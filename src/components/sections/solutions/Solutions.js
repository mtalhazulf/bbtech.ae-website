import solutionsData from "@/data/sections/solutions.json";

const Solutions = () => {
	const solutions = solutionsData.items;

	return (
		<section className="tj-choose-section section-gap">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="sec-heading style-3 text-center">
							<span className="sub-title wow fadeInUp" data-wow-delay=".3s">
								<i className="tji-box"></i> {solutionsData.subTitle}
							</span>
							<h2 className="sec-title title-anim">
								{solutionsData.titlePrefix}
								<span>{solutionsData.titleHighlight}</span>
							</h2>
						</div>
					</div>
				</div>
				<div className="row row-gap-4">
					{solutions.map((solution, idx) => (
						<div key={idx} className="col-lg-4 col-md-6">
							<div className="choose-box right-swipe wow fadeInUp">
								<div className="choose-content">
									<div className="choose-icon">
										<i className={solution.icon}></i>
									</div>
									<h4 className="title">{solution.title}</h4>
									<p className="desc">{solution.desc}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Solutions;
