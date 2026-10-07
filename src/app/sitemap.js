import { getAllPages, getBespokePages } from "@/data/pages/index.js";

const ORIGIN = "https://bbtech.ae";

export default async function sitemap() {
	const [cmsPages, bespokePages] = await Promise.all([getAllPages(), Promise.resolve(getBespokePages())]);
	const allPages = { ...cmsPages, ...bespokePages };
	return Object.values(allPages).map((page) => ({
		url: `${ORIGIN}${page.path}`,
	}));
}
