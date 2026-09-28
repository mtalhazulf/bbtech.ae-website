/**
 * Large-type quote band: tinted rounded panel with the template's pattern
 * shapes, the quote as a scroll-revealed ".title-highlight" heading and the
 * live attribution line underneath.
 */
const HomeQuote = ({ section }) => {
	const lines = section.blocks?.flatMap(block => block.p || []) || [];
	return (
		<section className="ci-home-quote section-gap section-gap-x">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-lg-10 col-xl-9">
						<div className="ci-quote-inner">
							<span className="ci-quote-icon wow fadeInUp" data-wow-delay=".2s" aria-hidden="true">
								<i className="tji-quote"></i>
							</span>
							<h2 className="sec-title title-highlight ci-quote-title">{section.heading}</h2>
							{lines.map((text, idx) => (
								<p key={idx} className="ci-quote-author wow fadeInUp" data-wow-delay=".4s">
									{text}
								</p>
							))}
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
		</section>
	);
};

export default HomeQuote;
