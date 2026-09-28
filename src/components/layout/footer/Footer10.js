import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

const Footer10 = () => {
	const { contact, socials, footer } = getSiteConfig();
	return (
		<footer className="tj-footer-section footer-2 h5-footer h10-footer section-gap-x">
			<div className="footer-main-area">
				<div className="container">
					<div className="row justify-content-between">
						<div className="col-xl-4 col-lg-4 col-md-6">
							<div className="footer-widget footer-col-1">
								<h2 className="h10-footer-title text-anim">
									Let&apos;s Make IT Happen Together?
								</h2>
								<Link
									className="text-btn wow fadeInUp"
									data-wow-delay=".3s"
									href={`mailto:${contact.email}`}
								>
									<span className="btn-text">
										<span>{contact.email}</span>
									</span>
								</Link>
								<div
									className="bg-shape-widget wow fadeInUpBig"
									data-wow-delay=".7s"
								></div>
							</div>
						</div>
						<div className="col-xl-5 col-lg-5 col-md-6">
							<div
								className="footer-widget footer-col-2 widget-nav-menu wow fadeInUp"
								data-wow-delay=".3s"
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
						<div className="col-xl-3 col-lg-3 col-md-6">
							<div
								className="footer-widget widget-contact wow fadeInUp"
								data-wow-delay=".7s"
							>
								<h5 className="title">Our Office</h5>
								<div className="footer-contact-info">
									<div className="contact-item">
										<span>{contact.location}.</span>
									</div>
									<div className="contact-item">
										<Link href={`tel:${contact.phone.tel}`}>
											P: {contact.phone.display}
										</Link>
										<Link href={`mailto:${contact.email}`}>
											M: {contact.email}
										</Link>
									</div>
									<div className="contact-item">
										<span>
											<i className="tji-clock"></i> {contact.hours}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="tj-copyright-area-2 h5-footer-copyright">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<div className="copyright-content-area">
								<div className="copyright-text">
									<p>&copy; {footer.copyrightText}</p>
								</div>
								<div className="social-links style-3">
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
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-shape-1">
				<img src="/images/shape/pattern-2.svg" alt="" />
			</div>
			<div className="bg-shape-2">
				<img src="/images/shape/pattern-3.svg" alt="" />
			</div>
			<div className="bg-shape-4 wow fadeInUpBig" data-wow-delay=".8s">
				<img src="/images/shape/h10-footer-shape-blur-2.svg" alt="" />
			</div>
		</footer>
	);
};

export default Footer10;
