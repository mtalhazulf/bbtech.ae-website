// Renders every email template against its fixture(s) to tmp/email-previews/*.html,
// for a fast look without needing SMTP/Mailpit running. `bun run email:preview`.
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderEmailHtml, renderEmailText } from "../../src/libs/mail/render.js";

const FIXTURES_DIR = path.join(process.cwd(), "src", "emails", "fixtures");
const OUT_DIR = path.join(process.cwd(), "tmp", "email-previews");

// fixture filename -> template it belongs to (a fixture name may differ from the
// template, e.g. the "-hostile" escaping-safety fixture for contact-notification).
const FIXTURE_TEMPLATES = {
	"contact-notification": "contact-notification",
	"contact-notification-hostile": "contact-notification",
	"contact-autoreply": "contact-autoreply",
};

await mkdir(OUT_DIR, { recursive: true });

const files = (await readdir(FIXTURES_DIR)).filter(f => f.endsWith(".json"));
let count = 0;

for (const file of files) {
	const fixtureName = file.replace(/\.json$/, "");
	const templateName = FIXTURE_TEMPLATES[fixtureName];
	if (!templateName) {
		console.warn(`skip ${file}: no template mapping in FIXTURE_TEMPLATES`);
		continue;
	}
	const { default: data } = await import(path.join(FIXTURES_DIR, file), { with: { type: "json" } });
	const html = renderEmailHtml(templateName, data);
	const text = renderEmailText(templateName, data);
	await writeFile(path.join(OUT_DIR, `${fixtureName}.html`), html, "utf8");
	await writeFile(path.join(OUT_DIR, `${fixtureName}.txt`), text, "utf8");
	console.log(`wrote ${fixtureName}.html + .txt`);
	count += 2;
}

console.log(`\n${count} files written to ${path.relative(process.cwd(), OUT_DIR)}/`);
