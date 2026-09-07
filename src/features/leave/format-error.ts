import type { Dictionary } from "@/i18n/dictionaries/en"
import type { LeaveActionState } from "./actions"

/** แปลงรหัสข้อผิดพลาดและค่าประกอบเป็นประโยคตามภาษาที่เลือก
 * Turn a leave error code and its values into a translated message.
 */
export function formatLeaveError(t: Dictionary, state: LeaveActionState): string {
  if (!state.error) return ""

  let message = t.leave.errors[state.error]
  for (const [key, value] of Object.entries(state.params ?? {})) {
    message = message.replace(`{${key}}`, value)
  }
  return message
}
