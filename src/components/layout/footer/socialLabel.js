/**
 * Accessible name for a social link, in the live bbtech.ae wording
 * ("Facebook page opens in new window"), keyed by site.json socials[].platform.
 * Shared by the footers, the top bar and the desktop offcanvas.
 */
const SOCIAL_NAMES = {
	facebook: "Facebook",
	twitter: "Twitter",
	linkedin: "Linkedin",
	instagram: "Instagram",
};

const getSocialLabel = (platform) => {
	const name =
		SOCIAL_NAMES[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
	return `${name} page opens in new window`;
};

export default getSocialLabel;
