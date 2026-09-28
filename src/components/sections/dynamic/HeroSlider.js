"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import modifyNumber from "@/libs/modifyNumber";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { A11y, Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

/**
 * @typedef {{ localPath: string, alt?: string, width: number, height: number }} PageImage
 * @typedef {{ title: string, subtitle?: string, image?: PageImage, cta?: { text: string, href: string }, mediaFit?: "cover" | "contain" }} HeroSlide
 */

/**
 * Home hero, dressed as the template's Hero10 (tinted rounded band, huge
 * banner title with the curve arrow, button + description row, pattern
 * shapes) and cycling the real slides from home.json with a cross-fade.
 * Every slide's image sits in the same rounded media card: photos fill it
 * (presentation key `mediaFit: "cover"`), transparent illustrations are
 * contained on the white card. A numbered slide navigator (the slides' own
 * titles, with an autoplay progress bar) and a pause button sit underneath.
 * The rotating badge only repeats a slide's own subtitle (the tagline) — no
 * template award copy. Hidden slides are `inert` so keyboard focus never
 * lands on an invisible button.
 *
 * @param {{ slides: HeroSlide[] }} props
 */
const HeroSlider = ({ slides = [] }) => {
	const swiperRef = useRef(null);
	const sectionRef = useRef(null);
	const [active, setActive] = useState(0);
	const [paused, setPaused] = useState(false);
	const badgeText = slides.find(slide => slide.subtitle)?.subtitle;

	useEffect(() => {
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (reduce.matches && swiperRef.current?.autoplay) {
			swiperRef.current.autoplay.stop();
			setPaused(true);
		}
	}, []);

	const togglePlayback = () => {
		const swiper = swiperRef.current;
		if (!swiper?.autoplay) return;
		if (paused) swiper.autoplay.start();
		else swiper.autoplay.stop();
		setPaused(!paused);
	};

	const goTo = idx => {
		const swiper = swiperRef.current;
		if (!swiper) return;
		if (swiper.params.loop) swiper.slideToLoop(idx);
		else swiper.slideTo(idx);
	};

	return (
		<section
			ref={sectionRef}
			className={`tj-banner-section-2 h10-hero section-gap-x ci-home-hero ${paused ? "is-paused" : ""}`}
		>
			<div className="container">
				<div className="ci-hero-stage">
					<Swiper
						slidesPerView={1}
						effect="fade"
						fadeEffect={{ crossFade: true }}
						loop={slides.length > 1}
						speed={900}
						autoplay={{ delay: 6500, disableOnInteraction: false }}
						modules={[EffectFade, Autoplay, A11y]}
						onSwiper={swiper => {
							swiperRef.current = swiper;
						}}
						onSlideChange={swiper => setActive(swiper.realIndex)}
						onAutoplayTimeLeft={(swiper, time, progress) => {
							sectionRef.current?.style.setProperty("--ci-hero-progress", String(1 - progress));
						}}
						className="ci-hero-slider"
					>
						{slides.map((slide, idx) => {
							const TitleTag = idx === 0 ? "h1" : "h2";
							// Keep the curve arrow glued to the last word so it never wraps onto a line alone.
							const splitAt = slide.title.lastIndexOf(" ") + 1;
							const titleHead = slide.title.slice(0, splitAt);
							const titleTail = slide.title.slice(splitAt);
							const mediaFit = slide.mediaFit === "cover" ? "is-cover" : "is-contain";
							const isHidden = idx !== active;
							return (
								<SwiperSlide key={idx} inert={isHidden} aria-hidden={isHidden ? "true" : undefined}>
									<div className="row ci-hero-row">
										<div className="col-12 col-lg-7">
											<div className="banner-content-2 ci-hero-content">
												<TitleTag className="banner-title ci-hero-title">
													{titleHead}
													<span className="ci-hero-title-end">
														{titleTail}{" "}
														<i className="tji-curve-arrow" aria-hidden="true"></i>
													</span>
												</TitleTag>
												{slide.subtitle || slide.cta ? (
													<div className="banner-desc-area">
														{slide.cta ? (
															<ButtonPrimary text={slide.cta.text} url={slide.cta.href} />
														) : null}
														{slide.subtitle ? (
															<p className="banner-desc">{slide.subtitle}</p>
														) : null}
													</div>
												) : null}
											</div>
										</div>
										<div className="col-12 col-lg-5">
											<div className={`ci-hero-media ${mediaFit}`}>
												{slide.image ? (
													<Image
														src={slide.image.localPath}
														alt={slide.image.alt || ""}
														width={slide.image.width}
														height={slide.image.height}
														sizes="(min-width: 1400px) 540px, (min-width: 992px) 42vw, 92vw"
														priority={idx === 0}
													/>
												) : null}
											</div>
										</div>
									</div>
								</SwiperSlide>
							);
						})}
					</Swiper>
					{badgeText ? (
						<div className="ci-hero-badge circle-text-wrap" aria-hidden="true">
							<svg className="circle-text ci-hero-badge-text" viewBox="0 0 160 160">
								<defs>
									<path
										id="ci-hero-badge-path"
										d="M80,80 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0"
									/>
								</defs>
								<text>
									<textPath href="#ci-hero-badge-path" textLength="385" lengthAdjust="spacing">
										{`${badgeText} • ${badgeText} • `}
									</textPath>
								</text>
							</svg>
							<div className="circle-icon">
								<Image
									src="/images/logos/logo.webp"
									alt=""
									width={152}
									height={224}
									className="ci-hero-badge-logo"
								/>
							</div>
						</div>
					) : null}
				</div>
				{slides.length > 1 ? (
					<div className="ci-hero-nav">
						<div className="ci-hero-thumbs">
							{slides.map((slide, idx) => (
								<button
									key={idx}
									type="button"
									className={`ci-hero-thumb ${active === idx ? "active" : ""}`}
									aria-label={`${modifyNumber(idx + 1)}: ${slide.title}`}
									aria-current={active === idx ? "true" : undefined}
									onClick={() => goTo(idx)}
								>
									<span className="ci-hero-thumb-bar" aria-hidden="true"></span>
									<span className="ci-hero-thumb-num" aria-hidden="true">
										{modifyNumber(idx + 1)}
									</span>
									<span className="ci-hero-thumb-title" aria-hidden="true">
										{slide.title}
									</span>
								</button>
							))}
						</div>
						<button
							type="button"
							className="ci-hero-toggle"
							onClick={togglePlayback}
							aria-label={paused ? "Play slideshow" : "Pause slideshow"}
						>
							<i className={paused ? "fa-regular fa-play" : "fa-regular fa-pause"} aria-hidden="true"></i>
						</button>
					</div>
				) : null}
			</div>
			<div className="bg-shape-1">
				<img src="/images/shape/pattern-2.svg" alt="" />
			</div>
			<div className="bg-shape-2">
				<img src="/images/shape/pattern-3.svg" alt="" />
			</div>
		</section>
	);
};

export default HeroSlider;
