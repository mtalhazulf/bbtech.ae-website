import Footer10 from "@/components/layout/footer/Footer10";
import Header from "@/components/layout/header/Header";
import HeroInner from "@/components/sections/hero/HeroInner";
import SectionRenderer from "@/components/sections/SectionRenderer";
import PageCta from "@/components/sections/pages/PageCta";
import pickSections from "@/components/sections/pages/pickSections";
import ServiceImageGrid from "@/components/sections/pages/ServiceImageGrid";
import BackToTop from "@/components/shared/others/BackToTop";
import HeaderSpace from "@/components/shared/others/HeaderSpace";
import ClientWrapper from "@/components/shared/wrappers/ClientWrapper";
import rawPage from "@/data/pages/services.json";
import { resolveFacts } from "@/libs/resolveFacts";

const page = resolveFacts(rawPage);

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

// Decorative imagery reused from the live site's own uploads (see content-import/assets-manifest.json).
const CTA_IMAGE = {
	localPath: "/images/bbtech/it-outsourcing/18907-scaled.webp",
	alt: "",
	width: 2400,
	height: 1807,
};

export default function Services() {
	const { picked, rest } = pickSections(page.sections, ["serviceGrid"]);

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
						{picked.serviceGrid ? (
							<ServiceImageGrid
								section={picked.serviceGrid}
								eyebrow="Services"
								heading="We Make IT Happen"
								highlight="IT"
								button={{ text: "Get in touch!", href: "/contact/" }}
							/>
						) : null}
						<SectionRenderer sections={rest} />
						<PageCta
							heading="Have a project for us? Get in touch!"
							button={{ text: "Contact", href: "/contact/" }}
							image={CTA_IMAGE}
						/>
					</main>
					<Footer10 />
				</div>
			</div>
			<ClientWrapper />
		</div>
	);
}
