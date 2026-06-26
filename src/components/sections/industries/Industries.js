import industriesData from "@/data/sections/industries.json";

const Industries = () => {
	const industries = industriesData.items;

	return (
		<section className="tj-industries-section section-gap">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="sec-heading style-3 text-center">
							<span className="sub-title wow fadeInUp" data-wow-delay=".3s">
								<i className="tji-box"></i> {industriesData.subTitle}
							</span>
							<h2
								className="sec-title title-anim wow fadeInUp"
								data-wow-delay=".3s"
							>
								{industriesData.title}
							</h2>
						</div>
					</div>
				</div>
				<div className="row row-gap-4">
					{industries.map((industry, idx) => (
						<div key={idx} className="col-lg-4 col-md-6">
							<div
								className="industry-card wow fadeInUp"
								data-wow-delay=".3s"
							>
								<div className="industry-icon">
									<i className={industry.icon}></i>
								</div>
								<div className="industry-count">
									{industry.count}
									{industry.symbol ? (
										<span className="count-plus">{industry.symbol}</span>
									) : (
										""
									)}
								</div>
								<h3 className="industry-name">{industry.name}</h3>
								<p className="industry-desc">{industry.desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Industries;
