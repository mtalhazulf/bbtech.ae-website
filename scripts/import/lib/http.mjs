// Polite HTTP client for the content-import tooling: bounded concurrency, a minimum
// delay between requests, retry-with-backoff on network/5xx errors, and an on-disk
// cache so re-running a script doesn't re-hit bbtech.ae for URLs it already has.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), "content-import", ".cache");
export const USER_AGENT = "BBTechContentImportBot/1.0 (+content-import-tooling; static-site migration crawl)";
const MIN_DELAY_MS = 300;
const MAX_CONCURRENT = 2;
const MAX_RETRIES = 3;

let active = 0;
const queue = [];
let lastDispatchAt = 0;

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function scheduleNext() {
	if (active >= MAX_CONCURRENT || queue.length === 0) return;
	const job = queue.shift();
	active++;
	runJob(job);
}

async function runJob(job) {
	try {
		const wait = Math.max(0, lastDispatchAt + MIN_DELAY_MS - Date.now());
		if (wait > 0) await sleep(wait);
		lastDispatchAt = Date.now();
		job.resolve(await doFetch(job.url, job.opts));
	} catch (err) {
		job.reject(err);
	} finally {
		active--;
		scheduleNext();
	}
}

function cacheKeyFor(url) {
	return createHash("sha256").update(url).digest("hex");
}

async function readCache(url) {
	try {
		const file = path.join(CACHE_DIR, `${cacheKeyFor(url)}.json`);
		return JSON.parse(await readFile(file, "utf8"));
	} catch {
		return null;
	}
}

async function writeCache(url, entry) {
	await mkdir(CACHE_DIR, { recursive: true });
	const file = path.join(CACHE_DIR, `${cacheKeyFor(url)}.json`);
	await writeFile(file, JSON.stringify(entry, null, 2), "utf8");
}

async function doFetch(url, opts) {
	let lastErr;
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			const res = await fetch(url, {
				headers: { "User-Agent": USER_AGENT, Accept: opts.accept || "*/*" },
				redirect: "follow",
			});
			if (res.status >= 500 && attempt < MAX_RETRIES) {
				await sleep(500 * 2 ** attempt);
				continue;
			}
			const body = await res.text();
			const headers = {};
			for (const [k, v] of res.headers.entries()) headers[k] = v;
			return {
				url,
				finalUrl: res.url,
				status: res.status,
				headers,
				body,
				fetchedAt: new Date().toISOString(),
			};
		} catch (err) {
			lastErr = err;
			if (attempt < MAX_RETRIES) {
				await sleep(500 * 2 ** attempt);
				continue;
			}
		}
	}
	throw lastErr || new Error(`Failed to fetch ${url}`);
}

/**
 * Fetch a URL politely (bounded concurrency + delay + retries), using an on-disk
 * cache keyed by URL unless opts.noCache or opts.force is set.
 * @param {string} url
 * @param {{ accept?: string, noCache?: boolean, force?: boolean }} [opts]
 */
export async function politeFetch(url, opts = {}) {
	if (!opts.force) {
		const cached = await readCache(url);
		if (cached) return cached;
	}
	const result = await new Promise((resolve, reject) => {
		queue.push({ url, opts, resolve, reject });
		scheduleNext();
	});
	if (!opts.noCache) await writeCache(url, result);
	return result;
}

/** Fetch and JSON.parse a URL's body (throws if the response isn't valid JSON). */
export async function politeFetchJson(url, opts = {}) {
	const res = await politeFetch(url, { ...opts, accept: "application/json" });
	return { ...res, json: JSON.parse(res.body) };
}
