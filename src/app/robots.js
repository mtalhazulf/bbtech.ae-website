const ORIGIN = "https://bbtech.ae";

export default function robots() {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${ORIGIN}/sitemap.xml`,
	};
}
