import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { strapiFetch } from "./client";

describe("strapiFetch", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env.STRAPI_URL = "http://cms.test";
		process.env.STRAPI_API_TOKEN = "test-token";
	});

	afterEach(() => {
		process.env = { ...originalEnv };
		vi.restoreAllMocks();
	});

	it("throws if STRAPI_URL is not set", async () => {
		delete process.env.STRAPI_URL;
		await expect(strapiFetch("/api/pages")).rejects.toThrow("STRAPI_URL is not set");
	});

	it("sends the bearer token and returns parsed JSON on success", async () => {
		const json = vi.fn().mockResolvedValue({ data: [] });
		global.fetch = vi.fn().mockResolvedValue({ ok: true, json });

		const result = await strapiFetch("/api/pages");

		expect(global.fetch).toHaveBeenCalledWith("http://cms.test/api/pages", {
			headers: { Authorization: "Bearer test-token" },
		});
		expect(result).toEqual({ data: [] });
	});

	it("throws a descriptive error on a non-ok response", async () => {
		global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, statusText: "Service Unavailable" });

		await expect(strapiFetch("/api/pages")).rejects.toThrow(/503/);
	});
});
