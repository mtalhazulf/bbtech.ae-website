/**
 * Thin fetch wrapper for Strapi's REST API. Called only at `next build` time (see
 * getPages.js) — never at request time, so the deployed site makes zero runtime calls here.
 */
export async function strapiFetch(path) {
	const baseUrl = process.env.STRAPI_URL;
	if (!baseUrl) {
		throw new Error("STRAPI_URL is not set");
	}

	const token = process.env.STRAPI_API_TOKEN;
	const res = await fetch(`${baseUrl}${path}`, {
		headers: token ? { Authorization: `Bearer ${token}` } : {},
	});

	if (!res.ok) {
		throw new Error(`Strapi request to ${path} failed: ${res.status} ${res.statusText}`);
	}

	return res.json();
}
