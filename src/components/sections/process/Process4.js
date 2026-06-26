import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import ProcessCard4 from "@/components/shared/cards/ProcessCard4";
import processData from "@/data/sections/process.json";

const Process4 = () => {
	const { process4 } = processData;
	const process = process4.items;

	return (
		<section className="h10-process section-gap section-gap-x tj-sticky-panel-3-container">
			<div className="container">
				<div className="row">
					<div className="col-12 col-lg-5">
						<div className="sec-heading style-3 tj-sticky-panel-3">
							<span className="sub-title">
								<i className="tji-box"></i> {process4.subTitle}
							</span>
							<h2 className="sec-title text-anim">{process4.title}</h2>
							<div className="h10-process-more">
								<ButtonPrimary
									text={process4.button.text}
									url={process4.button.url}
								/>
							</div>
						</div>
					</div>
					<div className="col-12 col-lg-7 ">
						<div className="h10-process-wrapper">
							{process?.length
								? process?.map((processSingle, idx) => (
										<ProcessCard4
											key={idx}
											processSingle={processSingle}
											idx={idx}
										/>
								  ))
								: ""}
						</div>
					</div>
				</div>
			</div>
			<div className="bg-shape-1">
				<img src={process4.shapes[0]} alt="" />
			</div>
			<div className="bg-shape-2">
				<img src={process4.shapes[1]} alt="" />
			</div>
			<div className="bg-shape-3">
				<img src={process4.shapes[2]} alt="" />
			</div>
		</section>
	);
};

export default Process4;
