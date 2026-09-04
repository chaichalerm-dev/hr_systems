import { describe, expect, it } from "vitest"

import { calculateLeaveDays } from "./leave-rules"

describe("calculateLeaveDays", () => {
  it("counts a single weekday as 1 day", () => {
    // Monday 5 Jan 2026
    expect(calculateLeaveDays(new Date(2026, 0, 5), new Date(2026, 0, 5))).toBe(1)
  })

  it("excludes weekends from a Mon-Fri range", () => {
    // Mon 5 Jan - Fri 9 Jan 2026 = 5 business days
    expect(calculateLeaveDays(new Date(2026, 0, 5), new Date(2026, 0, 9))).toBe(5)
  })

  it("excludes weekends spanning a full week", () => {
    // Mon 5 Jan - Sun 11 Jan 2026 = still 5 business days (Sat/Sun excluded)
    expect(calculateLeaveDays(new Date(2026, 0, 5), new Date(2026, 0, 11))).toBe(5)
  })

  it("returns 0 for a range that is entirely a weekend", () => {
    // Sat 10 Jan - Sun 11 Jan 2026
    expect(calculateLeaveDays(new Date(2026, 0, 10), new Date(2026, 0, 11))).toBe(0)
  })

  it("returns 0 when the end date is before the start date", () => {
    expect(calculateLeaveDays(new Date(2026, 0, 10), new Date(2026, 0, 5))).toBe(0)
  })
})
