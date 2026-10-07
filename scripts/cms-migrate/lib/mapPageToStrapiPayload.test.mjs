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

	it("maps a cardGrid related-post item (href/date/image, no text/icon)", () => {
		const page = {
			slug: "x", path: "/x/",
			sections: [{
				type: "cardGrid",
				items: [{ title: "A Post", href: "/blog/a-post/", date: "2020-08-05", image: { localPath: "/images/a.webp", alt: "A", width: 100, height: 100 } }],
			}],
		};
		expect(mapPageToStrapiPayload(page).data.sections[0].items).toEqual([
			{ title: "A Post", href: "/blog/a-post/", date: "2020-08-05", image: { localPath: "/images/a.webp", alt: "A", width: 100, height: 100 } },
		]);
	});

	it("maps a cardGrid sub-list item's flat string list to {text} components", () => {
		const page = {
			slug: "x", path: "/x/",
			sections: [{ type: "cardGrid", items: [{ title: "Features", list: ["One", "Two"] }] }],
		};
		expect(mapPageToStrapiPayload(page).data.sections[0].items).toEqual([
			{ title: "Features", list: [{ text: "One" }, { text: "Two" }] },
		]);
	});

	it("maps a cardGrid icon-only item (no text)", () => {
		const page = {
			slug: "x", path: "/x/",
			sections: [{ type: "cardGrid", items: [{ title: "English", icon: "fa-language" }] }],
		};
		expect(mapPageToStrapiPayload(page).data.sections[0].items).toEqual([
			{ title: "English", icon: "fa-language" },
		]);
	});

	it("maps a cardGrid item whose icon is an image object into iconImage", () => {
		const page = {
			slug: "x", path: "/x/",
			sections: [{
				type: "cardGrid",
				items: [{ title: "Mobile", text: "desc", icon: { localPath: "/images/i.webp", alt: "I", width: 50, height: 50 } }],
			}],
		};
		expect(mapPageToStrapiPayload(page).data.sections[0].items).toEqual([
			{ title: "Mobile", text: "desc", iconImage: { localPath: "/images/i.webp", alt: "I", width: 50, height: 50 } },
		]);
	});

	it("maps a cardGrid item with a card-level image alongside text", () => {
		const page = {
			slug: "x", path: "/x/",
			sections: [{
				type: "cardGrid",
				items: [{ title: "Social", text: "desc", image: { localPath: "/images/s.webp", alt: "S", width: 80, height: 80 } }],
			}],
		};
		expect(mapPageToStrapiPayload(page).data.sections[0].items).toEqual([
			{ title: "Social", text: "desc", image: { localPath: "/images/s.webp", alt: "S", width: 80, height: 80 } },
		]);
	});
});
