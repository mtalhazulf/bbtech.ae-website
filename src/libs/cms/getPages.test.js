import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({ strapiFetch: vi.fn() }));

describe("getAllPages", () => {
	beforeEach(() => {
		// getAllPages memoizes in a module-level variable - reset the module registry and
		// re-import fresh in every test, or the second test would silently reuse the first
		// test's already-resolved (and already-asserted-on) cache instead of exercising its
		// own scenario.
		vi.resetModules();
	});

	it("fetches published pages and keys them by slug", async () => {
		const { strapiFetch } = await import("./client");
		strapiFetch.mockResolvedValue({
			data: [
				{ slug: "erp", path: "/erp/", hero: { title: "ERP" }, sections: [] },
				{ slug: "odoo-development", path: "/odoo-development/", hero: { title: "Odoo" }, sections: [] },
			],
		});
		const { getAllPages } = await import("./getPages");

		const pages = await getAllPages();

		expect(Object.keys(pages).sort()).toEqual(["erp", "odoo-development"]);
		expect(pages.erp.path).toBe("/erp/");
		expect(strapiFetch).toHaveBeenCalledWith(expect.stringContaining("/api/pages"));
	});

	it("only calls strapiFetch once across repeated calls in the same build", async () => {
		const { strapiFetch } = await import("./client");
		strapiFetch.mockResolvedValue({ data: [] });
		const { getAllPages } = await import("./getPages");

		await getAllPages();
		await getAllPages();

		expect(strapiFetch).toHaveBeenCalledTimes(1);
	});
});
