import site from "@/data/site.json";

// Phase 4 (launch-completion): a single owner-editable `facts` block in site.json
// drives every phone number, email, address, hour, and experience claim site-wide,
// referenced from page/section JSON as a `{{facts.<path>}}` token. Resolved here —
// in Node, at module load (effectively build time for a static export) — never in
// the browser. `pages/index.js` and each bespoke page.js call this on their JSON
// before rendering; `scripts/import/lib/text-leaves.mjs` calls the same function so
// verify.mjs/check-page.mjs compare against the *resolved* text, not the raw token.
const TOKEN = /\{\{facts\.([a-zA-Z0-9_.]+)\}\}/g;

/** "10+ years" from a founding year, computed fresh (never hard-coded/cached). */
export function yearsExperience(foundedYear) {
	return `${new Date().getFullYear() - foundedYear}+ years`;
}

function lookup(path, facts) {
	if (path === "yearsExperience") return yearsExperience(facts.foundedYear);
	const value = path.split(".").reduce((obj, key) => obj?.[key], facts);
	if (value === undefined || typeof value === "object") {
		// Object (e.g. a bare "{{facts.phonePrimary}}") or unknown path: both are
		// authoring mistakes — every real use names a leaf ("phonePrimary.display").
		throw new Error(`resolveFacts: unresolved token {{facts.${path}}}`);
	}
	return String(value);
}

/**
 * Deep-resolves every `{{facts.<path>}}` token in strings/arrays/objects. Non-string
 * values (numbers, booleans, null, images) pass through untouched.
 * @template T
 * @param {T} value
 * @param {object} [facts] defaults to site.json's own facts block
 * @returns {T}
 */
export function resolveFacts(value, facts = site.facts) {
	if (typeof value === "string") {
		return TOKEN.test(value) ? value.replace(TOKEN, (_, path) => lookup(path, facts)) : value;
	}
	if (Array.isArray(value)) return value.map(item => resolveFacts(item, facts));
	if (value && typeof value === "object") {
		const out = {};
		for (const [key, val] of Object.entries(value)) out[key] = resolveFacts(val, facts);
		return out;
	}
	return value;
}
