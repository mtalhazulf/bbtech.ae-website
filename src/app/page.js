import Footer10 from "@/components/layout/footer/Footer10";
import Header from "@/components/layout/header/Header";
import SectionRenderer from "@/components/sections/SectionRenderer";
import HeroSlider from "@/components/sections/dynamic/HeroSlider";
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

export default function Home() {
	return (
		<div>
			<BackToTop />
			<Header headerType={10} />
			<Header headerType={10} isStickyHeader={true} />
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<main>
						<div className="top-space-15"></div>
						<HeroSlider slides={page.hero.slides} />
						<SectionRenderer sections={page.sections} />
					</main>
					<Footer10 />
				</div>
			</div>
			<TjMagicCursor />
			<ClientWrapper />
		</div>
	);
}
