// D6: honeypot + minimum-fill-time + a per-IP in-memory rate limit. Layered in front
// of Turnstile and zod validation in the route handler (src/app/api/contact/route.js),
// in that order — cheapest checks first.

const MIN_FILL_TIME_MS = 3000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;

/**
 * True if the submission looks like a bot: the honeypot field is filled, or the form
 * was submitted faster than a human could fill it in. Callers that get `true` back
 * should return 200 { ok: true } without sending mail — telling a bot it "worked"
 * teaches it nothing, where a 4xx invites retries with adjusted timing/fields.
 * @param {{ website?: string, renderedAt: number }} fields
 */
export function looksLikeBot({ website, renderedAt }) {
	if (website && website.trim().length > 0) return true;
	if (typeof renderedAt !== "number" || Number.isNaN(renderedAt)) return true;
	return Date.now() - renderedAt < MIN_FILL_TIME_MS;
}

// Per-instance memory, sliding window. Fine for this single-container deployment
// (see AGENTS.md / the Dockerfile); a multi-instance deployment would need a shared
// store (e.g. Redis) instead — noted here rather than silently not scaling.
const hits = new Map(); // ip -> timestamps[]

function sweep(now) {
	for (const [ip, timestamps] of hits) {
		const kept = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
		if (kept.length) hits.set(ip, kept);
		else hits.delete(ip);
	}
}

/**
 * @param {string} ip
 * @returns {{ limited: boolean, retryAfterSeconds?: number }}
 */
export function checkRateLimit(ip) {
	const now = Date.now();
	// Sweep occasionally, not every call, so this stays O(1) amortized under load.
	if (Math.random() < 0.05) sweep(now);

	const timestamps = (hits.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
	if (timestamps.length >= RATE_LIMIT_MAX) {
		const retryAfterSeconds = Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
		return { limited: true, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
	}
	timestamps.push(now);
	hits.set(ip, timestamps);
	return { limited: false };
}

/** First hop of x-forwarded-for, falling back to x-real-ip, else "unknown" (never blocks). */
export function clientIpFromHeaders(headers) {
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0].trim();
	return headers.get("x-real-ip") || "unknown";
}

export const SPAM_LIMITS = { MIN_FILL_TIME_MS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX };
