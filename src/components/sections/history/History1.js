import modifyNumber from "@/libs/modifyNumber";
import Image from "next/image";
import historyData from "@/data/sections/history.json";

const History1 = () => {
	const history = historyData.history1.items;
	return (
		<section className="tj-history-area section-bottom-gap">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="timeline">
							{history?.length
								? history?.map(({ title, desc, images, year }, idx) => (
										<div
											key={idx}
											className="timeline-inner wow fadeInUp"
											data-wow-delay={`0.${idx + 1 + idx}s`}
										>
											<div className="date">{year}</div>
											<div className="content">
												<div className="top">
													<span>{modifyNumber(idx + 1)}.</span>
													<h4 className="title">{title}</h4>
													<p>{desc}</p>
												</div>
												<div className="bottom">
													{images?.length
														? images?.map((img, idx) => (
																<Image
																	key={idx + 100}
																	src={
																		img ? img : "/images/history/history-1.webp"
																	}
																	alt="history"
																	width={241}
																	height={204}
																	style={{ height: "auto" }}
																/>
														  ))
														: ""}
												</div>
											</div>
										</div>
								  ))
								: ""}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default History1;
