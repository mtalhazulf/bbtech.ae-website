import teamDetailsData from "@/data/sections/team-details.json";
import getSiteConfig from "@/libs/getSiteConfig";
import getTeamMembers from "@/libs/getTeamMembers";
import Image from "next/image";

const TeamDetails1 = ({ currentItemId }) => {
	const { contact, socials } = getSiteConfig();
	const {
		fallbackImgLarge,
		greetingPrefix,
		intro,
		contactLabels,
		experience,
		skills,
	} = teamDetailsData.teamDetails1;
	const items = getTeamMembers();
	const currentId = currentItemId;
	const currentItem = items?.find(({ id }) => currentId === id);
	const {
		name,
		desig,
		imgLarge = fallbackImgLarge,
		email = contact.email,
		phone,
	} = currentItem || {};
	const phoneDisplay = phone?.display || contact.phone.display;
	const phoneTel = phone?.tel || contact.phone.tel;

	return (
		<section className="team-details slidebar-stickiy-container">
			<div className="container">
				<div className="row justify-content-center">
					{/* <!--  left --> */}
					<div className="col-12 col-md-8 col-lg-5">
						<div
							className="team-details__img slidebar-stickiy wow fadeInUp"
							data-wow-delay=".1s"
						>
							<Image
								src={imgLarge}
								alt=""
								width={645}
								height={700}
								style={{ height: "auto" }}
							/>
						</div>
					</div>
					{/* <!-- right --> */}
					<div className="col-12 col-lg-7 ">
						<div className="team-details__content">
							<h2 className="team-details__name title-anim">
								{greetingPrefix}
								{name}
							</h2>
							<span
								className="team-details__desig wow fadeInUp"
								data-wow-delay=".1s"
							>
								{desig}
							</span>
							<p className="wow fadeInUp" data-wow-delay=".3s">
								{intro}
							</p>
							<div
								className="team-details__contact-info wow fadeInUp"
								data-wow-delay=".5s"
							>
								<ul>
									<li>
										<span>{contactLabels.email}</span>
										<a href={`mailto:${email}`}>{email}</a>
									</li>
									<li>
										<span>{contactLabels.phone}</span>
										<a href={`tel:${phoneTel}`}>{phoneDisplay}</a>
									</li>
								</ul>
							</div>
							<div className="social-links wow fadeInUp" data-wow-delay=".5s">
								<ul>
									{socials?.map((social, index) => (
										<li key={index}>
											<a href={social.url} target="_blank">
												<i className={social.icon}></i>
											</a>
										</li>
									))}
								</ul>
							</div>
							<div className="team-details__experience">
								<h4
									className="team-details__subtitle wow fadeInUp"
									data-wow-delay=".3s"
								>
									{experience.title}
								</h4>
								{experience.paragraphs?.map((paragraph, index) => (
									<p key={index} className="wow fadeInUp" data-wow-delay=".3s">
										{paragraph}
									</p>
								))}
								<div
									className="team-details__experience__list wow fadeInUp"
									data-wow-delay=".3s"
								>
									<ul>
										{experience.items?.map((item, index) => (
											<li key={index}>
												<i className="tji-check"></i>
												<p>{item}</p>
											</li>
										))}
									</ul>
								</div>
							</div>
							<div className="team-details__skills">
								<h4
									className="team-details__subtitle wow fadeInUp"
									data-wow-delay=".3s"
								>
									{skills.title}
								</h4>
								<p className="wow fadeInUp" data-wow-delay=".3s">
									{skills.paragraph}
								</p>
								<ul
									className="tj-progress-list wow fadeInUp"
									data-wow-delay=".3s"
								>
									{skills.items?.map((item, index) => (
										<li key={index}>
											<h6 className="tj-progress-title">{item.title}</h6>
											<div className="tj-progress">
												<span className="tj-progress-percent">
													{item.percent}%
												</span>
												<div
													className="tj-progress-bar"
													data-percent={item.percent}
												></div>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TeamDetails1;
