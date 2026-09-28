// Fast per-page content check against a running server (dev or `next start`).
// Usage: bun scripts/import/check-page.mjs <slug|all> [--base=http://localhost:3000]
// For each page: every visible-copy string in its src/data/pages JSON (hero + sections,
// including plain-string paragraph/list text) must appear in the rendered body, and every
// image the assets manifest says the page uses must appear in the HTML. Same rules as the
// content checks in verify.mjs (shared via lib/text-leaves.mjs).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pageRegistry } from "../../src/data/pages/index.js";
import { collectTextLeaves, renderedText } from "./lib/text-leaves.mjs";

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--")) || "all";
const base = (args.find((a) => a.startsWith("--base=")) || "--base=http://localhost:3000").slice(7);

const CHROME_ONLY_ASSETS = new Set(["/images/bbtech/shared/logo-png.webp", "/images/bbtech/shared/small-logo.webp"]);

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
	const rendered = renderedText(html);
	const leaves = collectTextLeaves({ hero: page.hero, sections: page.sections });
	const missingText = [...leaves].filter((l) => !rendered.has(l));
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
