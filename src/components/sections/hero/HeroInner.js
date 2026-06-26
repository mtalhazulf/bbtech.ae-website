import heroData from "@/data/sections/hero.json";
import sliceText from "@/libs/sliceText";
import Link from "next/link";
import React from "react";
const HeroInner = ({ title, text, breadcrums = [] }) => {
	const { heroInner } = heroData;
	return (
		<section className="tj-page-header section-gap-x">
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
									<span>{sliceText(text, 28, true)}</span>
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
