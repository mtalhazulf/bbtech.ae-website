import Image from "next/image";
import Link from "next/link";
import HighlightText from "./HighlightText";

/**
 * Industry grid in the template's Industries dress (".industry-card"): the
 * real industry illustration, name and the client-count line exactly as the
 * live site words it. Cards the live site linked get a title link plus a
 * round arrow chip on the image corner (labelled "Read More: <name>"), so
 * linked and unlinked cards keep the same inner layout.
 */
const HomeIndustries = ({ section }) => {
	const items = section.items || [];
	return (
		<section className="tj-industries-section section-gap ci-home-industries">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="heading-wrap-content ci-industries-heading">
							<div className="sec-heading style-3">
								<h2 className="sec-title text-anim">
									<HighlightText text={section.heading} highlight={section.highlight} />
								</h2>
							</div>
							{section.text ? (
								<p className="desc wow fadeInUp" data-wow-delay=".4s">
									{section.text}
								</p>
							) : null}
						</div>
					</div>
				</div>
				<div className="row row-gap-4">
					{items.map((item, idx) => {
						const hasLink = Boolean(item.href && item.href !== "#");
						return (
							<div key={idx} className="col-12 col-md-6 col-lg-4">
								<div
									className={`industry-card ci-industry-card wow fadeInUp ${hasLink ? "has-link" : ""}`}
									data-wow-delay={`.${(idx % 3) + 2}s`}
								>
									{item.image ? (
										<div className="ci-industry-img">
											<Image
												src={item.image.localPath}
												alt={item.image.alt || ""}
												width={item.image.width}
												height={item.image.height}
												sizes="(min-width: 992px) 360px, (min-width: 768px) 45vw, 90vw"
											/>
											{hasLink ? (
												<Link
													className="ci-industry-link"
													href={item.href}
													aria-label={`Read More: ${item.title}`}
												>
													<i className="tji-arrow-right-long" aria-hidden="true"></i>
												</Link>
											) : null}
										</div>
									) : null}
									<h3 className="industry-name">
										{hasLink ? (
											<Link href={item.href} tabIndex={item.image ? -1 : undefined}>
												{item.title}
											</Link>
										) : (
											item.title
										)}
									</h3>
									{item.text ? (
										<p className="industry-desc ci-industry-count">
											<i className="tji-team" aria-hidden="true"></i>
											<span>{item.text}</span>
										</p>
									) : null}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default HomeIndustries;
