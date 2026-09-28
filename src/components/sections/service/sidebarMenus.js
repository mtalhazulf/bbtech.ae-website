// The two sidebar menus bbtech.ae's service pages showed in their aside#sidebar widget
// (see content-import/snapshot/<slug>/page.html). Labels and targets are copied from the
// live widgets, with the https://bbtech.ae origin stripped so links stay on this site.

/** "Our services" widget (most service pages). */
export const servicesMenu = {
	title: "Our services",
	items: [
		{ label: "Web Development", href: "/services/web-development/" },
		{ label: "Graphic Design", href: "/services/graphic-design/" },
		{ label: "Mobile App Development", href: "/services/mobile-app-development/" },
		{ label: "Branding & Rebranding", href: "/branding-rebranding/" },
		{ label: "Social Media Marketing", href: "/services/social-media-marketing/" },
		{ label: "Social Wifi", href: "/social-wifi/" },
	],
};

/** Untitled site-menu widget (it-outsourcing, privacy-policy, school-system-isms, services/erp). */
export const siteMenu = {
	title: null,
	items: [
		{ label: "Home", href: "/" },
		{ label: "About us", href: "/about-us/" },
		{
			label: "ERP",
			href: "/erp/",
			children: [{ label: "ISMS – School System", href: "/school-system-isms/" }],
		},
		{
			label: "Services",
			href: "/services/",
			children: [
				{ label: "Web Development", href: "/services/web-development/" },
				{ label: "Graphic Design", href: "/services/graphic-design/" },
				{ label: "Mobile App Development", href: "/services/mobile-app-development/" },
				{ label: "Social Media Marketing", href: "/services/social-media-marketing/" },
				{ label: "Social Wifi", href: "/social-wifi/" },
			],
		},
		{ label: "Contact", href: "/contact/" },
	],
};

export const sidebarMenus = { services: servicesMenu, site: siteMenu };
