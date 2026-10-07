const COMPONENT_TO_TYPE = {
	"sections.rich-text": "richText",
	"sections.card-grid": "cardGrid",
	"sections.checklist": "checklist",
};

function mapImage(image) {
	if (!image) return undefined;
	const { localPath, alt, width, height } = image;
	return { localPath, alt, width, height };
}

function mapCardGridItemFromStrapi(item) {
	const mapped = { title: item.title };
	if (item.text !== undefined) mapped.text = item.text;
	if (item.icon !== undefined) mapped.icon = item.icon;
	else if (item.iconImage) mapped.icon = mapImage(item.iconImage);
	if (item.href !== undefined) mapped.href = item.href;
	if (item.date !== undefined) mapped.date = item.date;
	if (item.image !== undefined) mapped.image = mapImage(item.image);
	if (item.list !== undefined) mapped.list = item.list.map((li) => li.text);
	return mapped;
}

function mapSection(section) {
	const type = COMPONENT_TO_TYPE[section.__component];
	if (!type) {
		throw new Error(`Unknown CMS section component: ${section.__component}`);
	}

	if (type === "checklist") {
		return {
			type,
			heading: section.heading,
			items: (section.items || []).map((item) => item.text),
		};
	}

	if (type === "cardGrid") {
		return {
			type,
			heading: section.heading,
			items: (section.items || []).map(mapCardGridItemFromStrapi),
		};
	}

	// richText
	return {
		type,
		heading: section.heading,
		blocks: section.blocks,
		...(section.image ? { image: mapImage(section.image) } : {}),
	};
}

export function mapStrapiPage(entry) {
	return {
		slug: entry.slug,
		path: entry.path,
		source: entry.source,
		layout: entry.layout,
		sidebarMenu: entry.sidebarMenu,
		metadata: {
			title: entry.metadata?.title,
			description: entry.metadata?.description,
			canonical: entry.metadata?.canonical,
			ogImage: entry.metadata?.ogImage,
		},
		hero: {
			title: entry.hero?.title,
			...(entry.hero?.subtitle ? { subtitle: entry.hero.subtitle } : {}),
			...(entry.hero?.image ? { image: mapImage(entry.hero.image) } : {}),
			...(entry.hero?.meta ? { meta: entry.hero.meta } : {}),
		},
		sections: (entry.sections || []).map(mapSection),
	};
}
