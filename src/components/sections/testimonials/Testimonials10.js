"use client";
import TestimonialsCard9 from "@/components/shared/cards/TestimonialsCard9";
import testimonialsData from "@/data/sections/testimonials.json";
import getTestimonials from "@/libs/getTestimonials";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Testimonials10 = () => {
	const { subTitle, subTitleIcon, title, shapes } =
		testimonialsData.testimonials10;
	const showbleTestimonials = getTestimonials()?.slice(0, 4);
	const testimonials = [...showbleTestimonials, ...showbleTestimonials];

	return (
		<section className="h10-testimonial section-gap section-gap-x">
			<div className="container">
				<div className="row justify-content-between">
					<div className="col-12">
						<div className="sec-heading-wrap">
							<div className="heading-wrap-content">
								<div className="sec-heading style-3">
									<span className="sub-title wow fadeInUp" data-wow-delay=".3s">
										<i className={subTitleIcon}></i>
										{subTitle}
									</span>
									<h2 className="sec-title text-anim">{title}</h2>
								</div>
								<div
									className="slider-navigation d-none d-md-inline-flex wow fadeInUp"
									data-wow-delay=".5s"
								>
									<div className="slider-prev">
										<span className="anim-icon">
											<i className="tji-arrow-left"></i>
											<i className="tji-arrow-left"></i>
										</span>
									</div>
									<div className="slider-next">
										<span className="anim-icon">
											<i className="tji-arrow-right"></i>
											<i className="tji-arrow-right"></i>
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="container-fluid gap-0">
				<div className="row">
					<div className="col-12">
						<div
							className="testimonial-wrapper h8-testimonial-wrapper h10-testimonial-wrapper wow fadeInUp"
							data-wow-delay=".3s"
						>
							<Swiper
								slidesPerView={1}
								spaceBetween={20}
								loop={true}
								speed={1500}
								centeredSlides={true}
								navigation={{
									nextEl: ".slider-next",
									prevEl: ".slider-prev",
								}}
								pagination={{
									el: ".swiper-pagination-area",
									clickable: true,
								}}
								autoplay={{
									delay: 3000,
									disableOnInteraction: false,
								}}
								modules={[Pagination, Autoplay, Navigation]}
								breakpoints={{
									576: {
										slidesPerView: 1.5,
									},
									768: {
										slidesPerView: 2,
									},
									992: {
										slidesPerView: 2.2,
										spaceBetween: 30,
									},
									1200: {
										slidesPerView: 2.8,
										spaceBetween: 30,
									},
									1400: {
										slidesPerView: 4,
										spaceBetween: 30,
									},
								}}
								className="swiper-container h10-testimonial-slider"
							>
								{testimonials?.length
									? testimonials?.map((testimonial, idx) => (
											<SwiperSlide key={idx}>
												<TestimonialsCard9 testimonial={testimonial} />
											</SwiperSlide>
									  ))
									: ""}
								<div className="swiper-pagination-area swiper-pagination-clickable"></div>
							</Swiper>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-shape-1">
				<img src={shapes[0]} alt="" />
			</div>
			<div className="bg-shape-2">
				<img src={shapes[1]} alt="" />
			</div>
		</section>
	);
};

export default Testimonials10;
