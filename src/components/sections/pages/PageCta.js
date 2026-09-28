import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";
import HighlightTitle from "./HighlightTitle";
import PageSegments from "./PageSegments";

/**
 * The template's closing CTA band (Cta.js markup: .tj-cta-section > .cta-area with
 * .cta-content + .cta-img), prop-driven for real content. It overlaps the top of the
 * footer exactly like the template's Cta, so every inner page ends on it.
 *
 * @param {{ heading: string, highlight?: string, text?: any, button?: { text: string, href: string }, image?: { localPath: string, alt?: string, width: number, height: number } }} props
 */
const PageCta = ({ heading, highlight, text, button, image }) => {
	return (
		<section className="tj-cta-section ci-cta">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className={`cta-area ${image ? "" : "ci-cta-no-img"}`}>
							<div className="cta-content">
								<h2 className="title title-anim">
									<HighlightTitle text={heading} highlight={highlight} />
								</h2>
								{text ? (
									<p className="ci-cta-text wow fadeInUp" data-wow-delay=".2s">
										<PageSegments segments={text} />
									</p>
								) : null}
								{button ? (
									<div className="cta-btn wow fadeInUp" data-wow-delay=".3s">
										<ButtonPrimary text={button.text} url={button.href} className="btn-dark" />
									</div>
								) : null}
							</div>
							{image ? (
								<div className="cta-img">
									<Image
										src={image.localPath}
										alt={image.alt || ""}
										width={image.width}
										height={image.height}
										sizes="(max-width: 991px) 100vw, 600px"
									/>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default PageCta;
