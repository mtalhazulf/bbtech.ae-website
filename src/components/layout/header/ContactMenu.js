"use client";
import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

const ContactMenu = ({ isContactOpen, setIsContactOpen }) => {
	const { logos, contact, socials, header } = getSiteConfig();
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
				className={`tj-offcanvas-area d-none d-lg-block  ${
					isContactOpen ? "opened" : ""
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
								<button className="hamburger_close_btn" onClick={handleClick}>
									<i className="fa-thin fa-times"></i>
								</button>
							</div>
						</div>
						{header.offcanvasText ? (
							<div className="offcanvas-text">
								<p>{header.offcanvasText}</p>
							</div>
						) : null}
						<div className="hamburger-search-area">
							<h5 className="hamburger-title">Search Now!</h5>
							<div className="hamburger_search">
								<form method="get" action="/">
									<button type="submit">
										<i className="tji-search"></i>
									</button>
									<input
										type="search"
										autoComplete="off"
										name="s"
										placeholder="Search here..."
									/>
								</form>
							</div>
						</div>
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
										<a href={social.url} target="_blank">
											<i className={social.icon}></i>
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
