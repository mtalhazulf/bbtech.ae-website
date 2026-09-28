// Shared by check-page.mjs (dev server) and verify.mjs (production build): what counts as a
// page's visible copy, and how rendered HTML is normalized before comparing against it.
import * as cheerio from "cheerio";

// Keys whose string value is visible copy (as opposed to hrefs/ids/alt text/dimensions).
const TEXT_KEYS = new Set(["text", "title", "heading", "subtitle", "label", "submitText", "consent"]);
// Keys whose array value holds copy: plain strings, or segment objects ({ text, href, bold... }).
const ARRAY_COPY_KEYS = new Set(["p", "ul", "ol", "items", "list"]);

function addPieces(str, out) {
	// A string may carry intentional line breaks that a layout renders as separate elements.
	for (const piece of str.split("\n")) {
		const t = piece.trim();
		if (t.length > 1) out.add(t);
	}
}

/** Every visible-copy string in a page's hero + sections, split at line breaks, deduped. */
export function collectTextLeaves(node, out = new Set()) {
	if (Array.isArray(node)) {
		for (const item of node) collectTextLeaves(item, out);
	} else if (node && typeof node === "object") {
		for (const [k, v] of Object.entries(node)) {
			if (typeof v === "string" && (TEXT_KEYS.has(k) || ARRAY_COPY_KEYS.has(k))) addPieces(v, out);
			else if (Array.isArray(v) && ARRAY_COPY_KEYS.has(k)) {
				for (const it of v) {
					if (typeof it === "string") addPieces(it, out);
					else collectTextLeaves(it, out);
				}
			} else if (v && typeof v === "object") collectTextLeaves(v, out);
		}
	}
	return out;
}

export function norm(s) {
	return s.replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();
}

// Chrome that never holds page-JSON copy (header/top bar/nav/footer/sidebars).
const CHROME =
	'header, footer, nav, aside, [role="banner"], [role="contentinfo"], .skip-link, .screen-reader-text, script, style, noscript, svg, #wpadminbar';

/**
 * Two normalized views of the body text: `joined` (cheerio text, so a word split across
 * inline tags like B<sup>2</sup> stays whole) and `spaced` (a space at every tag boundary,
 * so text split across block elements doesn't run together). A leaf counts as rendered if
 * either view contains it.
 */
export function renderedText(html) {
	const $ = cheerio.load(html);
	$(CHROME).remove();
	const body = $("body");
	const joined = norm(body.text());
	const spaced = norm(cheerio.load((body.html() || "").replace(/</g, " <")).root().text());
	return { joined, spaced, has: (leaf) => joined.includes(norm(leaf)) || spaced.includes(norm(leaf)) };
}
