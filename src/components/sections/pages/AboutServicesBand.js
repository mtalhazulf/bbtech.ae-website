import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";
import HighlightTitle from "./HighlightTitle";
import PageSegments from "./PageSegments";

/**
 * The template's About3 tinted band (.tj-about-section-2 with the two .bg-shape patterns):
 * a statement heading + tagline + button on the left, and the full services checklist as a
 * premium two-column check grid inside a white card on the right.
 *
 * `statement` is a richText section ({ heading, blocks }) and `list` a checklist section
 * ({ items }); both render verbatim.
 */
const AboutServicesBand = ({ statement, list, eyebrow, highlight, button, image }) => {
	const items = list?.items || [];
	const paragraphs = (statement?.blocks || []).filter((b) => b.p);

	return (
		<section className="tj-about-section-2 ci-services-band section-gap section-gap-x">
			<div className="container">
				<div className="row rg-30">
					<div className="col-lg-5">
						<div className="ci-band-intro">
							<div className="sec-heading">
								{eyebrow ? (
									<span className="sub-title wow fadeInUp" data-wow-delay=".1s">
										<i className="tji-box" aria-hidden="true"></i>
										{eyebrow}
									</span>
								) : null}
								{statement?.heading ? (
									<h2 className="sec-title title-anim">
										<HighlightTitle text={statement.heading} highlight={highlight} />
									</h2>
								) : null}
							</div>
							{paragraphs.map((block, i) => (
								<p key={i} className="ci-band-tagline wow fadeInUp" data-wow-delay=".2s">
									<PageSegments segments={block.p} />
								</p>
							))}
							{button ? (
								<div className="ci-band-btn wow fadeInUp" data-wow-delay=".3s">
									<ButtonPrimary text={button.text} url={button.href} />
								</div>
							) : null}
							{image ? (
								<div className="ci-band-img wow fadeInUp" data-wow-delay=".4s">
									<Image
										src={image.localPath}
										alt={image.alt || ""}
										width={image.width}
										height={image.height}
										sizes="(max-width: 991px) 100vw, 460px"
									/>
								</div>
							) : null}
						</div>
					</div>
					<div className="col-lg-7">
						<div className="ci-check-card wow fadeInUp" data-wow-delay=".3s">
							<ul className="ci-check-grid">
								{items.map((item, i) => {
									const long = typeof item === "string" && item.length > 70;
									return (
										<li key={i} className={long ? "is-wide" : undefined}>
											<span className="ci-check-icon" aria-hidden="true">
												<i className="tji-check"></i>
											</span>
											<span className="ci-check-text">
												<PageSegments segments={item} />
											</span>
										</li>
									);
								})}
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-shape-1">
				<Image src="/images/shape/pattern-2.svg" alt="" width={370} height={590} unoptimized />
			</div>
			<div className="bg-shape-2">
				<Image src="/images/shape/pattern-3.svg" alt="" width={370} height={590} unoptimized />
			</div>
		</section>
	);
};

export default AboutServicesBand;
