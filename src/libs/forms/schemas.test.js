import { describe, expect, it } from "vitest";
import { FORM_SCHEMAS, validateFormSubmission } from "./schemas";

const VALID = {
	formId: "contact-default",
	name: "Jane Visitor",
	email: "jane@example.com",
	telephone: "+971 50 123 4567",
	message: "Hello, I'd like a quote.",
	website: "",
	renderedAt: Date.now() - 5000,
	turnstileToken: "test-token",
};

describe("FORM_SCHEMAS", () => {
	it("has an entry for every form in data/forms.json", () => {
		// Keep in sync deliberately, not automatically - a schema is a security
		// boundary, so a new form must be a conscious addition here too.
		expect(Object.keys(FORM_SCHEMAS)).toEqual(["contact-default"]);
	});
});

describe("validateFormSubmission - contact-default", () => {
	it("accepts a valid submission", () => {
		const result = validateFormSubmission("contact-default", VALID);
		expect(result.success).toBe(true);
	});

	it("accepts a valid submission with telephone omitted", () => {
		const { telephone, ...rest } = VALID;
		const result = validateFormSubmission("contact-default", rest);
		expect(result.success).toBe(true);
	});

	it("rejects an unknown formId", () => {
		const result = validateFormSubmission("nonexistent-form", VALID);
		expect(result.success).toBe(false);
	});

	it("rejects a missing name", () => {
		const result = validateFormSubmission("contact-default", { ...VALID, name: "" });
		expect(result.success).toBe(false);
		expect(result.fieldErrors.name).toBeTruthy();
	});

	it("rejects an invalid email", () => {
		const result = validateFormSubmission("contact-default", { ...VALID, email: "not-an-email" });
		expect(result.success).toBe(false);
		expect(result.fieldErrors.email).toBeTruthy();
	});

	it("rejects a missing message", () => {
		const result = validateFormSubmission("contact-default", { ...VALID, message: "" });
		expect(result.success).toBe(false);
		expect(result.fieldErrors.message).toBeTruthy();
	});

	it("rejects an implausible phone number", () => {
		const result = validateFormSubmission("contact-default", { ...VALID, telephone: "not a phone" });
		expect(result.success).toBe(false);
	});

	it("caps name at 100 characters", () => {
		const result = validateFormSubmission("contact-default", { ...VALID, name: "a".repeat(101) });
		expect(result.success).toBe(false);
	});

	it("caps email at 254 characters", () => {
		const longLocal = "a".repeat(250);
		const result = validateFormSubmission("contact-default", { ...VALID, email: `${longLocal}@example.com` });
		expect(result.success).toBe(false);
	});

	it("caps message at 5000 characters", () => {
		const result = validateFormSubmission("contact-default", { ...VALID, message: "a".repeat(5001) });
		expect(result.success).toBe(false);
	});

	it("trims whitespace from name and message", () => {
		const result = validateFormSubmission("contact-default", {
			...VALID,
			name: "  Jane Visitor  ",
			message: "  Hello  ",
		});
		expect(result.success).toBe(true);
		expect(result.data.name).toBe("Jane Visitor");
		expect(result.data.message).toBe("Hello");
	});

	it("rejects a submission with no turnstileToken", () => {
		const { turnstileToken, ...rest } = VALID;
		const result = validateFormSubmission("contact-default", rest);
		expect(result.success).toBe(false);
	});
});
