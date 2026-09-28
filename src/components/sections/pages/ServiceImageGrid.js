import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import HighlightTitle from "./HighlightTitle";
import PageSegments from "./PageSegments";
import ServiceCard from "./ServiceImageCard";

/**
 * Services listing in the template's ServicesPrimary layout (.tj-service-section.service-4
 * grid of cards, staggered fadeInUp) with a "sec-heading-wrap" header. Cards are the
 * image-led ServiceImageCard; every card field from the cardGrid section renders.
 */
const ServiceImageGrid = ({ section, eyebrow, heading, highlight, button }) => {
	const items = section.items || [];
	return (
		<section className="tj-service-section service-4 ci-services-grid-section section-gap">
			<div className="container">
				{eyebrow || heading || section.heading ? (
					<div className="row">
						<div className="col-12">
							<div className="sec-heading-wrap">
								{eyebrow ? (
									<span className="sub-title wow fadeInUp" data-wow-delay=".1s">
										<i className="tji-box" aria-hidden="true"></i>
										{eyebrow}
									</span>
								) : null}
								<div className="heading-wrap-content">
									<div className="sec-heading">
										<h2 className="sec-title title-anim">
											<HighlightTitle text={section.heading || heading} highlight={highlight} />
										</h2>
									</div>
									{button ? (
										<div className="btn-wrap wow fadeInUp" data-wow-delay=".3s">
											<ButtonPrimary text={button.text} url={button.href} />
										</div>
									) : null}
								</div>
								{section.text ? (
									<p className="desc">
										<PageSegments segments={section.text} />
									</p>
								) : null}
							</div>
						</div>
					</div>
				) : null}
				<div className="row row-gap-4 justify-content-center">
					{items.map((item, idx) => (
						<div
							key={idx}
							className="col-xl-4 col-md-6 wow fadeInUp"
							data-wow-delay={`.${(idx % 3) + 1}s`}
						>
							<ServiceCard item={item} idx={idx} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default ServiceImageGrid;
