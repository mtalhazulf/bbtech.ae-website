import Image from "next/image";
import Link from "next/link";
import HighlightText from "./HighlightText";

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/**
 * "2020-08-05" -> "August 5, 2020", the format the live site prints (plain
 * string math, so server and client agree).
 */
const formatDate = iso => {
	const [year, month, day] = (iso || "").split("-");
	const monthName = MONTHS[Number(month) - 1];
	return year && monthName && day ? `${monthName} ${Number(day)}, ${year}` : iso;
};

/**
 * Latest News as blog cards: image, date + category meta, title, excerpt
 * and the live "Read more" link.
 */
const HomeNews = ({ section }) => {
	const items = section.items || [];
	return (
		<section className="section-gap ci-home-news">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="sec-heading style-3 text-center ci-news-heading">
							<h2 className="sec-title text-anim">
								<HighlightText text={section.heading} highlight={section.highlight} />
							</h2>
						</div>
					</div>
				</div>
				<div className="row row-gap-4">
					{items.map((item, idx) => (
						<div key={idx} className="col-12 col-lg-6">
							<article
								className="ci-news-card wow fadeInUp"
								data-wow-delay={`.${idx + 3}s`}
							>
								{item.image ? (
									<Link href={item.href || "#"} className="ci-news-thumb" tabIndex={-1} aria-hidden="true">
										<Image
											src={item.image.localPath}
											alt={item.image.alt || ""}
											width={item.image.width}
											height={item.image.height}
											sizes="(min-width: 992px) 280px, 90vw"
										/>
									</Link>
								) : null}
								<div className="ci-news-body">
									<div className="ci-news-meta">
										{item.date ? (
											<time className="ci-news-date" dateTime={item.date}>
												<i className="tji-calendar" aria-hidden="true"></i>
												{formatDate(item.date)}
											</time>
										) : null}
										{item.category?.text ? (
											<Link className="ci-news-cat" href={item.category.href || "/"}>
												{item.category.text}
											</Link>
										) : null}
									</div>
									<h3 className="ci-news-title">
										<Link href={item.href || "#"}>{item.title}</Link>
									</h3>
									{item.text ? <p className="desc">{item.text}</p> : null}
									{item.href ? (
										<Link className="text-btn ci-news-link" href={item.href}>
											<span className="btn-text">
												<span>Read more</span>
											</span>
											<span className="btn-icon">
												<i className="tji-arrow-right-long" aria-hidden="true"></i>
											</span>
										</Link>
									) : null}
								</div>
							</article>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HomeNews;
