import Image from "next/image";
import HighlightTitle from "./HighlightTitle";
import PageSegments, { segmentsText, soleLink } from "./PageSegments";

const ICONS = [
	[/^\s*address/i, "tji-location-3"],
	[/^\s*phone/i, "tji-phone"],
	[/^\s*e-?mail/i, "tji-envelop"],
];

function iconFor(segments) {
	const hit = ICONS.find(([re]) => re.test(segmentsText(segments)));
	return hit ? hit[1] : "tji-box";
}

/**
 * Navy info card (sits where the template's Contact3 has its map): a richText section's
 * heading, one icon row per detail paragraph, and any link-only paragraph as a button.
 * All strings render verbatim.
 */
const SisterCompanyCard = ({ section, highlight }) => {
	const paragraphs = (section.blocks || []).filter((b) => b.p);
	const links = paragraphs.map((b) => soleLink(b.p));
	const details = paragraphs.filter((_, i) => !links[i]);
	const buttons = links.filter(Boolean);

	return (
		<div className="ci-sister-info wow fadeInUp" data-wow-delay=".3s">
			{section.heading ? (
				<h3 className="ci-sister-info-title">
					<HighlightTitle text={section.heading} highlight={highlight} />
				</h3>
			) : null}
			<ul className="ci-sister-info-list">
				{details.map((block, i) => (
					<li key={i}>
						<span className="ci-info-icon" aria-hidden="true">
							<i className={iconFor(block.p)}></i>
						</span>
						<p>
							<PageSegments segments={block.p} />
						</p>
					</li>
				))}
			</ul>
			{buttons.map((link, i) => (
				<a
					key={i}
					className="tj-primary-btn ci-sister-info-btn"
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
			<div className="ci-card-shape" aria-hidden="true">
				<Image src="/images/shape/pattern-2.svg" alt="" width={370} height={590} unoptimized />
			</div>
		</div>
	);
};

export default SisterCompanyCard;
