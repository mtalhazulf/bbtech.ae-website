// Pure presentation helpers for the catch-all content pages (src/app/[...slug]/page.js).
//
// `buildPageModel(page)` turns a src/data/pages/*.json file into an ordered list of
// presentation blocks (intro, checks, groups, cards, steps, text, banner, article, posts)
// plus the closing CTA. It only regroups and re-orders the imported copy — every string
// is passed through untouched so the verbatim-content checks keep passing.
//
// Page-level presentation hints live in the JSON as presentation-only keys:
//   "layout": "sidebar" | "landing" | "post"   (default: "landing")
//   "sidebarMenu": "services" | "site"         (which live sidebar menu the page showed)
import { segmentsLead, segmentsText, splitSegmentLines } from "@/components/sections/dynamic/textBlocks";

/** The live site's own CTA copy (sidebar widget title on bbtech.ae service pages). */
export const DEFAULT_CTA = {
	title: "Have a project for us? Get in touch!",
	button: { text: "Let's Talk", href: "/contact/" },
};

const wordCount = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;

/**
 * Splits a heading into [prefix, highlight] so the last key phrase can be wrapped in the
 * template's highlight <span>. The prefix keeps its trailing space, so the rendered text
 * is byte-identical to the input.
 */
export function splitHighlight(title) {
	if (!title) return ["", ""];
	const text = String(title);
	const comma = text.lastIndexOf(", ");
	if (comma > 0) {
		const tail = text.slice(comma + 2);
		if (wordCount(tail) <= 4) return [text.slice(0, comma + 2), tail];
	}
	const words = text.split(" ");
	if (words.length < 2) return ["", text];
	let take = 1;
	if ((words[words.length - 1].length <= 3 && words.length >= 3) || words.length >= 8) take = 2;
	const cut = words.length - take;
	return [`${words.slice(0, cut).join(" ")} `, words.slice(cut).join(" ")];
}

/** Uses the page title as an eyebrow only when it reads like one (1-4 words). */
export function eyebrowFrom(text) {
	if (!text) return null;
	return wordCount(text) <= 4 && text.length <= 36 ? text : null;
}

// Icons: the live site's WordPress icon names mapped onto the icon fonts shipped here,
// then a keyword map for cards that had no icon at all. Purely decorative.
const LIVE_ICONS = {
	"fa-language": "fa-light fa-language",
	"fa-clipboard-list": "fa-light fa-clipboard-list",
	"fa-sms": "fa-light fa-comment-sms",
	"fa-puzzle-piece": "fa-light fa-puzzle-piece",
	"fa-book-open": "fa-light fa-book-open",
	"fa-users": "fa-light fa-users",
	"dt-icon-the7-misc-006-1": "fa-light fa-sitemap",
	trophy: "fa-light fa-trophy",
	group: "fa-light fa-users",
	clipboard: "fa-light fa-clipboard",
	cogs: "fa-light fa-gears",
	"Defaults-trophy": "fa-light fa-trophy",
	"Defaults-group": "fa-light fa-users",
	"Defaults-clipboard": "fa-light fa-clipboard",
	"Defaults-cogs": "fa-light fa-gears",
};

const KEYWORD_ICONS = [
	[/phone/, "fa-phone"],
	[/e-?mail/, "fa-envelope"],
	[/address|location|office/, "fa-location-dot"],
	[/hours/, "fa-clock"],
	[/migration/, "fa-cloud-arrow-up"],
	[/backup|disaster|recovery/, "fa-arrows-rotate"],
	[/saas|paas|iaas/, "fa-layer-group"],
	[/hybrid|multi-cloud/, "fa-diagram-project"],
	[/cyber|security|secure|risk/, "fa-shield-check"],
	[/cloud networking/, "fa-network-wired"],
	[/cloud/, "fa-cloud"],
	[/compliance|assessment|regulat/, "fa-clipboard-check"],
	[/policy|procedure/, "fa-file-contract"],
	[/inspection/, "fa-magnifying-glass"],
	[/telemedicine/, "fa-laptop-medical"],
	[/hospital/, "fa-hospital"],
	[/patient/, "fa-heart-pulse"],
	[/healthcare software/, "fa-stethoscope"],
	[/analytic|insight|data-driven|real-time|report|perspective/, "fa-chart-mixed"],
	[/interoperab|integration/, "fa-puzzle-piece"],
	[/voip|communication/, "fa-phone-volume"],
	[/wi-?fi|connectivity/, "fa-wifi"],
	[/monitoring|helpdesk|support/, "fa-headset"],
	[/network/, "fa-network-wired"],
	[/managed it/, "fa-server"],
	[/consult/, "fa-handshake"],
	[/training/, "fa-chalkboard-user"],
	[/implementation/, "fa-rocket"],
	[/rebrand|refresh|overhaul/, "fa-arrows-rotate"],
	[/logo|brand/, "fa-palette"],
	[/customi[sz]|\bcustom\b|work ?flow|tailored/, "fa-sliders"],
	[/seo/, "fa-magnifying-glass-chart"],
	[/pay per click/, "fa-arrow-pointer"],
	[/social media/, "fa-hashtag"],
	[/marketing|campaign|collateral/, "fa-bullhorn"],
	[/ui\/ux|interface/, "fa-object-group"],
	[/photo/, "fa-camera"],
	[/video/, "fa-video"],
	[/website|web /, "fa-laptop-code"],
	[/mobile|app/, "fa-mobile-screen-button"],
	[/development/, "fa-code"],
	[/overhead|cost|saving/, "fa-coins"],
	[/source of information/, "fa-database"],
	[/users|employee|team/, "fa-users"],
	[/loyalty/, "fa-heart"],
	[/experience|engage/, "fa-face-smile"],
	[/scal/, "fa-arrow-up-right-dots"],
	[/module/, "fa-cubes"],
];

const FALLBACK_ICONS = ["tji-service-1", "tji-service-2", "tji-service-3", "tji-service-4", "tji-service-5", "tji-service-6"];

/** Returns an icon class for a card: its live icon when it had one, else a keyword match. */
export function iconFor(title, liveIcon, index = 0) {
	if (typeof liveIcon === "string" && LIVE_ICONS[liveIcon]) return LIVE_ICONS[liveIcon];
	const text = (title || "").toLowerCase();
	for (const [pattern, icon] of KEYWORD_ICONS) {
		if (pattern.test(text)) return `fa-light ${icon}`;
	}
	return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

export const pad = (n) => String(n).padStart(2, "0");

// ---------------------------------------------------------------------------------------
// Section classification
// ---------------------------------------------------------------------------------------

const onlyKinds = (blocks, kinds) => (blocks || []).every((b) => kinds.some((k) => b[k] !== undefined));
const countKind = (blocks, kind) => (blocks || []).filter((b) => b[kind] !== undefined).length;

const proseLength = (blocks) => blocks.reduce((n, b) => n + segmentsText(b.p).length, 0);

const isAllBold = (p) => Array.isArray(p) && p.length === 1 && typeof p[0] === "object" && p[0].bold && !p[0].href;

/**
 * Paragraphs whose copy carries line breaks ("…studies.\nISMS is available…") become one
 * paragraph block per line, so they no longer collapse into a single wall of text. The
 * characters are unchanged (each line keeps its "\n"). A long all-bold run split this way
 * keeps its emphasis on the opening paragraph only (`plain` on the rest).
 */
function splitParagraphBlocks(blocks) {
	if (!blocks?.length) return blocks;
	const out = [];
	for (const block of blocks) {
		if (!block.p) {
			out.push(block);
			continue;
		}
		const lines = splitSegmentLines(block.p);
		if (lines.length < 2) {
			out.push(block);
			continue;
		}
		const bold = isAllBold(Array.isArray(block.p) ? block.p : [block.p]);
		lines.forEach((line, i) => out.push(bold && i > 0 ? { p: line, plain: true } : { p: line }));
	}
	return out;
}

/** Copies of the page's sections with their paragraphs split at line breaks (see above). */
const withSplitParagraphs = (sections) =>
	sections.map((s) => (s.type === "richText" && s.blocks?.length ? { ...s, blocks: splitParagraphBlocks(s.blocks) } : s));

const asSegments = (p) => (Array.isArray(p) ? p : [p]);

/**
 * A run of "Label: text" paragraphs (each opening with a bold label), optionally after one
 * or two plain lead paragraphs, e.g. ADHICS "Why Choose Us?". Presented as check cards.
 * @returns {{ lead: Array, items: Array }|null}
 */
function labelledParagraphs(blocks) {
	if (!blocks?.length || !onlyKinds(blocks, ["p"])) return null;
	const first = blocks.findIndex((b) => segmentsLead(asSegments(b.p)).lead);
	if (first < 0 || first > 2) return null;
	const items = blocks.slice(first);
	if (items.length < 3 || !items.every((b) => segmentsLead(asSegments(b.p)).lead)) return null;
	return { lead: blocks.slice(0, first), items: items.map((b) => asSegments(b.p)) };
}

/**
 * Heading groups inside one rich-text section, presented as one card per group:
 * heading + list pairs ("Our Services" -> h3 "Branding" + ul ...) or heading + a short
 * paragraph or two ("Phone number" -> p ...). Any paragraphs before the first heading are
 * the lead. Returns null when the section is really long-form prose (an article).
 */
export function headingListGroups(blocks) {
	const lead = [];
	const groups = [];
	let current = null;
	for (const block of blocks || []) {
		if (block.h) {
			current = { title: block.text, items: [], blocks: [] };
			groups.push(current);
		} else if (current && block.ul) {
			current.items.push(...block.ul);
		} else if (current) {
			current.blocks.push(block);
		} else {
			lead.push(block);
		}
	}
	const cardLike = (g) =>
		g.items.length ? !g.blocks.length : g.blocks.length > 0 && g.blocks.every((b) => b.p) && proseLength(g.blocks) <= 400;
	const valid = groups.length >= 2 && groups.length <= 9 && groups.every(cardLike);
	return valid ? { lead, groups } : null;
}

const isArticle = (s) => s.type === "richText" && countKind(s.blocks, "h") >= 3 && !headingListGroups(s.blocks);

const isClosing = (s, i, sections) =>
	i === sections.length - 1 &&
	i > 0 &&
	s.type === "richText" &&
	!!s.heading &&
	(s.blocks || []).length <= 3 &&
	onlyKinds(s.blocks, ["p"]);

const isPlainProse = (s) => s.type === "richText" && onlyKinds(s.blocks, ["p", "image"]);

/** The bold "Contact us today"/"Contact us now" run inside a closing section, if any. */
function closingButtonText(blocks) {
	for (const block of blocks || []) {
		for (const seg of Array.isArray(block.p) ? block.p : []) {
			if (seg && typeof seg === "object" && seg.bold && /^contact us/i.test(seg.text)) return seg.text;
		}
	}
	return null;
}

function checksStyle(items) {
	const lengths = items.map((it) => segmentsText(it).length);
	if (items.length > 10) return "grid";
	if (items.length <= 8 && Math.max(...lengths) <= 40) return "tiles";
	return "panel";
}

function cardsFromGrid(section) {
	const items = section.items || [];
	if (items.some((it) => it.href && it.date)) return { kind: "posts", heading: section.heading, items };
	if (items.some((it) => it.list)) {
		return {
			kind: "groups",
			heading: section.heading,
			lead: section.text ? [{ p: section.text }] : [],
			groups: items.map((it) => ({ title: it.title, items: it.list || [], text: it.text, icon: it.icon })),
		};
	}
	let style = "service";
	if (items.some((it) => it.image)) style = "image";
	else if (items.every((it) => !it.text)) style = "icon";
	return {
		kind: "cards",
		style,
		heading: section.heading,
		lead: section.text ? [{ p: section.text }] : [],
		image: section.image || null,
		items,
	};
}

/** Maps one content section onto a presentation block (see ServiceBlocks RENDERERS). */
export function classify(section) {
	const { type, heading, blocks } = section;
	if (type === "checklist") {
		return { kind: "checks", style: checksStyle(section.items), heading, lead: [], items: section.items };
	}
	if (type === "cardGrid") return cardsFromGrid(section);
	if (type === "cta") return { kind: "cta-inline", heading, button: section.button };
	if (type === "form") return { kind: "form", ...section };
	// richText
	const groups = headingListGroups(blocks);
	if (groups) return { kind: "groups", heading, lead: groups.lead, groups: groups.groups };
	if (countKind(blocks, "ol")) {
		const ol = blocks.find((b) => b.ol).ol;
		return { kind: "steps", heading, lead: blocks.filter((b) => !b.ol), items: ol };
	}
	if (blocks?.length && onlyKinds(blocks, ["ul"])) {
		const items = blocks.flatMap((b) => b.ul);
		return { kind: "checks", style: checksStyle(items), heading, lead: [], items };
	}
	if (heading && countKind(blocks, "ul") === 1 && onlyKinds(blocks, ["ul", "p"]) && countKind(blocks, "p") <= 1) {
		const items = blocks.find((b) => b.ul).ul;
		return { kind: "checks", style: "panel", heading, lead: blocks.filter((b) => b.p), items };
	}
	const labelled = heading && !section.image ? labelledParagraphs(blocks) : null;
	if (labelled) return { kind: "checks", style: "panel", heading, lead: labelled.lead, items: labelled.items };
	return { kind: "text", heading, blocks, image: section.image || null };
}

// ---------------------------------------------------------------------------------------
// Page model
// ---------------------------------------------------------------------------------------

/**
 * @typedef {Object} PageModel
 * @property {"sidebar"|"landing"|"post"} layout
 * @property {"services"|"site"|null} sidebarMenu
 * @property {Array<Object>} blocks  ordered presentation blocks (see classify())
 * @property {{title: string, blocks?: Array, image?: Object, button: {text: string, href: string}}} cta
 * @property {boolean} ownCta  whether `cta` is the page's own closing section
 */

/** @returns {PageModel} */
export function buildPageModel(page) {
	const layout = page.layout || "landing";
	const sections = withSplitParagraphs(page.sections || []);
	const hero = page.hero || {};
	const blocks = [];
	let cta = DEFAULT_CTA;
	let i = 0;

	// Intro: hero subtitle/image + the first prose section (+ any heading-less prose that
	// directly follows it, e.g. an image-only block).
	const subtitle = hero.subtitle || null;
	const longSubtitle = subtitle && subtitle.length > 90;
	const intro = { kind: "intro", eyebrow: null, title: null, lead: null, blocks: [], image: hero.image || null, extraImages: [] };
	if (longSubtitle) intro.lead = subtitle;
	const first = sections[0];
	if (first && isPlainProse(first) && !isClosing(first, 0, sections) && !isArticle(first)) {
		intro.title = first.heading || (!longSubtitle ? subtitle : null);
		if (first.heading && subtitle && !longSubtitle) intro.eyebrow = subtitle;
		intro.blocks = [...(first.blocks || [])];
		if (first.image) {
			if (intro.image) intro.extraImages.push(first.image);
			else intro.image = first.image;
		}
		i = 1;
		while (sections[i] && isPlainProse(sections[i]) && !sections[i].heading && !isClosing(sections[i], i, sections)) {
			const next = sections[i];
			if (next.image) {
				if (intro.image) intro.extraImages.push(next.image);
				else intro.image = next.image;
			}
			intro.blocks.push(...(next.blocks || []));
			i++;
		}
	} else if (first && first.type === "richText" && first.heading && !isArticle(first) && !isClosing(first, 0, sections)) {
		// e.g. "Web Applications and Web Development": prose + a short question list.
		intro.title = first.heading;
		if (subtitle && !longSubtitle) intro.eyebrow = subtitle;
		intro.blocks = [...(first.blocks || [])];
		if (first.image) intro.image = intro.image || first.image;
		i = 1;
		while (sections[i] && isPlainProse(sections[i]) && !sections[i].heading && !isClosing(sections[i], i, sections)) {
			const next = sections[i];
			if (next.image) {
				if (intro.image) intro.extraImages.push(next.image);
				else intro.image = next.image;
			}
			intro.blocks.push(...(next.blocks || []));
			i++;
		}
	} else if (subtitle && !longSubtitle) {
		intro.title = subtitle;
	}
	// An untitled intro takes the page's own title as its section title, since the template
	// never leaves copy under a bare eyebrow ("WHY CONSTRUCTION MANAGEMENT SYSTEM", "Odoo
	// Development Services We Offer").
	const untitledIntro = !intro.title;
	if (untitledIntro && hero.title && (intro.blocks.length || intro.lead)) intro.title = hero.title;
	if (!intro.eyebrow) {
		const eyebrow = eyebrowFrom(hero.title);
		if (eyebrow && eyebrow !== intro.title) intro.eyebrow = eyebrow;
	}

	const rest = [];
	for (; i < sections.length; i++) {
		const s = sections[i];
		if (isClosing(s, i, sections)) {
			if (layout === "landing" && s.image) {
				rest.push({ kind: "banner", heading: s.heading, blocks: s.blocks, image: s.image });
			} else {
				cta = {
					title: s.heading,
					blocks: s.blocks,
					image: s.image || null,
					button: { text: closingButtonText(s.blocks) || DEFAULT_CTA.button.text, href: "/contact/" },
				};
			}
			continue;
		}
		if (isArticle(s)) {
			rest.push({ kind: "article", blocks: s.blocks });
			continue;
		}
		rest.push(classify(s));
	}

	// A short heading+prose block directly followed by a heading-less list/card block
	// becomes that block's heading and lead ("Benefits of Using ERP" + its checklist).
	for (let k = 0; k < rest.length - 1; k++) {
		const a = rest[k];
		const b = rest[k + 1];
		if (a.kind === "text" && a.heading && !a.image && onlyKinds(a.blocks, ["p"]) && (a.blocks || []).length <= 2 && ["checks", "cards", "groups"].includes(b.kind) && !b.heading) {
			b.heading = a.heading;
			b.lead = [...(a.blocks || []), ...(b.lead || [])];
			rest.splice(k, 1);
			k--;
		}
	}

	if (layout === "landing") {
		// Side-by-side pairs on full-width pages: a short prose block next to an icon grid
		// ("Why ISMS?" + "ISMS CAN DO"), and an untitled image intro next to a short
		// checklist ("WHY CONSTRUCTION MANAGEMENT SYSTEM" + its top reasons).
		for (let k = 0; k < rest.length - 1; k++) {
			const a = rest[k];
			const b = rest[k + 1];
			if (a.kind === "text" && a.heading && !a.image && onlyKinds(a.blocks, ["p"]) && b.kind === "cards" && b.style === "icon") {
				a.companion = b;
				rest.splice(k + 1, 1);
			}
		}
		if (intro.image && untitledIntro && rest[0]?.kind === "checks" && rest[0].style === "tiles") {
			intro.companion = rest.shift();
		}
	}

	// Full-width intros without an image get the header's "Let's Talk" button beside the title.
	if (layout === "landing") intro.showButton = true;

	const hasIntro = intro.title || intro.blocks.length || intro.image || intro.lead;
	if (hasIntro) {
		// A lone lead paragraph (no title/copy/image) reads best as the lead of the card
		// block that follows it (e.g. Odoo's "services we offer" grid).
		const loneLead = intro.lead && !intro.title && !intro.blocks.length && !intro.image;
		if (loneLead && rest[0] && ["cards", "groups"].includes(rest[0].kind) && !rest[0].heading) {
			rest[0].lead = [{ p: intro.lead }, ...(rest[0].lead || [])];
			rest[0].eyebrow = intro.eyebrow;
		} else {
			blocks.push(intro);
		}
	}
	blocks.push(...rest);

	return {
		layout,
		sidebarMenu: page.sidebarMenu || (layout === "sidebar" ? "services" : null),
		blocks,
		cta,
		// true when the CTA band carries the page's own closing section rather than the
		// default "Have a project for us? Get in touch!" copy.
		ownCta: cta !== DEFAULT_CTA,
	};
}
