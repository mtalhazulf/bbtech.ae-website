import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import site from "@/data/site.json";

// D7: the repo only has the icon mark, no wordmark lockup - keep it that way, don't
// fabricate one. This is the site-wide fallback for any route without its own real
// photo-based ogImage (src/data/pages/*.json); every registered real page already sets
// one (see AGENTS.md "Metadata"), so this only ever serves 404s and any future page.
export const alt = `${site.company.shortName} - ${site.company.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#0b1832";
const SKY = "#08a5e9";
const ACCENT = "#f48916";

export default async function Image() {
	const iconBuffer = await sharp(
		path.join(process.cwd(), "public/images/logos/logo-icon.webp")
	)
		.resize(160, 235)
		.png()
		.toBuffer();
	const iconDataUri = `data:image/png;base64,${iconBuffer.toString("base64")}`;

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: NAVY,
					fontFamily: "sans-serif",
				}}
			>
				<img src={iconDataUri} width={160} height={235} />
				<div
					style={{
						marginTop: 36,
						fontSize: 88,
						fontWeight: 700,
						color: "#ffffff",
						letterSpacing: -2,
					}}
				>
					{site.company.shortName}
				</div>
				<div
					style={{
						marginTop: 40,
						width: 120,
						height: 6,
						borderRadius: 3,
						backgroundColor: ACCENT,
					}}
				/>
				<div style={{ marginTop: 28, fontSize: 34, color: SKY }}>
					{site.company.tagline}
				</div>
			</div>
		),
		{ ...size }
	);
}
