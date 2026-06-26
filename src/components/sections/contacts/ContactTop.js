import contactData from "@/data/sections/contact.json";
import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

const ContactTop = () => {
	const { contact, offices } = getSiteConfig();
	const { top } = contactData;
	return (
		<div className="tj-contact-area section-gap">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="sec-heading text-center">
							<span className="sub-title wow fadeInUp" data-wow-delay=".1s">
								<i className="tji-box"></i>
								{top.subTitle}
							</span>
							<h2 className="sec-title title-anim">
								<span>{top.titlePrefix}</span>
								{top.titleSuffix}
							</h2>
						</div>
					</div>
				</div>
				<div className="row row-gap-4">
					<div className="col-xl-3 col-lg-6 col-sm-6">
						<div
							className="contact-item style-2 wow fadeInUp"
							data-wow-delay=".3s"
						>
							<div className="contact-icon">
								<i className={top.locationCard.icon}></i>
							</div>
							<h3 className="contact-title">{top.locationCard.title}</h3>
							<p>{contact.location}</p>
						</div>
					</div>
					<div className="col-xl-3 col-lg-6 col-sm-6">
						<div
							className="contact-item style-2 wow fadeInUp"
							data-wow-delay=".5s"
						>
							<div className="contact-icon">
								<i className={top.emailCard.icon}></i>
							</div>
							<h3 className="contact-title">{top.emailCard.title}</h3>
							<ul className="contact-list">
								<li>
									<Link href={`mailto:${contact.email}`}>{contact.email}</Link>
								</li>
								<li>
									<Link href={`mailto:${contact.directorEmail}`}>
										{contact.directorEmail}
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="col-xl-3 col-lg-6 col-sm-6">
						<div
							className="contact-item style-2 wow fadeInUp"
							data-wow-delay=".7s"
						>
							<div className="contact-icon">
								<i className={top.phoneCard.icon}></i>
							</div>
							<h3 className="contact-title">{top.phoneCard.title}</h3>
							<ul className="contact-list">
								<li>
									<Link href={`tel:${offices[0].phone.tel}`}>
										{offices[0].phone.display}
									</Link>
								</li>
								<li>
									<Link href={`tel:${offices[1].phone.tel}`}>
										{offices[1].phone.display}
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="col-xl-3 col-lg-6 col-sm-6">
						<div
							className="contact-item style-2 wow fadeInUp"
							data-wow-delay=".9s"
						>
							<div className="contact-icon">
								<i className={top.chatCard.icon}></i>
							</div>
							<h3 className="contact-title">{top.chatCard.title}</h3>
							<ul className="contact-list">
								<li>
									<Link href={`mailto:${contact.supportEmail}`}>
										{contact.supportEmail}
									</Link>
								</li>
								<li className="active">
									<Link href="/contact">{top.chatCard.helpText}</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactTop;
