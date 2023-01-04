/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    //see: https://webpack.js.org/guides/asset-modules/
    config.module.rules.push({
      test: /\.glsl|txt/,
      type: "asset/source",
    });

    return config;
  },
};

module.exports = nextConfig;
