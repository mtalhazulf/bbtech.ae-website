import Footer10 from "@/components/layout/footer/Footer10";
import Header from "@/components/layout/header/Header";
import Cta from "@/components/sections/cta/Cta";
import ErrorPrimary from "@/components/sections/error/ErrorPrimary";
import HeroInner from "@/components/sections/hero/HeroInner";
import BackToTop from "@/components/shared/others/BackToTop";
import HeaderSpace from "@/components/shared/others/HeaderSpace";
import ClientWrapper from "@/components/shared/wrappers/ClientWrapper";
import pages from "@/data/pages.json";

const { notFound } = pages;

export default function NotFound() {
	return (
		<div>
			<BackToTop />
			<Header />
			<Header isStickyHeader={true} />
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<main>
						<HeaderSpace />
						<HeroInner title={notFound.hero.title} text={notFound.hero.text} />
						<ErrorPrimary />
						<Cta />
					</main>
					<Footer10 />
				</div>
			</div>
			<ClientWrapper />
		</div>
	);
}
