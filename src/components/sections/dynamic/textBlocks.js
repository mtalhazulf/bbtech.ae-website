// Shared renderers for the structured content blocks produced by the content import
// (see content-import/ and src/data/pages/*.json). A "segment" is either a plain string
// or { text, href?, bold?, italic? }; a "block" is one of { p, h, ul, ol, image } as
// documented in the content-import brief.
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

/** A checklist <ul>, matching the tji-check markup used throughout this codebase. */
export function CheckList({ items }) {
	return (
		<ul>
			{items.map((item, i) => (
				<li key={i}>
					<span>
						<i className="tji-check"></i>
					</span>
					<Segments segments={item} />
				</li>
			))}
		</ul>
	);
}

const HEADING_TAGS = { 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" };

export function Block({ block, index }) {
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
	if (block.ul) return <CheckList items={block.ul} key={index} />;
	if (block.ol) {
		return (
			<ol key={index}>
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
			// eslint-disable-next-line @next/next/no-img-element
			<img
				key={index}
				src={block.image.localPath}
				alt={block.image.alt || ""}
				width={block.image.width || undefined}
				height={block.image.height || undefined}
			/>
		);
	}
	return null;
}

export function Blocks({ blocks }) {
	if (!blocks) return null;
	return blocks.map((block, i) => <Block block={block} index={i} key={i} />);
}
