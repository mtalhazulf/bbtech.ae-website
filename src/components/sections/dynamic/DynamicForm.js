"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

// DESIGN.md's Forms row is explicit: "Labels must be visible, not placeholder-only."
function Field({ field, formId }) {
	const { name, label, type = "text", placeholder, required, options } = field;
	const id = `${formId || "form"}-${name}`;
	// The imported labels already carry their own "*" where the live form marked a field required.
	const labelEl = (
		<label className="ci-form-label" htmlFor={id}>
			{label}
		</label>
	);

	if (type === "textarea") {
		return (
			<div className="form-input message-input">
				{labelEl}
				<textarea name={name} id={id} placeholder={placeholder || label} required={required} />
			</div>
		);
	}

	if (type === "select") {
		return (
			<div className="form-input">
				{labelEl}
				<select className="ci-form-select" name={name} id={id} required={required} defaultValue="">
					<option value="" disabled>
						{placeholder || label}
					</option>
					{(options || []).map((opt, i) => (
						<option key={i} value={opt.value ?? opt}>
							{opt.label ?? opt.optionName ?? opt}
						</option>
					))}
				</select>
			</div>
		);
	}

	return (
		<div className="form-input">
			{labelEl}
			<input type={type} name={name} id={id} placeholder={placeholder || label} required={required} />
		</div>
	);
}

/**
 * Renders a { type: "form", id, fields, consent?, submitText } content section as the
 * template's white contact-form card (underlined inputs, pill submit button), with visible
 * labels. Deferred submission per D5: the handler only preventDefault()s — no backend is wired.
 * Optional `title` shows a card heading; `embedded` renders just the card (no section/container)
 * so a layout can place it in its own column.
 */
const DynamicForm = ({ id, fields, consent, submitText, title, embedded = false }) => {
	function handleSubmit(event) {
		event.preventDefault();
		// TODO(forms): wire submission
	}

	const card = (
		<div className="contact-form ci-form-card wow fadeInUp" data-wow-delay=".1s">
			{title ? <h3 className="title">{title}</h3> : null}
			<form id={id} onSubmit={handleSubmit}>
				<div className="row">
					{(fields || []).map((field, i) => (
						<div key={i} className={field.type === "textarea" ? "col-sm-12" : "col-sm-6"}>
							<Field field={field} formId={id} />
						</div>
					))}
				</div>
				{consent ? <p className="ci-form-note">{consent}</p> : null}
				<div className="submit-btn">
					<ButtonPrimary type="submit" text={submitText || "Submit"} />
				</div>
			</form>
		</div>
	);

	if (embedded) return card;
	return (
		<section className="ci-section ci-plain ci-dyn ci-form-section">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-xl-8 col-lg-10">{card}</div>
				</div>
			</div>
		</section>
	);
};

export default DynamicForm;
