import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import errorData from "@/data/sections/error.json";
import Image from "next/image";

const ErrorPrimary = () => {
	return (
		<section className="tj-error-section">
			<div className="container">
				<div className="row">
					<div className="col-12">
						<div className="tj-error-wrap text-center">
							<div className="tj-error-content">
								<div className="error-img">
									<Image
										src={errorData.image}
										alt=""
										width={errorData.imageWidth}
										height={errorData.imageHeight}
										style={{ height: "auto" }}
									/>
								</div>
								<h2 className="error-title title-anim">
									{errorData.title}
								</h2>
								<div className="error-desc">{errorData.desc}</div>
								<ButtonPrimary
									text={errorData.button.text}
									url={errorData.button.url}
									className={"error-btn"}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ErrorPrimary;
