// Required by @opennextjs/cloudflare's build CLI, which looks for this exact filename
// ("open-next.config.ts") regardless of project language - see its createOpenNextConfigFile().
// This file has no actual TypeScript syntax (no types/interfaces/generics) and needs no
// tsconfig.json; it's plain ESM JS that the Cloudflare build step bundles on its own. The
// rest of this repo stays JavaScript-only per AGENTS.md.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every page here is generateStaticParams + dynamicParams:false, prerendered once at
// build time with no revalidation ever - so the incremental cache just needs to serve
// those build-time HTML files back from the Worker's static assets. No R2/KV bucket to
// provision; without this, Next's dynamicParams:false catch-all pages 404 at runtime
// (OpenNext has nowhere to look them up - see NoFallbackError).
export default defineCloudflareConfig({
	incrementalCache: staticAssetsIncrementalCache,
	enableCacheInterception: true,
});
