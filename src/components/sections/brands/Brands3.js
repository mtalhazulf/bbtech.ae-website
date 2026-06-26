import BrandSlider2 from "@/components/shared/brands/BrandSlider2";
import brandsData from "@/data/sections/brands.json";

const Brands3 = ({ type, className }) => {
	const { brands3 } = brandsData;
	return (
		<div
			className={`tj-client-section-2 ${className ? className : ""} ${
				type === 2 ? "h6-client" : ""
			} section-gap-x wow fadeInUp`}
			data-wow-delay=".4s"
		>
			<div className="container-fluid client-container">
				<div className="row">
					{type === 2 ? (
						<div className="col-12">
							<div className="h6-client-title-wrapper">
								<h6
									className="h6-client-title
              "
								>
									{brands3.title2}
								</h6>
							</div>
						</div>
					) : (
						""
					)}
					<div className="col-12">
						<BrandSlider2 type={type} />
					</div>
				</div>
			</div>
		</div>
	);
};
export default Brands3;
