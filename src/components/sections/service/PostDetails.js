import { Blocks, ContentImage, Segments } from "@/components/sections/dynamic/textBlocks";
import { PostsBlock } from "./ServiceBlocks";

const META_ICONS = [
	[/^category/i, "fa-light fa-folder-open"],
	[/^by /i, "fa-light fa-user"],
];

function metaIcon(text) {
	for (const [pattern, icon] of META_ICONS) if (pattern.test(text)) return icon;
	return "fa-light fa-calendar";
}

const firstText = (p) => (Array.isArray(p) ? p : [p]).map((s) => (typeof s === "string" ? s : s.text)).join("");

// A post's byline block ("Category: …", "By …", "<date>") as imported from the live page.
function isMetaSection(section) {
	return (
		section.type === "richText" &&
		(section.blocks || []).length &&
		section.blocks.every((b) => b.p) &&
		section.blocks.some((b) => /^category:/i.test(firstText(b.p)))
	);
}

/**
 * Blog-details layout for the two live news posts: rounded feature image, meta row
 * (category / author / date from the post's own JSON), the post copy, then its related
 * posts as blog cards.
 */
const PostDetails = ({ page }) => {
	const { hero = {}, sections = [] } = page;
	const metaSection = sections.find(isMetaSection);
	const related = sections.filter((s) => s.type === "cardGrid");
	const content = sections.filter((s) => s !== metaSection && !related.includes(s));

	let meta = null;
	if (metaSection) {
		meta = metaSection.blocks.map((b, i) => (
			<li key={i}>
				<i className={metaIcon(firstText(b.p))} aria-hidden="true"></i>
				<span>
					<Segments segments={b.p} />
				</span>
			</li>
		));
	} else if (hero.meta) {
		meta = [
			hero.meta.category ? (
				<li key="c">
					<i className="fa-light fa-folder-open" aria-hidden="true"></i>
					<span>Category: {hero.meta.category}</span>
				</li>
			) : null,
			hero.meta.author ? (
				<li key="a">
					<i className="fa-light fa-user" aria-hidden="true"></i>
					<span>By {hero.meta.author}</span>
				</li>
			) : null,
			hero.meta.date ? (
				<li key="d">
					<i className="fa-light fa-calendar" aria-hidden="true"></i>
					<span>{hero.meta.date}</span>
				</li>
			) : null,
		];
	}

	return (
		<section className="ci-post-section section-gap">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-xl-9 col-lg-10">
						<article className="ci-post-details">
							{hero.image ? (
								<div className="ci-post-image wow fadeInUp" data-wow-delay=".1s">
									<ContentImage image={hero.image} priority sizes="(max-width: 1199px) 100vw, 1000px" />
								</div>
							) : null}
							{meta ? <ul className="ci-post-meta">{meta}</ul> : null}
							<div className="ci-post-text">
								{content.map((s, i) => (
									<Blocks key={i} blocks={s.blocks} />
								))}
							</div>
						</article>
						{related.map((s, i) => (
							<div key={i} className="ci-post-related">
								<PostsBlock block={{ heading: s.heading, items: s.items }} context="main" />
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default PostDetails;
