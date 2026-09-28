import heroData from "@/data/sections/hero.json";
import sliceText from "@/libs/sliceText";
import Link from "next/link";
import React from "react";

/**
 * Inner-page header: page title + breadcrumb on the template's dark rounded band. The
 * template's stock background photo is not used; the band is decorated with the
 * template's own line patterns and a token-based brand glow instead.
 */
const HeroInner = ({ title, text, breadcrums = [] }) => {
	const { heroInner } = heroData;
	return (
		<section className="tj-page-header section-gap-x">
			<div className="ci-page-header-glow" aria-hidden="true"></div>
			<div className="ci-page-header-shape shape-1" aria-hidden="true">
				<img src="/images/shape/pattern-2.svg" alt="" />
			</div>
			<div className="ci-page-header-shape shape-2" aria-hidden="true">
				<img src="/images/shape/pattern-3.svg" alt="" />
			</div>
			<div className="container">
				<div className="row">
					<div className="col-lg-12">
						<div className="tj-page-header-content text-center">
							<h1 className={`tj-page-title`}>{title}</h1>
							<div className="tj-page-link">
								<span>
									<i className={heroInner.homeIcon}></i>
								</span>
								<span>
									<Link href={heroInner.homeLink.path}>
										{heroInner.homeLink.name}
									</Link>
								</span>
								<span>
									<i className={heroInner.separatorIcon}></i>
								</span>
								{breadcrums?.length
									? breadcrums?.map(({ name, path }, idx) => (
											<React.Fragment key={idx}>
												<span>
													<Link href={path ? path : "/"}>{name}</Link>
												</span>
												<span>
													<i className={heroInner.separatorIcon}></i>
												</span>
											</React.Fragment>
									  ))
									: ""}
								<span>
									<span>{sliceText(text || title || "", 28, true)}</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroInner;
