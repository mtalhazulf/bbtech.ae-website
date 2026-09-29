import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mocked before the route module is imported, so its own module-level
// getMailTransport()/verifyTurnstile() calls hit these instead of the real network.
const sendMail = vi.fn().mockResolvedValue({ messageId: "test" });
vi.mock("@/libs/mail/transport", () => ({
	getMailTransport: () => ({ sendMail }),
	verifyMailTransport: vi.fn(),
}));
const verifyTurnstileMock = vi.fn().mockResolvedValue(true);
vi.mock("@/libs/forms/turnstile", () => ({
	verifyTurnstile: (...args) => verifyTurnstileMock(...args),
}));

process.env.SITE_URL = "https://bbtech.ae";
process.env.SMTP_HOST = "smtp.example.com";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "user";
process.env.SMTP_PASS = "pass";
process.env.MAIL_FROM = "BB Tech <no-reply@bbtech.ae>";
process.env.MAIL_TO = "info@bbtech.ae";
process.env.TURNSTILE_SECRET_KEY = "test-secret";

const { POST } = await import("./route");
const { resetMailEnvCache } = await import("@/libs/mail/env");

function makeRequest(body, { ip = "203.0.113.1", contentType = "application/json" } = {}) {
	return new Request("http://localhost/api/contact", {
		method: "POST",
		headers: { "content-type": contentType, "x-forwarded-for": ip },
		body: JSON.stringify(body),
	});
}

const VALID_BODY = {
	formId: "contact-default",
	name: "Jane Visitor",
	email: "jane@example.com",
	telephone: "",
	message: "Hello, I'd like a quote.",
	website: "",
	renderedAt: Date.now() - 5000,
	turnstileToken: "test-token",
	pageUrl: "https://bbtech.ae/contact/",
};

describe("POST /api/contact", () => {
	beforeEach(() => {
		sendMail.mockClear().mockResolvedValue({ messageId: "test" });
		verifyTurnstileMock.mockClear().mockResolvedValue(true);
		resetMailEnvCache();
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("sends both emails and returns 200 for a valid submission", async () => {
		const res = await POST(makeRequest({ ...VALID_BODY }, { ip: `1.1.1.${Math.random()}` }));
		const body = await res.json();
		expect(res.status).toBe(200);
		expect(body.ok).toBe(true);
		expect(sendMail).toHaveBeenCalledTimes(2);
	});

	it("honeypot: returns 200 and sends nothing", async () => {
		const res = await POST(makeRequest({ ...VALID_BODY, website: "http://spam.example" }, { ip: `2.2.2.${Math.random()}` }));
		const body = await res.json();
		expect(res.status).toBe(200);
		expect(body.ok).toBe(true);
		expect(sendMail).not.toHaveBeenCalled();
		expect(verifyTurnstileMock).not.toHaveBeenCalled();
	});

	it("timing: a submission faster than the minimum fill time sends nothing", async () => {
		const res = await POST(makeRequest({ ...VALID_BODY, renderedAt: Date.now() }, { ip: `3.3.3.${Math.random()}` }));
		expect(res.status).toBe(200);
		expect(sendMail).not.toHaveBeenCalled();
	});

	it("Turnstile failure returns 400 and sends nothing", async () => {
		verifyTurnstileMock.mockResolvedValueOnce(false);
		const res = await POST(makeRequest({ ...VALID_BODY }, { ip: `4.4.4.${Math.random()}` }));
		const body = await res.json();
		expect(res.status).toBe(400);
		expect(body.code).toBe("turnstile_failed");
		expect(sendMail).not.toHaveBeenCalled();
	});

	it("invalid input returns 422 with field errors", async () => {
		const res = await POST(makeRequest({ ...VALID_BODY, email: "not-an-email" }, { ip: `5.5.5.${Math.random()}` }));
		const body = await res.json();
		expect(res.status).toBe(422);
		expect(body.fieldErrors.email).toBeTruthy();
		expect(sendMail).not.toHaveBeenCalled();
	});

	it("notification send failure returns 502 and never attempts the auto-reply", async () => {
		sendMail.mockRejectedValueOnce(new Error("SMTP down"));
		const res = await POST(makeRequest({ ...VALID_BODY }, { ip: `6.6.6.${Math.random()}` }));
		const body = await res.json();
		expect(res.status).toBe(502);
		expect(body.code).toBe("mail_failed");
		expect(sendMail).toHaveBeenCalledTimes(1);
	});

	it("auto-reply failure is logged but the request still succeeds", async () => {
		sendMail.mockResolvedValueOnce({ messageId: "notification" }).mockRejectedValueOnce(new Error("autoreply bounced"));
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const res = await POST(makeRequest({ ...VALID_BODY }, { ip: `7.7.7.${Math.random()}` }));
		const body = await res.json();
		expect(res.status).toBe(200);
		expect(body.ok).toBe(true);
		expect(sendMail).toHaveBeenCalledTimes(2);
		expect(errorSpy).toHaveBeenCalled();
	});

	it("the 6th rapid request from the same IP returns 429", async () => {
		const ip = `8.8.8.${Math.random()}`;
		for (let i = 0; i < 5; i++) {
			const res = await POST(makeRequest({ ...VALID_BODY }, { ip }));
			expect(res.status).toBe(200);
		}
		const sixth = await POST(makeRequest({ ...VALID_BODY }, { ip }));
		expect(sixth.status).toBe(429);
		expect(sixth.headers.get("Retry-After")).toBeTruthy();
	});

	it("rejects a non-JSON content type", async () => {
		const res = await POST(makeRequest(VALID_BODY, { ip: `9.9.9.${Math.random()}`, contentType: "text/plain" }));
		expect(res.status).toBe(400);
	});

	it("strips CRLF from the name before it reaches any header", async () => {
		const res = await POST(
			makeRequest({ ...VALID_BODY, name: "Jane\r\nBcc: evil@example.com" }, { ip: `10.10.10.${Math.random()}` })
		);
		expect(res.status).toBe(200);
		const [notificationCall] = sendMail.mock.calls;
		expect(notificationCall[0].replyTo).not.toMatch(/[\r\n]/);
		expect(notificationCall[0].subject).not.toMatch(/[\r\n]/);
	});
});
