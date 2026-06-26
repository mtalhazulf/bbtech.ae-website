import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import heroData from "@/data/sections/hero.json";

const Hero10 = () => {
	const { hero10 } = heroData;
	return (
		<section className="tj-banner-section-2 h10-hero section-gap-x zoom-on-scroll-wrapper">
			<div className="container">
				<div className="row flex-column-reverse flex-lg-row">
					<div className="col-lg-4 col-xl-3">
						<div className="h10-hero-award-wrapper">
							<div
								className="h6-hero-history wow fadeInUp"
								data-wow-delay={hero10.history.delay}
							>
								<div className="h6-hero-history-title"></div>
								<p className="h6-hero-history-desc">
									{hero10.history.desc}
								</p>
							</div>
							<div
								className="circle-text-wrap wow bounceInLeft"
								data-wow-delay={hero10.award.delay}
							>
								<span
									className="circle-text"
									style={{
										backgroundImage: `url('${hero10.award.bgImage}')`,
									}}
								></span>
								<div className="circle-icon">
									<i className={hero10.award.icon}></i>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-8 col-xl-9">
						<div className="banner-content-2">
							<h1 className="banner-title text-anim">
								{hero10.title}{" "}
								<i
									className="tji-curve-arrow wow fadeInRight"
									data-wow-delay={hero10.titleArrowDelay}
								></i>
							</h1>
							<div
								className="banner-desc-area wow fadeInUp"
								data-wow-delay={hero10.descDelay}
							>
								<ButtonPrimary
									text={hero10.button.text}
									url={hero10.button.url}
								/>
								<div className="banner-desc">{hero10.desc}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="container-fluid gap-0">
				<div className="row">
					<div className="col-12">
						<div className="h10-hero-banner zoom-on-scroll">
							<div className="h10-hero-banner-img h10-hero-banner-video">
								<video
									autoPlay
									loop
									muted
									playsInline
									data-wf-ignore="true"
									data-object-fit="cover"
									poster={hero10.video.poster}
								>
									<source
										src={hero10.video.src}
										data-wf-ignore="true"
									/>
									<source
										src={hero10.video.src}
										data-wf-ignore="true"
									/>
								</video>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-shape-1">
				<img src={hero10.shapes[0]} alt="" />
			</div>
			<div className="bg-shape-2">
				<img src={hero10.shapes[1]} alt="" />
			</div>
		</section>
	);
};

export default Hero10;
