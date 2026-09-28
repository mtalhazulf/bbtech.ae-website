import { classify } from "@/components/sections/service/presentation";
import SectionShell from "@/components/sections/service/SectionShell";

/**
 * Renders a { type: "richText", heading?, blocks, image? } content section in the template's
 * premium vocabulary (same blocks as the catch-all pages):
 * - heading + ul pairs ("Our Services") -> numbered card grid on a tinted band
 * - an ol -> numbered step cards
 * - prose with an image -> split image + sec-heading + text
 * - prose with a heading -> sec-heading beside the copy
 * Optional `eyebrow` adds the template's sub-title pill above the heading.
 */
const RichTextSection = ({ heading, blocks, image, eyebrow }) => {
	let block = classify({ type: "richText", heading, blocks: blocks || [], image });
	if (block.kind === "text" && (heading || image)) {
		block = { kind: "intro", eyebrow: eyebrow || null, title: heading || null, lead: null, blocks: blocks || [], image: image || null, extraImages: [] };
	} else if (eyebrow) {
		block = { ...block, eyebrow };
	}
	return <SectionShell block={block} standalone />;
};

export default RichTextSection;
