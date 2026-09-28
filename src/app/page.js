import Footer10 from "@/components/layout/footer/Footer10";
import Header from "@/components/layout/header/Header";
import SectionRenderer from "@/components/sections/SectionRenderer";
import HeroSlider from "@/components/sections/dynamic/HeroSlider";
import HomeAbout from "@/components/sections/home/HomeAbout";
import HomeCertifications from "@/components/sections/home/HomeCertifications";
import HomeIndustries from "@/components/sections/home/HomeIndustries";
import HomeMarquee from "@/components/sections/home/HomeMarquee";
import HomeNews from "@/components/sections/home/HomeNews";
import HomeQuote from "@/components/sections/home/HomeQuote";
import HomeServices from "@/components/sections/home/HomeServices";
import HomeWhy from "@/components/sections/home/HomeWhy";
import BackToTop from "@/components/shared/others/BackToTop";
import TjMagicCursor from "@/components/shared/others/TjMagicCursor";
import ClientWrapper from "@/components/shared/wrappers/ClientWrapper";
import page from "@/data/pages/home.json";

const { title, description, canonical, ogImage } = page.metadata;

export const metadata = {
	title,
	description: description || undefined,
	alternates: canonical ? { canonical } : undefined,
	openGraph: {
		title,
		description: description || undefined,
		url: canonical,
		images: ogImage ? [{ url: ogImage }] : undefined,
	},
};

// Sections are placed by their presentation-only `variant` key (home.json).
// Anything without a known variant still renders through SectionRenderer, so
// a re-import can never silently drop content from the page.
const KNOWN_VARIANTS = new Set([
	"about",
	"servicesIntro",
	"serviceGroup",
	"industries",
	"quote",
	"why",
	"reputation",
	"news",
	"certifications",
]);
const sections = page.sections;
const byVariant = variant => sections.find(section => section.variant === variant);

/**
 * Resolves a presentation-only `mediaFrom` reference ("hero.<n>" = that hero
 * slide's image, "section.<n>" = that section's image) so a layout can reuse
 * an image already in home.json instead of copying image data around.
 *
 * @param {string} [ref]
 * @returns {{ localPath: string, alt?: string, width: number, height: number } | undefined}
 */
const resolveMedia = ref => {
	const [source, index] = (ref || "").split(".");
	if (source === "hero") return page.hero?.slides?.[Number(index)]?.image;
	if (source === "section") return sections[Number(index)]?.image;
	return undefined;
};
const about = byVariant("about");
const servicesIntro = byVariant("servicesIntro");
const serviceGroups = sections.filter(section => section.variant === "serviceGroup");
const industries = byVariant("industries");
const quote = byVariant("quote");
const why = byVariant("why");
const reputation = byVariant("reputation");
const news = byVariant("news");
const certifications = byVariant("certifications");
// The reputation line lives inside the Why band; without that band it falls back too.
const unplaced = sections.filter(
	section =>
		!KNOWN_VARIANTS.has(section.variant) || (section.variant === "reputation" && !why)
);

export default function Home() {
	return (
		<div>
			<BackToTop />
			<Header headerType={10} isHeaderTop={true} />
			<Header headerType={10} isStickyHeader={true} />
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<main>
						<div className="top-space-15"></div>
						<HeroSlider slides={page.hero.slides} />
						{about ? (
							<HomeAbout
								section={about}
								image={resolveMedia(about.mediaFrom)}
								reputation={reputation}
								why={why}
							/>
						) : null}
						{servicesIntro || serviceGroups.length ? (
							<HomeServices intro={servicesIntro} groups={serviceGroups} />
						) : null}
						<HomeMarquee items={serviceGroups.map(group => group.heading)} />
						{industries ? <HomeIndustries section={industries} /> : null}
						{quote ? <HomeQuote section={quote} /> : null}
						{why ? <HomeWhy section={why} reputation={reputation} /> : null}
						{news ? <HomeNews section={news} /> : null}
						{unplaced.length ? <SectionRenderer sections={unplaced} /> : null}
						{certifications ? <HomeCertifications section={certifications} /> : null}
					</main>
					<Footer10 />
				</div>
			</div>
			<TjMagicCursor />
			<ClientWrapper />
		</div>
	);
}
