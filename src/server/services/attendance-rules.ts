/**
 * Attendance status/hours calculation, pure functions, unit tested in
 * isolation. DB orchestration (check-in/out server actions) lives in
 * `src/features/attendance/actions.ts`.
 */

export interface AttendanceRules {
  workStartTime: string // "HH:mm"
  workEndTime: string // "HH:mm"
  gracePeriodMinutes: number
  standardWorkingHours: number
}

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/** Minutes past the work start time, counting only from the grace-period cutoff. Never negative. */
export function calculateLateMinutes(checkIn: Date, rules: AttendanceRules): number {
  const checkInMinutes = checkIn.getHours() * 60 + checkIn.getMinutes()
  const cutoffMinutes = timeStringToMinutes(rules.workStartTime) + rules.gracePeriodMinutes
  return Math.max(0, checkInMinutes - cutoffMinutes)
}

export function isLateCheckIn(checkIn: Date, rules: AttendanceRules): boolean {
  return calculateLateMinutes(checkIn, rules) > 0
}

/** Working hours between check-in and check-out, rounded to 2 decimal places. */
export function calculateWorkingHours(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime()
  const hours = diffMs / (1000 * 60 * 60)
  return Math.round(Math.max(0, hours) * 100) / 100
}
