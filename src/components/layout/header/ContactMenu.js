"use client";
import getSocialLabel from "@/components/layout/footer/socialLabel";
import getSiteConfig from "@/libs/getSiteConfig";
import Image from "next/image";
import Link from "next/link";

/**
 * Desktop offcanvas (header-1 hamburger). Mirrors the live footer's "Get in
 * Touch for your Inquiries" block (its own phone, email and both addresses)
 * with the same labels; the template's search box is omitted because the site
 * has no search.
 */
const ContactMenu = ({ isContactOpen, setIsContactOpen }) => {
	const { logos, contact, socials, header, footer } = getSiteConfig();
	const handleClick = () => {
		setIsContactOpen(false);
	};

	return (
		<>
			<div
				className={`body-overlay  ${isContactOpen ? "opened" : ""}`}
				onClick={handleClick}
			></div>
			<div
				className={`tj-offcanvas-area ci-offcanvas d-none d-lg-block  ${
					isContactOpen ? "opened" : ""
				}`}
			>
				<div className="hamburger_bg"></div>
				<div className="hamburger_wrapper">
					<div className="hamburger_inner">
						<div className="hamburger_top d-flex align-items-center justify-content-between">
							<div className="hamburger_logo">
								<Link href="/" className="mobile_logo" aria-label={logos.alt}>
									<Image src={logos.light} alt={logos.alt} width={152} height={224} />
								</Link>
							</div>
							<div className="hamburger_close">
								<button
									className="hamburger_close_btn"
									onClick={handleClick}
									aria-label="Close"
								>
									<i className="fa-thin fa-times"></i>
								</button>
							</div>
						</div>
						{header.offcanvasText ? (
							<div className="offcanvas-text">
								<p>{header.offcanvasText}</p>
							</div>
						) : null}
						<div className="hamburger-infos">
							<h5 className="hamburger-title">{footer.contactTitle}</h5>
							<p className="ci-offcanvas-lead">{footer.getInTouchHeading}</p>
							<div className="contact-info">
								<div className="contact-item">
									<span className="subtitle">{footer.phoneLabel}</span>
									<Link className="contact-link" href={`tel:${footer.phone.tel}`}>
										{footer.phone.display}
									</Link>
								</div>
								<div className="contact-item">
									<span className="subtitle">{footer.emailLabel}</span>
									<Link className="contact-link" href={`mailto:${contact.email}`}>
										{contact.email}
									</Link>
								</div>
								<div className="contact-item">
									<span className="subtitle">{footer.addressLabel}</span>
									{footer.addresses.map((address) => (
										<span className="contact-link ci-offcanvas-address" key={address.label}>
											<strong>{address.label}</strong> {address.text}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className="hamburger-socials">
						<h5 className="hamburger-title">{footer.socialsLabel}</h5>
						<div className="social-links style-3">
							<ul>
								{socials.map((social) => (
									<li key={social.platform}>
										<a
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={getSocialLabel(social.platform)}
										>
											<i className={social.icon} aria-hidden="true"></i>
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ContactMenu;
