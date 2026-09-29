// Presentation blocks for the catch-all content pages, built from the template's own
// vocabulary (sec-heading + eyebrow, numbered service cards, choose-box tiles, tinted
// panels with the pattern shapes, check lists). Each block renders only its inner markup;
// ServicePage decides whether it sits in the sidebar layout's main column
// (context "main") or in its own full-width section (context "full").
import {
	Blocks,
	CheckList,
	ContentImage,
	ItemText,
	Segments,
	segmentsText,
	splitLead,
} from "@/components/sections/dynamic/textBlocks";
import Cta from "@/components/sections/cta/Cta";
import DynamicForm from "@/components/sections/dynamic/DynamicForm";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_CTA, iconFor, pad } from "./presentation";
import SecHeading from "./SecHeading";

const delay = (i, step = 0.1, base = 0.1) => `${(base + (i % 3) * step).toFixed(1)}s`;

// Full-column feature image only for landscape images big enough not to upscale; smaller
// or squarer ones sit beside the heading instead.
function isWide(image) {
	if (!image?.width || !image?.height) return true;
	return image.width / image.height >= 1.3 && image.width >= 800;
}

function Lead({ blocks, className = "" }) {
	if (!blocks?.length) return null;
	return (
		<div className={`ci-lead-text ${className}`.trim()}>
			<Blocks blocks={blocks} />
		</div>
	);
}

/**
 * The level one below whatever BlockHeading renders in this context (§13 "headings in
 * order") - "main" context sits inside a page that already has its own h2 above this
 * block, so BlockHeading itself is h3 and card/tile titles are h4; "full" context is a
 * standalone section under the page's h1, so BlockHeading is h2 and titles are h3.
 */
function itemHeadingLevel(context, hasHeading = true) {
	const level = context === "main" ? 3 : 2;
	// A falsy `heading` means BlockHeading rendered nothing (§13 "headings in order") - the
	// slot one level down from it was never actually filled, so item titles take that slot
	// themselves instead of skipping past it.
	return `h${hasHeading ? level + 1 : level}`;
}

/** Heading row used above card grids: title on the left, lead copy on the right. */
function BlockHeading({ eyebrow, heading, lead, context, center }) {
	const as = context === "main" ? "h3" : "h2";
	if (!heading && !lead?.length && !eyebrow) return null;
	if (!heading) {
		return (
			<div className="ci-block-heading ci-lead-only row align-items-end">
				<div className={context === "full" ? "col-lg-9" : "col-12"}>
					{eyebrow ? (
						<div className="sec-heading ci-sec-heading mb-0">
							<span className="sub-title wow fadeInUp" data-wow-delay=".1s">
								<i className="tji-box" aria-hidden="true"></i>
								{eyebrow}
							</span>
						</div>
					) : null}
					<Lead blocks={lead} className="ci-lead-large wow fadeInUp" />
				</div>
				{context === "full" ? (
					<div className="col-lg-3 text-lg-end d-none d-lg-block">
						<div className="wow fadeInUp" data-wow-delay=".3s">
							<ButtonPrimary text={DEFAULT_CTA.button.text} url={DEFAULT_CTA.button.href} />
						</div>
					</div>
				) : null}
			</div>
		);
	}
	if (context === "full" && lead?.length && !center) {
		return (
			<div className="ci-block-heading row align-items-end">
				<div className="col-lg-6">
					<SecHeading eyebrow={eyebrow} title={heading} as={as} className="mb-0" />
				</div>
				<div className="col-lg-6">
					<Lead blocks={lead} className="wow fadeInUp" />
				</div>
			</div>
		);
	}
	return (
		<div className={`ci-block-heading ${center ? "text-center" : ""}`.trim()}>
			<SecHeading eyebrow={eyebrow} title={heading} as={as} className={center ? "sec-heading-centered ci-centered" : ""} />
			<Lead blocks={lead} className="wow fadeInUp" />
		</div>
	);
}

function CardIcon({ icon, title, index }) {
	if (icon && typeof icon === "object" && icon.localPath) {
		// The live icons are white line art, so they sit on a solid inner disc inside the
		// same tinted ring every other card icon uses.
		return (
			<div className="ci-card-icon is-image">
				<span className="ci-card-icon-disc">
					<Image src={icon.localPath} alt={icon.alt || ""} width={icon.width || 64} height={icon.height || 64} />
				</span>
			</div>
		);
	}
	return (
		<div className="ci-card-icon">
			<i className={iconFor(title, icon, index)} aria-hidden="true"></i>
		</div>
	);
}

// ---------------------------------------------------------------------------------------

export function IntroBlock({ block, context }) {
	const { eyebrow, title, lead, blocks, image, extraImages, companion } = block;
	const leadBlocks = lead ? [{ p: lead }] : [];

	if (context === "main") {
		const wide = isWide(image);
		const [opening, ...others] = blocks;
		const splitFirst = image && !wide && opening?.p;
		return (
			<div className="ci-intro">
				{image && wide ? (
					<div className="ci-media wow fadeInUp" data-wow-delay=".1s">
						<ContentImage image={image} priority sizes="(max-width: 991px) 100vw, 800px" />
					</div>
				) : null}
				{image && !wide ? (
					<div className="row align-items-center ci-intro-split">
						<div className="col-md-5">
							<div className="ci-media is-contain wow fadeInUp" data-wow-delay=".1s">
								<ContentImage image={image} priority sizes="(max-width: 767px) 100vw, 330px" />
							</div>
						</div>
						<div className="col-md-7">
							<SecHeading eyebrow={eyebrow} title={title} />
							<Lead blocks={leadBlocks} />
							{splitFirst ? (
								<div className="ci-prose">
									<Blocks blocks={[opening]} />
								</div>
							) : null}
						</div>
					</div>
				) : (
					<>
						<SecHeading eyebrow={eyebrow} title={title} />
						<Lead blocks={leadBlocks} />
					</>
				)}
				<div className="ci-prose">
					<Blocks blocks={splitFirst ? others : blocks} listColumns={2} />
				</div>
				{extraImages?.map((img, i) => (
					<div key={i} className="ci-media mt-30">
						<ContentImage image={img} />
					</div>
				))}
			</div>
		);
	}

	// Full-width (landing) intro. A short opening paragraph gets the large lead style.
	const firstP = blocks[0]?.p;
	const firstLen = firstP ? segmentsText(firstP).length : 0;
	const startsBold = Array.isArray(firstP) && typeof firstP[0] === "object" && firstP[0].bold;
	const leadFirst = firstP && firstLen >= 60 && firstLen <= 260 && !startsBold ? "ci-lead-first" : "";
	if (image) {
		const portrait = image.height > image.width;
		return (
			<div className={`row ci-intro ci-intro-full ${portrait ? "is-portrait" : "align-items-center"}`}>
				<div className={portrait ? "col-lg-5" : "col-lg-6"}>
					<div className={`ci-media ${portrait ? "is-portrait" : ""} wow fadeInLeft`.trim()} data-wow-delay=".2s">
						<ContentImage image={image} priority sizes="(max-width: 991px) 100vw, 50vw" />
					</div>
				</div>
				<div className={portrait ? "col-lg-7" : "col-lg-6"}>
					<div className="ci-intro-content">
						<SecHeading eyebrow={eyebrow} title={title} className={title ? "" : "is-eyebrow-only"} />
						<Lead blocks={leadBlocks} />
						<div className={`ci-prose ${leadFirst}`.trim()}>
							<Blocks blocks={blocks} listColumns={2} />
						</div>
						{companion ? (
							<div className="ci-intro-companion">
								{companion.heading ? <h3 className="ci-sub-heading">{companion.heading}</h3> : null}
								<CheckTiles items={companion.items} columns="col-sm-6" compact />
							</div>
						) : null}
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="row ci-intro ci-intro-full">
			<div className="col-lg-5">
				<SecHeading eyebrow={eyebrow} title={title} className="mb-lg-0" />
				{block.showButton ? (
					<div className="ci-intro-btn d-none d-lg-block wow fadeInUp" data-wow-delay=".3s">
						<ButtonPrimary text={DEFAULT_CTA.button.text} url={DEFAULT_CTA.button.href} />
					</div>
				) : null}
			</div>
			<div className="col-lg-7">
				<Lead blocks={leadBlocks} className="ci-lead-large" />
				<div className={`ci-prose ${leadFirst}`.trim()}>
					<Blocks blocks={blocks} listColumns={2} />
				</div>
			</div>
		</div>
	);
}

function CheckTiles({ items, columns, compact, titleAs = "h4" }) {
	const TitleTag = titleAs;
	return (
		<div className="row g-3 g-md-4 ci-tiles">
			{items.map((item, i) => (
				<div key={i} className={columns}>
					<div className={`ci-tile ${compact ? "is-row" : ""} wow fadeInUp`.trim()} data-wow-delay={delay(i)}>
						{compact ? null : (
							<span className="ci-tile-num" aria-hidden="true">
								{pad(i + 1)}
							</span>
						)}
						<div className="ci-tile-icon">
							<i className={iconFor(typeof item === "string" ? item : "", null, i)} aria-hidden="true"></i>
						</div>
						<TitleTag className="ci-tile-title">
							<ItemText item={item} />
						</TitleTag>
					</div>
				</div>
			))}
		</div>
	);
}

// Two reasons per row; a trailing odd one spans the row instead of leaving a hole.
function panelCol(count, i) {
	if (count <= 3) return "col-12";
	return count % 2 === 1 && i === count - 1 ? "col-12" : "col-md-6";
}

export function ChecksBlock({ block, context }) {
	const { style, heading, lead, items } = block;
	if (style === "tiles") {
		return (
			<div className="ci-checks is-tiles">
				<BlockHeading heading={heading} lead={lead} context={context} />
				<CheckTiles
					items={items}
					columns={context === "main" ? "col-sm-6 col-md-4" : "col-lg-4 col-sm-6"}
					titleAs={itemHeadingLevel(context, Boolean(heading))}
				/>
			</div>
		);
	}
	if (style === "grid") {
		return (
			<div className="ci-checks is-grid">
				<BlockHeading heading={heading} lead={lead} context={context} center={context === "full"} />
				<CheckList items={items} columns={context === "main" ? 2 : 3} className="is-boxed" />
			</div>
		);
	}
	// "panel": sentence-length reasons, two per row, inside a tinted panel. Short items with
	// no "Label:" lead read better as a compact boxed list than as cards.
	const plainShort = items.every((it) => typeof it === "string" && !splitLead(it).lead && it.length <= 70);
	return (
		<div className="ci-check-panel">
			<div className="ci-panel-shape" aria-hidden="true">
				<img src="/images/shape/pattern-2.svg" alt="" />
			</div>
			<SecHeading title={heading} as={context === "main" ? "h3" : "h2"} className={context === "full" ? "text-center sec-heading-centered ci-centered" : ""} />
			<Lead blocks={lead} />
			{plainShort ? (
				<CheckList items={items} columns={2} className="is-boxed" />
			) : (
				<div className="row g-3">
					{items.map((item, i) => (
						<div key={i} className={panelCol(items.length, i)}>
							<div className="ci-check-card wow fadeInUp" data-wow-delay={delay(i)}>
								<span className="ci-check-icon" aria-hidden="true">
									<i className="tji-check"></i>
								</span>
								<p className="ci-check-copy">
									<ItemText item={item} />
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

/**
 * Column classes for a numbered card grid. In the sidebar layout's main column cards sit
 * two per row (three when there are exactly three); a trailing odd card spans the row
 * with a horizontal layout instead of leaving a hole.
 * @returns {{ col: string, wide: boolean }}
 */
function gridCol(count, i, context, kind) {
	if (context === "main") {
		if (count === 3) return { col: "col-md-4", wide: false };
		if (count % 2 === 1 && i === count - 1) return { col: "col-12", wide: true };
		return { col: "col-md-6", wide: false };
	}
	if (kind === "groups" && (count === 4 || count === 2)) return { col: "col-lg-6", wide: false };
	if (count === 4 && kind !== "groups") return { col: "col-xl-3 col-md-6", wide: false };
	if (count === 2) return { col: "col-md-6", wide: false };
	if (count % 3 === 1 && i === count - 1) return { col: "col-12", wide: true };
	return { col: "col-lg-4 col-md-6", wide: false };
}

export function GroupsBlock({ block, context }) {
	const { heading, lead, groups, eyebrow } = block;
	const long = groups.some((g) => g.items.length > 8);
	// Heading + short prose groups (e.g. contact details) are info cards: four across, unnumbered.
	const info = groups.every((g) => !g.items.length);
	const GroupTitleTag = itemHeadingLevel(context, Boolean(heading));
	return (
		<div className={`ci-groups ${long ? "is-long" : ""} ${info ? "is-info" : ""}`.trim()}>
			<BlockHeading eyebrow={eyebrow} heading={heading} lead={lead} context={context} center={context === "full" && !lead?.length} />
			<div className="row g-4">
				{groups.map((group, i) => {
					const grid = info && context === "full" && groups.length === 4 ? { col: "col-xl-3 col-md-6", wide: false } : gridCol(groups.length, i, context, "groups");
					const { col, wide } = grid;
					return (
						<div key={i} className={col}>
							<div className={`ci-service-card ci-group-card ${wide ? "is-wide" : ""} wow fadeInUp`} data-wow-delay={delay(i)}>
								{info ? null : (
									<span className="ci-card-num" aria-hidden="true">
										{pad(i + 1)}.
									</span>
								)}
								<CardIcon icon={group.icon} title={group.title} index={i} />
								<div className="ci-card-body">
									<GroupTitleTag className="title">{group.title}</GroupTitleTag>
									{group.text ? (
										<p className="desc">
											<Segments segments={group.text} />
										</p>
									) : null}
									{group.blocks?.length ? (
										<div className="ci-prose ci-card-prose">
											<Blocks blocks={group.blocks} />
										</div>
									) : null}
									<CheckList items={group.items} columns={(long && context === "full") || wide ? 2 : 1} className="is-compact" />
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function iconCols(count, context) {
	if (context === "main") return "col-sm-6 col-md-4";
	return count >= 8 ? "col-xl-3 col-lg-4 col-sm-6" : "col-lg-4 col-sm-6";
}

function CardTitle({ item, as = "h4" }) {
	const Tag = as;
	return <Tag className="title">{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</Tag>;
}

/** One card of a CardsBlock grid, in the block's style ("service" | "image" | "icon"). */
function CardItem({ item, index, style, wide, titleAs }) {
	if (style === "image") {
		return (
			<div className="ci-image-card wow fadeInUp" data-wow-delay={delay(index)}>
				<div className="ci-image-card-thumb">
					<ContentImage image={item.image} sizes="(max-width: 767px) 100vw, 400px" />
				</div>
				<div className="ci-image-card-body">
					<CardTitle item={item} as={titleAs} />
					{item.text ? (
						<p className="desc">
							<Segments segments={item.text} />
						</p>
					) : null}
				</div>
			</div>
		);
	}
	if (style === "icon") {
		const TitleTag = titleAs;
		return (
			<div className="ci-tile is-icon wow fadeInUp" data-wow-delay={delay(index)}>
				<div className="ci-tile-icon">
					<i className={iconFor(item.title, item.icon, index)} aria-hidden="true"></i>
				</div>
				<TitleTag className="ci-tile-title">{item.title}</TitleTag>
			</div>
		);
	}
	return (
		<div className={`ci-service-card ${wide ? "is-wide" : ""} wow fadeInUp`} data-wow-delay={delay(index)}>
			<span className="ci-card-num" aria-hidden="true">
				{pad(index + 1)}.
			</span>
			<CardIcon icon={item.icon} title={item.title} index={index} />
			<div className="ci-card-body">
				<CardTitle item={item} as={titleAs} />
				{item.text ? (
					<p className="desc">
						<Segments segments={item.text} />
					</p>
				) : null}
				{item.list ? <CheckList items={item.list} className="is-compact" /> : null}
				{item.href ? (
					<Link className="text-btn" href={item.href}>
						<span className="btn-text">
							<span>Details</span>
						</span>
						<span className="btn-icon">
							<i className="tji-arrow-right-long"></i>
						</span>
					</Link>
				) : null}
			</div>
		</div>
	);
}

export function CardsBlock({ block, context }) {
	const { heading, lead, items, style, eyebrow, image } = block;
	const splitIntro = image && context === "full";
	// splitIntro forces BlockHeading into "main"-style (h3) regardless of the block's own
	// context, so card titles must follow suit here rather than the outer context.
	const titleAs = itemHeadingLevel(splitIntro ? "main" : context, Boolean(heading));
	return (
		<div className={`ci-cards is-${style}`}>
			{splitIntro ? (
				<div className="row align-items-center ci-cards-intro">
					<div className="col-lg-6">
						<div className="ci-media wow fadeInLeft" data-wow-delay=".2s">
							<ContentImage image={image} sizes="(max-width: 991px) 100vw, 50vw" />
						</div>
					</div>
					<div className="col-lg-6">
						<div className="ci-intro-content">
							<BlockHeading eyebrow={eyebrow} heading={heading} lead={lead} context="main" />
						</div>
					</div>
				</div>
			) : (
				<>
					<BlockHeading eyebrow={eyebrow} heading={heading} lead={lead} context={context} />
					{image ? (
						<div className="ci-media mb-30">
							<ContentImage image={image} />
						</div>
					) : null}
				</>
			)}
			<div className="row g-4">
				{items.map((item, i) => {
					const grid = style === "icon" ? { col: iconCols(items.length, context), wide: false } : gridCol(items.length, i, context, "cards");
					// Only the service card has a horizontal "wide" variant; other styles keep
					// their normal width for a trailing odd card.
					const wide = grid.wide && style === "service";
					const col = grid.wide && !wide ? "col-md-6" : grid.col;
					return (
						<div key={i} className={col}>
							<CardItem item={item} index={i} style={style} wide={wide} titleAs={titleAs} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

export function StepsBlock({ block, context }) {
	const { heading, lead, items } = block;
	return (
		<div className="ci-steps">
			<BlockHeading heading={heading} lead={lead} context={context} />
			<div className="row g-4">
				{items.map((item, i) => (
					<div key={i} className={context === "main" ? "col-md-6" : "col-lg-3 col-md-6"}>
						<div className="ci-step wow fadeInUp" data-wow-delay={delay(i)}>
							<span className="ci-step-num" aria-hidden="true">
								{pad(i + 1)}
							</span>
							<p className="ci-step-text">
								<Segments segments={item} />
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function TextBlock({ block, context }) {
	const { heading, blocks, image, companion } = block;
	if (companion && context === "full") {
		// Heading on the left, copy on the right (the template's heading-wrap rhythm), then
		// the companion icon grid as a full-width tinted panel underneath.
		return (
			<div className="ci-text-split">
				<div className="row ci-text-split-row">
					<div className="col-lg-5">
						<div className="ci-text-split-intro">
							<SecHeading title={heading} className="mb-0" />
						</div>
					</div>
					<div className="col-lg-7">
						<div className="ci-prose ci-text-split-copy">
							<Blocks blocks={blocks} />
						</div>
					</div>
				</div>
				<div className="ci-companion-panel">
					<div className="ci-panel-shape" aria-hidden="true">
						<img src="/images/shape/pattern-2.svg" alt="" />
					</div>
					{companion.heading ? <h3 className="ci-sub-heading">{companion.heading}</h3> : null}
					<div className="row g-3">
						{companion.items.map((item, i) => (
							<div key={i} className="col-xl-3 col-lg-4 col-sm-6">
								<div className="ci-tile is-icon is-row wow fadeInUp" data-wow-delay={delay(i)}>
									<div className="ci-tile-icon">
										<i className={iconFor(item.title, item.icon, i)} aria-hidden="true"></i>
									</div>
									<h4 className="ci-tile-title">{item.title}</h4>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="ci-text">
			{image ? (
				<div className="ci-media mb-30 wow fadeInUp">
					<ContentImage image={image} />
				</div>
			) : null}
			<SecHeading title={heading} />
			<div className="ci-prose">
				<Blocks blocks={blocks} listColumns={2} />
			</div>
			{companion ? <CardsBlock block={companion} context={context} /> : null}
		</div>
	);
}

export function BannerBlock({ block }) {
	const { heading, blocks, image } = block;
	return (
		<div className="ci-banner wow fadeInUp" data-wow-delay=".1s">
			<div className="ci-banner-img">
				<ContentImage image={image} sizes="(max-width: 1320px) 100vw, 1320px" />
			</div>
			<div className="ci-banner-content">
				<h2 className="title title-anim">{heading}</h2>
				<div className="ci-banner-text">
					<Blocks blocks={blocks} />
				</div>
			</div>
		</div>
	);
}

export function ArticleBlock({ block }) {
	return (
		<article className="ci-article">
			<Blocks blocks={block.blocks} />
		</article>
	);
}

export function PostsBlock({ block, context, headingAs }) {
	const { heading, items } = block;
	// A single related post spans the row as a horizontal card instead of leaving half of it empty.
	const lone = items.length === 1;
	const col = lone ? "col-12" : context === "main" ? "col-md-6" : "col-lg-4 col-md-6";
	// headingAs overrides the context-derived default for callers (PostDetails.js) that use
	// "main"-style columns without a page h2 elsewhere to nest under - context alone isn't
	// enough there to know what level this heading should actually be at.
	const sectionAs = headingAs || (context === "main" ? "h3" : "h2");
	const PostTitleTag = `h${Number(sectionAs[1]) + 1}`;
	return (
		<div className="ci-posts">
			{heading ? <SecHeading title={heading} as={sectionAs} /> : null}
			<div className="row g-4">
				{items.map((item, i) => (
					<div key={i} className={col}>
						<div className={`ci-blog-card ${lone ? "is-horizontal" : ""} wow fadeInUp`} data-wow-delay={delay(i)}>
							{item.image ? (
								<Link href={item.href} className="ci-blog-thumb" aria-label={item.title}>
									<ContentImage image={item.image} sizes="(max-width: 767px) 100vw, 420px" />
								</Link>
							) : null}
							<div className="ci-blog-body">
								{item.date ? (
									<span className="ci-blog-date">
										<i className="fa-light fa-calendar" aria-hidden="true"></i>
										{item.date}
									</span>
								) : null}
								<PostTitleTag className="title">
									<Link href={item.href}>{item.title}</Link>
								</PostTitleTag>
								<Link className="text-btn" href={item.href}>
									<span className="btn-text">
										<span>Read More</span>
									</span>
									<span className="btn-icon">
										<i className="tji-arrow-right-long"></i>
									</span>
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// A "cta" section in the middle of a page: the CTA band without the footer overlap.
function InlineCtaBlock({ block }) {
	return <Cta title={block.heading} button={block.button || null} inline />;
}

// A "form" section (e.g. a contact form) as the template's white form card.
function FormBlock({ block }) {
	return <DynamicForm id={block.id} fields={block.fields} consent={block.consent} submitText={block.submitText} embedded />;
}

const RENDERERS = {
	intro: IntroBlock,
	checks: ChecksBlock,
	groups: GroupsBlock,
	cards: CardsBlock,
	steps: StepsBlock,
	text: TextBlock,
	banner: BannerBlock,
	article: ArticleBlock,
	posts: PostsBlock,
	"cta-inline": InlineCtaBlock,
	form: FormBlock,
};

/** Renders one presentation block from buildPageModel(); unknown kinds render nothing. */
export function RenderBlock({ block, context }) {
	const Component = RENDERERS[block.kind];
	return Component ? <Component block={block} context={context} /> : null;
}
