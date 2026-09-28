import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import getSiteConfig from "@/libs/getSiteConfig";
import Image from "next/image";
import Link from "next/link";
import {
	FooterContact,
	FooterCopyright,
	FooterServices,
	FooterSocials,
	FooterUsefulInfo,
} from "./FooterParts";

const Footer10 = () => {
	const { logos, contact, footer } = getSiteConfig();
	return (
		<footer className="tj-footer-section footer-2 h5-footer h10-footer ci-footer ci-footer-dark section-gap-x">
			<div className="footer-main-area">
				<div className="container">
					<div className="row justify-content-between">
						<div className="col-xl-4 col-lg-12">
							<div className="footer-widget footer-col-1">
								<h2 className="h10-footer-title text-anim">{footer.tagline}</h2>
								<Link
									className="text-btn wow fadeInUp"
									data-wow-delay=".3s"
									href={`mailto:${contact.email}`}
								>
									<span className="btn-text">
										<span>{contact.email}</span>
									</span>
								</Link>
								<div className="ci-footer-col1-socials wow fadeInUp" data-wow-delay=".5s">
									<FooterSocials />
								</div>
								<div
									className="bg-shape-widget wow fadeInUpBig"
									data-wow-delay=".7s"
								></div>
							</div>
						</div>
						<div className="col-xl-2 col-lg-3 col-md-6">
							<FooterServices className="footer-col-2 ci-footer-col" delay=".3s" />
						</div>
						<div className="col-xl-3 col-lg-4 col-md-6">
							<FooterContact className="ci-footer-col" delay=".5s" />
						</div>
						<div className="col-xl-3 col-lg-5 col-md-12">
							<FooterUsefulInfo className="ci-footer-col" delay=".7s" />
						</div>
					</div>
				</div>
			</div>
			<div
				className="h10-footer-subscribe-wrapper ci-footer-band wow fadeInUp"
				data-wow-delay=".5s"
			>
				<div className="container">
					<div className="row">
						<div className="col-12">
							<div className="footer-subscribe h5-footer-subscribe ci-footer-card">
								<div className="ci-footer-card-logo">
									<Link href="/" aria-label={logos.alt}>
										<Image src={logos.primary} alt={logos.alt} width={152} height={224} />
									</Link>
								</div>
								<p className="ci-footer-card-text">{footer.intro}</p>
								<div className="ci-footer-card-btn">
									<ButtonPrimary text={footer.button.text} url={footer.button.url} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="tj-copyright-area-2 h5-footer-copyright">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<FooterCopyright showSocials={false} />
						</div>
					</div>
				</div>
			</div>
			<div className="bg-shape-1">
				<img src="/images/shape/pattern-2.svg" alt="" />
			</div>
			<div className="bg-shape-2">
				<img src="/images/shape/pattern-3.svg" alt="" />
			</div>
			<div className="bg-shape-4 wow fadeInUpBig" data-wow-delay=".8s">
				<img src="/images/shape/h10-footer-shape-blur-2.svg" alt="" />
			</div>
		</footer>
	);
};

export default Footer10;
