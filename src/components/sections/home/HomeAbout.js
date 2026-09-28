import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import FunfactSingle from "@/components/shared/funfact/FunfactSingle";
import Image from "next/image";
import HighlightText from "./HighlightText";

/**
 * Pulls the counters shown beside the About copy out of real home-page text
 * (the "Our reputation is the proof!" line and the "24/7 ..." Why-BB-Tech
 * item) so nothing is typed in by hand. Returns only what actually parses.
 *
 * @param {object} [reputation] section with blocks[].p[]
 * @param {object} [why] section with items[].title
 * @returns {{ value?: number, display?: string, symbol?: string, label: string }[]}
 */
const deriveStats = (reputation, why) => {
	const stats = [];
	const repLine = reputation?.blocks?.flatMap(block => block.p || [])[0];
	const repMatch = repLine?.match(/(\d+)\s*\+\s*([A-Za-z][A-Za-z ]*[A-Za-z])/);
	if (repMatch) {
		stats.push({ value: Number(repMatch[1]), symbol: "+", label: repMatch[2] });
	}
	const supportTitle = why?.items?.map(item => item.title).find(title => /^\d+\/\d+\s/.test(title || ""));
	if (supportTitle) {
		const [display, ...rest] = supportTitle.split(" ");
		stats.push({ display, label: rest.join(" ") });
	}
	return stats;
};

/**
 * About block in the template's About9 layout: a rounded photo frame (image
 * chosen in page.js via the section's `mediaFrom` key) on one side, eyebrow +
 * highlighted title + copy + counters on the other.
 */
const HomeAbout = ({ section, image, reputation, why }) => {
	const paragraphs = section.blocks?.flatMap(block => block.p || []) || [];
	const stats = deriveStats(reputation, why);

	return (
		<section className="h10-about section-gap ci-home-about">
			<div className="container">
				<div className="row ci-about-row">
					<div className="col-12 col-lg-5 order-2 order-lg-1">
						<div
							className="about-img-area h10-about-banner ci-home-about-media wow fadeInLeft"
							data-wow-delay=".3s"
						>
							{image ? (
								<div className="about-img">
									<Image
										src={image.localPath}
										alt={image.alt || ""}
										width={image.width}
										height={image.height}
										sizes="(min-width: 1400px) 534px, (min-width: 992px) 40vw, 92vw"
									/>
								</div>
							) : null}
						</div>
					</div>
					<div className="col-12 col-lg-7 order-1 order-lg-2">
						<div className="h10-about-content-wrapper">
							<div className="sec-heading style-3">
								<span className="sub-title wow fadeInUp" data-wow-delay=".3s">
									<i className="tji-box" aria-hidden="true"></i> About us
								</span>
								<h2 className="sec-title text-anim">
									<HighlightText text={section.heading} highlight={section.highlight} />
								</h2>
							</div>
							<div className="h10-about-content">
								{paragraphs.map((text, idx) => (
									<p key={idx} className="desc wow fadeInUp" data-wow-delay=".4s">
										{text}
									</p>
								))}
								{stats.length ? (
									<div className="h9-about-funfact h10-about-funfact ci-about-funfact wow fadeInUp" data-wow-delay=".5s">
										{stats.map((stat, idx) => (
											<div key={idx} className="countup-item">
												{stat.value ? (
													<FunfactSingle currentValue={stat.value} symbol={stat.symbol} />
												) : (
													<div className="inline-content">{stat.display}</div>
												)}
												<span className="count-text">{stat.label}</span>
											</div>
										))}
									</div>
								) : null}
								<div className="ci-about-btn wow fadeInUp" data-wow-delay=".6s">
									<ButtonPrimary text="Discover more" url="/about-us/" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HomeAbout;
