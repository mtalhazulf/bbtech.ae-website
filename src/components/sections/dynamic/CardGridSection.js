import Image from "next/image";
import Link from "next/link";
import { CheckList, Segments } from "./textBlocks";

function CardBody({ item }) {
	if (item.list) return <CheckList items={item.list} />;
	if (item.text) {
		return (
			<p className="desc">
				<Segments segments={item.text} />
			</p>
		);
	}
	return null;
}

function Icon({ icon }) {
	if (!icon) return null;
	// Most pages give a bexon-icons/FontAwesome class string; a few extraction agents used
	// a full downloaded image instead (e.g. home.json's icon-as-photo cards) — render
	// whichever shape actually came through rather than dropping it.
	if (typeof icon === "string") {
		return (
			<div className="choose-icon">
				<i className={icon}></i>
			</div>
		);
	}
	return (
		<div className="choose-icon">
			<Image
				src={icon.localPath}
				alt={icon.alt || ""}
				width={icon.width || 60}
				height={icon.height || 60}
				style={{ height: "60px", width: "auto" }}
			/>
		</div>
	);
}

function Card({ item }) {
	const title = item.href ? <Link href={item.href}>{item.title}</Link> : item.title;
	return (
		<div className="choose-box right-swipe">
			{item.image ? (
				<div className="choose-image">
					<Image
						src={item.image.localPath}
						alt={item.image.alt || ""}
						width={item.image.width || 400}
						height={item.image.height || 300}
						style={{ height: "auto", width: "100%" }}
					/>
				</div>
			) : null}
			<div className="choose-content">
				<Icon icon={item.icon} />
				{item.category || item.date ? (
					<div className="meta">
						{item.category ? (
							<Link href={item.category.href || "#"}>{item.category.text}</Link>
						) : null}
						{item.date ? <span>{item.date}</span> : null}
					</div>
				) : null}
				<h4 className="title">{title}</h4>
				<CardBody item={item} />
				{item.href ? (
					<Link href={item.href} className="text-btn">
						<span>Details</span>
						<i className="tji-arrow-right-long"></i>
					</Link>
				) : null}
			</div>
		</div>
	);
}

/** Renders a { type: "cardGrid", heading?, text?, image?, items } content section. */
const CardGridSection = ({ heading, text, image, items }) => {
	return (
		<section className="tj-choose-section section-gap-2">
			<div className="container">
				{heading || text || image ? (
					<div className="row align-items-center">
						<div className={image ? "col-lg-6" : "col-12"}>
							{heading ? (
								<div className="sec-heading">
									<h2 className="sec-title title-anim">{heading}</h2>
								</div>
							) : null}
							{text ? (
								<p className="desc">
									<Segments segments={text} />
								</p>
							) : null}
						</div>
						{image ? (
							<div className="col-lg-6">
								<Image
									src={image.localPath}
									alt={image.alt || ""}
									width={image.width || 600}
									height={image.height || 450}
									style={{ height: "auto", width: "100%" }}
								/>
							</div>
						) : null}
					</div>
				) : null}
				<div className="row row-gap-4 rightSwipeWrap">
					{items.map((item, idx) => (
						<div key={idx} className="col-lg-4 col-md-6">
							<Card item={item} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default CardGridSection;
