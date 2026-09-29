import Handlebars from "handlebars";
import juice from "juice";
import fs from "node:fs";
import path from "node:path";
import theme from "@/emails/theme.json";

const EMAILS_DIR = path.join(process.cwd(), "src", "emails");
const compiledCache = new Map();
let helpersRegistered = false;
let partialsRegistered = false;

function registerHelpersOnce() {
	if (helpersRegistered) return;
	Handlebars.registerHelper("eq", (a, b) => a === b);
	Handlebars.registerHelper("year", () => new Date().getFullYear());
	Handlebars.registerHelper("formatDate", date => {
		const value = date instanceof Date ? date : new Date(date);
		return new Intl.DateTimeFormat("en-GB", {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: "Asia/Dubai",
		}).format(value) + " (Asia/Dubai)";
	});
	// Escapes first, then converts newlines to <br> - a SafeString double-stash-safe
	// output, so no template ever needs {{{ }}} for user-controlled text (D5.4).
	Handlebars.registerHelper("nl2br", text => {
		const escaped = Handlebars.Utils.escapeExpression(text || "");
		return new Handlebars.SafeString(escaped.replace(/\n/g, "<br>"));
	});
	helpersRegistered = true;
}

function registerPartialsOnce() {
	if (partialsRegistered) return;
	const partialsDir = path.join(EMAILS_DIR, "partials");
	for (const file of fs.readdirSync(partialsDir)) {
		if (!file.endsWith(".hbs")) continue;
		const name = file.replace(/\.hbs$/, "");
		Handlebars.registerPartial(name, fs.readFileSync(path.join(partialsDir, file), "utf8"));
	}
	partialsRegistered = true;
}

function compile(relPath) {
	if (compiledCache.has(relPath)) return compiledCache.get(relPath);
	const source = fs.readFileSync(path.join(EMAILS_DIR, relPath), "utf8");
	const template = Handlebars.compile(source);
	compiledCache.set(relPath, template);
	return template;
}

registerHelpersOnce();
registerPartialsOnce();

/**
 * Renders templates/<name>.html.hbs with `data`, wraps it in layouts/base.hbs (the
 * only place {{{ }}} appears - the layout's own `body` slot, which is trusted HTML
 * this module produced, not raw user input), then inlines the CSS with juice so
 * clients that strip <style> blocks still render it correctly.
 * @param {string} templateName e.g. "contact-notification"
 * @param {object} data
 */
export function renderEmailHtml(templateName, data) {
	const context = { ...data, theme };
	const bodyHtml = compile(path.join("templates", `${templateName}.html.hbs`))(context);
	const fullHtml = compile(path.join("layouts", "base.hbs"))({ ...context, body: bodyHtml });
	return juice(fullHtml);
}

/** Renders templates/<name>.txt.hbs - the plain-text alternative, no layout/juice. */
export function renderEmailText(templateName, data) {
	return compile(path.join("templates", `${templateName}.txt.hbs`))({ ...data, theme });
}

/** Test-only: drops compiled-template/partial/helper caches so a test can re-register. */
export function resetRenderCache() {
	compiledCache.clear();
	helpersRegistered = false;
	partialsRegistered = false;
	registerHelpersOnce();
	registerPartialsOnce();
}
