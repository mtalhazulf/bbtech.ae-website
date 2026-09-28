// The seed inventory from prior research on bbtech.ae (see the content-import brief).
// discover.mjs verifies every live URL against this table rather than trusting it blindly:
// anything live but not listed here is flagged "needs-review" instead of silently classified.

/** Real pages, imported 1:1 at their live path (D2: URL parity, trailingSlash: true). */
export const REAL_PAGES = [
	{ path: "/", note: "Home" },
	{ path: "/about-us/", note: "About, incl. 16-item services list + Vision Plus block" },
	{ path: "/contact/", note: "Contact info, hours, form, Vision Plus block" },
	{ path: "/services/", note: "Services hub (11 cards)" },
	{ path: "/services/web-development/", note: "Service" },
	{ path: "/services/graphic-design/", note: "Service" },
	{ path: "/services/mobile-app-development/", note: "Service" },
	{ path: "/services/social-media-marketing/", note: "Service" },
	{ path: "/services/erp/", note: "ERP (form has extra fields: Country, City, Company, Website)" },
	{ path: "/erp/", note: "Construction ERP reasons + ~38-item feature list" },
	{ path: "/construction-management-system/", note: "Includes Constrcution-BBTECH.gif" },
	{ path: "/odoo-development/", note: "Odoo" },
	{ path: "/school-system-isms/", note: "ISMS (module groups, ISMS CAN DO)" },
	{ path: "/social-wifi/", note: "Service; check vs /services/social-wifi/ duplicate" },
	{ path: "/services/social-wifi/", note: "Present in live sitemap; not linked from nav — check vs /social-wifi/" },
	{ path: "/video-photography/", note: "Service" },
	{ path: "/branding-rebranding/", note: "Service" },
	{ path: "/network-solutions/", note: "Service" },
	{ path: "/it-outsourcing-2/", note: "Current IT outsourcing page" },
	{ path: "/it-outsourcing/", note: "Older, shorter IT outsourcing page — import if copy differs" },
	{ path: "/cloud-computing-services/", note: "Service" },
	{ path: "/adhics-medical-inspection-consultancy/", note: "Service" },
	{ path: "/healthcare-and-medical-centre-software-services/", note: "Service" },
	{ path: "/privacy-policy/", note: "Verbatim if real, else build from footer's 5 privacy points" },
	{ path: "/2020/08/05/new-corporate-logo-updated-branding/", note: "News post" },
	{ path: "/2020/08/05/update-of-the-branding/", note: "News post" },
];

/** Filler paths: redirect (permanent) to the target, don't import content. */
export const FILLER_REDIRECTS = [
	{ pattern: "/testimonials/", redirectTo: "/" },
	{ pattern: "/projects/", redirectTo: "/" },
	{ pattern: "/project/*", redirectTo: "/" },
	{ pattern: "/about-us/company/", redirectTo: "/about-us/" },
	{ pattern: "/about-us/team/", redirectTo: "/about-us/" },
	{ pattern: "/about-us/gallery/", redirectTo: "/about-us/" },
	{ pattern: "/services/service-page/", redirectTo: "/" },
	{ pattern: "/texture_test/", redirectTo: "/" },
	{ pattern: "/my-account/", redirectTo: "/" },
	{ pattern: "/dt_team/*", redirectTo: "/" },
	{ pattern: "/dt_portfolio/*", redirectTo: "/" },
];

/**
 * Extra filler/legacy patterns found during the live Phase 1 crawl that weren't in the
 * original seed (WordPress system archives and an abandoned demo-events plugin). Kept
 * separate from FILLER_REDIRECTS so the checkpoint report can call out what's new.
 */
export const DISCOVERED_FILLER_REDIRECTS = [
	{ pattern: "/events/*", redirectTo: "/", note: "Modern Events Calendar demo data (Daily each 3 days, Weekly on Mondays, ...)" },
	{ pattern: "/events/", redirectTo: "/", note: "Events archive, same plugin" },
	{ pattern: "/category/*", redirectTo: "/", note: "Blog category archive (news-updates)" },
	{ pattern: "/author/*", redirectTo: "/", note: "WP author archive" },
	{ pattern: "/project-category/*", redirectTo: "/", note: "Portfolio taxonomy archive" },
	{ pattern: "/dt_team_category/*", redirectTo: "/", note: "Team taxonomy archive" },
];

function normalizePath(p) {
	if (!p) return "/";
	let out = p.split("?")[0].split("#")[0];
	if (!out.startsWith("/")) out = `/${out}`;
	if (!out.endsWith("/")) out += "/";
	return out;
}

function matchesPattern(pattern, pathname) {
	if (pattern.endsWith("/*")) {
		const prefix = pattern.slice(0, -1); // keep trailing "/"
		// The archive root itself (e.g. "/dt_team/") is filler too, same as its children.
		return pathname.startsWith(prefix);
	}
	return pathname === pattern;
}

/**
 * Classify a live pathname against the seed + discovered tables.
 * @returns {{ classification: "real" | "filler", redirectTo?: string, seedNote?: string, seedMatch: boolean }}
 */
export function classifyPath(pathname) {
	const p = normalizePath(pathname);

	const real = REAL_PAGES.find((r) => normalizePath(r.path) === p);
	if (real) return { classification: "real", seedNote: real.note, seedMatch: true };

	for (const f of FILLER_REDIRECTS) {
		if (matchesPattern(f.pattern, p)) {
			return { classification: "filler", redirectTo: f.redirectTo, seedMatch: true };
		}
	}
	for (const f of DISCOVERED_FILLER_REDIRECTS) {
		if (matchesPattern(f.pattern, p)) {
			return { classification: "filler", redirectTo: f.redirectTo, seedMatch: false, seedNote: f.note };
		}
	}

	return { classification: "needs-review", seedMatch: false };
}

export { normalizePath };
