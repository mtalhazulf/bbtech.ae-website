import ContactFormCard from "./ContactFormCard";
import SisterCompanyCard from "./SisterCompanyCard";

/**
 * The template's Contact3 layout (".tj-contact-section-2": form card + side panel), with the
 * real form section on the left and, where Contact3 embeds a map, an info card on the right.
 */
const ContactFormSection = ({ form, aside, formTitle, formHighlight, asideHighlight }) => {
	return (
		<section className="tj-contact-section-2 ci-contact-form-section section-bottom-gap">
			<div className="container">
				<div className="row rg-30">
					{form ? (
						<div className={aside ? "col-lg-7" : "col-lg-8"}>
							<ContactFormCard
								id={form.id}
								fields={form.fields}
								consent={form.consent}
								submitText={form.submitText}
								title={formTitle}
								highlight={formHighlight}
							/>
						</div>
					) : null}
					{aside ? (
						<div className={form ? "col-lg-5" : "col-12"}>
							<SisterCompanyCard section={aside} highlight={asideHighlight} />
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
};

export default ContactFormSection;
