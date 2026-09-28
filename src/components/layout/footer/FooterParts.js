import BootstrapWrapper from "@/components/shared/wrappers/BootstrapWrapper";
import getNavItems from "@/libs/getNavItems";
import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";
import getSocialLabel from "./socialLabel";

/**
 * Shared building blocks for Footer (inner pages, template footer-1) and
 * Footer10 (home, template h10 footer). All copy comes from site.json "footer"
 * (verbatim from the live bbtech.ae footer) or from the nav JSON.
 */

/**
 * "Services" column links: the nav's ERP entry (with its submenu) followed by
 * the Services submenu, so the footer stays in sync with the header menu.
 * @returns {{ label: string, url: string }[]}
 */
export const getFooterServiceLinks = () => {
	const navItems = getNavItems();
	const erp = navItems.find((item) => item.path === "/erp/");
	const services = navItems.find((item) => item.path === "/services/");
	return [erp, ...(erp?.submenu || []), ...(services?.submenu || [])]
		.filter(Boolean)
		.map((item) => ({ label: item.name, url: item.path }));
};

export const FooterServices = ({ className = "", delay = ".3s" }) => {
	const { footer } = getSiteConfig();
	const links = getFooterServiceLinks();
	return (
		<div
			className={`footer-widget widget-nav-menu wow fadeInUp ${className}`}
			data-wow-delay={delay}
		>
			<h5 className="title">{footer.servicesTitle}</h5>
			<ul>
				{links.map((item) => (
					<li key={item.url}>
						<Link href={item.url}>{item.label}</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

/**
 * "Useful info" panels as a collapsed-by-default accordion (template FAQ
 * accordion markup, Bootstrap collapse), like the live footer's toggles.
 */
export const FooterUsefulInfo = ({ className = "", delay = ".5s" }) => {
	const { footer } = getSiteConfig();
	const parentId = "ciFooterUsefulInfo";
	return (
		<div
			className={`footer-widget ci-footer-info wow fadeInUp ${className}`}
			data-wow-delay={delay}
		>
			<h5 className="title">{footer.usefulInfoTitle}</h5>
			<BootstrapWrapper>
				<div className="accordion ci-footer-accordion" id={parentId}>
					{footer.usefulInfo.map((item, idx) => {
						const panelId = `ci-footer-info-${idx + 1}`;
						return (
							<div className="accordion-item" key={panelId}>
								<button
									className="faq-title collapsed"
									type="button"
									data-bs-toggle="collapse"
									data-bs-target={`#${panelId}`}
									aria-expanded="false"
									aria-controls={panelId}
								>
									{item.title}
								</button>
								<div
									id={panelId}
									className="collapse"
									data-bs-parent={`#${parentId}`}
								>
									<div className="accordion-body">
										{item.points ? (
											<ul className="ci-footer-points">
												{item.points.map((point) => (
													<li key={point}>{point}</li>
												))}
											</ul>
										) : (
											<p>{item.text}</p>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</BootstrapWrapper>
		</div>
	);
};

/**
 * "Contact info" column: the live footer's own phone variant, email and both
 * office addresses.
 */
export const FooterContact = ({ className = "", delay = ".7s" }) => {
	const { contact, footer } = getSiteConfig();
	return (
		<div
			className={`footer-widget ci-footer-contact wow fadeInUp ${className}`}
			data-wow-delay={delay}
		>
			<h5 className="title">{footer.contactTitle}</h5>
			<p className="ci-footer-lead">{footer.getInTouchHeading}</p>
			<ul className="ci-footer-contact-list">
				<li>
					<span className="icon" aria-hidden="true">
						<i className="tji-phone-2"></i>
					</span>
					<span className="ci-footer-contact-text">
						<span className="label">{footer.phoneLabel}</span>
						<Link href={`tel:${footer.phone.tel}`}>{footer.phone.display}</Link>
					</span>
				</li>
				<li>
					<span className="icon" aria-hidden="true">
						<i className="tji-envelop-2"></i>
					</span>
					<span className="ci-footer-contact-text">
						<span className="label">{footer.emailLabel}</span>
						<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
					</span>
				</li>
				<li>
					<span className="icon" aria-hidden="true">
						<i className="tji-location"></i>
					</span>
					<span className="ci-footer-contact-text">
						<span className="label">{footer.addressLabel}</span>
						{footer.addresses.map((address) => (
							<span className="address" key={address.label}>
								<strong>{address.label}</strong> {address.text}
							</span>
						))}
					</span>
				</li>
			</ul>
		</div>
	);
};

/** Socials with the live "Find us on:" label (template social-links markup). */
export const FooterSocials = ({ className = "" }) => {
	const { socials, footer } = getSiteConfig();
	return (
		<div className={`social-links ci-footer-socials ${className}`}>
			<span className="ci-footer-socials-label">{footer.socialsLabel}</span>
			<ul>
				{socials.map((social) => (
					<li key={social.platform}>
						<Link
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={getSocialLabel(social.platform)}
						>
							<i className={social.icon} aria-hidden="true"></i>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

/**
 * Copyright bar content: both live bottom-bar lines, Privacy Policy and (unless
 * the footer already shows them higher up) the socials.
 */
export const FooterCopyright = ({ showSocials = true }) => {
	const { footer } = getSiteConfig();
	return (
		<div className="copyright-content-area ci-footer-copyright">
			<div className="copyright-text">
				<p>&copy; {footer.copyrightText}</p>
				<p>{footer.rightsText}</p>
			</div>
			{showSocials ? <FooterSocials /> : null}
			<div className="copyright-menu">
				<ul>
					{footer.copyrightMenu.map((item) => (
						<li key={item.url}>
							<Link href={item.url}>{item.label}</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
