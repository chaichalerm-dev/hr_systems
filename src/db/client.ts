import { PrismaClient } from "@prisma/client"

// ใช้ PrismaClient ตัวเดิมเมื่อโหลดโค้ดใหม่หรือรับคำขอซ้ำ เพื่อลดการเปิดฐานข้อมูลหลายการเชื่อมต่อ
// Reuse PrismaClient across reloads and requests to avoid opening too many connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
