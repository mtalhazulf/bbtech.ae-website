import ctaData from "@/data/sections/cta.json";
import Link from "next/link";

const CtaSidebar = () => {
	const { ctaSidebar } = ctaData;
	return (
		<div className="feature-box">
			<div className="feature-content">
				<h2 className="title">{ctaSidebar.title}</h2>
				<span>{ctaSidebar.subtitle}</span>
				<Link
					className="read-more feature-contact"
					href={`tel:${ctaSidebar.phone.tel}`}
				>
					<i className={ctaSidebar.icon}></i>
					<span>{ctaSidebar.phone.display}</span>
				</Link>
			</div>
			<div className="feature-images">
				<img src={ctaSidebar.image} alt="" />
			</div>
		</div>
	);
};

export default CtaSidebar;
