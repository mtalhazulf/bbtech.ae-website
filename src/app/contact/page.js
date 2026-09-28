import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import HeroInner from "@/components/sections/hero/HeroInner";
import SectionRenderer from "@/components/sections/SectionRenderer";
import ContactFormSection from "@/components/sections/pages/ContactFormSection";
import ContactInfoCards from "@/components/sections/pages/ContactInfoCards";
import PageCta from "@/components/sections/pages/PageCta";
import pickSections from "@/components/sections/pages/pickSections";
import BackToTop from "@/components/shared/others/BackToTop";
import HeaderSpace from "@/components/shared/others/HeaderSpace";
import ClientWrapper from "@/components/shared/wrappers/ClientWrapper";
import page from "@/data/pages/contact.json";

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

export default function Contact() {
	const { picked, rest } = pickSections(page.sections, ["contactInfo", "contactForm", "sisterCompany"]);

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
						{picked.contactInfo ? (
							<ContactInfoCards
								section={picked.contactInfo}
								eyebrow="Contact info"
								heading="Get in Touch for your Inquiries"
								highlight="Inquiries"
							/>
						) : null}
						{picked.contactForm || picked.sisterCompany ? (
							<ContactFormSection
								form={picked.contactForm}
								aside={picked.sisterCompany}
								formTitle="Have a project for us? Get in touch!"
								formHighlight="Get in touch!"
								asideHighlight="Vision Plus"
							/>
						) : null}
						<SectionRenderer sections={rest} />
						<PageCta
							heading="We Make IT Happen"
							button={{ text: "Services", href: "/services/" }}
							image={CTA_IMAGE}
						/>
					</main>
					<Footer />
				</div>
			</div>
			<ClientWrapper />
		</div>
	);
}
