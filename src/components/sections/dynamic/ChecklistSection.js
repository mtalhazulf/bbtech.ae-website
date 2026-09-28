import { classify } from "@/components/sections/service/presentation";
import SectionShell from "@/components/sections/service/SectionShell";

/**
 * Renders a { type: "checklist", heading?, items } content section in the template's check
 * styles (no browser bullets): short items as icon tiles, sentence items as check cards in a
 * tinted panel, long lists as a boxed multi-column list on a tinted band.
 */
const ChecklistSection = ({ heading, items }) => {
	const block = classify({ type: "checklist", heading, items: items || [] });
	return <SectionShell block={block} standalone />;
};

export default ChecklistSection;
