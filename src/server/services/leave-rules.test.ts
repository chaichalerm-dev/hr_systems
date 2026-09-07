import { describe, expect, it } from "vitest"

import { calculateLeaveDays } from "./leave-rules"

describe("calculateLeaveDays / การนับวันลา", () => {
  it("counts a single weekday as 1 day / วันทำงานหนึ่งวันนับเป็นหนึ่งวันลา", () => {
    // วันจันทร์ที่ 5 มกราคม 2026 / Monday 5 Jan 2026.
    expect(calculateLeaveDays(new Date(2026, 0, 5), new Date(2026, 0, 5))).toBe(1)
  })

  it("excludes weekends from a Mon-Fri range / ช่วงจันทร์ถึงศุกร์นับห้าวัน", () => {
    // จันทร์ถึงศุกร์รวม 5 วันทำงาน / Mon 5 Jan to Fri 9 Jan 2026 = 5 workdays.
    expect(calculateLeaveDays(new Date(2026, 0, 5), new Date(2026, 0, 9))).toBe(5)
  })

  it("excludes weekends spanning a full week / ช่วงหนึ่งสัปดาห์ไม่นับเสาร์และอาทิตย์", () => {
    // จันทร์ถึงอาทิตย์ยังนับ 5 วัน เพราะตัดเสาร์–อาทิตย์ / Mon 5 Jan to Sun 11 Jan 2026 = 5 workdays.
    expect(calculateLeaveDays(new Date(2026, 0, 5), new Date(2026, 0, 11))).toBe(5)
  })

  it("returns 0 for a range that is entirely a weekend / เลือกเฉพาะเสาร์อาทิตย์นับศูนย์วัน", () => {
    // เสาร์ที่ 10 ถึงอาทิตย์ที่ 11 มกราคม 2026 / Sat 10 Jan to Sun 11 Jan 2026.
    expect(calculateLeaveDays(new Date(2026, 0, 10), new Date(2026, 0, 11))).toBe(0)
  })

  it("returns 0 when the end date is before the start date / วันสิ้นสุดก่อนเริ่มให้นับศูนย์วัน", () => {
    expect(calculateLeaveDays(new Date(2026, 0, 10), new Date(2026, 0, 5))).toBe(0)
  })
})
