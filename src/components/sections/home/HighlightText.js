/**
 * Renders a heading string with one highlighted phrase wrapped in <span>
 * (the template's ".sec-title span" treatment). The text itself is never
 * altered: `highlight` must be an exact substring of `text`, otherwise the
 * text renders as-is.
 *
 * @param {{ text: string, highlight?: string }} props
 */
const HighlightText = ({ text, highlight }) => {
	if (!text) return null;
	const idx = highlight ? text.indexOf(highlight) : -1;
	if (idx === -1) return <>{text}</>;
	return (
		<>
			{text.slice(0, idx)}
			<span>{highlight}</span>
			{text.slice(idx + highlight.length)}
		</>
	);
};

export default HighlightText;
