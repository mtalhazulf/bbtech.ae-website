import siteConfig from "@/data/site.json";
import { resolveFacts } from "@/libs/resolveFacts";

// Resolved once per module load (Node, build time for the static export) — see
// resolveFacts.js. site.json's own contact/header/footer phone-number and email
// fields are themselves {{facts.*}} tokens, so every consumer of getSiteConfig()
// gets the single facts block's values without knowing the token syntax exists.
const resolved = resolveFacts(siteConfig);

const getSiteConfig = () => {
	return resolved;
};

export default getSiteConfig;
