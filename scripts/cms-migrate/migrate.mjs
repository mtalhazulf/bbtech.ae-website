import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { mapPageToStrapiPayload } from "./lib/mapPageToStrapiPayload.mjs";

const PAGES_DIR = path.join(process.cwd(), "src", "data", "pages");
const BESPOKE_RELATIVE_PATHS = new Set(["home.json", "about-us.json", "contact.json", "services.json"]);

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_MIGRATION_TOKEN = process.env.STRAPI_MIGRATION_TOKEN;

if (!STRAPI_URL || !STRAPI_MIGRATION_TOKEN) {
	console.error("STRAPI_URL and STRAPI_MIGRATION_TOKEN must both be set.");
	process.exit(1);
}

async function collectCatchAllPageFiles(dir, baseDir = dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	let files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files = files.concat(await collectCatchAllPageFiles(fullPath, baseDir));
		} else if (entry.name.endsWith(".json")) {
			const relativePath = path.relative(baseDir, fullPath).split(path.sep).join("/");
			if (!BESPOKE_RELATIVE_PATHS.has(relativePath)) {
				files.push(fullPath);
			}
		}
	}
	return files;
}

async function createPage(payload) {
	const res = await fetch(`${STRAPI_URL}/api/pages`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${STRAPI_MIGRATION_TOKEN}`,
		},
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Failed to create page: ${res.status} ${res.statusText} - ${body}`);
	}
	return res.json();
}

async function main() {
	const files = await collectCatchAllPageFiles(PAGES_DIR);
	console.log(`Found ${files.length} catch-all page files to migrate.`);

	let created = 0;
	let failed = 0;
	for (const file of files) {
		const json = JSON.parse(await readFile(file, "utf8"));
		const payload = mapPageToStrapiPayload(json);
		try {
			await createPage(payload);
			created += 1;
			console.log(`OK   ${json.slug}`);
		} catch (err) {
			failed += 1;
			console.error(`FAIL ${json.slug}: ${err.message}`);
		}
	}

	console.log(`\nDone. ${created} created, ${failed} failed.`);
	if (failed > 0) process.exit(1);
}

main();
