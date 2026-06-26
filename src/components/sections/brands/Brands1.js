import BrandSlider1 from "@/components/shared/brands/BrandSlider1";
import brandsData from "@/data/sections/brands.json";

const Brands1 = ({ type = 1 }) => {
	const { brands1 } = brandsData;
	return (
		<section
			className={`tj-client-section ${
				type === 2 ? "client-section-gap-2" : "client-section-gap"
			} wow fadeInUp`}
			data-wow-delay=".4s"
		>
			<div className="container-fluid client-container">
				<div className="row">
					<div className="col-12">
						<div className="client-content">
							<h5 className="sec-title">
								{brands1.titlePrefix}
								<span className="client-numbers">{brands1.titleNumbers}</span>{" "}
								{brands1.titleMiddle}
								<span className="client-text">{brands1.titleText}</span>
								{brands1.titleSuffix}
							</h5>
						</div>
						<BrandSlider1 />
					</div>
				</div>
			</div>
		</section>
	);
};

export default Brands1;
