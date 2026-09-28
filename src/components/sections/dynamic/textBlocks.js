// Shared renderers for the structured content blocks produced by the content import
// (see content-import/ and src/data/pages/*.json). A "segment" is either a plain string
// or { text, href?, bold?, italic? }; a "block" is one of { p, h, ul, ol, image } as
// documented in the content-import brief.
//
// Every renderer here outputs the JSON copy verbatim (verify.mjs / check-page.mjs match
// rendered body text against the JSON): presentation may split a "Label: text" item into
// a bold lead and its description, but the characters (and the single space between
// them) always survive exactly as imported.
import Image from "next/image";
import Link from "next/link";

function Segment({ segment, keyPrefix }) {
	if (typeof segment === "string") return segment;
	let node = segment.text;
	if (segment.bold) node = <strong>{node}</strong>;
	if (segment.italic) node = <em>{node}</em>;
	if (segment.href) {
		const external = /^https?:\/\//.test(segment.href) && !segment.href.includes("bbtech.ae");
		return (
			<Link
				href={segment.href}
				key={keyPrefix}
				{...(external ? { target: "_blank", rel: "noopener" } : {})}
			>
				{node}
			</Link>
		);
	}
	return <span key={keyPrefix}>{node}</span>;
}

export function Segments({ segments }) {
	if (!segments) return null;
	const list = Array.isArray(segments) ? segments : [segments];
	return list.map((seg, i) => <Segment segment={seg} keyPrefix={i} key={i} />);
}

/** Flattens a segment (or segment list) to its plain text. */
export function segmentsText(segments) {
	if (!segments) return "";
	const list = Array.isArray(segments) ? segments : [segments];
	return list.map((seg) => (typeof seg === "string" ? seg : seg.text || "")).join("");
}

// "Expert Guidance: Certified professionals ..." -> lead "Expert Guidance:" + rest.
const LEAD_PATTERN = /^([^:]{2,60}:)\s+([\s\S]+)$/;

/**
 * Splits a plain-string list item into an optional bold lead ("Label:") and the rest.
 * Segment arrays are returned untouched (they already carry their own bold runs).
 */
export function splitLead(item) {
	if (typeof item !== "string") return { lead: null, rest: item };
	const match = item.match(LEAD_PATTERN);
	if (!match) return { lead: null, rest: item };
	return { lead: match[1], rest: match[2] };
}

const segText = (seg) => (typeof seg === "string" ? seg : seg?.text || "");

/**
 * The bold "Label" run that opens a segment array, as a lead: either a bold run that ends
 * in its own colon ("Malaffi Security:" + " Malaffi uses ...") or a bold run whose colon
 * opens the next segment ("Healthcare Expertise" + ": Decades of ..."). In the second case
 * the colon moves into the lead, so the rendered characters stay exactly the same.
 * @returns {{ lead: string|null, rest: Array }}
 */
export function segmentsLead(segments) {
	if (!Array.isArray(segments) || segments.length < 2) return { lead: null, rest: segments };
	const [first, next, ...others] = segments;
	if (!first || typeof first !== "object" || !first.bold || first.href || !first.text) return { lead: null, rest: segments };
	if (first.text.length > 60) return { lead: null, rest: segments };
	if (/:\s*$/.test(first.text)) return { lead: first.text, rest: [next, ...others] };
	const nextText = segText(next);
	if (nextText.startsWith(":")) {
		const remainder = nextText.slice(1);
		const restHead = typeof next === "string" ? remainder : { ...next, text: remainder };
		return { lead: `${first.text}:`, rest: [restHead, ...others] };
	}
	return { lead: null, rest: segments };
}

/** One list item's copy, with a "Label:" lead rendered bold when present. */
export function ItemText({ item }) {
	if (Array.isArray(item)) {
		const { lead, rest } = segmentsLead(item);
		if (!lead) return <Segments segments={item} />;
		return (
			<>
				<strong>{lead}</strong>
				<Segments segments={rest} />
			</>
		);
	}
	const { lead, rest } = splitLead(item);
	if (!lead) return <Segments segments={rest} />;
	return (
		<>
			<strong>{lead}</strong> {rest}
		</>
	);
}

/**
 * Splits a paragraph's segments at the line breaks inside its copy ("…studies.\nISMS is
 * available…") into one segment list per line. Each line keeps its own trailing "\n", so
 * the text is unchanged; blank lines are dropped.
 * @returns {Array<Array>} lines (a single line when the copy has no line breaks)
 */
export function splitSegmentLines(p) {
	const list = Array.isArray(p) ? p : [p];
	const lines = [];
	let current = [];
	for (const seg of list) {
		const text = segText(seg);
		if (!text.includes("\n")) {
			current.push(seg);
			continue;
		}
		const pieces = text.split(/(?<=\n)/);
		for (const piece of pieces) {
			current.push(typeof seg === "string" ? piece : { ...seg, text: piece });
			if (piece.endsWith("\n")) {
				lines.push(current);
				current = [];
			}
		}
	}
	if (current.length) lines.push(current);
	return lines.filter((line) => line.some((seg) => segText(seg).trim()));
}

/**
 * A checklist <ul> in the template's check-icon style (no browser bullets). `columns`
 * (1-3) lays the items out as a responsive grid.
 */
export function CheckList({ items, columns = 1, className = "" }) {
	if (!items?.length) return null;
	return (
		<ul className={`ci-check-list cols-${columns} ${className}`.trim()}>
			{items.map((item, i) => (
				<li key={i}>
					<span className="ci-check-icon" aria-hidden="true">
						<i className="tji-check"></i>
					</span>
					<span className="ci-check-text">
						<ItemText item={item} />
					</span>
				</li>
			))}
		</ul>
	);
}

const HEADING_TAGS = { 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" };

/** Renders an imported image through next/image, sized from its JSON width/height. */
export function ContentImage({ image, className, sizes, priority }) {
	if (!image?.localPath) return null;
	return (
		<Image
			className={className}
			src={image.localPath}
			alt={image.alt || ""}
			width={image.width || 1200}
			height={image.height || 800}
			sizes={sizes || "(max-width: 991px) 100vw, 60vw"}
			priority={priority}
		/>
	);
}

// A long paragraph imported as one bold run (the live page bolded the whole thing) reads as
// a wall of bold; it is shown as an emphasised paragraph instead, with the same text.
function isAllBoldParagraph(p) {
	const list = Array.isArray(p) ? p : [p];
	return list.length === 1 && typeof list[0] === "object" && list[0].bold && !list[0].href && (list[0].text || "").length > 160;
}

export function Block({ block, index, listColumns = 1 }) {
	if (block.p && isAllBoldParagraph(block.p)) {
		const seg = Array.isArray(block.p) ? block.p[0] : block.p;
		// `plain`: a presentation-only flag for the follow-on paragraphs of a long bold run
		// that was split at its line breaks (only its opening paragraph keeps the emphasis).
		return (
			<p key={index} className={block.plain ? undefined : "ci-emphasis"}>
				{seg.text}
			</p>
		);
	}
	if (block.p) {
		return (
			<p key={index}>
				<Segments segments={block.p} />
			</p>
		);
	}
	if (block.h) {
		const Tag = HEADING_TAGS[Math.min(Math.max(block.h, 2), 6)] || "h3";
		return <Tag key={index}>{block.text}</Tag>;
	}
	if (block.ul) return <CheckList items={block.ul} columns={listColumns} key={index} />;
	if (block.ol) {
		return (
			<ol className="ci-number-list" key={index}>
				{block.ol.map((item, i) => (
					<li key={i}>
						<Segments segments={item} />
					</li>
				))}
			</ol>
		);
	}
	if (block.image) {
		return (
			<div className="ci-inline-image" key={index}>
				<ContentImage image={block.image} />
			</div>
		);
	}
	return null;
}

export function Blocks({ blocks, listColumns }) {
	if (!blocks) return null;
	return blocks.map((block, i) => <Block block={block} index={i} key={i} listColumns={listColumns} />);
}
