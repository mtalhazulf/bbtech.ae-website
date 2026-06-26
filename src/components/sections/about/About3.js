import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";
import aboutData from "@/data/sections/about.json";
const About3 = ({ type }) => {
	const { about3 } = aboutData;
	return (
		<section className="tj-about-section-2 section-gap section-gap-x">
			<div className="container">
				<div className="row">
					<div className="col-xl-6 col-lg-6 order-lg-1 order-2">
						<div
							className="about-img-area style-2 wow fadeInLeft"
							data-wow-delay=".3s"
						>
							<div className="about-img overflow-hidden">
								<Image
									data-speed=".8"
									src={about3.image.src}
									alt=""
									width={about3.image.width}
									height={about3.image.height}
								/>
							</div>
							<div className={`box-area ${type === 2 ? "style-2" : ""}`}>
								<div className="progress-box wow fadeInUp" data-wow-delay=".3s">
									<h4 className="title">{about3.progress.title}</h4>
									<ul className="tj-progress-list">
										{about3.progress.items.map((item, index) => (
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
					<div className="col-xl-6 col-lg-6 order-lg-2 order-1">
						<div className="about-content-area">
							<div className={`sec-heading ${type === 2 ? "" : "style-3"}`}>
								<span className="sub-title wow fadeInUp" data-wow-delay=".3s">
									<i className="tji-box"></i>
									{about3.subTitle}
								</span>
								<h2 className="sec-title title-anim">
									{type === 2 ? (
										<>
											{about3.titleType2Prefix}
											<span>{about3.titleType2Highlight}</span>
										</>
									) : (
										about3.titleDefault
									)}
								</h2>
							</div>
						</div>
						<div className="about-bottom-area">
							{about3.boxes.map((box, index) => (
								<div
									key={index}
									className={`mission-vision-box wow ${box.animation}`}
									data-wow-delay=".5s"
								>
									<h4 className="title">{box.title}</h4>
									<p className="desc">{box.desc}</p>
									<ul className="list-items">
										{box.items.map((item, idx) => (
											<li key={idx}>
												<i className="tji-list"></i>
												{item}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
						<div className="about-btn-area wow fadeInUp" data-wow-delay=".5s">
							<ButtonPrimary
								text={about3.button.text}
								url={about3.button.url}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-shape-1">
				<img src={about3.shapes[0]} alt="" />
			</div>
			<div className="bg-shape-2">
				<img src={about3.shapes[1]} alt="" />
			</div>
		</section>
	);
};

export default About3;
