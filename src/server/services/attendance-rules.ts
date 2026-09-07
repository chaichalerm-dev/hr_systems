/** คำนวณสถานะและเวลาทำงานโดยไม่เรียกฐานข้อมูล ขั้นบันทึกเวลาอยู่ใน features/attendance/actions.ts
 * Calculate attendance without database calls. Attendance actions handle saving records.
 */

export interface AttendanceRules {
  workStartTime: string // ชั่วโมง:นาที เช่น 09:00 / Hours:minutes, e.g. 09:00
  workEndTime: string // ชั่วโมง:นาที เช่น 09:00 / Hours:minutes, e.g. 09:00
  gracePeriodMinutes: number
  standardWorkingHours: number
}

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/** นับนาทีสายหลังสิ้นสุดช่วงผ่อนผัน ถ้าไม่สายให้คืน 0
 * Count late minutes after the grace period; return zero when not late.
 */
export function calculateLateMinutes(checkIn: Date, rules: AttendanceRules): number {
  const checkInMinutes = checkIn.getHours() * 60 + checkIn.getMinutes()
  const cutoffMinutes = timeStringToMinutes(rules.workStartTime) + rules.gracePeriodMinutes
  return Math.max(0, checkInMinutes - cutoffMinutes)
}

export function isLateCheckIn(checkIn: Date, rules: AttendanceRules): boolean {
  return calculateLateMinutes(checkIn, rules) > 0
}

/** คำนวณชั่วโมงระหว่างเวลาเข้าและออก ปัดทศนิยม 2 ตำแหน่ง
 * Calculate hours between check-in and check-out, rounded to two decimal places.
 */
export function calculateWorkingHours(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime()
  const hours = diffMs / (1000 * 60 * 60)
  return Math.round(Math.max(0, hours) * 100) / 100
}
