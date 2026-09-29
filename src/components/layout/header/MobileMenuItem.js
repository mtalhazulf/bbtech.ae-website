"use client";

import Link from "next/link";
import { useId, useState } from "react";

const MobileMenuItem = ({ children, text, url, submenuClass }) => {
	const [isOpen, setIsOpen] = useState(false);
	const submenuId = useId();

	return (
		<li className={`has-dropdown ${isOpen ? "dropdown-opened" : ""}`}>
			<Link href={url ? url : "#"}>{text}</Link>
			<ul
				id={submenuId}
				className={`sub-menu ${submenuClass ? submenuClass : ""}`}
				style={{ display: !isOpen ? "none" : "" }}
			>
				{children}
			</ul>
			<button
				type="button"
				className={`mean-expand ${isOpen ? "mean-clicked" : ""}`}
				style={{ fontSize: "18px" }}
				onClick={() => setIsOpen(prevIsOpen => !prevIsOpen)}
				aria-expanded={isOpen}
				aria-controls={submenuId}
				aria-label={`${isOpen ? "Collapse" : "Expand"} ${text} submenu`}
			>
				<i className="tji-arrow-down" aria-hidden="true"></i>
			</button>
		</li>
	);
};

export default MobileMenuItem;
