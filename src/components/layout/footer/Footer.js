import getSiteConfig from "@/libs/getSiteConfig";
import Image from "next/image";
import Link from "next/link";
import {
	FooterContact,
	FooterCopyright,
	FooterServices,
	FooterUsefulInfo,
} from "./FooterParts";

const Footer = () => {
	const { logos, footer } = getSiteConfig();
	return (
		<footer className="tj-footer-section footer-1 ci-footer section-gap-x">
			<div className="footer-main-area">
				<div className="container">
					<div className="row justify-content-between">
						<div className="col-xl-4 col-md-6">
							<div className="footer-widget ci-footer-about wow fadeInUp" data-wow-delay=".1s">
								<div className="footer-logo">
									<Link href="/" aria-label={logos.alt}>
										<Image src={logos.primary} alt={logos.alt} width={152} height={224} />
									</Link>
								</div>
								<div className="footer-text">
									<p>{footer.intro}</p>
								</div>
							</div>
						</div>
						<div className="col-xl-2 col-md-6">
							<FooterServices className="ci-footer-col" delay=".3s" />
						</div>
						<div className="col-xl-3 col-md-6">
							<FooterContact className="ci-footer-col" delay=".5s" />
						</div>
						<div className="col-xl-3 col-md-6">
							<FooterUsefulInfo className="ci-footer-col" delay=".7s" />
						</div>
					</div>
				</div>
			</div>
			<div className="tj-copyright-area">
				<div className="container">
					<div className="row">
						<div className="col-12">
							<FooterCopyright />
						</div>
					</div>
				</div>
			</div>
			{footer.shapes.map((shape, index) => (
				<div className={`bg-shape-${index + 1}`} key={shape}>
					<img src={shape} alt="" />
				</div>
			))}
		</footer>
	);
};

export default Footer;
