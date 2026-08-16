/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next 16 otherwise writes AGENTS.md/CLAUDE.md into the repo on each run.
  agentRules: false,
}

module.exports = nextConfig
