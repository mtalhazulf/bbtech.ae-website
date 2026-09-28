"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import HighlightTitle from "./HighlightTitle";

const AUTOCOMPLETE = { name: "name", email: "email", telephone: "tel", tel: "tel", phone: "tel" };

/**
 * @typedef {{ name: string, label: string, type?: string, placeholder?: string, required?: boolean, options?: any[] }} FormField
 */

/** One form control with a visible label (DESIGN.md forms row: labels are never placeholder-only). */
function Field({ formId, field }) {
	const { name, label, type = "text", placeholder, required, options } = field;
	const id = `${formId}-${name}`;
	// The live form's placeholders repeat the label; with the label visible, only a distinct placeholder is shown.
	const hint = placeholder && placeholder !== label ? placeholder : undefined;
	const auto = AUTOCOMPLETE[name] || (type === "email" ? "email" : type === "tel" ? "tel" : undefined);

	let control;
	if (type === "textarea") {
		control = <textarea id={id} name={name} placeholder={hint} required={required} rows={5} />;
	} else if (type === "select") {
		control = (
			<select id={id} name={name} required={required} defaultValue="">
				<option value="" disabled>
					{hint || label}
				</option>
				{(options || []).map((opt, i) => (
					<option key={i} value={opt.value ?? opt}>
						{opt.label ?? opt.optionName ?? opt}
					</option>
				))}
			</select>
		);
	} else {
		control = <input id={id} name={name} type={type} placeholder={hint} required={required} autoComplete={auto} />;
	}

	return (
		<div className={`form-input ci-field ${type === "textarea" ? "message-input" : ""}`}>
			<label htmlFor={id}>{label}</label>
			{control}
		</div>
	);
}

/**
 * The template's Contact3 form card (".contact-form" white card with a title), prop-driven
 * from a { type: "form" } content section. Submission is intentionally not wired yet.
 */
const ContactFormCard = ({ id, fields = [], consent, submitText, title, highlight }) => {
	function handleSubmit(event) {
		event.preventDefault();
		// TODO(forms): wire submission
	}
	const shortCount = fields.filter((f) => f.type !== "textarea").length;
	const shortCol = shortCount % 3 === 0 ? "col-md-4" : "col-sm-6";

	return (
		<div className="contact-form ci-contact-form wow fadeInUp" data-wow-delay=".1s">
			{title ? (
				<h3 className="title">
					<HighlightTitle text={title} highlight={highlight} />
				</h3>
			) : null}
			<form id={id} onSubmit={handleSubmit}>
				<div className="row">
					{fields.map((field, i) => (
						<div key={i} className={field.type === "textarea" ? "col-12" : shortCol}>
							<Field formId={id} field={field} />
						</div>
					))}
				</div>
				{consent ? <p className="ci-form-consent">{consent}</p> : null}
				<div className="submit-btn">
					<ButtonPrimary type="submit" text={submitText || "Send message"} />
				</div>
			</form>
		</div>
	);
};

export default ContactFormCard;
