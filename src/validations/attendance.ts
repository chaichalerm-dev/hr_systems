import { z } from "zod"

export const checkInSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const checkOutSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const attendanceRulesFormSchema = z.object({
  workStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format."),
  workEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format."),
  gracePeriodMinutes: z.coerce.number().int().min(0).max(120),
  standardWorkingHours: z.coerce.number().min(1).max(24),
})

export type AttendanceRulesFormInput = z.infer<typeof attendanceRulesFormSchema>

// Client-side (react-hook-form holds real numbers already).
export const attendanceRulesFormClientSchema = attendanceRulesFormSchema.extend({
  gracePeriodMinutes: z.number().int().min(0).max(120),
  standardWorkingHours: z.number().min(1).max(24),
})
