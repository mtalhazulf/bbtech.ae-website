import { Mona_Sans } from "next/font/google";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "./assets/css/animate.min.css";
import "./assets/css/bexon-icons.css";
import "./assets/css/bootstrap.min.css";
import "./assets/css/font-awesome-pro.min.css";
import "./assets/css/meanmenu.css";
import "./assets/css/nice-select2.css";
import "./assets/css/odometer-theme-default.css";
import "./globals.scss";
import page from "@/data/pages/home.json";
import getSiteConfig from "@/libs/getSiteConfig";

const site = getSiteConfig();

// DESIGN.md §4: one Mona Sans instance, not two identical ones, and only the
// weights the site actually uses (400/500/600/700, no italics — headings use 500,
// body uses 400/600/700). --tj-ff-heading is bound to the same font in _root.scss
// so both tokens can diverge later without loading a second family now.
const bodyFont = Mona_Sans({
	variable: "--tj-ff-body",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	style: ["normal"],
	display: "swap",
});

export const metadata = {
	metadataBase: new URL("https://bbtech.ae"),
	title: page.metadata.title,
	description: page.metadata.description || undefined,
};

// Organization schema, based on the Yoast schema graph captured on the live homepage
// (content-import/snapshot/home/page.json) plus real contact facts from site.json.
const organizationJsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: site.company.name,
	url: site.company.website,
	logo: `${site.company.website}${site.logos.primary}`,
	sameAs: site.socials.map((s) => s.url),
	contactPoint: {
		"@type": "ContactPoint",
		telephone: site.contact.phone.display,
		email: site.contact.email,
		contactType: "customer service",
	},
	address: {
		"@type": "PostalAddress",
		streetAddress: site.contact.location,
		addressCountry: "AE",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" data-scroll-behavior="smooth" dir="ltr">
			<body className={bodyFont.variable}>
				<script
					type="application/ld+json"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						// organizationJsonLd is built entirely from our own static site.json config
						// (no user input); the "<" escape is defense-in-depth against a "</script>"
						// breakout, not a response to untrusted data.
						__html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
					}}
				/>
				{children}
			</body>
		</html>
	);
}
