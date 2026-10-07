import { resolveFacts } from "@/libs/resolveFacts";
import { strapiFetch } from "./client";
import { mapStrapiPage } from "./mapStrapiPage";

let pagesPromise = null;

async function fetchAllPages() {
	const json = await strapiFetch("/api/pages?populate=deep&pagination[pageSize]=100");
	const pages = {};
	for (const entry of json.data) {
		const page = resolveFacts(mapStrapiPage(entry));
		pages[page.slug] = page;
	}
	return pages;
}

/**
 * All published catch-all pages from Strapi, keyed by slug. Fetched once per build process
 * (memoized) — every route that needs page data during the same `next build` reuses the same
 * in-flight/resolved promise instead of re-fetching.
 */
export function getAllPages() {
	if (!pagesPromise) {
		pagesPromise = fetchAllPages();
	}
	return pagesPromise;
}
