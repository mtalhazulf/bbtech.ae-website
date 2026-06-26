import getNavItems from "@/libs/getNavItems";
import Link from "next/link";
import MobileMenuItem from "./MobileMenuItem";

const MobileNavbar = () => {
	const navItems = getNavItems();
	const homeNav = navItems[0];
	const industriesNav = navItems[1];
	const solutionsNav = navItems[2];
	const serviceNav = navItems[3];
	const contactNav = navItems[4];
	return (
		<div className="hamburger_menu">
			<div className="mobile_menu mean-container">
				<div className="mean-bar">
					<Link
						href="#nav"
						className="meanmenu-reveal"
						style={{ right: 0, left: "auto" }}
					>
						<span>
							<span>
								<span></span>
							</span>
						</span>
					</Link>
					<nav className="mean-nav">
						<ul>
							<li>
								<Link href={homeNav?.path ? homeNav?.path : "#"}>
									{homeNav?.name}
								</Link>
							</li>
							<li>
								<Link href={industriesNav?.path ? industriesNav?.path : "#"}>
									{industriesNav?.name}
								</Link>
							</li>
							<li>
								<Link href={solutionsNav?.path ? solutionsNav?.path : "#"}>
									{solutionsNav?.name}
								</Link>
							</li>
							<MobileMenuItem
								text={serviceNav?.name}
								url={serviceNav?.path ? serviceNav?.path : "#"}
								submenuClass={"mega-menu-service"}
							>
								{serviceNav?.submenu?.length
									? serviceNav?.submenu?.map((item, idx) => (
											<li key={idx}>
												<Link
													className="mega-menu-service-single"
													href={item?.path ? item?.path : "/"}
												>
													{" "}
													<span className="mega-menu-service-icon">
														<i
															className={
																item?.icon ? item?.icon : "tji-service-1"
															}
														></i>
													</span>{" "}
													<span className="mega-menu-service-title">
														{item?.name
															? item?.name
															: "Business process optimization"}
													</span>{" "}
													<span className="mega-menu-service-nav">
														<i className="tji-arrow-right-long"></i>
														<i className="tji-arrow-right-long"></i>
													</span>
												</Link>
											</li>
									  ))
									: ""}
							</MobileMenuItem>
							<li className="mean-last">
								<Link href={contactNav?.path ? contactNav?.path : "#"}>
									{" "}
									{contactNav?.name ? contactNav?.name : "Contact"}
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</div>
	);
};

export default MobileNavbar;
