import getSocialLabel from "@/components/layout/footer/socialLabel";
import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

// The live top bar links Facebook, Twitter and LinkedIn only; Instagram
// appears in the live footer alone.
const TOP_BAR_PLATFORMS = new Set(["facebook", "twitter", "linkedin"]);

/**
 * Template top bar (header-top) carrying the live site's top-bar contacts:
 * phone, email and address on the left, socials on the right. Collapses to
 * phone + email below 992px (template behavior hides the last items).
 */
const HeaderTop = () => {
	const { contact, socials: allSocials } = getSiteConfig();
	const socials = allSocials.filter((social) => TOP_BAR_PLATFORMS.has(social.platform));
	return (
		<div className="header-top ci-header-top">
			<div className="container-fluid">
				<div className="row">
					<div className="col-12">
						<div className="header-top-content">
							<div className="header-info">
								<div className="info-item">
									<span aria-hidden="true">
										<i className="tji-phone-3"></i>
									</span>
									<Link href={`tel:${contact.phone.tel}`}>{contact.phone.display}</Link>
								</div>
								<div className="info-item">
									<span aria-hidden="true">
										<i className="tji-envelop-2"></i>
									</span>
									<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
								</div>
								<div className="info-item">
									<span aria-hidden="true">
										<i className="tji-location"></i>
									</span>
									<span>{contact.topBarLocation}</span>
								</div>
							</div>
							<div className="header-info ci-header-top-socials">
								<div className="info-item">
									<div className="social-links style-2">
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
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default HeaderTop;
