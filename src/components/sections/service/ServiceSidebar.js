import CtaSidebar from "@/components/sections/cta/CtaSidebar";
import Link from "next/link";
import { sidebarMenus } from "./sidebarMenus";

function MenuLink({ item, currentPath }) {
	const active = item.href === currentPath;
	return (
		<Link className={active ? "active" : ""} href={item.href} aria-current={active ? "page" : undefined}>
			{item.label}
			<span className="icon" aria-hidden="true">
				<i className="tji-arrow-right"></i>
			</span>
		</Link>
	);
}

/**
 * Service-page sidebar: the live menu widget (current page highlighted) and the contact
 * card. Rendered in a <div> (not <aside>) and pinned by the template's declarative
 * "slidebar-stickiy" hook (src/libs/sidebarSticky.js) on desktop. Holds no page-JSON copy.
 */
const ServiceSidebar = ({ menu = "services", currentPath, contactDesktopOnly = false }) => {
	const data = sidebarMenus[menu] || sidebarMenus.services;
	const contactClass = `tj-sidebar-widget widget-feature-item wow fadeInUp ${contactDesktopOnly ? "d-none d-lg-block" : ""}`.trim();
	return (
		<div className="tj-main-sidebar ci-sidebar slidebar-stickiy">
			<div className="tj-sidebar-widget service-categories wow fadeInUp" data-wow-delay=".1s">
				{data.title ? <h4 className="widget-title">{data.title}</h4> : null}
				<ul>
					{data.items.map((item, idx) => (
						<li key={idx}>
							<MenuLink item={item} currentPath={currentPath} />
							{item.children?.length ? (
								<ul className="sub-menu">
									{item.children.map((child, cIdx) => (
										<li key={cIdx}>
											<MenuLink item={child} currentPath={currentPath} />
										</li>
									))}
								</ul>
							) : null}
						</li>
					))}
				</ul>
			</div>
			<div className={contactClass} data-wow-delay=".3s">
				<CtaSidebar />
			</div>
		</div>
	);
};

export default ServiceSidebar;
