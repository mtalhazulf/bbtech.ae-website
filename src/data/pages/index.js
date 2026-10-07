// Page registry for the catch-all content route (src/app/[...slug]/page.js). Content for
// the 22 catch-all pages lives in Strapi (see src/libs/cms/), fetched once per build and
// memoized — this module is a thin, stable-named wrapper so callers don't need to know that.
//
// Bespoke routes (/, /about-us/, /contact/, /services/) still import their own JSON directly
// for their own rendering and do NOT go through this registry or the CMS — but other tooling
// that needs "every real page" (sitemap.js, verify.mjs, check-page.mjs) needs them too, so
// they're imported here read-only, exactly as they were before the CMS migration.
import page_home from "@/data/pages/home.json";
import page_about_us from "@/data/pages/about-us.json";
import page_contact from "@/data/pages/contact.json";
import page_services from "@/data/pages/services.json";
import { resolveFacts } from "@/libs/resolveFacts";
import { getAllPages as fetchAllPages } from "@/libs/cms/getPages";

export const BESPOKE_SLUGS = new Set(["home", "about-us", "contact", "services"]);

// Note: `.map(resolveFacts)` (passing the function directly) would break this — Array.map
// calls its callback with (element, index, array), and resolveFacts's second parameter is
// `facts = site.facts`, so the index would override that default for every page but the
// first. Wrap it so only the page value is passed through.
const BESPOKE_PAGES = [page_home, page_about_us, page_contact, page_services].map((page) => resolveFacts(page));

/** The 4 bespoke pages, keyed by slug — resolved once at module load (no CMS fetch needed). */
export function getBespokePages() {
	return Object.fromEntries(BESPOKE_PAGES.map((p) => [p.slug, p]));
}

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
