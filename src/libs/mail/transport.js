import nodemailer from "nodemailer";
import { getMailEnv } from "@/libs/mail/env";

let transport;
let verified = false;

/** Pooled nodemailer transport, created once per server process and reused. */
export function getMailTransport() {
	if (transport) return transport;
	const env = getMailEnv();
	transport = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		secure: env.SMTP_SECURE, // true for 465, false (STARTTLS) for 587/25
		auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
		pool: true,
		maxConnections: 3,
	});
	return transport;
}

/** Verifies the SMTP connection once (lazily, on first real send attempt). */
export async function verifyMailTransport() {
	if (verified) return;
	await getMailTransport().verify();
	verified = true;
}

/** Test-only: drops the cached transport/verification state. */
export function resetMailTransport() {
	transport = undefined;
	verified = false;
}
