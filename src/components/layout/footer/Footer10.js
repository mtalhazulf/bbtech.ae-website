import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

const Footer10 = () => {
	const { company, contact, socials, footer } = getSiteConfig();
	return (
		<footer className="tj-footer-section footer-2 h5-footer h10-footer section-gap-x">
			<div className="footer-main-area">
				<div className="container">
					<div className="row justify-content-between">
						<div className="col-xl-5 col-lg-4 col-md-6">
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
						<div className="col-xl-2 col-lg-3 col-md-6">
							<div
								className="footer-widget footer-col-2 widget-nav-menu wow fadeInUp"
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
						<div className="col-xl-2 col-lg-2 col-md-6">
							<div
								className="footer-widget footer-col-3 widget-nav-menu wow fadeInUp"
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
			<div
				className="h10-footer-subscribe-wrapper wow fadeInUp"
				data-wow-delay=".5s"
			>
				<div className="container">
					<div className="row align-items-end">
						<div className="col-12 col-lg-4 col-xl-5">
							<div className="award-logo-area ">
								{footer.awardLogosLight.map((award, index) => (
									<div className="award-logo" key={index}>
										<img src={award} alt="" />
									</div>
								))}
							</div>
						</div>
						<div className="col-12 col-lg-8 col-xl-7">
							<div className="footer-subscribe h5-footer-subscribe">
								<h3 className="title text-anim">
									Subscribe to Our Newsletter.
								</h3>
								<div className="subscribe-form">
									<form action="#">
										<input
											type="email"
											name="email"
											placeholder="Enter email"
										/>
										<ButtonPrimary
											type={"submit"}
											text={"Subscribe"}
											className={"d-none d-sm-flex"}
										/>
										<label htmlFor="agree">
											<input id="agree" type="checkbox" />
											Agree to our{" "}
											<Link href="/terms-and-conditions">
												Terms &amp; Condition?
											</Link>
										</label>
										<ButtonPrimary
											type={"submit"}
											text={"Subscribe"}
											className={"d-flex d-sm-none"}
										/>
									</form>
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
									<p>
										&copy; {company.copyrightYear}{" "}
										<Link href={company.website} target="_blank">
											{company.name}
										</Link>{" "}
										All rights reserved
									</p>
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
								<div className="copyright-menu">
									<ul>
										{footer.copyrightMenu.map((item, index) => (
											<li key={index}>
												<Link href={item.url}>{item.label}</Link>
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
