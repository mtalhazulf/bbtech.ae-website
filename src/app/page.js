import Footer10 from "@/components/layout/footer/Footer10";
import Header from "@/components/layout/header/Header";
import About9 from "@/components/sections/about/About9";
import Brands3 from "@/components/sections/brands/Brands3";
import Hero10 from "@/components/sections/hero/Hero10";
import TextMarquee from "@/components/sections/marquee/TextMarquee";
import Process4 from "@/components/sections/process/Process4";
import Services10 from "@/components/sections/services/Services10";
import Testimonials10 from "@/components/sections/testimonials/Testimonials10";
import BackToTop from "@/components/shared/others/BackToTop";
import TjMagicCursor from "@/components/shared/others/TjMagicCursor";
import ClientWrapper from "@/components/shared/wrappers/ClientWrapper";
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
						<Hero10 />
						<Services10 />
						<TextMarquee />
						<About9 />
						<Process4 />
						<Testimonials10 />
						<Brands3 type={2} className="mb-0" />
					</main>
					<Footer10 />
				</div>
			</div>
			<TjMagicCursor />
			<ClientWrapper />
		</div>
	);
}
