import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

const Footer = () => {
	const { company, logos, contact, socials, footer } = getSiteConfig();
	return (
		<footer className="tj-footer-section footer-1 section-gap-x">
			<div className="footer-main-area">
				<div className="container">
					<div className="row justify-content-between">
						<div className="col-xl-3 col-lg-4 col-md-6">
							<div className="footer-widget wow fadeInUp" data-wow-delay=".1s">
								<div className="footer-logo">
									<Link href="/">
										<img src={logos.primary} alt="Logos" />
									</Link>
								</div>
								<div className="footer-text">
									<p>{company.description}</p>
								</div>
								<div className="award-logo-area">
									{footer.awardLogos.map((award, index) => (
										<div className="award-logo" key={index}>
											<img src={award} alt="" />
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="col-xl-3 col-lg-4 col-md-6">
							<div
								className="footer-widget widget-nav-menu wow fadeInUp"
								data-wow-delay=".3s"
							>
								<h5 className="title">Services</h5>
								<ul>
									{footer.servicesMenu.map((item, index) => (
										<li key={index}>
											<Link href={item.url}>{item.label}</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
						<div className="col-xl-2 col-lg-4 col-md-6">
							<div
								className="footer-widget widget-nav-menu wow fadeInUp"
								data-wow-delay=".5s"
							>
								<h5 className="title">Company</h5>
								<ul>
									{footer.companyMenu.map((item, index) => (
										<li key={index}>
											<Link href={item.url}>
												{item.label}{" "}
												{item.badge && (
													<span className="badge">{item.badge}</span>
												)}
											</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
						<div className="col-xl-4 col-lg-5 col-md-6">
							<div
								className="footer-widget widget-subscribe wow fadeInUp"
								data-wow-delay=".7s"
							>
								<h3 className="title">Subscribe to Our Newsletter.</h3>
								<div className="subscribe-form">
									<form action="#">
										<input
											type="email"
											name="email"
											placeholder="Enter email"
										/>
										<button type="submit">
											<i className="tji-plane"></i>
										</button>
										<label htmlFor="agree">
											<input id="agree" type="checkbox" />
											Agree to our{" "}
											<Link href="/terms-and-conditions">
												Terms & Condition?
											</Link>
										</label>
									</form>
								</div>
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
									<p>
										&copy; {company.copyrightYear}{" "}
										<Link href={company.website} target="_blank">
											{company.name}
										</Link>{" "}
										All rights reserved
									</p>
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
