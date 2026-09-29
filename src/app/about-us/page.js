import Footer10 from "@/components/layout/footer/Footer10";
import Header from "@/components/layout/header/Header";
import HeroInner from "@/components/sections/hero/HeroInner";
import SectionRenderer from "@/components/sections/SectionRenderer";
import AboutIntro from "@/components/sections/pages/AboutIntro";
import AboutServicesBand from "@/components/sections/pages/AboutServicesBand";
import CertificationsBand from "@/components/sections/pages/CertificationsBand";
import PageCta from "@/components/sections/pages/PageCta";
import pickSections from "@/components/sections/pages/pickSections";
import SisterCompanyBand from "@/components/sections/pages/SisterCompanyBand";
import BackToTop from "@/components/shared/others/BackToTop";
import HeaderSpace from "@/components/shared/others/HeaderSpace";
import ClientWrapper from "@/components/shared/wrappers/ClientWrapper";
import rawPage from "@/data/pages/about-us.json";
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
const INTRO_IMAGE = {
	localPath: "/images/bbtech/shared/binary-bridge-technology-services.webp",
	alt: "",
	width: 598,
	height: 582,
};
const BAND_IMAGE = {
	localPath: "/images/bbtech/it-outsourcing-2/outsource.webp",
	alt: "IT Outsourcing",
	width: 1024,
	height: 532,
};
const CTA_IMAGE = {
	localPath: "/images/bbtech/it-outsourcing/18907-scaled.webp",
	alt: "",
	width: 2400,
	height: 1807,
};

export default function AboutUs() {
	const { picked, rest } = pickSections(page.sections, [
		"intro",
		"servicesList",
		"outsourcing",
		"sisterCompany",
		"certifications",
	]);

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
						{picked.intro ? (
							<AboutIntro
								section={picked.intro}
								eyebrow="About us"
								highlight="IT"
								button={{ text: "Get in touch!", href: "/contact/" }}
								image={INTRO_IMAGE}
							/>
						) : null}
						{picked.outsourcing || picked.servicesList ? (
							<AboutServicesBand
								statement={picked.outsourcing}
								list={picked.servicesList}
								eyebrow="Services"
								highlight="IT services"
								button={{ text: "Discover more", href: "/services/" }}
								image={BAND_IMAGE}
							/>
						) : null}
						{picked.sisterCompany ? (
							<SisterCompanyBand section={picked.sisterCompany} highlight="Plus" />
						) : null}
						{picked.certifications ? (
							<CertificationsBand section={picked.certifications} highlight="Certifications" />
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
