// Required by @opennextjs/cloudflare's build CLI, which looks for this exact filename
// ("open-next.config.ts") regardless of project language - see its createOpenNextConfigFile().
// This file has no actual TypeScript syntax (no types/interfaces/generics) and needs no
// tsconfig.json; it's plain ESM JS that the Cloudflare build step bundles on its own. The
// rest of this repo stays JavaScript-only per AGENTS.md.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
