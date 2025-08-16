// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "images.unsplash.com"], // 👈 Added Unsplash domain
  },
};

module.exports = nextConfig;
