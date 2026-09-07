import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // อนุญาตให้เครื่องมือพัฒนาเชื่อมผ่าน localhost และ 127.0.0.1 หากใช้ชื่อโฮสต์อื่นต้องเพิ่มที่นี่
  // Allow the development connection through localhost and 127.0.0.1; add other hosts explicitly if needed.
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  // Content-Security-Policy ต้องมี nonce ต่อคำขอ จึงตั้งไว้ใน middleware.ts แทน
  // ส่วนนี้ใส่เฉพาะ header ที่เป็นค่าคงที่ ครอบคลุมทุก route รวมถึง /api
  // Content-Security-Policy needs a per-request nonce, so it's set in
  // middleware.ts instead. These are the static headers, applied to every
  // route including /api.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // ปิดสิทธิ์ที่ไม่ได้ใช้ เปิดเฉพาะตำแหน่งที่ตัวแอปเองใช้ตอนลงเวลา
          // Deny unused features; only geolocation stays on for check-in/out.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
        ],
      },
    ]
  },
};

export default nextConfig;
