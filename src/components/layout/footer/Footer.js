import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

const Footer = () => {
	const { logos, contact, socials, footer } = getSiteConfig();
	return (
		<footer className="tj-footer-section footer-1 section-gap-x">
			<div className="footer-main-area">
				<div className="container">
					<div className="row justify-content-between">
						<div className="col-xl-4 col-lg-4 col-md-6">
							<div className="footer-widget wow fadeInUp" data-wow-delay=".1s">
								<div className="footer-logo">
									<Link href="/">
										<img src={logos.primary} alt="Logos" />
									</Link>
								</div>
								<div className="footer-text">
									<p>{footer.intro}</p>
								</div>
							</div>
						</div>
						<div className="col-xl-3 col-lg-4 col-md-6">
							<div
								className="footer-widget widget-nav-menu wow fadeInUp"
								data-wow-delay=".3s"
							>
								<h5 className="title">{footer.getInTouchHeading}</h5>
								<div className="footer-contact-info">
									<div className="contact-item">
										<span>Phone number</span>
										<br />
										<Link href={`tel:${contact.phone.tel}`}>{contact.phone.display}</Link>
									</div>
									<div className="contact-item">
										<span>Email</span>
										<br />
										<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
									</div>
									<div className="contact-item">
										<span>Address</span>
										<br />
										{contact.location}
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-5 col-lg-4 col-md-6">
							<div
								className="footer-widget widget-nav-menu wow fadeInUp"
								data-wow-delay=".5s"
							>
								<h5 className="title">Useful Info</h5>
								{footer.usefulInfo.map((item, index) => (
									<div key={index} className="footer-useful-info-item">
										<strong>{item.title}</strong>
										<p>{item.text}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="tj-copyright-area">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<div className="copyright-content-area">
								<div className="footer-contact">
									<ul>
										<li>
											<Link href={`tel:${contact.phone.tel}`}>
												<span className="icon">
													<i className="tji-phone-2"></i>
												</span>
												<span className="text">{contact.phone.display}</span>
											</Link>
										</li>
										<li>
											<Link href={`mailto:${contact.email}`}>
												<span className="icon">
													<i className="tji-envelop-2"></i>
												</span>
												<span className="text">{contact.email}</span>
											</Link>
										</li>
									</ul>
								</div>
								<div className="social-links">
									<ul>
										{socials.map((social, index) => (
											<li key={index}>
												<Link href={social.url} target="_blank">
													<i className={social.icon}></i>
												</Link>
											</li>
										))}
									</ul>
								</div>
								<div className="copyright-text">
									<p>&copy; {footer.copyrightText}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{footer.shapes.map((shape, index) => (
				<div className={`bg-shape-${index + 1}`} key={index}>
					<img src={shape} alt="" />
				</div>
			))}
		</footer>
	);
};

export default Footer;
