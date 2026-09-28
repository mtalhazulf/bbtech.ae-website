import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import modifyNumber from "@/libs/modifyNumber";
import Image from "next/image";
import HighlightText from "./HighlightText";

/**
 * "Why BB Tech" as the template's Process4 dark band: sticky heading column
 * (which also carries the real "Our reputation is the proof!" line) beside
 * stacked, numbered cards with the live icons.
 */
const HomeWhy = ({ section, reputation }) => {
	const items = section.items || [];
	const repLines = reputation?.blocks?.flatMap(block => block.p || []) || [];

	return (
		<section className="h10-process section-gap section-gap-x tj-sticky-panel-3-container ci-home-why">
			<div className="container">
				<div className="row">
					<div className="col-12 col-lg-5">
						<div className="sec-heading style-3 tj-sticky-panel-3">
							<h2 className="sec-title text-anim">
								<HighlightText text={section.heading} highlight={section.highlight} />
							</h2>
							{reputation ? (
								<div className="ci-why-reputation">
									<h3 className="ci-why-rep-title">{reputation.heading}</h3>
									{repLines.map((text, idx) => (
										<p key={idx} className="ci-why-rep-text">
											{text}
										</p>
									))}
								</div>
							) : null}
							<div className="h10-process-more">
								<ButtonPrimary text="Get in touch!" url="/contact/" />
							</div>
						</div>
					</div>
					<div className="col-12 col-lg-7">
						<div className="h10-process-wrapper">
							{items.map((item, idx) => (
								<div key={idx} className="h10-process-item tj-sticky-panel-3">
									<span className="h10-process-sln" aria-hidden="true">
										{modifyNumber(idx + 1)}
									</span>
									<div className="h10-process-icon">
										{item.image ? (
											<Image
												src={item.image.localPath}
												alt={item.image.alt || ""}
												width={item.image.width}
												height={item.image.height}
												sizes="80px"
											/>
										) : null}
									</div>
									<div className="h10-process-content">
										<h4 className="title">{item.title}</h4>
										{item.text ? <p className="desc">{item.text}</p> : null}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className="bg-shape-1">
				<img src="/images/shape/pattern-2.svg" alt="" />
			</div>
			<div className="bg-shape-2">
				<img src="/images/shape/pattern-3.svg" alt="" />
			</div>
			<div className="bg-shape-3">
				<img src="/images/shape/h7-testimonial-shape-blur.svg" alt="" />
			</div>
		</section>
	);
};

export default HomeWhy;
