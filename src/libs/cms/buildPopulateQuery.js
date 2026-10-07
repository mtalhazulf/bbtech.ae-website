/**
 * Convert a nested object structure to Strapi 5 query string format.
 * Handles the bracket notation: populate[field][populate][nested]=true
 *
 * @param {object} obj - The populate structure to convert
 * @param {string} prefix - The query parameter prefix (usually "populate")
 * @returns {string} URL search parameters
 */
export function buildPopulateQuery(obj, prefix = "populate") {
	const params = new URLSearchParams();

	function recurse(o, p) {
		if (o === null || o === undefined) {
			// Skip null/undefined
		} else if (typeof o === "boolean") {
			params.append(p, o.toString());
		} else if (typeof o === "string" || typeof o === "number") {
			params.append(p, o.toString());
		} else if (Array.isArray(o)) {
			o.forEach((item, index) => {
				recurse(item, `${p}[${index}]`);
			});
		} else if (typeof o === "object") {
			Object.keys(o).forEach((key) => {
				const newKey = p ? `${p}[${key}]` : key;
				recurse(o[key], newKey);
			});
		}
	}

	recurse(obj, prefix);
	return params.toString();
}

/**
 * Define the populate structure for fetching all nested page data from Strapi.
 * Covers metadata (ogImage), hero (image), and all dynamic zone sections with nested fields.
 */
export const PAGE_POPULATE_STRUCTURE = {
	metadata: true,
	hero: {
		populate: {
			image: true,
		},
	},
	sections: {
		on: {
			"sections.rich-text": {
				populate: {
					image: true,
				},
			},
			"sections.checklist": {
				populate: {
					items: true,
				},
			},
			"sections.card-grid": {
				populate: {
					items: {
						populate: {
							image: true,
							iconImage: true,
							list: true,
						},
					},
				},
			},
		},
	},
};
