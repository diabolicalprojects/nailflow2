/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['cdn.diabolicalservices.tech', 'api.diabolicalservices.tech'],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        NEXT_PUBLIC_CDN_KEY: process.env.NEXT_PUBLIC_CDN_KEY || 'dmm_7tpONlAMTNtIMLjpr4gMSNqw9LGbgX6X',
    },
};

module.exports = nextConfig;
