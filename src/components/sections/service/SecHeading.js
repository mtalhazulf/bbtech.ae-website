import { splitHighlight } from "./presentation";

/**
 * The template's section heading: optional eyebrow pill (icon + uppercase dashed label)
 * and a title with its last key phrase highlighted. Text is rendered verbatim.
 */
const SecHeading = ({ eyebrow, title, as = "h2", className = "", animate = true }) => {
	if (!title && !eyebrow) return null;
	const Tag = as;
	const [prefix, highlight] = splitHighlight(title);
	return (
		<div className={`sec-heading ci-sec-heading ${className}`.trim()}>
			{eyebrow ? (
				<span className="sub-title wow fadeInUp" data-wow-delay=".1s">
					<i className="tji-box" aria-hidden="true"></i>
					{eyebrow}
				</span>
			) : null}
			{title ? (
				<Tag className={`sec-title ${animate ? "title-anim" : ""}`.trim()}>
					{prefix}
					{highlight ? <span>{highlight}</span> : null}
				</Tag>
			) : null}
		</div>
	);
};

export default SecHeading;
