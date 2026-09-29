const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	// Pin the Turbopack workspace root to this repo. Without it, Next 16.3+ walks up
	// looking for a lockfile and can pick up an unrelated one further up the tree
	// (e.g. a stray package-lock.json in a parent folder on a dev machine), which
	// prints a "Next.js ignored package-lock.json ..." warning on every build.
	turbopack: {
		root: path.join(__dirname),
	},
	// D2: 1:1 URL parity with the live bbtech.ae paths, which are all trailing-slashed.
	trailingSlash: true,
	// Every filler/duplicate/legacy live path from content-import/inventory.json, plus
	// /about/ (this repo's pre-import placeholder) -> /about-us/. See
	// scripts/import/lib/seed-inventory.mjs for where these patterns come from and
	// content-import/needs-client-input.md for anything still open.
	async redirects() {
		// Sources must carry a trailing slash to match once trailingSlash:true has
		// normalized the incoming request path — see AGENTS.md/DESIGN.md history for why
		// this bit; without it every one of these silently no-ops.
		return [
			{ source: "/about/", destination: "/about-us/", permanent: true },

			// Named filler pages (seed inventory)
			{ source: "/testimonials/", destination: "/", permanent: true },
			{ source: "/projects/", destination: "/", permanent: true },
			{ source: "/about-us/company/", destination: "/about-us/", permanent: true },
			{ source: "/about-us/team/", destination: "/about-us/", permanent: true },
			{ source: "/about-us/gallery/", destination: "/about-us/", permanent: true },
			{ source: "/services/service-page/", destination: "/", permanent: true },
			{ source: "/texture_test/", destination: "/", permanent: true },
			{ source: "/my-account/", destination: "/", permanent: true },

			// Collections with real or placeholder content (dt_portfolio/dt_team), matched
			// as wildcards so items outside this crawl's snapshot still redirect correctly.
			{ source: "/project/:path*", destination: "/", permanent: true },
			{ source: "/dt_portfolio/:path*", destination: "/", permanent: true },
			{ source: "/dt_team/:path*", destination: "/", permanent: true },

			// WordPress system archives and the abandoned Modern Events Calendar demo data,
			// found live during the Phase 1 crawl (not in the original seed inventory).
			{ source: "/events/:path*", destination: "/", permanent: true },
			{ source: "/category/:path*", destination: "/", permanent: true },
			{ source: "/author/:path*", destination: "/", permanent: true },
			{ source: "/project-category/:path*", destination: "/", permanent: true },
			{ source: "/dt_team_category/:path*", destination: "/", permanent: true },
		];
	},
	// Phase 5 (launch-completion): no live page embeds a third-party iframe today
	// (Contact3.js is a dead template component with a Google Maps embed, unreachable
	// from any real route - see content-import/launch/phase-5-forms.md), so the CSP
	// below omits maps.google.com; add it under frame-src if a map embed goes live.
	// script-src/style-src need 'unsafe-inline' (and script-src needs 'unsafe-eval',
	// for GSAP - ScrollSmoother/SplitText use it internally, confirmed via a live CSP
	// violation in testing, not guessed): this app has no CSP-nonce plumbing,
	// and both Next.js's own hydration script and every component's inline style={}
	// prop (used throughout - not something a CSP change should have to rewrite) rely
	// on it. A nonce-based CSP is stricter, but Next.js has shipped nonce-handling XSS
	// bugs before, and getting that wrong is worse than this trade-off. Verified
	// unbroken against a full build in Phase 5.
	async headers() {
		const csp = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob:",
			"font-src 'self' data:",
			"connect-src 'self' https://challenges.cloudflare.com",
			"frame-src https://challenges.cloudflare.com",
			"frame-ancestors 'self'",
			"base-uri 'self'",
			"form-action 'self'",
		].join("; ");
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "Content-Security-Policy", value: csp },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
				],
			},
		];
	},
};

module.exports = nextConfig;
