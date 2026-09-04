/**
 * Leave-days calculation — pure function, unit tested in isolation.
 * Counts business days (Mon-Fri) inclusive of both endpoints. Company
 * holidays are not modeled as a separate calendar in this portfolio build
 * (see README "Limitations"); a real deployment would subtract a holiday
 * calendar here too.
 */
export function calculateLeaveDays(startDate: Date, endDate: Date): number {
  if (endDate < startDate) return 0

  let count = 0
  const cursor = new Date(startDate)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (cursor <= end) {
    const dayOfWeek = cursor.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count += 1
    cursor.setDate(cursor.getDate() + 1)
  }

  return count
}
