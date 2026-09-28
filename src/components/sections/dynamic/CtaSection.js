import Cta from "@/components/sections/cta/Cta";

/**
 * Renders a { type: "cta", heading, button: { text, href } } content section as the
 * template's CTA band, which (like the template's own Cta) overlaps the top of the footer.
 * Pass `inline` when it is not the last section of the page, so it keeps normal spacing
 * instead of pulling the next section up.
 */
const CtaSection = ({ heading, button, inline = false }) => {
	return <Cta title={heading} button={button || null} inline={inline} />;
};

export default CtaSection;
