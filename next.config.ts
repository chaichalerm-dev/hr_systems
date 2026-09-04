import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server's HMR handshake succeed when accessed via 127.0.0.1
  // or a LAN IP instead of localhost — without this, Next 16 silently blocks
  // the dev client bootstrap and every page just never hydrates.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
