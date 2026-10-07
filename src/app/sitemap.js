import { getAllPages } from "@/data/pages/index.js";

const ORIGIN = "https://bbtech.ae";

export default async function sitemap() {
	const pages = await getAllPages();
	return Object.values(pages).map((page) => ({
		url: `${ORIGIN}${page.path}`,
	}));
}
