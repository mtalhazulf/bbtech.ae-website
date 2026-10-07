import { describe, expect, it } from "vitest";
import { mapPageToStrapiPayload } from "./mapPageToStrapiPayload.mjs";

describe("mapPageToStrapiPayload", () => {
	it("maps top-level fields straight through", () => {
		const page = {
			slug: "example",
			path: "/example/",
			source: "https://bbtech.ae/example/",
			layout: "sidebar",
			sidebarMenu: "services",
			metadata: { title: "Example", description: "", canonical: "", ogImage: "" },
			hero: { title: "Example" },
			sections: [],
		};

		expect(mapPageToStrapiPayload(page)).toEqual({
			data: {
				slug: "example",
				path: "/example/",
				source: "https://bbtech.ae/example/",
				layout: "sidebar",
				sidebarMenu: "services",
				metadata: { title: "Example", description: "", canonical: "", ogImage: "" },
				hero: { title: "Example" },
				sections: [],
			},
		});
	});

	it("maps a richText section to sections.rich-text, keeping blocks and image as-is", () => {
		const page = {
			slug: "example",
			path: "/example/",
			sections: [
				{
					type: "richText",
					heading: "Why us",
					blocks: [{ p: ["Hello"] }, { ul: ["One", "Two"] }],
					image: { localPath: "/images/x.webp", alt: "X", width: 600, height: 400 },
				},
			],
		};

		expect(mapPageToStrapiPayload(page).data.sections).toEqual([
			{
				__component: "sections.rich-text",
				heading: "Why us",
				blocks: [{ p: ["Hello"] }, { ul: ["One", "Two"] }],
				image: { localPath: "/images/x.webp", alt: "X", width: 600, height: 400 },
			},
		]);
	});

	it("maps a checklist section's flat string items to {text} components", () => {
		const page = {
			slug: "example",
			path: "/example/",
			sections: [{ type: "checklist", heading: "Reasons", items: ["One", "Two"] }],
		};

		expect(mapPageToStrapiPayload(page).data.sections).toEqual([
			{
				__component: "sections.checklist",
				heading: "Reasons",
				items: [{ text: "One" }, { text: "Two" }],
			},
		]);
	});

	it("maps a cardGrid section's items through unchanged (same field names as the component)", () => {
		const page = {
			slug: "example",
			path: "/example/",
			sections: [
				{
					type: "cardGrid",
					items: [{ title: "A", text: "a text", icon: "Defaults-trophy" }],
				},
			],
		};

		expect(mapPageToStrapiPayload(page).data.sections).toEqual([
			{
				__component: "sections.card-grid",
				heading: undefined,
				items: [{ title: "A", text: "a text", icon: "Defaults-trophy" }],
			},
		]);
	});

	it("throws on an unknown section type", () => {
		const page = { slug: "x", path: "/x/", sections: [{ type: "cta" }] };
		expect(() => mapPageToStrapiPayload(page)).toThrow(/Unknown page section type: cta/);
	});
});
