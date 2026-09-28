import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

const HeaderTop = () => {
	const { contact, socials } = getSiteConfig();
	return (
		<div className="header-top">
			<div className="container-fluid">
				<div className="row">
					<div className="col-12">
						<div className="header-top-content">
							<div className="header-info">
								<div className="info-item">
									<span>
										<i className="tji-phone-3"></i>
									</span>
									<Link href={`tel:${contact.phone.tel}`}>{contact.phone.display}</Link>
								</div>
								<div className="info-item">
									<span>
										<i className="tji-envelop-2"></i>
									</span>
									<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
								</div>
								<div className="info-item">
									<span>
										<i className="tji-location"></i>
									</span>
									<span>{contact.topBarLocation}</span>
								</div>
								<div className="info-item">
									<div className="social-links style-2">
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
			</div>
		</div>
	);
};

export default HeaderTop;
