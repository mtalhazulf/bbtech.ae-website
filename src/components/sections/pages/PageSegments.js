// Renders the inline "segments" used by src/data/pages/*.json text blocks: each segment is
// either a plain string or { text, href?, bold?, italic?, target?, rel? }. Strings are
// rendered verbatim (including any "\n" — pair with a `white-space: pre-line` container).
import Link from "next/link";

/**
 * @typedef {string | { text: string, href?: string, bold?: boolean, italic?: boolean, target?: string, rel?: string }} Segment
 */

function isExternal(href) {
	return /^https?:\/\//.test(href) && !href.includes("bbtech.ae");
}

function SegmentNode({ segment }) {
	if (typeof segment === "string") return segment;
	let node = segment.text;
	if (segment.bold) node = <strong>{node}</strong>;
	if (segment.italic) node = <em>{node}</em>;
	if (!segment.href) return <span>{node}</span>;
	if (/^(mailto|tel):/.test(segment.href) || isExternal(segment.href)) {
		const external = isExternal(segment.href);
		return (
			<a
				href={segment.href}
				target={segment.target || (external ? "_blank" : undefined)}
				rel={segment.rel || (external ? "noopener" : undefined)}
			>
				{node}
			</a>
		);
	}
	return <Link href={segment.href}>{node}</Link>;
}

/** Renders one segment or an array of segments. */
const PageSegments = ({ segments }) => {
	if (segments === undefined || segments === null) return null;
	const list = Array.isArray(segments) ? segments : [segments];
	return list.map((segment, i) => <SegmentNode key={i} segment={segment} />);
};

/** Plain-text value of a segment list (used for aria labels and link detection). */
export function segmentsText(segments) {
	const list = Array.isArray(segments) ? segments : [segments];
	return list.map((s) => (typeof s === "string" ? s : s?.text || "")).join("");
}

/** The first linked segment in a paragraph, if the paragraph is only a link (a "button" paragraph). */
export function soleLink(segments) {
	const list = (Array.isArray(segments) ? segments : [segments]).filter(
		(s) => !(typeof s === "string" && !s.trim())
	);
	return list.length === 1 && typeof list[0] === "object" && list[0].href ? list[0] : null;
}

export default PageSegments;
