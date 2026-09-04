import type { Dictionary } from "@/i18n/dictionaries/en"
import type { LeaveActionState } from "./actions"

/** Turns a leave action's error code (plus any runtime params) into a localised sentence. */
export function formatLeaveError(t: Dictionary, state: LeaveActionState): string {
  if (!state.error) return ""

  let message = t.leave.errors[state.error]
  for (const [key, value] of Object.entries(state.params ?? {})) {
    message = message.replace(`{${key}}`, value)
  }
  return message
}
