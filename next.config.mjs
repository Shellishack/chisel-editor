/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Add external configuration
    config.externals = [...config.externals, { canvas: "canvas" }]; // required to make Konva & react-konva work

    config.resolve.extensions.push(".ts", ".tsx");
    config.resolve.fallback = { fs: false };

    return config;
  },
};

export default nextConfig;
