import { Fragment } from "react";
import HighlightTitle from "./HighlightTitle";
import PageSegments from "./PageSegments";

const ICONS = [
	[/phone|call|tel/i, "tji-phone"],
	[/mail/i, "tji-envelop"],
	[/address|location|office/i, "tji-location-3"],
	[/hour|time|open/i, "tji-clock"],
];

function iconFor(title) {
	const hit = ICONS.find(([re]) => re.test(title || ""));
	return hit ? hit[1] : "tji-box";
}

/** Groups a richText block list into cards: each heading block starts a card, the paragraphs after it are its details. */
function toCards(blocks = []) {
	const cards = [];
	for (const block of blocks) {
		if (block.h) cards.push({ title: block.text, paragraphs: [] });
		else if (block.p) {
			if (!cards.length) cards.push({ title: null, paragraphs: [] });
			cards[cards.length - 1].paragraphs.push(block.p);
		}
	}
	return cards;
}

const PHONE_LINE = /^\s*\(?\+?[\d\s()-]{7,}\s*$/;

/** A plain-string paragraph of phone numbers ("…\n…") keeps its exact text, with each number made tappable. */
function PhoneLines({ text }) {
	const lines = text.split("\n");
	return lines.map((line, i) => (
		<Fragment key={i}>
			{PHONE_LINE.test(line) ? <a href={`tel:${line.replace(/[^\d+]/g, "")}`}>{line}</a> : line}
			{i < lines.length - 1 ? "\n" : null}
		</Fragment>
	));
}

/** A paragraph that is only a short plain-text label ending in ":" (e.g. "UAE:", "Pakistan:"). */
function isLabelParagraph(segments) {
	const list = Array.isArray(segments) ? segments : [segments];
	return list.length === 1 && typeof list[0] === "string" && /:\s*$/.test(list[0]);
}

/**
 * Splits a card's paragraphs into label-led groups ("UAE:" + its lines, "Pakistan:" + its
 * lines). A card with two or more such groups is shown as a wide card with the groups side
 * by side, so a long multi-office address doesn't stretch the short cards next to it.
 */
function toGroups(paragraphs) {
	const groups = [];
	for (const p of paragraphs) {
		if (isLabelParagraph(p) || !groups.length) groups.push([p]);
		else groups[groups.length - 1].push(p);
	}
	const labelled = groups.filter((g) => isLabelParagraph(g[0]));
	return labelled.length >= 2 ? groups : null;
}

function Detail({ segments, isPhoneCard }) {
	const list = Array.isArray(segments) ? segments : [segments];
	const isLabel = isLabelParagraph(list);
	const hasLink = list.some((s) => typeof s === "object" && s?.href);
	const className = [isLabel ? "ci-contact-label" : "", hasLink && list.some((s) => typeof s === "string" && s.trim()) ? "active" : ""]
		.filter(Boolean)
		.join(" ");
	return (
		<li className={className || undefined}>
			{isPhoneCard && list.length === 1 && typeof list[0] === "string" ? (
				<PhoneLines text={list[0]} />
			) : (
				<PageSegments segments={list} />
			)}
		</li>
	);
}

/** Column classes for the row of short cards: 3-up (4-up for four or more) on desktop, 2-up on tablets. */
function shortColumns(count) {
	return Array.from({ length: count }, (_, i) => {
		if (count >= 4) return "col-xl-3 col-md-6";
		if (count === 3) return i === 2 ? "col-lg-4 col-md-12" : "col-lg-4 col-md-6";
		if (count === 2) return "col-md-6";
		return "col-12";
	});
}

function CardHead({ title }) {
	return (
		<>
			<div className="contact-icon" aria-hidden="true">
				<i className={iconFor(title)}></i>
			</div>
			{title ? <h3 className="contact-title">{title}</h3> : null}
		</>
	);
}

/**
 * The template's ContactTop (".tj-contact-area" heading + ".contact-item.style-2" icon
 * cards), driven by a richText section of heading/paragraph pairs. Every heading and
 * paragraph string renders verbatim, one card per heading. Short cards sit in one row; a
 * card made of several labelled groups (a multi-office address) follows as one wide card.
 */
const ContactInfoCards = ({ section, eyebrow, heading, highlight }) => {
	const cards = toCards(section.blocks).map((card) => ({ ...card, groups: toGroups(card.paragraphs) }));
	const shortCards = cards.filter((card) => !card.groups);
	const wideCards = cards.filter((card) => card.groups);
	const cols = shortColumns(shortCards.length);
	return (
		<section className="tj-contact-area ci-contact-info section-gap">
			<div className="container">
				{eyebrow || heading ? (
					<div className="row">
						<div className="col-12">
							<div className="sec-heading text-center">
								{eyebrow ? (
									<span className="sub-title wow fadeInUp" data-wow-delay=".1s">
										<i className="tji-box" aria-hidden="true"></i>
										{eyebrow}
									</span>
								) : null}
								{heading ? (
									<h2 className="sec-title title-anim">
										<HighlightTitle text={heading} highlight={highlight} />
									</h2>
								) : null}
							</div>
						</div>
					</div>
				) : null}
				<div className="row row-gap-4">
					{shortCards.map((card, i) => {
						const isPhoneCard = /phone/i.test(card.title || "");
						return (
							<div key={`s${i}`} className={cols[i]}>
								<div className="contact-item style-2 ci-contact-card wow fadeInUp" data-wow-delay={`.${i * 2 + 3}s`}>
									<CardHead title={card.title} />
									<ul className="contact-list">
										{card.paragraphs.map((p, j) => (
											<Detail key={j} segments={p} isPhoneCard={isPhoneCard} />
										))}
									</ul>
								</div>
							</div>
						);
					})}
					{wideCards.map((card, i) => {
						const isPhoneCard = /phone/i.test(card.title || "");
						return (
							<div key={`w${i}`} className="col-12">
								<div className="contact-item style-2 ci-contact-card ci-contact-wide wow fadeInUp" data-wow-delay=".3s">
									<div className="ci-wide-head">
										<CardHead title={card.title} />
									</div>
									<div className="ci-wide-groups">
										{card.groups.map((group, g) => (
											<ul key={g} className="contact-list ci-contact-group">
												{group.map((p, j) => (
													<Detail key={j} segments={p} isPhoneCard={isPhoneCard} />
												))}
											</ul>
										))}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default ContactInfoCards;
