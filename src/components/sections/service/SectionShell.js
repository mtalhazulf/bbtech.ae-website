import { RenderBlock } from "./ServiceBlocks";

/** Full-width section treatment for a block: tinted band for list-heavy blocks, else plain. */
export function toneFor(block) {
	if (block.kind === "groups") return "tinted";
	if (block.kind === "checks" && block.style === "grid") return "tinted";
	return "plain";
}

/**
 * Wraps one presentation block in a full-width template section. "tinted" is the theme-bg
 * band with the template's pattern shapes (as About3 does). `standalone` sections (used on
 * their own via the dynamic components) carry their own top and bottom spacing; page
 * sequences (ServicePage) use top-only spacing so gaps never double up.
 */
const SectionShell = ({ block, tone = toneFor(block), standalone = false }) => {
	const tinted = tone === "tinted";
	return (
		<section
			className={`ci-section ci-section-${block.kind} ${tinted ? "ci-tinted section-gap-x" : "ci-plain"} ${standalone ? "ci-dyn" : ""}`.trim()}
		>
			<div className="container">
				<RenderBlock block={block} context="full" />
			</div>
			{tinted ? (
				<>
					<div className="bg-shape-1" aria-hidden="true">
						<img src="/images/shape/pattern-2.svg" alt="" />
					</div>
					<div className="bg-shape-2" aria-hidden="true">
						<img src="/images/shape/pattern-3.svg" alt="" />
					</div>
				</>
			) : null}
		</section>
	);
};

export default SectionShell;
