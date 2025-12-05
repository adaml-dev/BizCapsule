/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*.app.github.dev', 'localhost:3000'],
    },
  },
  outputFileTracingIncludes: {
    '/experiments/[slug]': ['./experiments_raw/**/*'],
  },
};

module.exports = nextConfig;
