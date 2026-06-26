import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import aboutData from "@/data/sections/about.json";

const About12 = () => {
	const { about12 } = aboutData;
	return (
		<section className="tj-history section-gap">
			<div className="container">
				<div className="row rg-30 justify-content-between">
					<div className="col-xl-5">
						<div className="sec-heading mb-0">
							<span className="sub-title wow fadeInUp" data-wow-delay="0.1s">
								<i className="tji-box"></i> {about12.subTitle}
							</span>
							<h2 className="sec-title text-anim">
								{about12.titlePrefix}{" "}
								<span>{about12.titleHighlight}</span>
							</h2>
						</div>
					</div>
					<div className="col-xl-5">
						<div className="desc wow fadeInUp" data-wow-delay="0.3s">
							{about12.paragraphs.map((paragraph, index) => (
								<p key={index}>{paragraph}</p>
							))}
						</div>
						<div
							className="history-btn mt-30 wow fadeInUp"
							data-wow-delay="0.5s"
						>
							<ButtonPrimary
								text={about12.button.text}
								url={about12.button.url}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About12;
