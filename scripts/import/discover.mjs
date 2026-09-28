// Phase 1: Discovery and inventory.
//
// Enumerates every URL on bbtech.ae from three independent sources (Yoast sitemaps, the
// WP REST API, and the live primary menu), fetches + snapshots each one, classifies it
// against the seed inventory (scripts/import/lib/seed-inventory.mjs), and writes
// content-import/inventory.json plus content-import/snapshot/<path>/{page.html,page.json}.
//
// Idempotent: relies on the on-disk HTTP cache in content-import/.cache/, so re-running
// only re-fetches URLs that changed or were never fetched. Pass --fresh to bypass the cache.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import { politeFetch, politeFetchJson } from "./lib/http.mjs";
import { classifyPath, normalizePath } from "./lib/seed-inventory.mjs";

const ORIGIN = "https://bbtech.ae";
const ROOT = process.cwd();
const CONTENT_IMPORT_DIR = path.join(ROOT, "content-import");
const SNAPSHOT_DIR = path.join(CONTENT_IMPORT_DIR, "snapshot");
const FRESH = process.argv.includes("--fresh");

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function toArray(x) {
	if (x === undefined || x === null) return [];
	return Array.isArray(x) ? x : [x];
}

function fetchOpts() {
	return FRESH ? { force: true } : {};
}

// ---------------------------------------------------------------------------
// 1. Sitemaps
// ---------------------------------------------------------------------------

/** @returns {Promise<Array<{loc: string, lastmod?: string, images: string[]}>>} */
async function fetchSitemapUrls(sitemapUrl, seenSitemaps = new Set()) {
	if (seenSitemaps.has(sitemapUrl)) return [];
	seenSitemaps.add(sitemapUrl);

	const res = await politeFetch(sitemapUrl, fetchOpts());
	if (res.status !== 200 || !res.body.includes("<?xml")) return [];

	const doc = xml.parse(res.body);
	const urls = [];

	if (doc.sitemapindex) {
		for (const entry of toArray(doc.sitemapindex.sitemap)) {
			const child = await fetchSitemapUrls(entry.loc, seenSitemaps);
			urls.push(...child);
		}
	}
	if (doc.urlset) {
		for (const entry of toArray(doc.urlset.url)) {
			const images = toArray(entry["image:image"]).map((img) => img["image:loc"]).filter(Boolean);
			urls.push({ loc: entry.loc, lastmod: entry.lastmod, images });
		}
	}
	return urls;
}

// ---------------------------------------------------------------------------
// 2. REST API
// ---------------------------------------------------------------------------

// Internal WP types with no public single-page URL worth enumerating as content.
const SKIP_REST_TYPES = new Set([
	"attachment",
	"nav_menu_item",
	"wp_block",
	"wp_template",
	"wp_template_part",
	"wp_navigation",
	"wp_global_styles",
]);

async function fetchTypes() {
	const { json } = await politeFetchJson(`${ORIGIN}/wp-json/wp/v2/types`, fetchOpts());
	return json;
}

/** Paginate a REST collection endpoint (per_page=100, follow X-WP-TotalPages). */
async function fetchAllOfType(restBase) {
	const first = await politeFetch(`${ORIGIN}/wp-json/wp/v2/${restBase}?per_page=100&page=1`, fetchOpts());
	if (first.status !== 200) return [];
	let items = JSON.parse(first.body);
	const totalPages = Number(first.headers["x-wp-totalpages"] || "1");
	for (let page = 2; page <= totalPages; page++) {
		const res = await politeFetch(`${ORIGIN}/wp-json/wp/v2/${restBase}?per_page=100&page=${page}`, fetchOpts());
		if (res.status !== 200) break;
		items = items.concat(JSON.parse(res.body));
	}
	return items;
}

// ---------------------------------------------------------------------------
// 3. Primary menu (parsed from the live homepage HTML)
// ---------------------------------------------------------------------------

function extractMenuTree($, $ul) {
	const items = [];
	$ul.children("li").each((_, li) => {
		const $li = $(li);
		const $link = $li.children("a").first();
		const label = ($link.find(".menu-text").first().text() || $link.text() || "").trim();
		const href = $link.attr("href") || null;
		const entry = { label, href };
		let $childUl = $li.children("ul").first();
		if (!$childUl.length) $childUl = $li.children(".dt-mega-menu-wrap").find("ul").first();
		if ($childUl.length) entry.submenu = extractMenuTree($, $childUl);
		items.push(entry);
	});
	return items;
}

function extractSiteChrome(homeHtml) {
	const $ = cheerio.load(homeHtml);
	const primaryMenu = extractMenuTree($, $("#primary-menu"));
	const topBar = {
		contacts: $(".mini-contacts")
			.map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
			.get(),
		social: [...new Set($(".soc-ico a").map((_, el) => $(el).attr("href")).get())],
	};
	return { primaryMenu, topBar };
}

// ---------------------------------------------------------------------------
// 4. Per-page extraction
// ---------------------------------------------------------------------------

const RESIDUE_TERMS = [
	"lorem ipsum",
	"guy hawkins",
	"savannah",
	"kristin watson",
	"bexon",
	"theme-junction",
	"themeforest",
	"1-888",
];

function extractMainContentSignals(html) {
	const $ = cheerio.load(html);
	const $main = $("body").clone();
	$main.find("header, footer, nav, script, style, noscript, svg, #wpadminbar").remove();

	const headings = [];
	$main.find("h1, h2, h3, h4, h5, h6").each((_, el) => {
		const text = $(el).text().replace(/\s+/g, " ").trim();
		if (text) headings.push({ level: el.tagName.toLowerCase(), text });
	});

	const text = $main.text().replace(/\s+/g, " ").trim();
	const wordCount = text ? text.split(" ").length : 0;

	const lazyBgCount = $main
		.find("[data-lazy-src], [data-lazy-srcset], [data-bg], [data-src]")
		.filter((_, el) => !$(el).is("img"))
		.length;
	const imageCount = $main.find("img").length + lazyBgCount;
	const formCount = $main.find("form").length;

	const lowerText = text.toLowerCase();
	const residue = RESIDUE_TERMS.filter((term) => lowerText.includes(term));

	return {
		h1: $main.find("h1").first().text().replace(/\s+/g, " ").trim() || null,
		headings,
		wordCount,
		imageCount,
		formCount,
		residue,
	};
}

function extractHeadMeta(html) {
	const $ = cheerio.load(html);
	return {
		title: $("title").first().text().trim() || null,
		description: $('meta[name="description"]').attr("content") || null,
		canonical: $('link[rel="canonical"]').attr("href") || null,
		ogTitle: $('meta[property="og:title"]').attr("content") || null,
		ogDescription: $('meta[property="og:description"]').attr("content") || null,
		ogImage: $('meta[property="og:image"]').attr("content") || null,
		ogType: $('meta[property="og:type"]').attr("content") || null,
	};
}

function metaFromYoast(yoastHeadJson) {
	if (!yoastHeadJson) return null;
	const ogImage = Array.isArray(yoastHeadJson.og_image) ? yoastHeadJson.og_image[0]?.url : null;
	return {
		title: yoastHeadJson.title || null,
		description: yoastHeadJson.description || null,
		canonical: yoastHeadJson.canonical || null,
		ogTitle: yoastHeadJson.og_title || null,
		ogDescription: yoastHeadJson.og_description || null,
		ogImage: ogImage || null,
		ogType: yoastHeadJson.og_type || null,
	};
}

// ---------------------------------------------------------------------------
// 5. Snapshot paths
// ---------------------------------------------------------------------------

function slugForPath(pathname) {
	const trimmed = pathname.replace(/^\/+|\/+$/g, "");
	return trimmed === "" ? "home" : trimmed;
}

async function writeSnapshot(pathname, html, restObject) {
	const dir = path.join(SNAPSHOT_DIR, slugForPath(pathname));
	await mkdir(dir, { recursive: true });
	await writeFile(path.join(dir, "page.html"), html, "utf8");
	await writeFile(path.join(dir, "page.json"), JSON.stringify(restObject ?? null, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	console.log(`[discover] origin=${ORIGIN} fresh=${FRESH}`);
	await mkdir(SNAPSHOT_DIR, { recursive: true });

	console.log("[discover] fetching sitemaps...");
	let sitemapUrls = [];
	try {
		sitemapUrls = await fetchSitemapUrls(`${ORIGIN}/sitemap_index.xml`);
	} catch (err) {
		console.warn("[discover] sitemap_index.xml failed:", err.message);
	}
	try {
		const wpCore = await fetchSitemapUrls(`${ORIGIN}/wp-sitemap.xml`);
		sitemapUrls.push(...wpCore);
	} catch {
		// WP core sitemap is commonly disabled when Yoast is active; not fatal.
	}
	console.log(`[discover] ${sitemapUrls.length} URLs from sitemaps`);

	console.log("[discover] fetching /wp-json/wp/v2/types...");
	const types = await fetchTypes();
	const restTypesToFetch = Object.values(types).filter((t) => !SKIP_REST_TYPES.has(t.slug));
	console.log(`[discover] REST types to enumerate: ${restTypesToFetch.map((t) => t.slug).join(", ")}`);

	const restByPath = new Map();
	const restCounts = {};
	for (const t of restTypesToFetch) {
		const items = await fetchAllOfType(t.rest_base);
		restCounts[t.slug] = items.length;
		for (const item of items) {
			if (!item.link) continue;
			const p = normalizePath(new URL(item.link).pathname);
			restByPath.set(p, { type: t.slug, object: item });
		}
		console.log(`[discover]   ${t.slug} (${t.rest_base}): ${items.length} items`);
	}

	// Media: enumerate count only in Phase 1 (full listing + download is Phase 2 / asset harvest).
	let mediaTotal = 0;
	try {
		const mediaHead = await politeFetch(`${ORIGIN}/wp-json/wp/v2/media?per_page=1`, fetchOpts());
		mediaTotal = Number(mediaHead.headers["x-wp-total"] || "0");
	} catch (err) {
		console.warn("[discover] media count failed:", err.message);
	}
	console.log(`[discover] media library total: ${mediaTotal} (full harvest deferred to Phase 2)`);

	console.log("[discover] fetching homepage for menu structure...");
	const homeRes = await politeFetch(`${ORIGIN}/`, fetchOpts());
	const siteChrome = extractSiteChrome(homeRes.body);

	// Merge sitemap + REST + menu hrefs + forced entries into one path registry.
	const registry = new Map(); // normalizedPath -> { lastmod, images, restType, restObject }
	const EXCLUDE_PATTERNS = [/\/wp-content\//, /\/wp-json\//, /\.xml$/, /\/feed\/?$/, /\/page\/\d+\/?$/];

	function addUrl(rawUrl, extra = {}) {
		let u;
		try {
			u = new URL(rawUrl, ORIGIN);
		} catch {
			return;
		}
		if (u.hostname !== "bbtech.ae") return; // no hotlinked/external URLs in the page registry
		if (EXCLUDE_PATTERNS.some((re) => re.test(u.pathname))) return;
		const p = normalizePath(u.pathname);
		const existing = registry.get(p) || {};
		registry.set(p, { ...existing, ...extra });
	}

	addUrl("/"); // always include home even if sitemap parsing changes upstream
	for (const entry of sitemapUrls) addUrl(entry.loc, { lastmod: entry.lastmod, images: entry.images });
	for (const [p, { type, object }] of restByPath) {
		addUrl(`${ORIGIN}${p}`, { restType: type, restObject: object });
	}
	function walkMenu(items) {
		for (const item of items) {
			if (item.href) addUrl(item.href);
			if (item.submenu) walkMenu(item.submenu);
		}
	}
	walkMenu(siteChrome.primaryMenu);

	console.log(`[discover] ${registry.size} unique URLs after merge`);

	// Fetch + snapshot + extract signals for every URL in the registry.
	const inventory = [];
	let i = 0;
	for (const [pathname, meta] of [...registry.entries()].sort(([a], [b]) => a.localeCompare(b))) {
		i++;
		const fullUrl = `${ORIGIN}${pathname}`;
		process.stdout.write(`[discover] (${i}/${registry.size}) ${pathname}\n`);

		let html = "";
		let httpStatus = null;
		try {
			const res = await politeFetch(fullUrl, fetchOpts());
			html = res.body;
			httpStatus = res.status;
		} catch (err) {
			console.warn(`[discover]   fetch failed: ${err.message}`);
		}

		await writeSnapshot(pathname, html, meta.restObject ?? null);

		const classification = classifyPath(pathname);
		const contentSignals = html ? extractMainContentSignals(html) : null;
		const yoastMeta = meta.restObject?.yoast_head_json ? metaFromYoast(meta.restObject.yoast_head_json) : null;
		const htmlMeta = html ? extractHeadMeta(html) : null;
		const metaOut = yoastMeta || htmlMeta || {};

		inventory.push({
			url: fullUrl,
			path: pathname,
			slug: slugForPath(pathname),
			restType: meta.restType || null,
			httpStatus,
			lastmod: meta.lastmod || null,
			classification: classification.classification,
			redirectTo: classification.redirectTo || null,
			seedMatch: classification.seedMatch,
			seedNote: classification.seedNote || null,
			newRoute:
				classification.classification === "real"
					? pathname
					: classification.classification === "filler"
						? classification.redirectTo
						: null,
			metadata: {
				title: metaOut.title || null,
				description: metaOut.description || null,
				canonical: metaOut.canonical || null,
				ogTitle: metaOut.ogTitle || null,
				ogDescription: metaOut.ogDescription || null,
				ogImage: metaOut.ogImage || null,
				ogType: metaOut.ogType || null,
			},
			h1: contentSignals?.h1 ?? null,
			headings: contentSignals?.headings ?? [],
			wordCount: contentSignals?.wordCount ?? 0,
			imageCount: contentSignals?.imageCount ?? 0,
			formCount: contentSignals?.formCount ?? 0,
			templateResidue: contentSignals?.residue ?? [],
			sitemapImages: meta.images || [],
		});
	}

	const summary = {
		generatedAt: new Date().toISOString(),
		origin: ORIGIN,
		totals: {
			urls: inventory.length,
			real: inventory.filter((e) => e.classification === "real").length,
			filler: inventory.filter((e) => e.classification === "filler").length,
			needsReview: inventory.filter((e) => e.classification === "needs-review").length,
			forms: inventory.reduce((sum, e) => sum + e.formCount, 0),
			mediaLibraryTotal: mediaTotal,
			restCounts,
		},
		siteChrome,
		entries: inventory,
	};

	await writeFile(path.join(CONTENT_IMPORT_DIR, "inventory.json"), JSON.stringify(summary, null, 2), "utf8");
	console.log(`[discover] wrote content-import/inventory.json (${inventory.length} entries)`);
	console.log(`[discover] totals:`, summary.totals);

	const flagged = inventory.filter((e) => e.classification === "needs-review");
	if (flagged.length) {
		console.log(`[discover] NEEDS REVIEW (${flagged.length}):`);
		for (const e of flagged) console.log(`  - ${e.path}`);
	}
	const residueOnReal = inventory.filter((e) => e.classification === "real" && e.templateResidue.length > 0);
	if (residueOnReal.length) {
		console.log(`[discover] WARNING: template residue found on pages classified "real":`);
		for (const e of residueOnReal) console.log(`  - ${e.path}: ${e.templateResidue.join(", ")}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
