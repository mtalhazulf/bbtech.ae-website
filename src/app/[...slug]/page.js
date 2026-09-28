import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import RichTextSection from "@/components/sections/dynamic/RichTextSection";
import HeroInner from "@/components/sections/hero/HeroInner";
import SectionRenderer from "@/components/sections/SectionRenderer";
import BackToTop from "@/components/shared/others/BackToTop";
import HeaderSpace from "@/components/shared/others/HeaderSpace";
import ClientWrapper from "@/components/shared/wrappers/ClientWrapper";
import { getCatchAllParams, getPageData } from "@/data/pages/index.js";
import { notFound } from "next/navigation";

// Every real page is registered in the page registry at build time; nothing else is
// prerenderable through this route.
export const dynamicParams = false;

export async function generateStaticParams() {
	return getCatchAllParams();
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const page = getPageData(slug.join("/"));
	if (!page) return {};

	const { title, description, canonical, ogImage } = page.metadata;
	return {
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
}

export default async function ContentPage({ params }) {
	const { slug } = await params;
	const page = getPageData(slug.join("/"));
	if (!page) notFound();

	return (
		<div>
			<BackToTop />
			<Header isHeaderTop={true} />
			<Header isStickyHeader={true} />
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<main>
						<HeaderSpace />
						<HeroInner title={page.hero?.title} text={page.hero?.title} />
						{page.hero?.subtitle || page.hero?.image ? (
							<RichTextSection
								blocks={page.hero.subtitle ? [{ p: [page.hero.subtitle] }] : []}
								image={page.hero.image}
							/>
						) : null}
						<SectionRenderer sections={page.sections} />
					</main>
					<Footer />
				</div>
			</div>
			<ClientWrapper />
		</div>
	);
}
