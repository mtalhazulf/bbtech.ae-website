"use client";
import { Autoplay, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

/**
 * The template's TextMarquee band (outlined text on the theme color),
 * scrolling real headings passed in from the page JSON. Purely decorative:
 * the same headings render as real content elsewhere on the page, so the
 * band is hidden from assistive tech.
 *
 * @param {{ items: string[] }} props
 */
const HomeMarquee = ({ items = [] }) => {
	if (!items.length) return null;
	// Repeat the list so the continuous loop always has enough slides to fill wide screens.
	const loopItems = [...items, ...items, ...items];
	return (
		<section className="tj-marquee-section section-gap-x ci-home-marquee" aria-hidden="true">
			<div className="marquee-wrapper">
				<Swiper
					slidesPerView="auto"
					spaceBetween={0}
					freeMode={true}
					loop={true}
					speed={9000}
					allowTouchMove={false}
					autoplay={{ delay: 0, disableOnInteraction: false }}
					className="marquee-slider"
					modules={[Autoplay, FreeMode]}
					onSwiper={swiper => {
						if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
							swiper.autoplay?.stop();
						}
					}}
				>
					{loopItems.map((title, idx) => (
						<SwiperSlide key={idx} className="marquee-item">
							<span className="marquee-text">{title}</span>
							<span className="ci-marquee-sep">
								<i className="tji-star-2"></i>
							</span>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</section>
	);
};

export default HomeMarquee;
