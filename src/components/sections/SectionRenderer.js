import CardGridSection from "./dynamic/CardGridSection";
import ChecklistSection from "./dynamic/ChecklistSection";
import CtaSection from "./dynamic/CtaSection";
import DynamicForm from "./dynamic/DynamicForm";
import RichTextSection from "./dynamic/RichTextSection";

const RENDERERS = {
	richText: (s, i) => <RichTextSection key={i} heading={s.heading} blocks={s.blocks} image={s.image} />,
	cardGrid: (s, i) => <CardGridSection key={i} heading={s.heading} items={s.items} />,
	checklist: (s, i) => <ChecklistSection key={i} heading={s.heading} items={s.items} />,
	cta: (s, i) => <CtaSection key={i} heading={s.heading} button={s.button} />,
	form: (s, i) => <DynamicForm key={i} id={s.id} fields={s.fields} consent={s.consent} submitText={s.submitText} />,
};

/**
 * Maps the ordered `sections` array from a src/data/pages/*.json content file onto real
 * section components. Every section produced by the content import is one of the types
 * above (see content-import/ for the extraction rules) — an unrecognized type is skipped
 * rather than crashing the build, but that should never happen for real content.
 */
const SectionRenderer = ({ sections }) => {
	if (!sections?.length) return null;
	return sections.map((section, i) => {
		const render = RENDERERS[section.type];
		if (!render) {
			if (process.env.NODE_ENV !== "production") {
				console.warn(`SectionRenderer: unknown section type "${section.type}" at index ${i}`);
			}
			return null;
		}
		return render(section, i);
	});
};

export default SectionRenderer;
