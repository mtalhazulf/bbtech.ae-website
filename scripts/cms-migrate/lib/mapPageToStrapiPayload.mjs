const TYPE_TO_COMPONENT = {
	richText: "sections.rich-text",
	cardGrid: "sections.card-grid",
	checklist: "sections.checklist",
};

function mapCardGridItem(item) {
	const mapped = { title: item.title };
	if (item.text !== undefined) mapped.text = item.text;
	if (typeof item.icon === "string") mapped.icon = item.icon;
	else if (item.icon && typeof item.icon === "object") mapped.iconImage = item.icon;
	if (item.href !== undefined) mapped.href = item.href;
	if (item.date !== undefined) mapped.date = item.date;
	if (item.image !== undefined) mapped.image = item.image;
	if (item.list !== undefined) mapped.list = item.list.map((text) => ({ text }));
	return mapped;
}

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
			items: (section.items || []).map(mapCardGridItem),
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
