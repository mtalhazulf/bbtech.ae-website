import getSocialLabel from "@/components/layout/footer/socialLabel";
import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";
import MobileNavbar from "./MobileNavbar";

const MobileMenu = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
	const { logos, contact, socials } = getSiteConfig();
	const handleClick = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			<div
				className={`body-overlay  ${isMobileMenuOpen ? "opened" : ""}`}
				onClick={handleClick}
			></div>
			<div
				className={`hamburger-area d-lg-none ${
					isMobileMenuOpen ? "opened" : ""
				}`}
			>
				<div className="hamburger_bg"></div>
				<div className="hamburger_wrapper">
					<div className="hamburger_inner">
						<div className="hamburger_top d-flex align-items-center justify-content-between">
							<div className="hamburger_logo">
								<Link href="/" className="mobile_logo">
									<img src={logos.light} alt="Logo" />
								</Link>
							</div>
							<div className="hamburger_close">
								<button
									type="button"
									className="hamburger_close_btn"
									onClick={handleClick}
									aria-label="Close menu"
								>
									<i className="fa-thin fa-times" aria-hidden="true"></i>
								</button>
							</div>
						</div>
						<MobileNavbar />
						<div className="hamburger-infos">
							<h5 className="hamburger-title">Contact Info</h5>
							<div className="contact-info">
								<div className="contact-item">
									<span className="subtitle">Phone</span>
									<Link className="contact-link" href={`tel:${contact.phone.tel}`}>
										{contact.phone.display}
									</Link>
								</div>
								<div className="contact-item">
									<span className="subtitle">Email</span>
									<Link className="contact-link" href={`mailto:${contact.email}`}>
										{contact.email}
									</Link>
								</div>
								<div className="contact-item">
									<span className="subtitle">Location</span>
									<span className="contact-link">{contact.location}</span>
								</div>
							</div>
						</div>
					</div>
					<div className="hamburger-socials">
						<h5 className="hamburger-title">Follow Us</h5>
						<div className="social-links style-3">
							<ul>
								{socials.map((social, index) => (
									<li key={index}>
										<Link
											href={social.url}
											target="_blank"
											aria-label={getSocialLabel(social.platform)}
										>
											<i className={social.icon} aria-hidden="true"></i>
										</Link>
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

export default MobileMenu;
