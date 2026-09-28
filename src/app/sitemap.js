import { pageRegistry } from "@/data/pages/index.js";

const ORIGIN = "https://bbtech.ae";

export default function sitemap() {
	return Object.values(pageRegistry).map((page) => ({
		url: `${ORIGIN}${page.path}`,
	}));
}
