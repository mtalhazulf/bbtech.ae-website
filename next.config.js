/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	// D2: 1:1 URL parity with the live bbtech.ae paths, which are all trailing-slashed.
	trailingSlash: true,
};

module.exports = nextConfig;
