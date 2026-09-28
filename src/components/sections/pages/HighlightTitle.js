/**
 * Renders a heading string verbatim, wrapping the first occurrence of `highlight` in a
 * <span> (the template's ".sec-title span" highlight). Presentation only: the text itself is
 * never changed, and if the phrase isn't found the heading renders unhighlighted.
 */
const HighlightTitle = ({ text, highlight }) => {
	if (!text) return null;
	const at = highlight ? text.indexOf(highlight) : -1;
	if (at < 0) return text;
	return (
		<>
			{text.slice(0, at)}
			<span>{highlight}</span>
			{text.slice(at + highlight.length)}
		</>
	);
};

export default HighlightTitle;
