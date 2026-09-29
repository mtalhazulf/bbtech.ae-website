"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise;

function loadTurnstileScript() {
	if (typeof window === "undefined") return Promise.resolve();
	if (window.turnstile) return Promise.resolve();
	if (scriptPromise) return scriptPromise;
	scriptPromise = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = SCRIPT_SRC;
		script.async = true;
		script.defer = true;
		script.onload = resolve;
		script.onerror = () => reject(new Error("Failed to load Turnstile"));
		document.head.appendChild(script);
	});
	return scriptPromise;
}

/**
 * Explicit-render Cloudflare Turnstile widget (D6). `onVerify(token)` fires once a
 * challenge passes; the parent form calls `ref.current.reset()` after every submit
 * (success or failure) so a resubmission always carries a fresh token.
 * @param {{ onVerify: (token: string) => void }} props
 */
const Turnstile = forwardRef(function Turnstile({ onVerify }, ref) {
	const containerRef = useRef(null);
	const widgetIdRef = useRef(null);

	useImperativeHandle(ref, () => ({
		reset() {
			if (widgetIdRef.current !== null && window.turnstile) {
				window.turnstile.reset(widgetIdRef.current);
			}
		},
	}));

	useEffect(() => {
		if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
			// Not configured yet (content-import/needs-client-input.md): render nothing
			// rather than let Turnstile throw on an undefined sitekey. The form still
			// shows and can be filled in; submission fails server-side (fail closed)
			// until the client supplies a real site key.
			console.warn("[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set - widget disabled.");
			return;
		}
		let cancelled = false;
		loadTurnstileScript()
			.then(() => {
				if (cancelled || !containerRef.current || !window.turnstile) return;
				widgetIdRef.current = window.turnstile.render(containerRef.current, {
					sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
					callback: onVerify,
					"expired-callback": () => onVerify(""),
					"error-callback": () => onVerify(""),
				});
			})
			.catch(err => console.error("[Turnstile] failed to load:", err.message));
		return () => {
			cancelled = true;
			if (widgetIdRef.current !== null && window.turnstile) {
				window.turnstile.remove(widgetIdRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <div ref={containerRef} className="ci-turnstile" />;
});

export default Turnstile;
