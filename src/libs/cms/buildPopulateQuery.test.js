import { describe, expect, it } from "vitest";
import { buildPopulateQuery, PAGE_POPULATE_STRUCTURE } from "./buildPopulateQuery";

describe("buildPopulateQuery", () => {
	it("converts simple boolean populate to query string", () => {
		const result = buildPopulateQuery({ metadata: true }, "populate");
		expect(result).toBe("populate%5Bmetadata%5D=true");
	});

	it("converts nested object to bracket notation", () => {
		const result = buildPopulateQuery(
			{
				hero: {
					populate: {
						image: true,
					},
				},
			},
			"populate"
		);
		expect(result).toContain("populate%5Bhero%5D%5Bpopulate%5D%5Bimage%5D=true");
	});

	it("handles dynamic zone on syntax correctly", () => {
		const result = buildPopulateQuery(
			{
				sections: {
					on: {
						"sections.rich-text": {
							populate: {
								image: true,
							},
						},
					},
				},
			},
			"populate"
		);
		expect(result).toContain("sections.rich-text");
		expect(result).toContain("%5Bimage%5D=true");
	});

	it("builds the full PAGE_POPULATE_STRUCTURE correctly", () => {
		const result = buildPopulateQuery(PAGE_POPULATE_STRUCTURE);
		// Should contain all major populate keys
		expect(result).toContain("metadata");
		expect(result).toContain("hero");
		expect(result).toContain("sections");
		// Should contain the component names
		expect(result).toContain("sections.rich-text");
		expect(result).toContain("sections.checklist");
		expect(result).toContain("sections.card-grid");
		// Should contain nested field names
		expect(result).toContain("image");
		expect(result).toContain("items");
		expect(result).toContain("iconImage");
		expect(result).toContain("list");
	});
});
