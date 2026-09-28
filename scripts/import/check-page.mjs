// Fast per-page content check against the running dev server (no production build needed).
// Usage: bun scripts/import/check-page.mjs <slug|all> [--base=http://localhost:3000]
// For each page: every visible-copy string in its src/data/pages JSON (hero + sections) must
// appear in the rendered body text, and every image the assets manifest says the page uses
// must appear in the HTML. Same rules as the JSON text-leaf + image checks in verify.mjs.
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { pageRegistry } from "../../src/data/pages/index.js";

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--")) || "all";
const base = (args.find((a) => a.startsWith("--base=")) || "--base=http://localhost:3000").slice(7);

const TEXT_LEAF_KEYS = new Set(["p", "text", "title", "heading", "subtitle", "label", "submitText", "consent"]);
const CHROME_ONLY_ASSETS = new Set(["/images/bbtech/shared/logo-png.webp", "/images/bbtech/shared/small-logo.webp"]);

function collectTextLeaves(node, out = new Set()) {
	if (Array.isArray(node)) {
		for (const item of node) collectTextLeaves(item, out);
	} else if (node && typeof node === "object") {
		for (const [k, v] of Object.entries(node)) {
			if (typeof v === "string" && TEXT_LEAF_KEYS.has(k) && v.trim().length > 1) out.add(v.trim());
			else if (typeof v === "string" && (k === "ul" || k === "ol")) out.add(v.trim());
			else if (Array.isArray(v) && (k === "ul" || k === "ol" || k === "items" || k === "list")) {
				for (const it of v) {
					if (typeof it === "string" && it.trim().length > 1) out.add(it.trim());
					else collectTextLeaves(it, out);
				}
			} else collectTextLeaves(v, out);
		}
	}
	return out;
}

function norm(s) {
	return s.replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();
}

function bodyText(html) {
	const $ = cheerio.load(html);
	$('header, footer, nav, aside, [role="banner"], [role="contentinfo"], script, style, noscript, svg').remove();
	return norm($("body").text());
}

const manifest = JSON.parse(await readFile(path.join(process.cwd(), "content-import", "assets-manifest.json"), "utf8"));
const slugs = target === "all" ? Object.keys(pageRegistry) : [target];
let totalMissing = 0;

for (const slug of slugs) {
	const page = pageRegistry[slug];
	if (!page) {
		console.log(`?? unknown slug "${slug}"`);
		totalMissing++;
		continue;
	}
	let html;
	try {
		const res = await fetch(`${base}${page.path}`);
		html = await res.text();
		if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
	} catch (err) {
		console.log(`FAIL ${page.path}: could not load (${err.message})`);
		totalMissing++;
		continue;
	}
	const text = bodyText(html);
	const leaves = collectTextLeaves({ hero: page.hero, sections: page.sections });
	const missingText = [...leaves].filter((l) => !text.includes(norm(l)));
	const missingImages = manifest
		.filter((a) => !CHROME_ONLY_ASSETS.has(a.localPath) && a.usedOn.includes(slug))
		.filter((a) => !html.includes(a.localPath))
		.map((a) => a.localPath);
	const ok = !missingText.length && !missingImages.length;
	console.log(`${ok ? "OK  " : "FAIL"} ${page.path}  text ${leaves.size - missingText.length}/${leaves.size}  images missing ${missingImages.length}`);
	for (const m of missingText) console.log(`     missing text: "${m.slice(0, 110)}"`);
	for (const m of missingImages) console.log(`     missing image: ${m}`);
	totalMissing += missingText.length + missingImages.length;
}

process.exit(totalMissing ? 1 : 0);
