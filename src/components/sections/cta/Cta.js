import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import ctaData from "@/data/sections/cta.json";

const Cta = () => {
	const { cta } = ctaData;
	return (
		<section className="tj-cta-section">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="cta-area">
							<div className="cta-content">
								<h2 className="title title-anim">{cta.title}</h2>
								<div
									className="cta-btn wow fadeInUp"
									data-wow-delay={cta.buttonDelay}
								>
									<ButtonPrimary
										text={cta.button.text}
										url={cta.button.url}
										className={"btn-dark"}
									/>
								</div>
							</div>
							<div className="cta-img">
								<img src={cta.image} alt="" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Cta;
