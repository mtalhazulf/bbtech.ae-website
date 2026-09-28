"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import modifyNumber from "@/libs/modifyNumber";
import Image from "next/image";
import { useState } from "react";
import HighlightText from "./HighlightText";

/**
 * Service showcase in the template's Services10 dress: "sec-heading-wrap"
 * header with a side button, then one tab per real service group (tab labels
 * are the site's own nav labels), each showing a split image/copy panel and
 * the group's four items as numbered ServiceCard11-style icon cards.
 * Every panel is server-rendered; inactive ones are only `hidden`.
 */
const HomeServices = ({ intro, groups = [] }) => {
	const [active, setActive] = useState(0);
	const introText = intro?.blocks?.flatMap(block => block.p || []) || [];

	const onKeyDown = event => {
		if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
		event.preventDefault();
		const step = event.key === "ArrowRight" ? 1 : -1;
		const next = (active + step + groups.length) % groups.length;
		setActive(next);
		document.getElementById(`ci-service-tab-${next}`)?.focus();
	};

	return (
		<section className="h5-service-section h10-service section-gap ci-home-services">
			<div className="container">
				{intro ? (
					<div className="row">
						<div className="col-12">
							<div className="sec-heading-wrap style-8">
								<div className="heading-wrap-content">
									<div className="sec-heading style-3">
										<span className="sub-title wow fadeInUp" data-wow-delay=".3s">
											<i className="tji-box" aria-hidden="true"></i> Services
										</span>
										<h2 className="sec-title text-anim">
											<HighlightText text={intro.heading} highlight={intro.highlight} />
										</h2>
									</div>
									<div className="ci-heading-aside wow fadeInUp" data-wow-delay=".5s">
										{introText.map((text, idx) => (
											<p key={idx} className="desc">
												{text}
											</p>
										))}
										<ButtonPrimary text="Discover more" url="/services/" />
									</div>
								</div>
							</div>
						</div>
					</div>
				) : null}

				<div
					className="ci-service-tabs wow fadeInUp"
					data-wow-delay=".3s"
					role="tablist"
					aria-label={intro?.heading}
					onKeyDown={onKeyDown}
				>
					{groups.map((group, idx) => (
						<button
							key={idx}
							type="button"
							role="tab"
							id={`ci-service-tab-${idx}`}
							aria-selected={active === idx}
							aria-controls={`ci-service-panel-${idx}`}
							tabIndex={active === idx ? 0 : -1}
							className={`ci-service-tab ${active === idx ? "active" : ""}`}
							onClick={() => setActive(idx)}
						>
							<span className="ci-service-tab-icon" aria-hidden="true">
								<i className={group.tabIcon || "tji-service-1"}></i>
							</span>
							<span className="ci-service-tab-label">{group.tabLabel}</span>
						</button>
					))}
				</div>

				{groups.map((group, idx) => (
					<div
						key={idx}
						role="tabpanel"
						id={`ci-service-panel-${idx}`}
						aria-labelledby={`ci-service-tab-${idx}`}
						hidden={active !== idx}
						className="ci-service-panel"
					>
						<div className="ci-service-summary">
							<div className="row align-items-center">
								<div className="col-12 col-lg-5">
									<div className="ci-service-media">
										{group.image ? (
											<Image
												src={group.image.localPath}
												alt={group.image.alt || ""}
												width={group.image.width}
												height={group.image.height}
												sizes="(min-width: 992px) 440px, 80vw"
											/>
										) : null}
									</div>
								</div>
								<div className="col-12 col-lg-7">
									<div className="ci-service-copy">
										<span className="ci-service-count">
											{modifyNumber(idx + 1)} / {modifyNumber(groups.length)}
										</span>
										<h3 className="ci-service-title">
											<HighlightText text={group.heading} highlight={group.highlight} />
										</h3>
										{group.text ? <p className="desc">{group.text}</p> : null}
										{group.link ? (
											<ButtonPrimary text="Discover more" url={group.link} />
										) : null}
									</div>
								</div>
							</div>
						</div>
						<div className="row row-gap-4 h10-service-wrapper">
							{group.items?.map((item, itemIdx) => (
								<div key={itemIdx} className="col-12 col-md-6 col-xl-3">
									<div className="service-item style-4 ci-home-service-card">
										<span className="h10-service-sln" aria-hidden="true">
											{modifyNumber(itemIdx + 1)}.
										</span>
										<div className="service-icon">
											{item.icon ? (
												<Image
													src={item.icon.localPath}
													alt={item.icon.alt || ""}
													width={item.icon.width}
													height={item.icon.height}
													sizes="56px"
												/>
											) : null}
										</div>
										<div className="service-content">
											<h4 className="title">{item.title}</h4>
											{item.text ? <p className="desc">{item.text}</p> : null}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default HomeServices;
