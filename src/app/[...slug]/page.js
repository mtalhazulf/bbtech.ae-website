import Footer10 from "@/components/layout/footer/Footer10";
import Header from "@/components/layout/header/Header";
import HeroInner from "@/components/sections/hero/HeroInner";
import ServicePage from "@/components/sections/service/ServicePage";
import BackToTop from "@/components/shared/others/BackToTop";
import HeaderSpace from "@/components/shared/others/HeaderSpace";
import ClientWrapper from "@/components/shared/wrappers/ClientWrapper";
import { getCatchAllParams, getPageData } from "@/data/pages/index.js";
import { notFound } from "next/navigation";

// Every real page is registered in the page registry at build time; nothing else is
// prerenderable through this route.
export const dynamicParams = false;

export async function generateStaticParams() {
	return await getCatchAllParams();
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const page = await getPageData(slug.join("/"));
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

// Breadcrumb trail between "Home" and the page itself: /services/<x>/ pages sit under the
// live "Services" menu entry.
function breadcrumbsFor(page) {
	if (page.path.startsWith("/services/")) return [{ name: "Services", path: "/services/" }];
	return [];
}

export default async function ContentPage({ params }) {
	const { slug } = await params;
	const page = await getPageData(slug.join("/"));
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
						<HeroInner title={page.hero?.title} text={page.hero?.title} breadcrums={breadcrumbsFor(page)} />
						<ServicePage page={page} />
					</main>
					<Footer10 />
				</div>
			</div>
			<ClientWrapper />
		</div>
	);
}
