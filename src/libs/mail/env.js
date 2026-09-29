import { z } from "zod";

// Validated lazily (first call, not at import/build time) - a missing SMTP var must
// fail the *request* with a clear server-side log, never the static build. Every real
// page still needs to prerender even before the client has supplied SMTP credentials.
const envSchema = z.object({
	SITE_URL: z.url().default("https://bbtech.ae"),
	SMTP_HOST: z.string().min(1, "SMTP_HOST is not set"),
	SMTP_PORT: z.coerce.number().int().positive().default(587),
	SMTP_SECURE: z
		.string()
		.optional()
		.transform(v => v === "true"),
	SMTP_USER: z.string().min(1, "SMTP_USER is not set"),
	SMTP_PASS: z.string().min(1, "SMTP_PASS is not set"),
	MAIL_FROM: z.string().min(1, "MAIL_FROM is not set"),
	MAIL_TO: z.email("MAIL_TO must be a valid email address"),
	MAIL_BCC: z.string().optional(),
	TURNSTILE_SECRET_KEY: z.string().min(1, "TURNSTILE_SECRET_KEY is not set"),
});

let cached;

/**
 * @throws if any required var is missing/invalid - callers (the route handler) catch
 * this and return 500 mail_failed, logging the specific message server-side only.
 */
export function getMailEnv() {
	if (cached) return cached;
	const result = envSchema.safeParse(process.env);
	if (!result.success) {
		const message = z
			.flattenError(result.error)
			.fieldErrors;
		throw new Error(`Invalid mail environment: ${JSON.stringify(message)}`);
	}
	cached = result.data;
	return cached;
}

/** Test-only: clears the cache so a test can set process.env and re-validate. */
export function resetMailEnvCache() {
	cached = undefined;
}
