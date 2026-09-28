import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";
import HighlightTitle from "./HighlightTitle";
import PageSegments from "./PageSegments";

/**
 * About-page intro: the template's "sec-heading-wrap" (eyebrow + heading + side button,
 * as in Features type 2) over a split layout — image panel and a highlighted call-out on
 * the left, the long-form copy on the right with the first paragraph set as a lead.
 * Every paragraph of the richText section renders verbatim.
 */
const AboutIntro = ({ section, eyebrow, highlight, button, image }) => {
	const paragraphs = (section.blocks || []).filter((b) => b.p);
	const others = (section.blocks || []).filter((b) => !b.p);
	const [lead, ...restAll] = paragraphs;
	const callout = restAll.length > 1 ? restAll[restAll.length - 1] : null;
	const body = callout ? restAll.slice(0, -1) : restAll;

	return (
		<section className="ci-about-intro section-gap">
			<div className="container">
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
										<HighlightTitle text={section.heading} highlight={highlight} />
									</h2>
								</div>
								{button ? (
									<div className="btn-wrap wow fadeInUp" data-wow-delay=".3s">
										<ButtonPrimary text={button.text} url={button.href} />
									</div>
								) : null}
							</div>
						</div>
					</div>
				</div>
				<div className="ci-about-grid">
					{image ? (
						<div className="ci-about-media wow fadeInLeft" data-wow-delay=".2s">
							<Image
								src={image.localPath}
								alt={image.alt || ""}
								width={image.width}
								height={image.height}
								sizes="(max-width: 991px) 100vw, 480px"
							/>
						</div>
					) : null}
					<div className="ci-about-copy">
						{lead ? (
							<p className="ci-lead wow fadeInUp" data-wow-delay=".2s">
								<PageSegments segments={lead.p} />
							</p>
						) : null}
						<div className="ci-copy-body wow fadeInUp" data-wow-delay=".3s">
							{body.map((block, i) => (
								<p key={i}>
									<PageSegments segments={block.p} />
								</p>
							))}
						</div>
						{others.length ? (
							<div className="ci-copy-body">
								{others.map((block, i) =>
									block.text ? <h3 key={i}>{block.text}</h3> : null
								)}
							</div>
						) : null}
					</div>
					{callout ? (
						<div className="ci-about-callout wow fadeInUp" data-wow-delay=".3s">
							<span className="ci-callout-icon" aria-hidden="true">
								<i className="tji-phone"></i>
							</span>
							<p>
								<PageSegments segments={callout.p} />
							</p>
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
};

export default AboutIntro;
