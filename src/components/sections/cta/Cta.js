import { Blocks, ContentImage } from "@/components/sections/dynamic/textBlocks";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";

// Real site copy for the default CTA band: the live service-page sidebar widget heading.
// (The template's own cta.json copy and stock image are placeholders and are not used.)
const DEFAULT_TITLE = "Have a project for us? Get in touch!";
const DEFAULT_BUTTON = { text: "Let's Talk", href: "/contact/" };

/**
 * The template's CTA band (tj-cta-section), which overlaps the top of the footer.
 * All props are optional:
 *   title   heading (defaults to the live "Have a project for us? Get in touch!")
 *   blocks  content blocks rendered under the title (e.g. a page's closing paragraphs)
 *   text    a single paragraph, as an alternative to `blocks`
 *   button  { text, href } (defaults to "Let's Talk" -> /contact/)
 *   image   { localPath, alt, width, height } shown on the right half; without one the
 *           band uses the decorative pattern instead of a stock photo
 *   inline  true when the band is not the page's last section (no footer overlap)
 */
const Cta = ({ title = DEFAULT_TITLE, blocks, text, button = DEFAULT_BUTTON, image, inline = false }) => {
	const long = (title || "").length > 34;
	// Bands that carry body copy use a deeper teal so regular-size white text passes AA.
	const hasText = !!(blocks?.length || text);
	return (
		<section
			className={`tj-cta-section ci-cta ${image ? "has-image" : "no-image"} ${hasText ? "has-text" : ""} ${inline ? "is-inline" : ""}`
				.replace(/\s+/g, " ")
				.trim()}
		>
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="cta-area">
							<div className="cta-content">
								<h2 className={`title title-anim ${long ? "is-long" : ""}`.trim()}>{title}</h2>
								{blocks?.length || text ? (
									<div className="ci-cta-text wow fadeInUp" data-wow-delay=".3s">
										{blocks?.length ? <Blocks blocks={blocks} /> : <p>{text}</p>}
									</div>
								) : null}
								{button ? (
									<div className="cta-btn wow fadeInUp" data-wow-delay=".5s">
										<ButtonPrimary text={button.text} url={button.href} className="btn-dark" />
									</div>
								) : null}
							</div>
							{image ? (
								<div className="cta-img">
									<ContentImage image={image} sizes="(max-width: 991px) 100vw, 660px" />
								</div>
							) : (
								<div className="ci-cta-decor" aria-hidden="true">
									<img className="shape-1" src="/images/shape/pattern-2.svg" alt="" />
									<img className="shape-2" src="/images/shape/pattern-3.svg" alt="" />
									<span className="ci-cta-mark">
										<i className="tji-arrow-right-big"></i>
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Cta;
