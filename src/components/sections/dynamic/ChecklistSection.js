import { CheckList } from "./textBlocks";

/** Renders a { type: "checklist", heading?, items } content section. */
const ChecklistSection = ({ heading, items }) => {
	return (
		<section className="tj-service-area section-gap-2">
			<div className="container">
				<div className="row">
					<div className="col-lg-10">
						{heading ? (
							<div className="sec-heading mb-30">
								<h2 className="sec-title title-anim">{heading}</h2>
							</div>
						) : null}
						<div className="blog-text">
							<CheckList items={items} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ChecklistSection;
