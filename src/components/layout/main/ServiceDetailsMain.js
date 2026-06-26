import HeroInner from "@/components/sections/hero/HeroInner";
import ServicesDetailsPrimary from "@/components/sections/services/ServicesDetailsPrimary";
import servicesData from "@/data/sections/services.json";
import getALlServices from "@/libs/getALlServices";
import getPreviousNextItem from "@/libs/getPreviousNextItem";

const ServiceDetailsMain = ({ currentItemId }) => {
	const { fallbackTitle, breadcrumbs } = servicesData.serviceDetailsMain;
	const items = getALlServices();
	const currentId = currentItemId;
	const { prevId, nextId, currentItem, isPrevItem, isNextItem } =
		getPreviousNextItem(items, currentId);
	const { title } = currentItem || {};
	return (
		<div>
			<HeroInner
				title={title ? title : fallbackTitle}
				text={title ? title : fallbackTitle}
				breadcrums={breadcrumbs}
			/>
			<ServicesDetailsPrimary
				option={{
					currentItem,
					items,
					currentId,
					prevId,
					nextId,
					isPrevItem,
					isNextItem,
				}}
			/>
		</div>
	);
};

export default ServiceDetailsMain;
