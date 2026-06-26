"use client";
import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import ReactNiceSelect from "@/components/shared/Inputs/ReactNiceSelect";
import contactData from "@/data/sections/contact.json";
import getSiteConfig from "@/libs/getSiteConfig";
import Link from "next/link";

const Contact2 = () => {
	const { offices } = getSiteConfig();
	const { serviceOptions, form2, map2 } = contactData;
	return (
		<section className="tj-contact-section section-gap section-gap-x">
			<div className="container">
				<div className="row">
					<div className="col-lg-6">
						<div className="global-map wow fadeInUp" data-wow-delay=".3s">
							<div className="global-map-img">
								<img src={map2.img} alt="Image" />
								{offices.map((office, index) => (
									<div
										className={`location-indicator loc-${index + 1}`}
										key={index}
									>
										<div className="location-tooltip">
											<span>{office.label}</span>
											<p>{office.address}</p>
											<Link href={`tel:${office.phone.tel}`}>
												P: {office.phone.display}
											</Link>
											<Link href={`mailto:${office.email}`}>
												M: {office.email}
											</Link>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="col-lg-6">
						<div
							className="contact-form style-2 wow fadeInUp"
							data-wow-delay=".4s"
						>
							<div className="sec-heading">
								<span className="sub-title text-white">
									<i className="tji-box"></i>
									{form2.subTitle}
								</span>
								<h2 className="sec-title title-anim">
									{form2.titlePrefix}
									<span>{form2.titleHighlight}</span>
								</h2>
							</div>
							<form id="contact-form-2">
								<div className="row wow fadeInUp" data-wow-delay=".5s">
									<div className="col-sm-6">
										<div className="form-input">
											<input
												type="text"
												name="cfName2"
												placeholder="Full Name *"
											/>
										</div>
									</div>
									<div className="col-sm-6">
										<div className="form-input">
											<input
												type="email"
												name="cfEmail2"
												placeholder="Email Address *"
											/>
										</div>
									</div>
									<div className="col-sm-6">
										<div className="form-input">
											<input
												type="tel"
												name="cfPhone2"
												placeholder="Phone number *"
											/>
										</div>
									</div>
									<div className="col-sm-6">
										<div className="form-input">
											<div className="tj-nice-select-box">
												<div className="tj-select">
													<ReactNiceSelect
														selectedIndex={0}
														options={serviceOptions}
													/>
												</div>
											</div>
										</div>
									</div>
									<div className="col-sm-12">
										<div className="form-input message-input">
											<textarea
												name="cfMessage2"
												id="message"
												placeholder="Type message *"
											></textarea>
										</div>
									</div>
									<div className="submit-btn">
										<ButtonPrimary text={"Send Message"} type={"submit"} />
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
			{form2.shapes.map((shape, index) => (
				<div className={`bg-shape-${index + 1}`} key={index}>
					<img src={shape} alt="" />
				</div>
			))}
		</section>
	);
};

export default Contact2;
