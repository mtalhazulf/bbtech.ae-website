import { NextResponse } from "next/server";
import site from "@/data/site.json";
import { checkRateLimit, clientIpFromHeaders, looksLikeBot } from "@/libs/forms/spam";
import { validateFormSubmission } from "@/libs/forms/schemas";
import { verifyTurnstile } from "@/libs/forms/turnstile";
import { getMailEnv } from "@/libs/mail/env";
import { renderEmailHtml, renderEmailText } from "@/libs/mail/render";
import { getMailTransport } from "@/libs/mail/transport";

// D1: nodemailer needs Node's net/tls, not the edge runtime; this is the only server
// code the whole site has. force-dynamic - a POST handler with per-request, per-IP
// rate-limit state must never be statically evaluated/cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 20 * 1024;

// Defense-in-depth against header/CRLF injection wherever a submitted value ends up
// inside an email header (Subject, Reply-To) - strip CR/LF outright before use.
function stripHeaderUnsafe(value) {
	return String(value ?? "").replace(/[\r\n]+/g, " ").trim();
}

// The auto-reply's only echo of user input (D5.4): first name, capped, no markup/URLs -
// never the visitor's message, so the reply can't be turned into a spam relay.
function firstNameFrom(name) {
	const stripped = String(name ?? "")
		.replace(/<[^>]*>/g, "")
		.replace(/https?:\/\/\S+/gi, "")
		.trim();
	return (stripped.split(/\s+/)[0] || "there").slice(0, 40);
}

// The notification email links back to the page the visitor submitted from - only
// accept that if it's actually a same-origin URL. An arbitrary client-supplied value
// would otherwise render as a clickable link straight into a staff inbox.
function safePageUrl(candidate, siteUrl) {
	try {
		const url = new URL(candidate, siteUrl);
		const site = new URL(siteUrl);
		if (url.origin === site.origin) return url.toString();
	} catch {
		// fall through
	}
	return null;
}

// Reads the body incrementally and bails as soon as it exceeds the cap, instead of
// buffering the whole thing first - a single Docker instance (D1: no load balancer to
// shed this for us) has to reject an oversized/unbounded body without ever materializing
// it in memory. A Content-Length over the cap short-circuits before reading anything;
// that header can lie (or be absent for a chunked body), so the streamed byte count is
// still the real enforcement, not just an optimization.
async function readBodyWithLimit(request, maxBytes) {
	const contentLength = request.headers.get("content-length");
	if (contentLength && Number(contentLength) > maxBytes) return { tooLarge: true };
	if (!request.body) return { text: await request.text() };

	const reader = request.body.getReader();
	const chunks = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.byteLength;
		if (total > maxBytes) {
			await reader.cancel().catch(() => {});
			return { tooLarge: true };
		}
		chunks.push(value);
	}
	const bytes = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return { text: new TextDecoder().decode(bytes) };
}

function jsonError(code, status, extra) {
	return NextResponse.json({ ok: false, code, ...extra }, { status });
}

function logOutcome(formId, outcome, startedAt) {
	// One structured line per submission - no message bodies/emails/phone numbers.
	console.log(JSON.stringify({ formId, outcome, durationMs: Date.now() - startedAt }));
}

export async function POST(request) {
	const startedAt = Date.now();
	const formId = "unknown";

	if (!request.headers.get("content-type")?.includes("application/json")) {
		return jsonError("invalid_content_type", 400);
	}

	let raw;
	try {
		const { text, tooLarge } = await readBodyWithLimit(request, MAX_BODY_BYTES);
		if (tooLarge) return jsonError("payload_too_large", 413);
		raw = JSON.parse(text);
	} catch {
		return jsonError("invalid_json", 400);
	}
	if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
		return jsonError("invalid_json", 400);
	}

	const resolvedFormId = typeof raw?.formId === "string" ? raw.formId : formId;
	const ip = clientIpFromHeaders(request.headers);

	// 2. Rate limit (5 / 10 min / IP).
	const rate = checkRateLimit(ip);
	if (rate.limited) {
		logOutcome(resolvedFormId, "rate_limited", startedAt);
		return NextResponse.json(
			{ ok: false, code: "rate_limited" },
			{ status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } }
		);
	}

	// 3. Honeypot + minimum fill time - a bot gets a silent 200, nothing is sent.
	if (looksLikeBot(raw)) {
		logOutcome(resolvedFormId, "bot_silently_accepted", startedAt);
		return NextResponse.json({ ok: true });
	}

	// 4. Turnstile.
	const turnstileOk = await verifyTurnstile(raw?.turnstileToken, ip);
	if (!turnstileOk) {
		logOutcome(resolvedFormId, "turnstile_failed", startedAt);
		return jsonError("turnstile_failed", 400);
	}

	// 5. zod validation.
	const validation = validateFormSubmission(resolvedFormId, raw);
	if (!validation.success) {
		logOutcome(resolvedFormId, "invalid", startedAt);
		return jsonError("invalid", 422, { fieldErrors: validation.fieldErrors });
	}
	const data = validation.data;

	let env;
	try {
		env = getMailEnv();
	} catch (err) {
		console.error("[contact] mail environment invalid:", err.message);
		logOutcome(resolvedFormId, "mail_failed", startedAt);
		return jsonError("mail_failed", 502);
	}

	const facts = site.facts;
	const name = stripHeaderUnsafe(data.name);
	const email = stripHeaderUnsafe(data.email);
	const pageUrl = safePageUrl(raw?.pageUrl, env.SITE_URL) || `${env.SITE_URL}/contact/`;
	const formLabel = "Contact form";

	const fields = [
		{ label: "Name", value: data.name },
		{ label: "Email", value: data.email },
		...(data.telephone ? [{ label: "Telephone", value: data.telephone }] : []),
	];

	const notificationData = {
		subject: stripHeaderUnsafe(`New enquiry: ${formLabel}, ${name}`),
		preheaderText: `New enquiry from ${name} via ${formLabel}`,
		siteUrl: env.SITE_URL,
		formLabel,
		name: data.name,
		pageUrl,
		submittedAt: new Date().toISOString(),
		fields,
		message: data.message,
		replyMailto: `mailto:${email}`,
		replyLabel: `Reply to ${name}`,
		facts,
	};

	const transport = getMailTransport();

	// 6. Team notification. A failure here fails the request (502) - the whole point
	// of the form is that this email arrives.
	try {
		await transport.sendMail({
			from: env.MAIL_FROM,
			to: env.MAIL_TO,
			bcc: env.MAIL_BCC || undefined,
			// Structured form, not a hand-built "name <email>" string: nodemailer quotes
			// and escapes `name` itself, so a name containing `"`, `<`/`>`, or a comma
			// can't break out and inject an extra address or header.
			replyTo: { name, address: email },
			subject: notificationData.subject,
			html: renderEmailHtml("contact-notification", notificationData),
			text: renderEmailText("contact-notification", notificationData),
		});
	} catch (err) {
		console.error("[contact] notification send failed:", err.message);
		logOutcome(resolvedFormId, "mail_failed", startedAt);
		return jsonError("mail_failed", 502);
	}

	// 7. Auto-reply. Best-effort - logged, never fails the request.
	try {
		const autoReplyData = {
			subject: "We've received your message | BB Tech",
			preheaderText: "Thanks for contacting BB Tech - here's what happens next",
			siteUrl: env.SITE_URL,
			firstName: firstNameFrom(data.name),
			servicesUrl: `${env.SITE_URL}/services/`,
			facts,
		};
		await transport.sendMail({
			from: env.MAIL_FROM,
			to: email,
			subject: autoReplyData.subject,
			html: renderEmailHtml("contact-autoreply", autoReplyData),
			text: renderEmailText("contact-autoreply", autoReplyData),
		});
	} catch (err) {
		console.error("[contact] auto-reply send failed (notification still sent):", err.message);
	}

	// 8.
	logOutcome(resolvedFormId, "sent", startedAt);
	return NextResponse.json({ ok: true });
}
