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
export function looksLikeBot(fields) {
	const { website, renderedAt } = fields || {};
	if (typeof website === "string" && website.trim().length > 0) return true;
	if (typeof website !== "string" && typeof website !== "undefined") return true;
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

/**
 * Best-effort client IP for the rate limiter. `x-forwarded-for`'s *first* entry is
 * whatever the client itself sent - trivially spoofable, and trusting it would let
 * anyone bypass the rate limit by sending a new value per request. `cf-connecting-ip`
 * is set by Cloudflare and can't be forged past it (Cloudflare overwrites any
 * client-supplied copy); short of that, the *last* x-forwarded-for entry is the one
 * appended by the reverse proxy nearest this server, not the client. Falls back to
 * "unknown" (never blocks) rather than guessing wrong.
 *
 * This is only sound if the origin is UNREACHABLE except through Cloudflare - otherwise
 * an attacker hits the origin directly and forges cf-connecting-ip/x-forwarded-for
 * themselves, making the rate limit a no-op (Turnstile is unaffected either way, since
 * it's verified independently). That's a deployment/firewall requirement, not something
 * this function can enforce - see needs-client-input.md, "Deployment requirement".
 */
export function clientIpFromHeaders(headers) {
	const cfIp = headers.get("cf-connecting-ip");
	if (cfIp) return cfIp.trim();
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) {
		const hops = forwarded.split(",").map(h => h.trim()).filter(Boolean);
		if (hops.length) return hops[hops.length - 1];
	}
	return headers.get("x-real-ip") || "unknown";
}

export const SPAM_LIMITS = { MIN_FILL_TIME_MS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX };
