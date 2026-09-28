import Image from "next/image";

/**
 * ISO badges in the template's Brands3 band (".tj-client-section-2.h6-client":
 * theme-colored rounded strip, dotted uppercase title, logo tiles). Four real
 * badges don't fill a looping marquee, so they sit in a static row.
 */
const HomeCertifications = ({ section }) => {
	const items = (section.items || []).filter(item => item.image);
	return (
		<section
			className="tj-client-section-2 h6-client section-gap-x ci-home-certs wow fadeInUp"
			data-wow-delay=".3s"
		>
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="h6-client-title-wrapper">
							<h2 className="h6-client-title">{section.heading}</h2>
						</div>
					</div>
				</div>
				<div className="row row-gap-3 justify-content-center">
					{items.map((item, idx) => (
						<div key={idx} className="col-6 col-lg-3">
							<div className="client-logo ci-cert-logo">
								<Image
									src={item.image.localPath}
									alt={item.image.alt || ""}
									width={item.image.width}
									height={item.image.height}
									sizes="(min-width: 992px) 300px, 45vw"
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HomeCertifications;
