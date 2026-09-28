import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

/** Renders a { type: "cta", heading, button: { text, href } } content section. */
const CtaSection = ({ heading, button }) => {
	return (
		<section className="tj-cta-section">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="cta-area">
							<div className="cta-content">
								<h2 className="title title-anim">{heading}</h2>
								{button ? (
									<div className="cta-btn wow fadeInUp">
										<ButtonPrimary text={button.text} url={button.href} className="btn-dark" />
									</div>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CtaSection;
