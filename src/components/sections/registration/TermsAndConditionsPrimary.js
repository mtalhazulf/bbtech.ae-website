import termsData from "@/data/sections/terms.json";
import Link from "next/link";

const TermsAndConditionsPrimary = () => {
	const {
		heading,
		pill,
		lastUpdated,
		intro,
		note,
		toc,
		definitions,
		license,
		restrictions,
		support,
		updates,
		disclaimer,
	} = termsData;
	return (
		<section className="terms-and-conditions section-gap">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-10">
						<div className="terms-and-conditions-wrapper">
							<div>
								<h2>
									{heading} <span className="pill">{pill}</span>
								</h2>
								<p className="muted">{lastUpdated}</p>
								<p>
									{intro.before}
									<strong>{intro.strong}</strong>
									{intro.afterStrong}
									<Link
										href={intro.link1.href}
										target="_blank"
										rel="noopener"
									>
										{intro.link1.text}
									</Link>
									{intro.betweenLinks}
									<Link
										href={intro.link2.href}
										target="_blank"
										rel="noopener"
									>
										{intro.link2.text}
									</Link>
									{intro.afterLink2}
								</p>
								<div className="note">
									<strong>{note.label}</strong>
									{note.text}
								</div>
							</div>

							<nav className="toc" aria-label="Table of contents">
								<h2>{toc.heading}</h2>
								<ol>
									{toc.items.map((item, index) => (
										<li key={index}>
											<button
												className="tj-scroll-btn"
												data-target={item.target}
											>
												{item.label}
											</button>
										</li>
									))}
								</ol>
							</nav>

							<div id={definitions.id}>
								<h3>{definitions.heading}</h3>
								<p>
									<strong>{definitions.weUs.strong}</strong>
									{definitions.weUs.middle}
									<em>
										<Link href={definitions.weUs.link.href}>
											{definitions.weUs.link.text}
										</Link>
									</em>
									{definitions.weUs.after}
								</p>
								<p>
									<strong>{definitions.you.strong}</strong>
									{definitions.you.after}
								</p>
								<p>
									<strong>{definitions.license.strong}</strong>
									{definitions.license.middle}
									<Link
										href={definitions.license.link.href}
										target="_blank"
										rel="noopener"
									>
										{definitions.license.link.text}
									</Link>
									{definitions.license.after}
								</p>
							</div>

							<div id={license.id}>
								<h3>{license.heading}</h3>
								<p>{license.intro}</p>
								<ul>
									{license.items.map((item, index) => (
										<li key={index}>
											<strong>{item.strong}</strong>
											{item.before}
											<em>{item.em}</em>
											{item.after}
										</li>
									))}
								</ul>
								<p>
									{license.outro.before}
									<strong>{license.outro.strong}</strong>
									{license.outro.after}
								</p>
							</div>

							<div id={restrictions.id}>
								<h3>{restrictions.heading}</h3>
								<p>
									{restrictions.intro.before}
									<strong>{restrictions.intro.strong}</strong>
									{restrictions.intro.after}
								</p>
								<ul>
									{restrictions.items.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							</div>

							<div id={support.id}>
								<h3>{support.heading}</h3>
								<p>
									{support.intro.before}
									<Link
										href={support.intro.link.href}
										target="_blank"
										rel="noopener"
									>
										{support.intro.link.text}
									</Link>
									{support.intro.after}
								</p>
								<p>
									<strong>{support.includedLabel}</strong>
								</p>
								<ul>
									{support.included.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
								<p>
									<strong>{support.notIncludedLabel}</strong>
								</p>
								<ul>
									{support.notIncluded.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
								<p>
									<strong>{support.howTo.strong}</strong>
									{support.howTo.before}
									<em>{support.howTo.em1}</em>
									{support.howTo.middle}
									<em>{support.howTo.em2}</em>
									{support.howTo.after}
								</p>
							</div>

							<div id={updates.id}>
								<h3>{updates.heading}</h3>
								<p>{updates.intro}</p>
								<ul>
									{updates.items.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							</div>
							<p className="muted">
								<small>{disclaimer}</small>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TermsAndConditionsPrimary;
