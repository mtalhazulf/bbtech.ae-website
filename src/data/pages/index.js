// Page registry for the catch-all content route (src/app/[...slug]/page.js). Content for
// the 22 catch-all pages now lives in Strapi (see src/libs/cms/), fetched once per build and
// memoized — this module is a thin, stable-named wrapper so callers don't need to know that.
//
// Bespoke routes (/, /about-us/, /contact/, /services/) still import their own JSON directly
// and do NOT go through this registry or the CMS.
import { getAllPages as fetchAllPages } from "@/libs/cms/getPages";

export const BESPOKE_SLUGS = new Set(["home", "about-us", "contact", "services"]);

export async function getAllPages() {
	return fetchAllPages();
}

export async function getPageData(slug) {
	const pages = await fetchAllPages();
	return pages[slug] ?? null;
}

/** All registered slugs, split into path segments, for generateStaticParams. */
export async function getCatchAllParams() {
	const pages = await fetchAllPages();
	return Object.keys(pages)
		.filter((slug) => !BESPOKE_SLUGS.has(slug))
		.map((slug) => ({ slug: slug.split("/") }));
}
