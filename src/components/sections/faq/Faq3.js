import FaqItem2 from "@/components/shared/faq/FaqItem2";
import BootstrapWrapper from "@/components/shared/wrappers/BootstrapWrapper";
import faqData from "@/data/sections/faq.json";

const Faq3 = () => {
	const { faq3 } = faqData;
	const { items } = faq3;
	return (
		<section className="tj-faq-section section-gap section-separator">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="sec-heading text-center">
							<span
								className="sub-title wow fadeInUp"
								data-wow-delay={faq3.subTitleDelay}
							>
								<i className={faq3.subTitleIcon}></i>
								{faq3.subTitle}
							</span>
							<h2 className="sec-title title-anim">
								{faq3.titlePrefix}
								<span>{faq3.titleHighlight}</span>
								{faq3.titleSuffix}
							</h2>
						</div>
					</div>
					<div className="row justify-content-center">
						<div className="col-lg-8">
							<BootstrapWrapper>
								<div className="accordion tj-faq pt-0" id="faqTwo">
									{items?.length
										? items?.map((item, idx) => (
												<FaqItem2 key={idx} item={item} idx={idx} />
										  ))
										: ""}
								</div>
							</BootstrapWrapper>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Faq3;
