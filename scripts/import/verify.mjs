// Phase 7: verification. Run against a production build's static HTML output
// (.next/server/app/**/*.html) — run `bun run build` first.
//
// Checks: route coverage, sentence coverage per real page, image coverage, zero remote
// references, no template residue, and a static internal-link crawl. Prints a report and
// exits non-zero if anything fails.
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { getAllPages, getBespokePages } from "../../src/data/pages/index.js";

import { collectTextLeaves, renderedText } from "./lib/text-leaves.mjs";

const ROOT = process.cwd();
const BUILD_APP_DIR = path.join(ROOT, ".next", "server", "app");
const CONTENT_IMPORT_DIR = path.join(ROOT, "content-import");

function slugToBuildFile(slug) {
	return slug === "home" ? "index.html" : `${slug}.html`;
}

async function readBuiltHtml(slug) {
	try {
		return await readFile(path.join(BUILD_APP_DIR, slugToBuildFile(slug)), "utf8");
	} catch {
		return null;
	}
}

function stripChrome(html) {
	const $ = cheerio.load(html);
	// The7 theme wraps the whole top bar + nav in a <div role="banner"> — only the inner
	// nav is a literal <header> tag — so role selectors matter here as much as tag names.
	// aside#sidebar: the shared "Our services" + generic contact-form widget the Phase 3
	// extraction deliberately treated as site-wide chrome (see per-page warnings).
	$(
		'header, footer, nav, aside, [role="banner"], [role="contentinfo"], .skip-link, .screen-reader-text, script, style, noscript, svg, #wpadminbar, .dt-mobile-header, .dt-offcanvas, .search-popup, #search-popup',
	).remove();
	return $("body").text().replace(/\s+/g, " ").trim();
}

function normalizeSentence(s) {
	return s
		.replace(/\s+/g, " ")
		.replace(/[“”]/g, '"')
		.replace(/[‘’]/g, "'")
		.trim()
		.toLowerCase();
}

function splitSentences(text) {
	// Simple sentence splitter: good enough for substring-presence checking, not
	// linguistically perfect. Filters out very short fragments (headings, labels).
	return text
		.split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
		.map((s) => s.trim())
		.filter((s) => s.length > 15);
}

async function loadCopyFixes() {
	try {
		const md = await readFile(path.join(CONTENT_IMPORT_DIR, "copy-fixes.md"), "utf8");
		const fixes = [];
		for (const line of md.split("\n")) {
			const m = line.match(/^\|\s*`?([^|`]+)`?\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
			if (m && m[2] !== "Original" && !m[2].startsWith("---")) {
				fixes.push([m[2].trim(), m[3].trim()]);
			}
		}
		return fixes;
	} catch {
		return [];
	}
}

function applyFixes(text, fixes) {
	let out = text;
	for (const [from, to] of fixes) out = out.split(from).join(to);
	return out;
}

const RESIDUE_TERMS = [
	"lorem ipsum",
	"guy hawkins",
	"savannah",
	"kristin watson",
	"bexon",
	"theme-junction",
	"themeforest",
	"1-888",
	"#1e8a8a",
	"rgba(30, 138, 138",
];

// Asset-embed patterns only (src=/srcset=/url()) — an outbound <a href> to
// visionplus.com.pk (their own site) or bbtech.ae (canonical/self-links) is expected and
// allowed; a hotlinked *asset* from either is not.
const REMOTE_PATTERNS = [
	/(?:src|srcset)="https?:\/\/bbtech\.ae\/wp-content[^"]*"/i,
	/url\(['"]?https?:\/\/bbtech\.ae\/wp-content/i,
	/(?:src|srcset)="https?:\/\/(?:www\.)?visionplus\.com\.pk\/[^"]*"/i,
	/wp-json/i, // should never appear in rendered output for any reason
];

async function main() {
	const failures = [];
	const warnings = [];
	const copyFixes = await loadCopyFixes();
	const pageRegistry = { ...(await getAllPages()), ...getBespokePages() };

	// Load all built HTML once.
	const realSlugs = Object.keys(pageRegistry);
	const builtHtmlBySlug = {};
	for (const slug of realSlugs) builtHtmlBySlug[slug] = await readBuiltHtml(slug);

	// 1. Route coverage
	console.log("=== Route coverage ===");
	for (const slug of realSlugs) {
		if (!builtHtmlBySlug[slug]) failures.push(`ROUTE MISSING: "${slug}" has no build output`);
	}
	console.log(`${realSlugs.length - failures.length}/${realSlugs.length} real pages built`);

	// Hidden template routes must not exist in the build output.
	const hiddenRoutes = ["team", "careers", "history", "faq", "solutions", "industries", "terms-and-conditions"];
	for (const r of hiddenRoutes) {
		try {
			await readFile(path.join(BUILD_APP_DIR, `${r}.html`), "utf8");
			failures.push(`HIDDEN ROUTE STILL BUILT: /${r}/ should be non-routable (D4)`);
		} catch {
			// expected: file should not exist
		}
	}

	// 2. Sentence coverage per real page
	console.log("\n=== Sentence coverage ===");
	const coverageReport = [];
	for (const slug of realSlugs) {
		const builtHtml = builtHtmlBySlug[slug];
		if (!builtHtml) continue;
		let snapshotHtml;
		try {
			snapshotHtml = await readFile(path.join(CONTENT_IMPORT_DIR, "snapshot", slug, "page.html"), "utf8");
		} catch {
			warnings.push(`No snapshot for "${slug}", skipping sentence coverage`);
			continue;
		}
		const sourceText = applyFixes(stripChrome(snapshotHtml), copyFixes);
		const builtText = normalizeSentence(stripChrome(builtHtml));
		const sentences = splitSentences(sourceText);
		let hit = 0;
		const missed = [];
		for (const s of sentences) {
			const norm = normalizeSentence(s);
			if (builtText.includes(norm)) hit++;
			else missed.push(s);
		}
		const pct = sentences.length ? Math.round((hit / sentences.length) * 100) : 100;
		coverageReport.push({ slug, pct, total: sentences.length, missed });
		if (pct < 100) {
			for (const m of missed) warnings.push(`[${slug}] missing sentence: "${m.slice(0, 120)}"`);
		}
	}
	for (const r of coverageReport) {
		console.log(`${r.pct.toString().padStart(3)}%  ${r.slug}  (${r.total} sentences checked)`);
	}
	const avgCoverage = coverageReport.length
		? Math.round(coverageReport.reduce((s, r) => s + r.pct, 0) / coverageReport.length)
		: 0;
	console.log(`Average: ${avgCoverage}%`);
	console.log(
		"(A hero slider's 3 slides sit adjacent with no punctuation between them in the live\n" +
			" markup, so the sentence splitter above merges them into one unmatched blob even when\n" +
			" each slide's text renders correctly — see the JSON text-leaf check below instead for\n" +
			" a per-string, false-positive-free measure of what the rendering pipeline dropped.)",
	);

	// 2b. JSON text-leaf coverage: every visible-copy string actually IN each page's own
	// src/data/pages/*.json should appear in that page's rendered HTML. This is a stricter,
	// noise-free complement to the sentence check above — it answers "did SectionRenderer
	// drop anything from the data we already trust", not "does the data match the live site"
	// (Phase 3 already covered that).
	console.log("\n=== JSON text-leaf coverage (per-string, not sentence-based) ===");
	let leafTotal = 0;
	let leafMissing = 0;
	for (const slug of realSlugs) {
		const html = builtHtmlBySlug[slug];
		if (!html) continue;
		const rendered = renderedText(html);
		const page = pageRegistry[slug];
		// metadata.title/description render into <head>, which stripChrome (body-only) never
		// sees — that's a check-methodology gap, not a rendering bug, so skip that subtree.
		const leaves = collectTextLeaves({ hero: page.hero, sections: page.sections });
		let missedHere = 0;
		for (const leaf of leaves) {
			leafTotal++;
			if (!rendered.has(leaf)) {
				leafMissing++;
				missedHere++;
				failures.push(`JSON TEXT NOT RENDERED on "${slug}": "${leaf.slice(0, 100)}"`);
			}
		}
		if (missedHere > 0) console.log(`  ${slug}: ${missedHere}/${leaves.size} strings missing`);
	}
	console.log(`${leafTotal - leafMissing}/${leafTotal} JSON text strings found in their page's rendered HTML`);

	// 3. Image coverage
	console.log("\n=== Image coverage ===");
	let assetsManifest = [];
	try {
		assetsManifest = JSON.parse(await readFile(path.join(CONTENT_IMPORT_DIR, "assets-manifest.json"), "utf8"));
	} catch {
		warnings.push("Could not load assets-manifest.json");
	}
	// These two were harvested from raw header/footer HTML (present on every page) but are
	// rendered through site.json's own curated logo + Next.js's automatic favicon.ico
	// convention, not through the per-page content pipeline — so they're correctly absent
	// from every page's SectionRenderer output, not a coverage gap.
	const CHROME_ONLY_ASSETS = new Set(["/images/bbtech/shared/logo-png.webp", "/images/bbtech/shared/small-logo.webp"]);
	let imageMisses = 0;
	for (const asset of assetsManifest) {
		if (CHROME_ONLY_ASSETS.has(asset.localPath)) continue;
		for (const slug of asset.usedOn) {
			const html = builtHtmlBySlug[slug];
			if (!html) continue; // route missing already reported
			if (!html.includes(asset.localPath)) {
				failures.push(`IMAGE NOT RENDERED: ${asset.localPath} expected on "${slug}"`);
				imageMisses++;
			}
		}
	}
	console.log(`${assetsManifest.length} manifest assets checked, ${imageMisses} missing on their expected page(s)`);

	// 4. Zero remote references + 5. template residue
	console.log("\n=== Remote references + template residue ===");
	for (const slug of realSlugs) {
		const html = builtHtmlBySlug[slug];
		if (!html) continue;
		for (const re of REMOTE_PATTERNS) {
			if (re.test(html)) failures.push(`REMOTE REFERENCE on "${slug}": matches ${re}`);
		}
		const lower = html.toLowerCase();
		for (const term of RESIDUE_TERMS) {
			if (lower.includes(term)) failures.push(`TEMPLATE RESIDUE on "${slug}": "${term}"`);
		}
	}
	console.log(failures.filter((f) => f.startsWith("REMOTE") || f.startsWith("TEMPLATE")).length + " issues found");

	// 6. Static internal-link crawl
	console.log("\n=== Internal link crawl ===");
	const knownPaths = new Set(Object.values(pageRegistry).map((p) => p.path));
	let redirectSources = new Set();
	try {
		const configSrc = await readFile(path.join(ROOT, "next.config.js"), "utf8");
		for (const m of configSrc.matchAll(/source:\s*"([^"]+)"/g)) redirectSources.add(m[1]);
	} catch {
		warnings.push("Could not read next.config.js for redirect sources");
	}
	const brokenLinks = new Set();
	for (const slug of realSlugs) {
		const html = builtHtmlBySlug[slug];
		if (!html) continue;
		const $ = cheerio.load(html);
		$("a[href]").each((_, a) => {
			const href = $(a).attr("href");
			if (!href || !href.startsWith("/") || href.startsWith("//")) return;
			const pathname = href.split("?")[0].split("#")[0];
			if (pathname === "/") return;
			const isKnown = knownPaths.has(pathname);
			const isRedirect = [...redirectSources].some((src) => {
				const prefix = src.replace(/:path\*.*$/, "");
				return pathname === src || pathname.startsWith(prefix);
			});
			if (!isKnown && !isRedirect) brokenLinks.add(`${pathname} (linked from ${slug})`);
		});
	}
	for (const link of brokenLinks) warnings.push(`UNRESOLVED INTERNAL LINK: ${link}`);
	console.log(`${brokenLinks.size} internal links with no matching real page or redirect`);

	// Report
	console.log("\n=== Summary ===");
	console.log(`Failures: ${failures.length}`);
	for (const f of failures) console.log(`  FAIL: ${f}`);
	console.log(`Warnings: ${warnings.length}`);
	for (const w of warnings.slice(0, 50)) console.log(`  warn: ${w}`);
	if (warnings.length > 50) console.log(`  ...and ${warnings.length - 50} more warnings`);

	if (failures.length > 0) {
		console.log("\nVERIFY: FAILED");
		process.exit(1);
	}
	console.log("\nVERIFY: PASSED (see warnings above for non-blocking gaps)");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
