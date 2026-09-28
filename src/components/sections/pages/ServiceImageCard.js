import modifyNumber from "@/libs/modifyNumber";
import Image from "next/image";
import Link from "next/link";
import PageSegments from "./PageSegments";

/**
 * Image-led service card built on the template's h6 service card markup
 * (.h6-service-item > .h6-service-thumb + .h6-service-content with an index number,
 * title, description and a text-btn arrow link). Text renders verbatim; "\n" line
 * breaks in the description are kept via `white-space: pre-line`.
 *
 * @param {{ item: { title: string, text?: any, href?: string, image?: { localPath: string, alt?: string, width: number, height: number, fit?: "cover" | "contain" } }, idx: number, linkText?: string }} props
 */
const ServiceImageCard = ({ item, idx, linkText = "Details" }) => {
	const { title, text, href, image } = item;
	const thumb = image ? (
		<Image
			src={image.localPath}
			alt={image.alt || ""}
			width={image.width}
			height={image.height}
			sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 400px"
		/>
	) : null;

	return (
		<div className="h6-service-item ci-service-card">
			{image ? (
				<div className={`h6-service-thumb ${image.fit === "contain" ? "is-contain" : ""}`}>
					{href ? (
						<Link href={href} tabIndex={-1} aria-hidden="true">
							{thumb}
						</Link>
					) : (
						thumb
					)}
					<span className="ci-service-index">{modifyNumber(idx + 1)}.</span>
				</div>
			) : null}
			<div className="h6-service-content">
				<h3 className="title">{href ? <Link href={href}>{title}</Link> : title}</h3>
				{text ? (
					<p className="desc">
						<PageSegments segments={text} />
					</p>
				) : null}
				{href ? (
					<Link className="text-btn" href={href} aria-label={`${linkText}: ${title}`}>
						<span className="btn-text">
							<span>{linkText}</span>
						</span>
						<span className="btn-icon">
							<i className="tji-arrow-right-long" aria-hidden="true"></i>
						</span>
					</Link>
				) : null}
			</div>
		</div>
	);
};

export default ServiceImageCard;
