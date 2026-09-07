import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // ระบุไฟล์ที่ไม่ต้องตรวจรูปแบบโค้ด / Choose files ESLint should skip.
  globalIgnores([
    // ไฟล์ build และชนิดข้อมูลที่ Next.js สร้าง / Next.js build output and generated types.
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
