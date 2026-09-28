import Image from "next/image";
import { Blocks } from "./textBlocks";

/**
 * Renders a { type: "richText", heading?, blocks, image? } content section.
 * Reuses the same "blog-text" copy container the template already uses for
 * long-form body copy (see ServicesDetailsPrimary), just data-driven.
 */
const RichTextSection = ({ heading, blocks, image }) => {
	return (
		<section className="tj-service-area section-gap-2">
			<div className="container">
				<div className="row">
					<div className="col-lg-10">
						{heading ? (
							<div className="sec-heading mb-30">
								<h2 className="sec-title title-anim">{heading}</h2>
							</div>
						) : null}
						{image ? (
							<div className="blog-images wow fadeInUp" data-wow-delay=".1s">
								<Image
									src={image.localPath}
									alt={image.alt || ""}
									width={image.width || 800}
									height={image.height || 500}
									style={{ height: "auto", width: "100%" }}
								/>
							</div>
						) : null}
						<div className="blog-text">
							<Blocks blocks={blocks} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default RichTextSection;
