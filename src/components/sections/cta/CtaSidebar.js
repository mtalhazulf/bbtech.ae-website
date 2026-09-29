import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

// The live sidebar widget's own heading on bbtech.ae service pages.
const LIVE_TITLE = "Have a project for us? Get in touch!";

/**
 * Sidebar contact card: the live "Have a project for us? Get in touch!" widget, with the
 * company's real contact details from src/data/site.json and a link to /contact/ (the live
 * widget's inline form is pending a client decision, see content-import/needs-client-input.md).
 */
const CtaSidebar = ({ title = LIVE_TITLE, button = { text: "Let's Talk", href: "/contact/" } }) => {
	const { contact } = getSiteConfig();
	return (
		<div className="ci-contact-card">
			<div className="ci-contact-card-shape" aria-hidden="true">
				<img src="/images/shape/pattern-3.svg" alt="" />
			</div>
			<h3 className="title">{title}</h3>
			<ul className="ci-contact-list">
				<li>
					<span className="icon" aria-hidden="true">
						<i className="fa-light fa-phone"></i>
					</span>
					<Link href={`tel:${contact.phone.tel}`}>{contact.phone.display}</Link>
				</li>
				<li>
					<span className="icon" aria-hidden="true">
						<i className="fa-light fa-envelope"></i>
					</span>
					<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
				</li>
				<li>
					<span className="icon" aria-hidden="true">
						<i className="fa-light fa-location-dot"></i>
					</span>
					<span>{contact.location}</span>
				</li>
			</ul>
			<ButtonPrimary text={button.text} url={button.href} />
		</div>
	);
};

export default CtaSidebar;
