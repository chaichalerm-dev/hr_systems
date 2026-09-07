/** นับวันจันทร์–ศุกร์ รวมวันเริ่มและสิ้นสุด ยังไม่หักวันหยุดบริษัทเพราะไม่มีปฏิทินวันหยุด
 * Count weekdays including both endpoints. Company holidays are not deducted because no holiday calendar exists.
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
