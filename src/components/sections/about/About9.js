import FunfactSingle from "@/components/shared/funfact/FunfactSingle";
import aboutData from "@/data/sections/about.json";

const About9 = () => {
	const { about9 } = aboutData;
	return (
		<section className="h10-about section-gap">
			<div className="container">
				<div className="row flex-column-reverse flex-md-row ">
					<div className="col-12 col-lg-5 d-block d-md-none d-lg-block">
						<div
							className="about-img-area h10-about-banner wow bounceInLeft"
							data-wow-delay=".3s"
						>
							<div className="about-img overflow-hidden">
								<img data-speed=".8" src={about9.image} alt="" />
							</div>
						</div>
					</div>
					<div className="col-12 col-lg-7">
						<div className="h10-about-content-wrapper">
							<div className="sec-heading style-3 ">
								<span className="sub-title wow fadeInUp" data-wow-delay=".3s">
									<i className="tji-box"></i> {about9.subTitle}
								</span>
								<h2
									className="sec-title title-highlight wow fadeInUp"
									data-wow-delay=".3s"
								>
									{about9.title}
								</h2>
							</div>
							<div className="row">
								<div className="col-12 col-md-6 d-none d-md-block d-lg-none">
									<div
										className="about-img-area h10-about-banner wow bounceInLeft"
										data-wow-delay=".3s"
									>
										<div className="about-img">
											<img src={about9.image} alt="" />
										</div>
									</div>
								</div>
								<div className="col-12 col-md-6 col-lg-12">
									<div className="h10-about-content">
										<p className="desc wow fadeInUp" data-wow-delay=".4s">
											{about9.desc}
										</p>
										<div className="h9-about-funfact h10-about-funfact">
											{about9.funfacts.map((funfact, index) => (
												<div key={index} className="countup-item">
													<FunfactSingle
														currentValue={funfact.value}
														symbol={funfact.symbol}
													/>
													<span className="count-text">{funfact.text}</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default About9;
