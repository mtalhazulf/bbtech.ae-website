"use client";

import getSiteConfig from "@/libs/getSiteConfig";
import Image from "next/image";
import Link from "next/link";
const Logo = ({ headerType, isStickyHeader }) => {
	const { logos } = getSiteConfig();
	return (
		<div className="site_logo">
			<Link className="logo" href="/">
				<Image
					src={
						(headerType === 2 ||
							headerType === 5 ||
							headerType === 7 ||
							headerType === 9) &&
						!isStickyHeader
							? logos.light
							: logos.primary
					}
					alt={logos.alt}
					width={114}
					height={168}
					style={{ height: "52px", width: "auto" }}
				/>
			</Link>
		</div>
	);
};

export default Logo;
