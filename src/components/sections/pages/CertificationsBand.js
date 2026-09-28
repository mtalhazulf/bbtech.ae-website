import Image from "next/image";
import HighlightTitle from "./HighlightTitle";

/**
 * Logo band in the template's Brands1 style (white logo boxes around a dashed, blurred
 * circle holding the title), without the slider or any invented "trusted by" copy: the
 * heading and badge images come straight from the cardGrid section.
 */
const CertificationsBand = ({ section, highlight }) => {
	const items = (section.items || []).filter((item) => item.image);
	const half = Math.ceil(items.length / 2);
	const renderBadge = (item, i) => (
		<div key={i} className="ci-cert-item wow fadeInUp" data-wow-delay={`.${i + 1}s`}>
			<Image
				src={item.image.localPath}
				alt={item.image.alt || ""}
				width={item.image.width}
				height={item.image.height}
				sizes="(max-width: 575px) 45vw, 240px"
			/>
			{item.title ? <h3 className="ci-cert-title">{item.title}</h3> : null}
			{item.text ? <p className="ci-cert-text">{item.text}</p> : null}
		</div>
	);

	return (
		<section className="ci-cert-section section-bottom-gap">
			<div className="container">
				<div className="ci-cert-band">
					<div className="ci-cert-group">{items.slice(0, half).map((item, i) => renderBadge(item, i))}</div>
					{section.heading ? (
						<div className="ci-cert-circle">
							<h2 className="sec-title">
								<HighlightTitle text={section.heading} highlight={highlight} />
							</h2>
						</div>
					) : null}
					<div className="ci-cert-group">
						{items.slice(half).map((item, i) => renderBadge(item, i + half))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default CertificationsBand;
