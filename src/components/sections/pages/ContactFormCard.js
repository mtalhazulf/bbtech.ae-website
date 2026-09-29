"use client";
import ContactForm from "@/components/shared/forms/ContactForm";
import HighlightTitle from "./HighlightTitle";

/**
 * The template's Contact3 form card (".contact-form" white card with a title), prop-driven
 * from a { type: "form" } content section. Submission goes through the shared ContactForm
 * (POST /api/contact - Turnstile, honeypot, rate limit, SMTP - see AGENTS.md "Forms").
 */
const ContactFormCard = ({ id, fields = [], consent, submitText, title, highlight }) => {
	const shortCount = fields.filter(f => f.type !== "textarea").length;
	const shortCol = shortCount % 3 === 0 ? "col-md-4" : "col-sm-6";

	return (
		<div className="contact-form ci-contact-form wow fadeInUp" data-wow-delay=".1s">
			{title ? (
				<h3 className="title">
					<HighlightTitle text={title} highlight={highlight} />
				</h3>
			) : null}
			<ContactForm
				formId={id}
				fields={fields}
				consent={consent}
				submitText={submitText || "Send message"}
				gridClass={field => (field.type === "textarea" ? "col-12" : shortCol)}
			/>
		</div>
	);
};

export default ContactFormCard;
