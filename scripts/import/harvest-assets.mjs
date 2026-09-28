// Phase 2: Asset harvest.
//
// Scans every "real" page's Phase 1 snapshot for image/document references (plain <img>
// src/srcset, <link rel="icon">, og:image, and a raw-text sweep that also catches Slider
// Revolution/WPBakery/Elementor URLs embedded in <script>/<style> blocks), resolves each
// one to its full-resolution WordPress original via the Media Library REST API, downloads
// it, converts it (WebP, longest edge <=2400px; SVG kept as-is; animated GIF -> animated
// WebP; PDFs/docs untouched), dedupes by SHA-256, and writes content-import/assets-manifest.json.
//
// Idempotent: skips re-downloading a URL whose sha256 output already exists on disk.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { politeFetch, politeFetchBinary } from "./lib/http.mjs";

const ORIGIN = "https://bbtech.ae";
const ROOT = process.cwd();
const CONTENT_IMPORT_DIR = path.join(ROOT, "content-import");
const SNAPSHOT_DIR = path.join(CONTENT_IMPORT_DIR, "snapshot");
const ORIGINALS_DIR = path.join(CONTENT_IMPORT_DIR, "originals");
const PUBLIC_DIR = path.join(ROOT, "public");

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const DOC_EXT = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);
const ASSET_EXT_RE = /\.(jpe?g|png|gif|webp|svg|pdf|docx?|xlsx?|mp4|webm|mov)$/i;

// Small, well-known assets called out explicitly in the import brief: their filenames
// alone aren't descriptive enough to auto-generate an alt, so give them one directly
// rather than queuing a vision pass for something this unambiguous.
const KNOWN_ALT_BY_BASENAME = {
	"logo-png": "BB Tech logo",
	"logo-02": "Vision Plus logo",
	"small-logo": "BB Tech favicon",
	branding: "Binary Bridge Technology Services",
	45001: "ISO 45001 certification badge",
	27001: "ISO 27001 certification badge",
	14001: "ISO 14001 certification badge",
	9001: "ISO 9001 certification badge",
};

function normalizeAssetUrl(u) {
	if (u.startsWith("//")) return `https:${u}`;
	if (u.startsWith("/")) return `${ORIGIN}${u}`;
	return u;
}

function isHarvestableUrl(u) {
	if (!u) return false;
	const clean = u.split("?")[0].split("#")[0];
	if (!ASSET_EXT_RE.test(clean)) return false;
	if (/\/wp-content\/(plugins|themes)\//i.test(u)) return false; // template/plugin assets, not real content
	if (/bbtech\.ae/i.test(u) || u.startsWith("/")) return true;
	if (/visionplus\.com\.pk/i.test(u)) return true;
	return false;
}

const RAW_ASSET_RE = /(?:https?:)?\/\/(?:bbtech\.ae|visionplus\.com\.pk)\/[^\s"'()<>]+?\.(?:jpe?g|png|gif|webp|svg|pdf|docx?|xlsx?|mp4|webm|mov)/gi;

function extractAssetsFromHtml(html) {
	const found = new Map(); // normalizedUrl -> { alt, width, height, cls }
	const $ = cheerio.load(html);

	$("img").each((_, el) => {
		const $el = $(el);
		const candidates = [];
		const src = $el.attr("src");
		if (src) candidates.push(src);
		const srcset = $el.attr("srcset") || $el.attr("data-lazy-srcset");
		if (srcset) {
			for (const part of srcset.split(",")) candidates.push(part.trim().split(/\s+/)[0]);
		}
		const lazySrc = $el.attr("data-lazy-src") || $el.attr("data-src");
		if (lazySrc) candidates.push(lazySrc);

		const alt = $el.attr("alt");
		const width = $el.attr("width") || null;
		const height = $el.attr("height") || null;
		const cls = $el.attr("class") || "";
		for (const c of candidates) {
			if (!isHarvestableUrl(c)) continue;
			const norm = normalizeAssetUrl(c);
			if (!found.has(norm)) found.set(norm, { alt, width, height, cls });
		}
	});

	$('link[rel*="icon"]').each((_, el) => {
		const href = $(el).attr("href");
		if (href && isHarvestableUrl(href)) {
			const norm = normalizeAssetUrl(href);
			if (!found.has(norm)) found.set(norm, { alt: "Site favicon", width: null, height: null, cls: "" });
		}
	});
	const og = $('meta[property="og:image"]').attr("content");
	if (og && isHarvestableUrl(og)) {
		const norm = normalizeAssetUrl(og);
		if (!found.has(norm)) found.set(norm, { alt: null, width: null, height: null, cls: "" });
	}

	// Raw sweep: catches Slider Revolution / WPBakery / Elementor URLs embedded in
	// <script>/<style> text and inline background-image styles that aren't <img> tags.
	for (const m of html.matchAll(RAW_ASSET_RE)) {
		if (/\/wp-content\/(plugins|themes)\//i.test(m[0])) continue;
		const norm = normalizeAssetUrl(m[0]);
		if (!found.has(norm)) found.set(norm, { alt: null, width: null, height: null, cls: "" });
	}

	return found;
}

// ---------------------------------------------------------------------------
// WordPress media library lookup (resolves resized copies -> full originals)
// ---------------------------------------------------------------------------

async function fetchMediaLibrary() {
	const fields = "id,source_url,alt_text,caption,media_details,mime_type";
	const first = await politeFetch(`${ORIGIN}/wp-json/wp/v2/media?per_page=100&page=1&_fields=${fields}`, {});
	let items = JSON.parse(first.body);
	const totalPages = Number(first.headers["x-wp-totalpages"] || "1");
	for (let page = 2; page <= totalPages; page++) {
		const res = await politeFetch(`${ORIGIN}/wp-json/wp/v2/media?per_page=100&page=${page}&_fields=${fields}`, {});
		items = items.concat(JSON.parse(res.body));
	}
	return items;
}

function buildMediaLookup(items) {
	const bySourceUrl = new Map();
	const bySizeUrl = new Map();
	for (const item of items) {
		if (item.source_url) bySourceUrl.set(item.source_url, item);
		for (const sizeInfo of Object.values(item.media_details?.sizes || {})) {
			if (sizeInfo?.source_url) bySizeUrl.set(sizeInfo.source_url, item);
		}
	}
	return { bySourceUrl, bySizeUrl };
}

function stripSizeSuffix(url) {
	return url.replace(/-\d+x\d+(?=\.\w+$)/, "");
}

/** @returns {{ candidateUrl: string, mediaItem: object|null }} */
function resolveOriginalCandidate(url, mediaLookup) {
	if (mediaLookup.bySourceUrl.has(url)) return { candidateUrl: url, mediaItem: mediaLookup.bySourceUrl.get(url) };
	if (mediaLookup.bySizeUrl.has(url)) {
		const item = mediaLookup.bySizeUrl.get(url);
		return { candidateUrl: item.source_url, mediaItem: item };
	}
	const stripped = stripSizeSuffix(url);
	if (stripped !== url && mediaLookup.bySourceUrl.has(stripped)) {
		return { candidateUrl: stripped, mediaItem: mediaLookup.bySourceUrl.get(stripped) };
	}
	return { candidateUrl: stripped, mediaItem: null };
}

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------

function basenameNoExt(url) {
	const clean = url.split("?")[0].split("#")[0];
	return path.basename(clean, path.extname(clean));
}

function slugify(name) {
	return name
		.toLowerCase()
		.replace(/[_\s]+/g, "-")
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

// Strock-photo filenames carry a lot of noise that isn't a description of the image
// (stock-site prefixes, WxH tokens, long numeric/hex ids). Strip it before deciding
// whether what's left is descriptive enough to use as generated alt text.
function stripStockPhotoNoise(name) {
	let s = name.toLowerCase().replace(/_/g, "-");
	s = s.replace(/^depositphotos-\d+-?/, "");
	s = s.replace(/^istock(?:photo)?-\d+-?/, "");
	s = s.replace(/^shutterstock-\d+-?/, "");
	s = s.replace(/^fotolia-\d+-?/, "");
	s = s.replace(/stock-photo-?/g, "");
	s = s.replace(/stock-image-?/g, "");
	s = s.replace(/subscription-monthly-?/g, "");
	s = s.replace(/\b\d{2,4}x\d{2,4}\b/g, ""); // WxH dimension tokens
	s = s.replace(/-\d{5,}/g, ""); // long numeric ids
	s = s.replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
	return s;
}

function isDescriptiveName(name) {
	if (!name || /^[0-9a-f]{8,}$/i.test(name) || /^\d+$/.test(name)) return false;
	const words = name.split(/[-\s]+/).filter(Boolean);
	return words.some((w) => /^[a-z]{3,}$/i.test(w) && !["img", "image", "photo", "pic"].includes(w.toLowerCase()));
}

// Conservative: only flag as purely decorative when the markup itself signals it
// (divider/spacer/separator classes, or icon-scale dimensions). A class like
// "list-img-icon" paired with real content (e.g. "Manager.png" next to a feature
// name) is NOT decorative just because "icon" appears in the class name — it still
// needs real alt text, so "icon" alone is deliberately not a trigger here.
const DECORATIVE_CLASS_HINTS = ["divider", "spacer", "separator", "bg-shape", "shape-"];
function looksDecorative({ cls, width, height }) {
	const classStr = (cls || "").toLowerCase();
	if (DECORATIVE_CLASS_HINTS.some((h) => classStr.includes(h))) return true;
	const w = Number(width);
	const h = Number(height);
	if (w && h && w <= 32 && h <= 32) return true;
	return false;
}

const ACRONYMS = new Set(["erp", "isms", "adhics", "seo", "it", "ui", "ux", "api", "cctv", "iso", "gif", "pdf", "crm", "hr"]);

function titleize(name) {
	return name
		.split(/[-\s]+/)
		.filter(Boolean)
		.map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
		.join(" ");
}

function outputBaseName(originalUrl) {
	// Deliberately NOT run through stripStockPhotoNoise: that's tuned to decide whether a
	// name is descriptive enough for alt text, and over-strips short/generic filenames
	// (e.g. "istockphoto-1353929637-612x612-1.jpg" -> "1"). A slightly noisy but unique,
	// traceable filename beats a collision-prone "1.webp".
	const raw = basenameNoExt(originalUrl);
	return slugify(raw) || "asset";
}

// ---------------------------------------------------------------------------
// Alt text resolution
// ---------------------------------------------------------------------------

function resolveAlt({ mediaItem, htmlAlt, cls, width, height, baseName }) {
	const wpAlt = mediaItem?.alt_text?.trim();
	if (wpAlt) return { alt: wpAlt, altSource: "wordpress" };

	const trimmedHtmlAlt = htmlAlt?.trim();
	if (trimmedHtmlAlt && trimmedHtmlAlt.toLowerCase() !== "null") {
		return { alt: trimmedHtmlAlt, altSource: "html" };
	}

	if (looksDecorative({ cls, width, height })) return { alt: "", altSource: "decorative" };

	const known = KNOWN_ALT_BY_BASENAME[baseName.toLowerCase()];
	if (known) return { alt: known, altSource: "generated" };

	const cleanedForAlt = stripStockPhotoNoise(baseName).replace(/-/g, " ").trim();
	if (isDescriptiveName(cleanedForAlt)) {
		return { alt: titleize(cleanedForAlt), altSource: "generated" };
	}
	return { alt: null, altSource: "generated-pending" };
}

// ---------------------------------------------------------------------------
// Download + process
// ---------------------------------------------------------------------------

async function downloadWithFallback(candidateUrl, fallbackUrl) {
	let res = await politeFetchBinary(candidateUrl);
	let usedUrl = candidateUrl;
	if ((res.status !== 200 || !res.buffer) && fallbackUrl !== candidateUrl) {
		res = await politeFetchBinary(fallbackUrl);
		usedUrl = fallbackUrl;
	}
	return { ...res, usedUrl };
}

async function processAsset(buffer, ext, outDir, baseName) {
	const lowerExt = ext.toLowerCase();

	if (lowerExt === ".svg") {
		const outRel = path.join(outDir, `${baseName}.svg`).split(path.sep).join("/");
		await mkdir(path.join(PUBLIC_DIR, outDir), { recursive: true });
		await writeFile(path.join(PUBLIC_DIR, outRel), buffer);
		let width = null;
		let height = null;
		try {
			const meta = await sharp(buffer).metadata();
			width = meta.width ?? null;
			height = meta.height ?? null;
		} catch {
			// Some hand-authored SVGs lack intrinsic dimensions sharp can read; not fatal.
		}
		return { publicPath: `/${outRel}`, width, height };
	}

	if (DOC_EXT.has(lowerExt)) {
		const outRel = path.join("files", `${baseName}${lowerExt}`).split(path.sep).join("/");
		await mkdir(path.join(PUBLIC_DIR, "files"), { recursive: true });
		await writeFile(path.join(PUBLIC_DIR, outRel), buffer);
		return { publicPath: `/${outRel}`, width: null, height: null };
	}

	if (VIDEO_EXT.has(lowerExt)) {
		const outRel = path.join("video", "bbtech", `${baseName}${lowerExt}`).split(path.sep).join("/");
		await mkdir(path.join(PUBLIC_DIR, "video", "bbtech"), { recursive: true });
		await writeFile(path.join(PUBLIC_DIR, outRel), buffer);
		return { publicPath: `/${outRel}`, width: null, height: null };
	}

	if (!RASTER_EXT.has(lowerExt)) {
		// Unknown extension slipped through the harvest regex; store it untouched rather than
		// risk sharp mis-handling it.
		const outRel = path.join(outDir, `${baseName}${lowerExt}`).split(path.sep).join("/");
		await mkdir(path.join(PUBLIC_DIR, outDir), { recursive: true });
		await writeFile(path.join(PUBLIC_DIR, outRel), buffer);
		return { publicPath: `/${outRel}`, width: null, height: null };
	}

	const probe = await sharp(buffer, { animated: lowerExt === ".gif" }).metadata();
	const isAnimated = (probe.pages || 1) > 1;
	let img = sharp(buffer, { animated: isAnimated }).resize({
		width: 2400,
		height: 2400,
		fit: "inside",
		withoutEnlargement: true,
	});
	const outBuffer = await img.webp({ quality: 82 }).toBuffer();
	const outRel = path.join(outDir, `${baseName}.webp`).split(path.sep).join("/");
	await mkdir(path.join(PUBLIC_DIR, outDir), { recursive: true });
	await writeFile(path.join(PUBLIC_DIR, outRel), outBuffer);
	const finalMeta = await sharp(outBuffer, { animated: isAnimated }).metadata();
	return { publicPath: `/${outRel}`, width: finalMeta.width ?? null, height: finalMeta.height ?? null };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const SHARED_HINT_SUBSTRINGS = [
	"logo-png",
	"logo-02",
	"small-logo",
	"branding",
	"binary-bridge-technology-services",
	"45001",
	"27001",
	"14001",
	"9001",
];

async function main() {
	const inventory = JSON.parse(await readFile(path.join(CONTENT_IMPORT_DIR, "inventory.json"), "utf8"));
	const realPages = inventory.entries.filter((e) => e.classification === "real");
	console.log(`[harvest] scanning ${realPages.length} real pages for assets...`);

	const usage = new Map(); // normalizedUrl -> { alt, width, height, cls, pages: Set<slug> }
	for (const page of realPages) {
		const htmlPath = path.join(SNAPSHOT_DIR, page.slug, "page.html");
		let html;
		try {
			html = await readFile(htmlPath, "utf8");
		} catch {
			console.warn(`[harvest]   missing snapshot for ${page.path}, skipping`);
			continue;
		}
		const found = extractAssetsFromHtml(html);
		for (const [url, meta] of found) {
			const existing = usage.get(url);
			if (existing) {
				existing.pages.add(page.slug);
				if (!existing.alt && meta.alt) existing.alt = meta.alt;
			} else {
				usage.set(url, { ...meta, pages: new Set([page.slug]) });
			}
		}
	}
	console.log(`[harvest] ${usage.size} unique asset URLs found across real pages`);

	console.log("[harvest] fetching WP media library for original resolution...");
	const mediaItems = await fetchMediaLibrary();
	const mediaLookup = buildMediaLookup(mediaItems);
	console.log(`[harvest] media library: ${mediaItems.length} items indexed`);

	await mkdir(ORIGINALS_DIR, { recursive: true });

	const manifest = [];
	const shaToEntry = new Map();
	const usedOutputPaths = new Set();
	const failures = [];
	const pendingAlt = [];

	let i = 0;
	for (const [url, meta] of [...usage.entries()].sort(([a], [b]) => a.localeCompare(b))) {
		i++;
		process.stdout.write(`[harvest] (${i}/${usage.size}) ${url}\n`);

		const { candidateUrl, mediaItem } = resolveOriginalCandidate(url, mediaLookup);
		const { buffer, usedUrl, status } = await downloadWithFallback(candidateUrl, url);

		if (!buffer || status !== 200) {
			console.warn(`[harvest]   FAILED (status ${status}): ${candidateUrl}`);
			failures.push({ url, candidateUrl, status, usedOn: [...meta.pages] });
			continue;
		}

		const sha256 = createHash("sha256").update(buffer).digest("hex");
		let entry = shaToEntry.get(sha256);

		if (!entry) {
			const ext = path.extname(usedUrl.split("?")[0]) || ".bin";
			await writeFile(path.join(ORIGINALS_DIR, `${sha256}${ext}`), buffer);

			const baseNameRaw = outputBaseName(usedUrl);
			const isShared = meta.pages.size > 1 || SHARED_HINT_SUBSTRINGS.some((h) => baseNameRaw.includes(h));
			const outDir = isShared
				? path.join("images", "bbtech", "shared")
				: path.join("images", "bbtech", [...meta.pages][0]);

			let baseName = baseNameRaw;
			let dedupeSuffix = 0;
			while (usedOutputPaths.has(path.join(outDir, baseName).toLowerCase())) {
				dedupeSuffix++;
				baseName = `${baseNameRaw}-${dedupeSuffix}`;
			}
			usedOutputPaths.add(path.join(outDir, baseName).toLowerCase());

			const { publicPath, width, height } = await processAsset(buffer, ext, outDir, baseName);
			const { alt, altSource } = resolveAlt({
				mediaItem,
				htmlAlt: meta.alt,
				cls: meta.cls,
				width,
				height,
				baseName: baseNameRaw,
			});

			entry = {
				sourceUrls: [],
				resolvedOriginalUrl: usedUrl,
				localPath: publicPath,
				width,
				height,
				bytes: buffer.length,
				sha256,
				alt,
				altSource,
				usedOn: [],
			};
			shaToEntry.set(sha256, entry);
			manifest.push(entry);
			if (altSource === "generated-pending") pendingAlt.push(entry);
		}

		if (!entry.sourceUrls.includes(url)) entry.sourceUrls.push(url);
		for (const slug of meta.pages) if (!entry.usedOn.includes(slug)) entry.usedOn.push(slug);
	}

	await writeFile(path.join(CONTENT_IMPORT_DIR, "assets-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

	const totalBytes = manifest.reduce((s, e) => s + e.bytes, 0);
	console.log(`[harvest] wrote content-import/assets-manifest.json (${manifest.length} unique assets, ${(totalBytes / 1024 / 1024).toFixed(1)} MB originals)`);
	console.log(`[harvest] failures: ${failures.length}`);
	for (const f of failures) console.log(`  - ${f.url} (candidate ${f.candidateUrl}, status ${f.status}) used on: ${f.usedOn.join(", ")}`);
	console.log(`[harvest] pending generated alt text: ${pendingAlt.length}`);
	for (const p of pendingAlt) console.log(`  - ${p.localPath} (used on: ${p.usedOn.join(", ")})`);

	await writeFile(
		path.join(CONTENT_IMPORT_DIR, ".harvest-failures.json"),
		JSON.stringify(failures, null, 2),
		"utf8",
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
