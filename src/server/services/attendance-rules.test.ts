import { describe, expect, it } from "vitest"

import { calculateLateMinutes, calculateWorkingHours, isLateCheckIn } from "./attendance-rules"

const rules = {
  workStartTime: "09:00",
  workEndTime: "18:00",
  gracePeriodMinutes: 15,
  standardWorkingHours: 8,
}

function timeOn(hour: number, minute: number): Date {
  const date = new Date(2026, 0, 5) // กำหนดวันจันทร์ไว้คงที่ / A fixed Monday.
  date.setHours(hour, minute, 0, 0)
  return date
}

describe("calculateLateMinutes / isLateCheckIn / การนับนาทีสาย", () => {
  it("is not late within the grace period / ยังไม่สายภายในช่วงผ่อนผัน", () => {
    const checkIn = timeOn(9, 10) // มาหลังเก้าโมง 10 นาที ยังอยู่ในช่วงผ่อนผัน / Ten minutes after 09:00, within the 15-minute grace period.
    expect(isLateCheckIn(checkIn, rules)).toBe(false)
    expect(calculateLateMinutes(checkIn, rules)).toBe(0)
  })

  it("is exactly on the grace period boundary and not late / มาตรงเวลาสิ้นสุดช่วงผ่อนผันยังไม่สาย", () => {
    const checkIn = timeOn(9, 15)
    expect(isLateCheckIn(checkIn, rules)).toBe(false)
  })

  it("is late just past the grace period / เริ่มนับสายเมื่อพ้นช่วงผ่อนผัน", () => {
    const checkIn = timeOn(9, 16)
    expect(isLateCheckIn(checkIn, rules)).toBe(true)
    expect(calculateLateMinutes(checkIn, rules)).toBe(1)
  })

  it("counts late minutes past the cutoff, not past the nominal start time / เริ่มนับจากสิ้นสุดช่วงผ่อนผัน", () => {
    const checkIn = timeOn(9, 45)
    // เริ่มนับสายหลัง 09:15 ดังนั้น 09:45 สาย 30 นาที / 09:45 is 30 minutes after the 09:15 cutoff.
    expect(calculateLateMinutes(checkIn, rules)).toBe(30)
  })

  it("checking in before the work start time is never late / มาก่อนเวลาเริ่มงานไม่ถือว่าสาย", () => {
    const checkIn = timeOn(8, 30)
    expect(isLateCheckIn(checkIn, rules)).toBe(false)
    expect(calculateLateMinutes(checkIn, rules)).toBe(0)
  })
})

describe("calculateWorkingHours / การคำนวณชั่วโมงทำงาน", () => {
  it("computes a standard full day / คำนวณชั่วโมงของวันทำงานปกติ", () => {
    expect(calculateWorkingHours(timeOn(9, 0), timeOn(18, 0))).toBe(9)
  })

  it("rounds to 2 decimal places / ปัดทศนิยมสองตำแหน่ง", () => {
    const hours = calculateWorkingHours(timeOn(9, 0), timeOn(17, 20))
    expect(hours).toBe(8.33)
  })

  it("never returns a negative value if checkout precedes checkin / เวลาออกก่อนเวลาเข้าให้ชั่วโมงเป็นศูนย์", () => {
    expect(calculateWorkingHours(timeOn(18, 0), timeOn(9, 0))).toBe(0)
  })
})
