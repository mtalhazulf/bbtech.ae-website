import Cta from "@/components/sections/cta/Cta";
import PostDetails from "./PostDetails";
import { buildPageModel } from "./presentation";
import SectionShell, { toneFor } from "./SectionShell";
import { RenderBlock } from "./ServiceBlocks";
import ServiceSidebar from "./ServiceSidebar";

/**
 * Premium presentation for every catch-all content page (src/app/[...slug]/page.js):
 * - "sidebar": service-details layout, content col-lg-8 + sticky menu/contact sidebar
 * - "landing": full-width template sections (split intro, icon cards, tinted bands)
 * - "post":    blog-details article
 * Every layout ends in the CTA band, which overlaps the footer like the template's pages.
 */
const ServicePage = ({ page }) => {
	const model = buildPageModel(page);
	const { cta } = model;
	const ctaBand = <Cta title={cta.title} blocks={cta.blocks} button={cta.button} image={cta.image} />;

	if (model.layout === "post") {
		return (
			<>
				<PostDetails page={page} />
				{ctaBand}
			</>
		);
	}

	if (model.layout === "sidebar") {
		// The sidebar's contact card already carries the default "Have a project for us? Get
		// in touch!" copy, so the band only closes pages that have their own closing section
		// (and then the card is desktop-only, so phones never stack two CTAs back to back).
		return (
			<>
				<section className={`ci-details-section section-gap ${model.ownCta ? "" : "is-last"}`.trim()}>
					<div className="container">
						<div className="row row-gap-5 slidebar-stickiy-container">
							<div className="col-lg-8">
								<div className="ci-details-main">
									{model.blocks.map((block, i) => (
										<div key={i} className={`ci-details-block ci-block-${block.kind}`}>
											<RenderBlock block={block} context="main" />
										</div>
									))}
								</div>
							</div>
							<div className="col-lg-4">
								<ServiceSidebar menu={model.sidebarMenu} currentPath={page.path} contactDesktopOnly={model.ownCta} />
							</div>
						</div>
					</div>
				</section>
				{model.ownCta ? ctaBand : null}
			</>
		);
	}

	// Landing: consecutive tinted bands are avoided so the page keeps one or two tints.
	let lastTone = "plain";
	return (
		<>
			<div className="ci-landing">
				{model.blocks.map((block, i) => {
					let tone = toneFor(block);
					if (tone === "tinted" && lastTone === "tinted") tone = "plain";
					lastTone = tone;
					return <SectionShell key={i} block={block} tone={tone} />;
				})}
			</div>
			{ctaBand}
		</>
	);
};

export default ServicePage;
