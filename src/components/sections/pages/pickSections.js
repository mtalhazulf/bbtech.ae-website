/**
 * Splits a page's `sections` array into the ones a bespoke layout asks for (by their
 * presentation-only `variant` key) and everything else. The bespoke page renders the picked
 * sections in its premium layout and hands `rest` to SectionRenderer, so a section added to
 * the JSON later is still rendered instead of silently dropped.
 *
 * @param {Array<{ variant?: string }>} sections
 * @param {string[]} variants
 * @returns {{ picked: Record<string, any>, rest: any[] }}
 */
export default function pickSections(sections = [], variants = []) {
	const picked = {};
	const rest = [];
	for (const section of sections) {
		if (section?.variant && variants.includes(section.variant) && !picked[section.variant]) {
			picked[section.variant] = section;
		} else {
			rest.push(section);
		}
	}
	return { picked, rest };
}
