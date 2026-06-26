"use client";
import BootstrapWrapper from "@/components/shared/wrappers/BootstrapWrapper";
import servicesData from "@/data/sections/services.json";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import CtaSidebar from "../cta/CtaSidebar";

const ServicesDetailsPrimary = ({ option }) => {
	const {
		currentItem,
		items,
		currentId,
		isPrevItem,
		isNextItem,
		prevId,
		nextId,
	} = option || {};
	const { title, titleLarge, id, iconName, img } = currentItem || {};
	const {
		mainImage,
		title: contentTitle,
		paragraphs,
		checkList,
		gallery,
		rangeHeading,
		rangeParagraph,
		detailsBoxes,
		faqHeading,
		faqs,
		sidebarTitle,
		sidebarLimit,
	} = servicesData.servicesDetails;
	const sidebarItems = items?.slice(0, sidebarLimit);
	return (
		<section className="tj-service-area section-gap">
			<div className="container">
				<div className="row row-gap-5">
					<div className="col-lg-8">
						<div className="post-details-wrapper">
							<div className="blog-images wow fadeInUp" data-wow-delay=".1s">
								<Image
									src={mainImage.src}
									alt="Images"
									width={mainImage.width}
									height={mainImage.height}
									style={{ height: "auto" }}
								/>
							</div>
							<h2 className="title title-anim">{contentTitle}</h2>
							<div className="blog-text">
								{paragraphs?.map((paragraph, index) => (
									<p
										key={index}
										className="wow fadeInUp"
										data-wow-delay=".3s"
									>
										{paragraph}
									</p>
								))}
								<ul className="wow fadeInUp" data-wow-delay=".3s">
									{checkList?.map((listItem, index) => (
										<li key={index}>
											<span>
												<i className="tji-check"></i>
											</span>
											{listItem}
										</li>
									))}
								</ul>
								<div className="images-wrap">
									<div className="row">
										{gallery?.map((image, index) => (
											<div key={index} className="col-sm-6">
												<div
													className="image-box wow fadeInUp"
													data-wow-delay={image.delay}
												>
													<Image
														src={image.src}
														alt="Image"
														width={image.width}
														height={image.height}
														style={{ height: "auto" }}
													/>
												</div>
											</div>
										))}
									</div>
								</div>
								<h3 className="wow fadeInUp" data-wow-delay=".3s">
									{rangeHeading}
								</h3>
								<p className="wow fadeInUp" data-wow-delay=".3s">
									{rangeParagraph}
								</p>
								<div className="details-content-box">
									{detailsBoxes?.map((box, index) => (
										<div
											key={index}
											className="service-details-item wow fadeInUp"
											data-wow-delay={box.delay}
										>
											{index === 0 ? (
												<>
													<span className="number">{box.number}</span>
													<h6 className="title">
														{box.title.map((line, lineIdx) => (
															<Fragment key={lineIdx}>
																{line}
																{lineIdx < box.title.length - 1 ? <br /> : null}
															</Fragment>
														))}
													</h6>
													<div className="desc">
														<p>{box.desc}</p>
													</div>
												</>
											) : (
												<div className="service-number">
													<span className="number">{box.number}</span>
													<h6 className="title">
														{box.title.map((line, lineIdx) => (
															<Fragment key={lineIdx}>
																{line}
																{lineIdx < box.title.length - 1 ? <br /> : null}
															</Fragment>
														))}
													</h6>
													<div className="desc">
														<p>{box.desc}</p>
													</div>
												</div>
											)}
										</div>
									))}
								</div>
								<h3 className="wow fadeInUp" data-wow-delay=".3s">
									{faqHeading}
								</h3>
								<BootstrapWrapper>
									<div className="accordion tj-faq style-2" id="faqOne">
										{faqs?.map((faq, index) => (
											<div
												key={index}
												className={`accordion-item ${
													index === 0 ? "active " : ""
												}wow fadeInUp`}
												data-wow-delay=".3s"
											>
												<button
													className={
														index === 0 ? " faq-title" : "faq-title collapsed"
													}
													type="button"
													data-bs-toggle="collapse"
													data-bs-target={`#${faq.id}`}
													aria-expanded={index === 0 ? "true" : "false"}
												>
													{faq.question}
												</button>
												<div
													id={faq.id}
													className={`collapse ${index === 0 ? "show" : ""}`}
													data-bs-parent="#faqOne"
												>
													<div className="accordion-body faq-text">
														<p>{faq.answer}</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</BootstrapWrapper>
							</div>
							<div
								className="tj-post__navigation mb-0 wow fadeInUp"
								data-wow-delay="0.3s"
							>
								{/* <!-- previous post --> */}
								<div
									className="tj-nav__post previous"
									style={{ visibility: isPrevItem ? "visible" : "hidden" }}
								>
									<div className="tj-nav-post__nav prev_post">
										<Link href={isPrevItem ? `/services/${prevId}` : "#"}>
											<span>
												<i className="tji-arrow-left"></i>
											</span>
											Previous
										</Link>
									</div>
								</div>
								<Link href={"/services"} className="tj-nav-post__grid">
									<i className="tji-window"></i>
								</Link>
								{/* <!-- next post --> */}
								<div
									className="tj-nav__post next"
									style={{ visibility: isNextItem ? "visible" : "hidden" }}
								>
									<div className="tj-nav-post__nav next_post">
										<Link href={isNextItem ? `/services/${nextId}` : "#"}>
											Next
											<span>
												<i className="tji-arrow-right"></i>
											</span>
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-4">
						<aside className="tj-main-sidebar">
							{/* <!-- Service List --> */}
							<div
								className="tj-sidebar-widget service-categories wow fadeInUp"
								data-wow-delay=".1s"
							>
								<h4 className="widget-title">{sidebarTitle}</h4>
								<ul>
									{sidebarItems?.length
										? sidebarItems?.map(({ shortTitle, id }, idx) => (
												<li key={idx}>
													<Link
														className={`${currentId === id ? "active" : ""}`}
														href={`/services/${id}`}
													>
														{shortTitle}
														<span className="icon">
															<i className="tji-arrow-right"></i>
														</span>
													</Link>
												</li>
										  ))
										: ""}
								</ul>
							</div>

							{/* <!-- cta --> */}
							<div
								className="tj-sidebar-widget widget-feature-item wow fadeInUp"
								data-wow-delay=".3s"
							>
								<CtaSidebar />
							</div>
						</aside>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ServicesDetailsPrimary;
