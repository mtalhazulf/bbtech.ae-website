"use client";
import getSiteConfig from "@/libs/getSiteConfig";
import { FORM_SCHEMAS } from "@/libs/forms/schemas";
import { useRef, useState } from "react";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Turnstile from "./Turnstile";

const AUTOCOMPLETE = { name: "name", email: "email", telephone: "tel", tel: "tel", phone: "tel" };

/** One form control with a visible label (DESIGN.md §7: never placeholder-only). */
function Field({ formId, field, value, error, onChange }) {
	const { name, label, type = "text", placeholder, required } = field;
	const id = `${formId}-${name}`;
	const errorId = error ? `${id}-error` : undefined;
	const hint = placeholder && placeholder !== label ? placeholder : undefined;
	const auto = AUTOCOMPLETE[name] || (type === "email" ? "email" : type === "tel" ? "tel" : undefined);
	const commonProps = {
		id,
		name,
		required,
		"aria-required": required || undefined,
		"aria-invalid": error ? "true" : undefined,
		"aria-describedby": errorId,
		value: value || "",
		onChange: e => onChange(name, e.target.value),
	};

	return (
		<div className={`form-input ci-field ${type === "textarea" ? "message-input" : ""}`}>
			<label htmlFor={id}>{label}</label>
			{type === "textarea" ? (
				<textarea {...commonProps} placeholder={hint} rows={5} />
			) : (
				<input {...commonProps} type={type} placeholder={hint} autoComplete={auto} />
			)}
			{error ? (
				<p id={errorId} className="ci-field-error" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}

const STATUS = { IDLE: "idle", SUBMITTING: "submitting", SUCCESS: "success", ERROR: "error" };

/**
 * Renders any formId in src/data/forms.json against POST /api/contact (D5). Same field
 * markup/classes the template shipped with (ci-field wrapper, visible labels) - this
 * replaces the old preventDefault()-only stub in DynamicForm.js/ContactFormCard.js.
 * @param {{ formId: string, fields: Array, consent?: string, submitText?: string, gridClass?: (field: object) => string }} props
 */
export default function ContactForm({ formId, fields = [], consent, submitText = "Send message", gridClass }) {
	const { contact } = getSiteConfig();
	const [values, setValues] = useState({});
	const [fieldErrors, setFieldErrors] = useState({});
	const [status, setStatus] = useState(STATUS.IDLE);
	const [statusMessage, setStatusMessage] = useState("");
	const renderedAtRef = useRef(Date.now());
	const turnstileTokenRef = useRef("");
	const turnstileRef = useRef(null);
	const formRef = useRef(null);

	function handleChange(name, value) {
		setValues(prev => ({ ...prev, [name]: value }));
		setFieldErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (status === STATUS.SUBMITTING) return;

		const payload = {
			formId,
			...values,
			website: values.website || "",
			renderedAt: renderedAtRef.current,
			turnstileToken: turnstileTokenRef.current,
			pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
		};

		// Client-side validation first (same schema as the server) - instant feedback;
		// the server re-validates regardless, since a client can always be bypassed.
		const schema = FORM_SCHEMAS[formId];
		const localCheck = schema?.safeParse(payload);
		if (localCheck && !localCheck.success) {
			const errors = {};
			for (const issue of localCheck.error.issues) errors[issue.path[0]] = issue.message;
			setFieldErrors(errors);
			setStatus(STATUS.ERROR);
			setStatusMessage("Please fix the highlighted fields.");
			const firstInvalid = Object.keys(errors)[0];
			formRef.current?.querySelector(`[name="${firstInvalid}"]`)?.focus();
			return;
		}

		setStatus(STATUS.SUBMITTING);
		setStatusMessage("Sending…");
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const body = await res.json().catch(() => ({}));

			if (res.ok && body.ok) {
				setStatus(STATUS.SUCCESS);
				setStatusMessage("Thanks - we've received your message and will be in touch.");
				setValues({});
				setFieldErrors({});
				formRef.current?.reset();
			} else if (res.status === 422 && body.fieldErrors) {
				const errors = {};
				for (const [field, messages] of Object.entries(body.fieldErrors)) errors[field] = messages?.[0];
				setFieldErrors(errors);
				setStatus(STATUS.ERROR);
				setStatusMessage("Please fix the highlighted fields.");
			} else {
				setStatus(STATUS.ERROR);
				setStatusMessage(
					`Something went wrong sending your message. Please try again, or email ${contact.email} / call ${contact.phone.display} directly.`
				);
			}
		} catch {
			setStatus(STATUS.ERROR);
			setStatusMessage(
				`Something went wrong sending your message. Please try again, or email ${contact.email} / call ${contact.phone.display} directly.`
			);
		} finally {
			renderedAtRef.current = Date.now();
			turnstileTokenRef.current = "";
			turnstileRef.current?.reset();
		}
	}

	return (
		<form ref={formRef} id={formId} onSubmit={handleSubmit} noValidate>
			<div className="row">
				{fields.map((field, i) => (
					<div key={i} className={gridClass ? gridClass(field) : field.type === "textarea" ? "col-12" : "col-sm-6"}>
						<Field
							formId={formId}
							field={field}
							value={values[field.name]}
							error={fieldErrors[field.name]}
							onChange={handleChange}
						/>
					</div>
				))}
			</div>

			{/* Honeypot: visually hidden (not display:none alone), never seen or filled by a
			    real visitor; a labelled aria-hidden wrapper keeps assistive tech out of it too. */}
			<div className="ci-honeypot-wrap" aria-hidden="true">
				<label htmlFor={`${formId}-website`}>Leave this field empty</label>
				<input
					type="text"
					id={`${formId}-website`}
					name="website"
					tabIndex={-1}
					autoComplete="off"
					value={values.website || ""}
					onChange={e => handleChange("website", e.target.value)}
				/>
			</div>

			<div className="ci-turnstile-wrap">
				<Turnstile ref={turnstileRef} onVerify={token => (turnstileTokenRef.current = token)} />
			</div>

			{consent ? <p className="ci-form-note">{consent}</p> : null}

			<div
				className={`ci-form-status ${status === STATUS.ERROR ? "is-error" : status === STATUS.SUCCESS ? "is-success" : ""}`}
				aria-live="polite"
			>
				{statusMessage}
			</div>

			<div className="submit-btn">
				<ButtonPrimary
					type="submit"
					text={status === STATUS.SUBMITTING ? "Sending…" : submitText}
					disabled={status === STATUS.SUBMITTING}
				/>
			</div>
		</form>
	);
}
