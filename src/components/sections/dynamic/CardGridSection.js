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
				{item.icon ? (
					<div className="choose-icon">
						<i className={item.icon}></i>
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

/** Renders a { type: "cardGrid", heading?, items } content section. */
const CardGridSection = ({ heading, items }) => {
	return (
		<section className="tj-choose-section section-gap-2">
			<div className="container">
				{heading ? (
					<div className="row">
						<div className="col-12">
							<div className="sec-heading">
								<h2 className="sec-title title-anim">{heading}</h2>
							</div>
						</div>
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
