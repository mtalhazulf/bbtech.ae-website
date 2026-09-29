import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, clientIpFromHeaders, looksLikeBot } from "./spam";

describe("looksLikeBot", () => {
	it("flags a filled honeypot", () => {
		expect(looksLikeBot({ website: "http://spam.example", renderedAt: Date.now() - 10000 })).toBe(true);
	});

	it("flags a submission faster than the minimum fill time", () => {
		expect(looksLikeBot({ website: "", renderedAt: Date.now() - 500 })).toBe(true);
	});

	it("flags a missing/invalid renderedAt", () => {
		expect(looksLikeBot({ website: "" })).toBe(true);
		expect(looksLikeBot({ website: "", renderedAt: "not a number" })).toBe(true);
	});

	it("passes a real, slow, empty-honeypot submission", () => {
		expect(looksLikeBot({ website: "", renderedAt: Date.now() - 10000 })).toBe(false);
	});
});

describe("clientIpFromHeaders", () => {
	it("prefers the first x-forwarded-for hop", () => {
		const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
		expect(clientIpFromHeaders(headers)).toBe("1.2.3.4");
	});

	it("falls back to x-real-ip", () => {
		const headers = new Headers({ "x-real-ip": "9.9.9.9" });
		expect(clientIpFromHeaders(headers)).toBe("9.9.9.9");
	});

	it("falls back to \"unknown\" rather than throwing", () => {
		expect(clientIpFromHeaders(new Headers())).toBe("unknown");
	});
});

describe("checkRateLimit", () => {
	beforeEach(() => {
		vi.useRealTimers();
	});

	it("allows the first 5 submissions from one IP, then limits the 6th", () => {
		const ip = `test-ip-${Math.random()}`;
		for (let i = 0; i < 5; i++) {
			expect(checkRateLimit(ip).limited).toBe(false);
		}
		const sixth = checkRateLimit(ip);
		expect(sixth.limited).toBe(true);
		expect(sixth.retryAfterSeconds).toBeGreaterThan(0);
	});

	it("tracks separate IPs independently", () => {
		const ipA = `test-ip-a-${Math.random()}`;
		const ipB = `test-ip-b-${Math.random()}`;
		for (let i = 0; i < 5; i++) checkRateLimit(ipA);
		expect(checkRateLimit(ipA).limited).toBe(true);
		expect(checkRateLimit(ipB).limited).toBe(false);
	});
});
