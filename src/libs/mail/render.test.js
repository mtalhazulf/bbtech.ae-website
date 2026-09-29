import { describe, expect, it } from "vitest";
import { renderEmailHtml, renderEmailText } from "./render";
import notificationFixture from "@/emails/fixtures/contact-notification.json";
import autoreplyFixture from "@/emails/fixtures/contact-autoreply.json";
import hostileFixture from "@/emails/fixtures/contact-notification-hostile.json";

const TEMPLATES = [
	{ name: "contact-notification", fixture: notificationFixture },
	{ name: "contact-autoreply", fixture: autoreplyFixture },
];

describe("renderEmailHtml / renderEmailText", () => {
	for (const { name, fixture } of TEMPLATES) {
		it(`renders ${name}.html without throwing and produces well-formed-looking HTML`, () => {
			const html = renderEmailHtml(name, fixture);
			expect(html).toContain("<!doctype html>");
			expect(html).toContain("</html>");
			// juice inlines styles - a lone <style> block surviving would mean it didn't run.
			expect(html).not.toMatch(/<style/i);
		});

		it(`renders ${name}.txt without throwing`, () => {
			const text = renderEmailText(name, fixture);
			expect(text.length).toBeGreaterThan(0);
		});
	}

	it("contact-notification.html includes every submitted field and the message", () => {
		const html = renderEmailHtml("contact-notification", notificationFixture);
		for (const field of notificationFixture.fields) {
			expect(html).toContain(field.value);
		}
		expect(html).toContain("Could someone call me back this week?");
	});

	it("contact-notification.txt includes every submitted field and the message", () => {
		const text = renderEmailText("contact-notification", notificationFixture);
		for (const field of notificationFixture.fields) {
			expect(text).toContain(field.value);
		}
		expect(text).toContain("Could someone call me back this week?");
	});

	it("contact-autoreply contains no message body (anti-relay, D5.4)", () => {
		const html = renderEmailHtml("contact-autoreply", autoreplyFixture);
		const text = renderEmailText("contact-autoreply", autoreplyFixture);
		// The autoreply fixture has no `message`/`fields` at all; assert the template
		// never references them even if a caller mistakenly passed one in.
		const withMessage = renderEmailHtml("contact-autoreply", { ...autoreplyFixture, message: "SECRET-MESSAGE-TEXT" });
		expect(withMessage).not.toContain("SECRET-MESSAGE-TEXT");
		expect(html).not.toContain("fields");
		expect(text).not.toContain("fields");
	});

	it("escapes <script> and event-handler markup in the name and message", () => {
		const html = renderEmailHtml("contact-notification", hostileFixture);
		expect(html).not.toContain("<script>alert(1)</script>");
		expect(html).not.toContain('<img src=x onerror=alert(1)>');
		expect(html).toContain("&lt;script&gt;");
	});

	it("preserves line breaks in the message as <br> without unescaping markup", () => {
		const html = renderEmailHtml("contact-notification", hostileFixture);
		expect(html).toContain("First line<br>Second line");
		expect(html).toContain("&lt;b&gt;markup&lt;/b&gt;");
	});
});
