"use client";
import ContactForm from "@/components/shared/forms/ContactForm";

/**
 * Renders a { type: "form", id, fields, consent?, submitText } content section as the
 * template's white contact-form card (underlined inputs, pill submit button), with visible
 * labels. Submission goes through the shared ContactForm (POST /api/contact - see AGENTS.md
 * "Forms"); `id` must have a matching entry in both src/data/forms.json and
 * src/libs/forms/schemas.js, or the server rejects the submission as an unknown form.
 * Optional `title` shows a card heading; `embedded` renders just the card (no section/container)
 * so a layout can place it in its own column.
 */
const DynamicForm = ({ id, fields, consent, submitText, title, embedded = false }) => {
	const card = (
		<div className="contact-form ci-form-card wow fadeInUp" data-wow-delay=".1s">
			{title ? <h3 className="title">{title}</h3> : null}
			<ContactForm formId={id} fields={fields} consent={consent} submitText={submitText || "Submit"} />
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
