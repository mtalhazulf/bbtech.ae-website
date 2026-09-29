// Static page registry for the catch-all content route (src/app/[...slug]/page.js).
// Every real page from the content import lives here, keyed by its path with no leading
// or trailing slash (e.g. "services/erp" for /services/erp/, "home" for /).
//
// Bespoke routes (/, /about-us/, /contact/, /services/) have their own dedicated page
// files and do NOT go through the catch-all, but are still registered here for
// consistency and so other tooling (sitemap.js, verify.mjs) has one source of truth.
import page_home from "@/data/pages/home.json";
import page_2020_08_05_new_corporate_logo_updated_branding from "@/data/pages/2020/08/05/new-corporate-logo-updated-branding.json";
import page_2020_08_05_update_of_the_branding from "@/data/pages/2020/08/05/update-of-the-branding.json";
import page_about_us from "@/data/pages/about-us.json";
import page_adhics_medical_inspection_consultancy from "@/data/pages/adhics-medical-inspection-consultancy.json";
import page_branding_rebranding from "@/data/pages/branding-rebranding.json";
import page_cloud_computing_services from "@/data/pages/cloud-computing-services.json";
import page_construction_management_system from "@/data/pages/construction-management-system.json";
import page_contact from "@/data/pages/contact.json";
import page_erp from "@/data/pages/erp.json";
import page_healthcare_and_medical_centre_software_services from "@/data/pages/healthcare-and-medical-centre-software-services.json";
import page_it_outsourcing_2 from "@/data/pages/it-outsourcing-2.json";
import page_it_outsourcing from "@/data/pages/it-outsourcing.json";
import page_network_solutions from "@/data/pages/network-solutions.json";
import page_odoo_development from "@/data/pages/odoo-development.json";
import page_privacy_policy from "@/data/pages/privacy-policy.json";
import page_school_system_isms from "@/data/pages/school-system-isms.json";
import page_services from "@/data/pages/services.json";
import page_services_erp from "@/data/pages/services/erp.json";
import page_services_graphic_design from "@/data/pages/services/graphic-design.json";
import page_services_mobile_app_development from "@/data/pages/services/mobile-app-development.json";
import page_services_social_media_marketing from "@/data/pages/services/social-media-marketing.json";
import page_services_social_wifi from "@/data/pages/services/social-wifi.json";
import page_services_web_development from "@/data/pages/services/web-development.json";
import page_social_wifi from "@/data/pages/social-wifi.json";
import page_video_photography from "@/data/pages/video-photography.json";
import { resolveFacts } from "@/libs/resolveFacts";

// Every real page's JSON can carry a {{facts.<path>}} token (Phase 4, launch-
// completion); resolved once here, at module load, so every consumer (the catch-all
// route, sitemap.js, verify.mjs) sees plain resolved strings, never raw tokens. The
// 4 bespoke routes (/, /about-us/, /contact/, /services/) import their JSON directly
// instead of through this registry, so they call resolveFacts() themselves.
const rawRegistry = {
	"home": page_home,
	"2020/08/05/new-corporate-logo-updated-branding": page_2020_08_05_new_corporate_logo_updated_branding,
	"2020/08/05/update-of-the-branding": page_2020_08_05_update_of_the_branding,
	"about-us": page_about_us,
	"adhics-medical-inspection-consultancy": page_adhics_medical_inspection_consultancy,
	"branding-rebranding": page_branding_rebranding,
	"cloud-computing-services": page_cloud_computing_services,
	"construction-management-system": page_construction_management_system,
	"contact": page_contact,
	"erp": page_erp,
	"healthcare-and-medical-centre-software-services": page_healthcare_and_medical_centre_software_services,
	"it-outsourcing-2": page_it_outsourcing_2,
	"it-outsourcing": page_it_outsourcing,
	"network-solutions": page_network_solutions,
	"odoo-development": page_odoo_development,
	"privacy-policy": page_privacy_policy,
	"school-system-isms": page_school_system_isms,
	"services": page_services,
	"services/erp": page_services_erp,
	"services/graphic-design": page_services_graphic_design,
	"services/mobile-app-development": page_services_mobile_app_development,
	"services/social-media-marketing": page_services_social_media_marketing,
	"services/social-wifi": page_services_social_wifi,
	"services/web-development": page_services_web_development,
	"social-wifi": page_social_wifi,
	"video-photography": page_video_photography,
};

export const pageRegistry = Object.fromEntries(
	Object.entries(rawRegistry).map(([slug, page]) => [slug, resolveFacts(page)])
);

// Slugs handled by their own dedicated route file, not the [...slug] catch-all.
export const BESPOKE_SLUGS = new Set(["home","about-us","contact","services"]);

export function getPageData(slug) {
	return pageRegistry[slug] ?? null;
}

/** All registered slugs, split into path segments, for generateStaticParams. */
export function getCatchAllParams() {
	return Object.keys(pageRegistry)
		.filter((slug) => !BESPOKE_SLUGS.has(slug))
		.map((slug) => ({ slug: slug.split("/") }));
}
