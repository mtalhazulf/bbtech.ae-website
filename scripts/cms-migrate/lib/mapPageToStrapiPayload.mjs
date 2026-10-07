const TYPE_TO_COMPONENT = {
	richText: "sections.rich-text",
	cardGrid: "sections.card-grid",
	checklist: "sections.checklist",
};

function mapSection(section) {
	const component = TYPE_TO_COMPONENT[section.type];
	if (!component) {
		throw new Error(`Unknown page section type: ${section.type}`);
	}

	if (section.type === "checklist") {
		return {
			__component: component,
			heading: section.heading,
			items: (section.items || []).map((text) => ({ text })),
		};
	}

	if (section.type === "cardGrid") {
		return {
			__component: component,
			heading: section.heading,
			items: section.items || [],
		};
	}

	// richText
	const { type, ...rest } = section;
	return { __component: component, ...rest };
}

export function mapPageToStrapiPayload(page) {
	return {
		data: {
			slug: page.slug,
			path: page.path,
			source: page.source,
			layout: page.layout,
			sidebarMenu: page.sidebarMenu,
			metadata: page.metadata || {},
			hero: page.hero || {},
			sections: (page.sections || []).map(mapSection),
		},
	};
}
