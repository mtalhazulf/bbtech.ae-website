import { resolveFacts } from "@/libs/resolveFacts";
import { strapiFetch } from "./client";
import { mapStrapiPage } from "./mapStrapiPage";
import { buildPopulateQuery, PAGE_POPULATE_STRUCTURE } from "./buildPopulateQuery";

let pagesPromise = null;

async function fetchAllPages() {
	const populateQuery = buildPopulateQuery(PAGE_POPULATE_STRUCTURE);
	const json = await strapiFetch(`/api/pages?${populateQuery}&pagination[pageSize]=100`);
	if (!json.data || json.data.length === 0) {
		throw new Error("Strapi returned 0 pages - refusing to build a site missing all catch-all content");
	}
	if (json.meta?.pagination?.total > json.data.length) {
		throw new Error(
			`Strapi reports ${json.meta.pagination.total} total pages but only ${json.data.length} were fetched - increase pagination[pageSize] in the request`,
		);
	}
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
