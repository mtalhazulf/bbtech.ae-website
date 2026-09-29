import { z } from "zod";

// Shared client + server validation, one branch per formId. Only "contact-default"
// exists today (src/data/forms.json — the only real <form> in the codebase; the
// service-enquiry/ERP-extension/sidebar-widget forms this pipeline was scoped for
// were never actually built as components, see content-import/launch/phase-5-forms.md).
// Adding a new form later means one more branch here plus a data/forms.json entry —
// the route handler, spam checks, and email rendering are already formId-generic.

// Trim, then cap length — every field goes through this before its own rules.
const trimmed = (max) => z.string().trim().max(max);

const contactDefaultSchema = z.object({
	formId: z.literal("contact-default"),
	name: trimmed(100).min(1, "Name is required"),
	email: trimmed(254).email("Enter a valid email address"),
	// Optional and lenient: live customers give UAE, Pakistani, or plain local numbers.
	telephone: z
		.union([trimmed(30).regex(/^[+0-9()\s-]{5,30}$/, "Enter a valid phone number"), z.literal("")])
		.optional(),
	message: trimmed(5000).min(1, "Message is required"),
	// Anti-spam fields (D6) — present on every submission, validated by src/libs/forms/spam.js,
	// not by this schema (they're not user-facing form data).
	website: z.string().optional(), // honeypot; a real visitor never fills this
	renderedAt: z.number(), // signed timestamp from the form's render time
	turnstileToken: z.string().min(1, "Verification failed - please try again"),
});

export const FORM_SCHEMAS = {
	"contact-default": contactDefaultSchema,
};

/**
 * @param {string} formId
 * @param {unknown} data
 * @returns {{ success: true, data: object } | { success: false, fieldErrors: Record<string,string[]> }}
 */
export function validateFormSubmission(formId, data) {
	const schema = FORM_SCHEMAS[formId];
	if (!schema) return { success: false, fieldErrors: { formId: ["Unknown form"] } };
	const result = schema.safeParse({ ...data, formId });
	if (result.success) return { success: true, data: result.data };
	return { success: false, fieldErrors: z.flattenError(result.error).fieldErrors };
}
