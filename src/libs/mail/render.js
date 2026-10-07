import Handlebars from "handlebars";
import juice from "juice";
import theme from "@/emails/theme.json";

// Template/partial sources are static imports (not fs.readFileSync/readdirSync against
// src/emails/**) so every deploy target's bundler includes them automatically - a runtime
// directory scan isn't reachable by a bundler's import graph, so it silently went missing
// in environments with no real filesystem (e.g. a Cloudflare Worker).
import baseLayout from "@/emails/layouts/base.js";
import buttonPartial from "@/emails/partials/button.js";
import fieldRowPartial from "@/emails/partials/field-row.js";
import footerPartial from "@/emails/partials/footer.js";
import headerPartial from "@/emails/partials/header.js";
import preheaderPartial from "@/emails/partials/preheader.js";
import contactAutoreplyHtml from "@/emails/templates/contact-autoreply.html.js";
import contactAutoreplyTxt from "@/emails/templates/contact-autoreply.txt.js";
import contactNotificationHtml from "@/emails/templates/contact-notification.html.js";
import contactNotificationTxt from "@/emails/templates/contact-notification.txt.js";

const PARTIALS = {
	button: buttonPartial,
	"field-row": fieldRowPartial,
	footer: footerPartial,
	header: headerPartial,
	preheader: preheaderPartial,
};

const TEMPLATES = {
	"contact-autoreply.html": contactAutoreplyHtml,
	"contact-autoreply.txt": contactAutoreplyTxt,
	"contact-notification.html": contactNotificationHtml,
	"contact-notification.txt": contactNotificationTxt,
};

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
	for (const [name, source] of Object.entries(PARTIALS)) {
		Handlebars.registerPartial(name, source);
	}
	partialsRegistered = true;
}

function compile(key) {
	if (compiledCache.has(key)) return compiledCache.get(key);
	const source = key === "layout:base" ? baseLayout : TEMPLATES[key];
	const template = Handlebars.compile(source);
	compiledCache.set(key, template);
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
	const bodyHtml = compile(`${templateName}.html`)(context);
	const fullHtml = compile("layout:base")({ ...context, body: bodyHtml });
	return juice(fullHtml);
}

/** Renders templates/<name>.txt.hbs - the plain-text alternative, no layout/juice. */
export function renderEmailText(templateName, data) {
	return compile(`${templateName}.txt`)({ ...data, theme });
}

/** Test-only: drops compiled-template/partial/helper caches so a test can re-register. */
export function resetRenderCache() {
	compiledCache.clear();
	helpersRegistered = false;
	partialsRegistered = false;
	registerHelpersOnce();
	registerPartialsOnce();
}
