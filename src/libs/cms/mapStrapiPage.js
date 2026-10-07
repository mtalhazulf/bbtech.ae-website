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
	return {
		title: item.title,
		...(item.text ? { text: item.text } : {}),
		...(typeof item.icon === "string"
			? { icon: item.icon }
			: item.iconImage ? { icon: mapImage(item.iconImage) } : {}),
		...(item.href ? { href: item.href } : {}),
		...(item.date ? { date: item.date } : {}),
		...(item.image ? { image: mapImage(item.image) } : {}),
		...(item.list && item.list.length > 0 ? { list: item.list.map((li) => li.text) } : {}),
	};
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
