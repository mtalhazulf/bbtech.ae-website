"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

/**
 * Home page hero, driven by { type: "slider", slides: [{ title, subtitle?, image?, cta? }] }.
 * Some live slide backgrounds are confirmed-dead links on bbtech.ae (see
 * content-import/needs-client-input.md) and were intentionally not substituted with
 * unrelated imagery — those slides fall back to a token-based background color instead
 * of a broken or fabricated image.
 */
const HeroSlider = ({ slides }) => {
	return (
		<section className="tj-hero-slider">
			<Swiper
				slidesPerView={1}
				loop={slides.length > 1}
				speed={800}
				autoplay={{ delay: 6000, disableOnInteraction: false }}
				pagination={{ el: ".hero-slider-pagination", clickable: true }}
				modules={[Pagination, Autoplay]}
			>
				{slides.map((slide, idx) => (
					<SwiperSlide key={idx}>
						<div
							className="hero-slide"
							style={{
								position: "relative",
								backgroundColor: "var(--tj-color-theme-dark)",
								minHeight: "480px",
								display: "flex",
								alignItems: "center",
							}}
						>
							{slide.image ? (
								<Image
									src={slide.image.localPath}
									alt={slide.image.alt || ""}
									fill
									style={{ objectFit: "cover", zIndex: 0 }}
									priority={idx === 0}
								/>
							) : null}
							<div className="container" style={{ position: "relative", zIndex: 1 }}>
								<div className="row">
									<div className="col-lg-8">
										<h1 className="title title-anim" style={{ color: "var(--tj-color-common-white, #fff)" }}>
											{slide.title}
										</h1>
										{slide.subtitle ? (
											<p className="desc" style={{ color: "var(--tj-color-text-body-2)" }}>
												{slide.subtitle}
											</p>
										) : null}
										{slide.cta ? (
											<div className="hero-btn">
												<ButtonPrimary text={slide.cta.text} url={slide.cta.href} />
											</div>
										) : null}
									</div>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}
				<div className="hero-slider-pagination"></div>
			</Swiper>
		</section>
	);
};

export default HeroSlider;
