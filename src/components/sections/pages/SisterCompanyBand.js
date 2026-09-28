import Image from "next/image";
import HighlightTitle from "./HighlightTitle";
import PageSegments, { soleLink } from "./PageSegments";

/**
 * A navy split card (the template's dark service band look, with its line pattern shape):
 * heading and the section's link paragraph as a primary button on the left, the copy on
 * the right (on mobile: heading, copy, then button). A paragraph that is only a link
 * renders as the button; everything else as text, all verbatim.
 */
const SisterCompanyBand = ({ section, highlight }) => {
	const paragraphs = (section.blocks || []).filter((b) => b.p);
	const links = paragraphs.map((b) => soleLink(b.p));
	const textBlocks = paragraphs.filter((_, i) => !links[i]);
	const buttons = links.filter(Boolean);

	return (
		<section className="ci-sister-section section-gap">
			<div className="container">
				<div className="ci-sister-card wow fadeInUp" data-wow-delay=".1s">
					<div className="ci-sister-grid">
						<div className="sec-heading ci-dark-heading">
							<h2 className="sec-title title-anim">
								<HighlightTitle text={section.heading} highlight={highlight} />
							</h2>
						</div>
						<div className="ci-sister-copy">
							{textBlocks.map((block, i) => (
								<p key={i} className={i === 0 ? "ci-sister-lead" : undefined}>
									<PageSegments segments={block.p} />
								</p>
							))}
						</div>
						{buttons.length ? (
							<div className="ci-sister-actions">
								{buttons.map((link, i) => (
									<a
										key={i}
										className="tj-primary-btn"
										href={link.href}
										target={link.target || "_blank"}
										rel={link.rel || "noopener"}
									>
										<span className="btn-text">
											<span>{link.text}</span>
										</span>
										<span className="btn-icon">
											<i className="tji-arrow-right-long" aria-hidden="true"></i>
										</span>
									</a>
								))}
							</div>
						) : null}
					</div>
					<div className="ci-card-shape" aria-hidden="true">
						<Image src="/images/shape/pattern-2.svg" alt="" width={370} height={590} unoptimized />
					</div>
				</div>
			</div>
		</section>
	);
};

export default SisterCompanyBand;
