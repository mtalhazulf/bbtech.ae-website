// Server-side verification of a Cloudflare Turnstile token (D6). The widget itself
// (src/components/shared/forms/Turnstile.js) is client-side and only produces a token;
// it proves nothing on its own until this call round-trips it with Cloudflare.
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * @param {string} token
 * @param {string} [remoteIp]
 * @returns {Promise<boolean>}
 */
export async function verifyTurnstile(token, remoteIp) {
	const secret = process.env.TURNSTILE_SECRET_KEY;
	if (!secret) {
		// A missing secret is a deploy misconfiguration, not a visitor's fault - fail
		// closed (reject the submission) but log loudly so it's caught immediately.
		console.error("[turnstile] TURNSTILE_SECRET_KEY is not set - refusing all submissions");
		return false;
	}
	const body = new URLSearchParams({ secret, response: token });
	if (remoteIp) body.set("remoteip", remoteIp);

	try {
		const res = await fetch(VERIFY_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body,
		});
		if (!res.ok) return false;
		const data = await res.json();
		return data.success === true;
	} catch (err) {
		console.error("[turnstile] verification request failed:", err.message);
		return false;
	}
}

// Cloudflare's documented always-pass test keys (Turnstile docs → "Testing"), for
// dev/CI where a real site key can't be provisioned. Never used unless the env
// explicitly opts in - production always verifies against the real secret.
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";
