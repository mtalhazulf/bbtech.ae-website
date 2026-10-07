import { describe, expect, it } from "vitest";
import { mapStrapiPage } from "./mapStrapiPage";

describe("mapStrapiPage", () => {
	it("maps top-level fields straight through", () => {
		const entry = {
			id: 1,
			slug: "example",
			path: "/example/",
			source: "https://bbtech.ae/example/",
			layout: "sidebar",
			sidebarMenu: "services",
			metadata: { id: 2, title: "Example", description: "", canonical: "", ogImage: "" },
			hero: { id: 3, title: "Example" },
			sections: [],
		};

		expect(mapStrapiPage(entry)).toEqual({
			slug: "example",
			path: "/example/",
			source: "https://bbtech.ae/example/",
			layout: "sidebar",
			sidebarMenu: "services",
			metadata: { title: "Example", description: "", canonical: "", ogImage: "" },
			hero: { title: "Example" },
			sections: [],
		});
	});

	it("maps a sections.rich-text component back to type richText", () => {
		const entry = {
			slug: "example",
			path: "/example/",
			hero: { title: "Example" },
			sections: [
				{
					id: 10,
					__component: "sections.rich-text",
					heading: "Why us",
					blocks: [{ p: ["Hello"] }],
					image: { id: 11, localPath: "/images/x.webp", alt: "X", width: 600, height: 400 },
				},
			],
		};

		expect(mapStrapiPage(entry).sections).toEqual([
			{
				type: "richText",
				heading: "Why us",
				blocks: [{ p: ["Hello"] }],
				image: { localPath: "/images/x.webp", alt: "X", width: 600, height: 400 },
			},
		]);
	});

	it("maps sections.checklist items back to a flat string array", () => {
		const entry = {
			slug: "example",
			path: "/example/",
			hero: { title: "Example" },
			sections: [
				{
					id: 20,
					__component: "sections.checklist",
					heading: "Reasons",
					items: [
						{ id: 1, text: "One" },
						{ id: 2, text: "Two" },
					],
				},
			],
		};

		expect(mapStrapiPage(entry).sections).toEqual([
			{ type: "checklist", heading: "Reasons", items: ["One", "Two"] },
		]);
	});

	it("maps sections.card-grid items back to plain {title,text,icon} objects", () => {
		const entry = {
			slug: "example",
			path: "/example/",
			hero: { title: "Example" },
			sections: [
				{
					id: 30,
					__component: "sections.card-grid",
					heading: undefined,
					items: [{ id: 1, title: "A", text: "a text", icon: "Defaults-trophy" }],
				},
			],
		};

		expect(mapStrapiPage(entry).sections).toEqual([
			{
				type: "cardGrid",
				heading: undefined,
				items: [{ title: "A", text: "a text", icon: "Defaults-trophy" }],
			},
		]);
	});

	it("throws on an unknown component", () => {
		const entry = {
			slug: "x",
			path: "/x/",
			hero: { title: "X" },
			sections: [{ __component: "sections.cta" }],
		};
		expect(() => mapStrapiPage(entry)).toThrow(/Unknown CMS section component: sections.cta/);
	});

	it("maps a sections.card-grid related-post item (href/date/image) with no text/icon invented", () => {
		const entry = {
			slug: "x", path: "/x/", hero: { title: "X" },
			sections: [{
				__component: "sections.card-grid",
				items: [{ id: 1, title: "A Post", href: "/blog/a-post/", date: "2020-08-05",
					image: { id: 2, localPath: "/images/a.webp", alt: "A", width: 100, height: 100 } }],
			}],
		};
		expect(mapStrapiPage(entry).sections[0].items).toEqual([
			{ title: "A Post", href: "/blog/a-post/", date: "2020-08-05",
				image: { localPath: "/images/a.webp", alt: "A", width: 100, height: 100 } },
		]);
	});

	it("maps a sections.card-grid item's list components back to a flat string array", () => {
		const entry = {
			slug: "x", path: "/x/", hero: { title: "X" },
			sections: [{
				__component: "sections.card-grid",
				items: [{ id: 1, title: "Features", list: [{ id: 10, text: "One" }, { id: 11, text: "Two" }] }],
			}],
		};
		expect(mapStrapiPage(entry).sections[0].items).toEqual([
			{ title: "Features", list: ["One", "Two"] },
		]);
	});

	it("maps a sections.card-grid icon-only item with no text invented", () => {
		const entry = {
			slug: "x", path: "/x/", hero: { title: "X" },
			sections: [{ __component: "sections.card-grid", items: [{ id: 1, title: "English", icon: "fa-language" }] }],
		};
		expect(mapStrapiPage(entry).sections[0].items).toEqual([
			{ title: "English", icon: "fa-language" },
		]);
	});

	it("maps a sections.card-grid item's iconImage back onto a plain icon object key", () => {
		const entry = {
			slug: "x", path: "/x/", hero: { title: "X" },
			sections: [{
				__component: "sections.card-grid",
				items: [{ id: 1, title: "Mobile", text: "desc",
					iconImage: { id: 2, localPath: "/images/i.webp", alt: "I", width: 50, height: 50 } }],
			}],
		};
		expect(mapStrapiPage(entry).sections[0].items).toEqual([
			{ title: "Mobile", text: "desc", icon: { localPath: "/images/i.webp", alt: "I", width: 50, height: 50 } },
		]);
	});

	it("maps a sections.card-grid item with a card-level image alongside text", () => {
		const entry = {
			slug: "x", path: "/x/", hero: { title: "X" },
			sections: [{
				__component: "sections.card-grid",
				items: [{ id: 1, title: "Social", text: "desc",
					image: { id: 2, localPath: "/images/s.webp", alt: "S", width: 80, height: 80 } }],
			}],
		};
		expect(mapStrapiPage(entry).sections[0].items).toEqual([
			{ title: "Social", text: "desc", image: { localPath: "/images/s.webp", alt: "S", width: 80, height: 80 } },
		]);
	});
});
