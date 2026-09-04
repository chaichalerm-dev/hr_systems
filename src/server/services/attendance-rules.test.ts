import { describe, expect, it } from "vitest"

import { calculateLateMinutes, calculateWorkingHours, isLateCheckIn } from "./attendance-rules"

const rules = {
  workStartTime: "09:00",
  workEndTime: "18:00",
  gracePeriodMinutes: 15,
  standardWorkingHours: 8,
}

function timeOn(hour: number, minute: number): Date {
  const date = new Date(2026, 0, 5) // a fixed Monday
  date.setHours(hour, minute, 0, 0)
  return date
}

describe("calculateLateMinutes / isLateCheckIn", () => {
  it("is not late within the grace period", () => {
    const checkIn = timeOn(9, 10) // 10 minutes after 09:00, within 15-minute grace
    expect(isLateCheckIn(checkIn, rules)).toBe(false)
    expect(calculateLateMinutes(checkIn, rules)).toBe(0)
  })

  it("is exactly on the grace period boundary and not late", () => {
    const checkIn = timeOn(9, 15)
    expect(isLateCheckIn(checkIn, rules)).toBe(false)
  })

  it("is late just past the grace period", () => {
    const checkIn = timeOn(9, 16)
    expect(isLateCheckIn(checkIn, rules)).toBe(true)
    expect(calculateLateMinutes(checkIn, rules)).toBe(1)
  })

  it("counts late minutes past the cutoff, not past the nominal start time", () => {
    const checkIn = timeOn(9, 45)
    // cutoff is 09:15, so 09:45 is 30 minutes past the cutoff
    expect(calculateLateMinutes(checkIn, rules)).toBe(30)
  })

  it("checking in before the work start time is never late", () => {
    const checkIn = timeOn(8, 30)
    expect(isLateCheckIn(checkIn, rules)).toBe(false)
    expect(calculateLateMinutes(checkIn, rules)).toBe(0)
  })
})

describe("calculateWorkingHours", () => {
  it("computes a standard full day", () => {
    expect(calculateWorkingHours(timeOn(9, 0), timeOn(18, 0))).toBe(9)
  })

  it("rounds to 2 decimal places", () => {
    const hours = calculateWorkingHours(timeOn(9, 0), timeOn(17, 20))
    expect(hours).toBe(8.33)
  })

  it("never returns a negative value if checkout precedes checkin", () => {
    expect(calculateWorkingHours(timeOn(18, 0), timeOn(9, 0))).toBe(0)
  })
})
