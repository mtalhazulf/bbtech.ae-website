import { classify } from "@/components/sections/service/presentation";
import SectionShell from "@/components/sections/service/SectionShell";

/**
 * Renders a { type: "cardGrid", heading?, text?, image?, items } content section with the
 * template's card styles: numbered service cards with icons (text items), check-list cards
 * (items with a `list`), image cards, icon tiles (title-only items) or blog cards (items
 * with href + date). Optional `eyebrow` adds the sub-title pill above the heading.
 */
const CardGridSection = ({ heading, text, image, items, eyebrow }) => {
	const block = classify({ type: "cardGrid", heading, text, image, items: items || [] });
	return <SectionShell block={eyebrow ? { ...block, eyebrow } : block} standalone />;
};

export default CardGridSection;
