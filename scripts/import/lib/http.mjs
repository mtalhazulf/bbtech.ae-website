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
		job.resolve(await job.task());
	} catch (err) {
		job.reject(err);
	} finally {
		active--;
		scheduleNext();
	}
}

/** Run `task` through the shared concurrency/delay scheduler used by every fetch below. */
function enqueue(task) {
	return new Promise((resolve, reject) => {
		queue.push({ task, resolve, reject });
		scheduleNext();
	});
}

async function withRetry(fn) {
	let lastErr;
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			const result = await fn();
			if (result.retryable && attempt < MAX_RETRIES) {
				await sleep(500 * 2 ** attempt);
				continue;
			}
			return result;
		} catch (err) {
			lastErr = err;
			if (attempt < MAX_RETRIES) {
				await sleep(500 * 2 ** attempt);
				continue;
			}
		}
	}
	throw lastErr || new Error("request failed after retries");
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

async function readBinaryCache(url) {
	try {
		const key = cacheKeyFor(url);
		const meta = JSON.parse(await readFile(path.join(CACHE_DIR, `${key}.bin.json`), "utf8"));
		const buffer = meta.status === 200 ? await readFile(path.join(CACHE_DIR, `${key}.bin`)) : null;
		return { ...meta, buffer };
	} catch {
		return null;
	}
}

async function writeBinaryCache(url, entry) {
	await mkdir(CACHE_DIR, { recursive: true });
	const key = cacheKeyFor(url);
	const { buffer, ...meta } = entry;
	await writeFile(path.join(CACHE_DIR, `${key}.bin.json`), JSON.stringify(meta, null, 2), "utf8");
	if (buffer) await writeFile(path.join(CACHE_DIR, `${key}.bin`), buffer);
}

function headersToObject(res) {
	const headers = {};
	for (const [k, v] of res.headers.entries()) headers[k] = v;
	return headers;
}

async function doFetchText(url, opts) {
	return withRetry(async () => {
		const res = await fetch(url, {
			headers: { "User-Agent": USER_AGENT, Accept: opts.accept || "*/*" },
			redirect: "follow",
		});
		if (res.status >= 500) return { retryable: true };
		const body = await res.text();
		return {
			url,
			finalUrl: res.url,
			status: res.status,
			headers: headersToObject(res),
			body,
			fetchedAt: new Date().toISOString(),
		};
	});
}

async function doFetchBinary(url) {
	return withRetry(async () => {
		const res = await fetch(url, {
			headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
			redirect: "follow",
		});
		if (res.status >= 500) return { retryable: true };
		if (res.status !== 200) {
			return {
				url,
				finalUrl: res.url,
				status: res.status,
				headers: headersToObject(res),
				buffer: null,
				fetchedAt: new Date().toISOString(),
			};
		}
		const arrayBuffer = await res.arrayBuffer();
		return {
			url,
			finalUrl: res.url,
			status: res.status,
			headers: headersToObject(res),
			buffer: Buffer.from(arrayBuffer),
			fetchedAt: new Date().toISOString(),
		};
	});
}

/**
 * Fetch a URL politely (bounded concurrency + delay + retries), using an on-disk
 * text/JSON cache unless opts.noCache or opts.force is set.
 * @param {string} url
 * @param {{ accept?: string, noCache?: boolean, force?: boolean }} [opts]
 */
export async function politeFetch(url, opts = {}) {
	if (!opts.force) {
		const cached = await readCache(url);
		if (cached) return cached;
	}
	const result = await enqueue(() => doFetchText(url, opts));
	if (!opts.noCache) await writeCache(url, result);
	return result;
}

/** Fetch and JSON.parse a URL's body (throws if the response isn't valid JSON). */
export async function politeFetchJson(url, opts = {}) {
	const res = await politeFetch(url, { ...opts, accept: "application/json" });
	return { ...res, json: JSON.parse(res.body) };
}

/**
 * Fetch a URL's raw bytes politely (same scheduler as politeFetch), cached to disk
 * (bytes + a small JSON sidecar) so re-running a script doesn't re-download assets
 * bbtech.ae has already served us.
 * @param {string} url
 * @param {{ force?: boolean }} [opts]
 * @returns {Promise<{ url: string, finalUrl: string, status: number, headers: object, buffer: Buffer|null, fetchedAt: string }>}
 */
export async function politeFetchBinary(url, opts = {}) {
	if (!opts.force) {
		const cached = await readBinaryCache(url);
		if (cached) return cached;
	}
	const result = await enqueue(() => doFetchBinary(url));
	await writeBinaryCache(url, result);
	return result;
}
