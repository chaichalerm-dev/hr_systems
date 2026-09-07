import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // อนุญาตให้เครื่องมือพัฒนาเชื่อมผ่าน localhost และ 127.0.0.1 หากใช้ชื่อโฮสต์อื่นต้องเพิ่มที่นี่
  // Allow the development connection through localhost and 127.0.0.1; add other hosts explicitly if needed.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
