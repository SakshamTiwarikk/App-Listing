// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'], // 👈 Add 'localhost' to allowed domains
  },
};

module.exports = nextConfig;
