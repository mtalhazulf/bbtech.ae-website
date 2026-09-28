"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

// DESIGN.md's Forms row is explicit: "Labels must be visible, not placeholder-only."
function Field({ field }) {
	const { name, label, type = "text", placeholder, required, options } = field;

	if (type === "textarea") {
		return (
			<div className="form-input message-input">
				<label htmlFor={name}>{label}</label>
				<textarea name={name} id={name} placeholder={placeholder || label} required={required} />
			</div>
		);
	}

	if (type === "select") {
		return (
			<div className="form-input">
				<label htmlFor={name}>{label}</label>
				<div className="tj-nice-select-box">
					<select name={name} id={name} required={required} defaultValue="">
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
			</div>
		);
	}

	return (
		<div className="form-input">
			<label htmlFor={name}>{label}</label>
			<input type={type} name={name} id={name} placeholder={placeholder || label} required={required} />
		</div>
	);
}

/**
 * Renders a { type: "form", id, fields, consent?, submitText } content section.
 * Deferred submission per D5: the handler only preventDefault()s — no backend is wired.
 */
const DynamicForm = ({ id, fields, consent, submitText }) => {
	function handleSubmit(event) {
		event.preventDefault();
		// TODO(forms): wire submission
	}

	return (
		<section className="tj-contact-section-2 section-gap-2">
			<div className="container">
				<div className="row">
					<div className="col-lg-8">
						<form id={id} className="contact-form" onSubmit={handleSubmit}>
							<div className="row">
								{fields.map((field, i) => (
									<div key={i} className={field.type === "textarea" ? "col-sm-12" : "col-sm-6"}>
										<Field field={field} />
									</div>
								))}
							</div>
							{consent ? <p className="form-note">{consent}</p> : null}
							<div className="submit-btn">
								<ButtonPrimary type="submit" text={submitText || "Submit"} />
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
};

export default DynamicForm;
