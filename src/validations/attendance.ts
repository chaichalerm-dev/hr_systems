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
  workStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "กรอกเวลาแบบชั่วโมง:นาที เช่น 09:00 / Use HH:mm, for example 09:00."),
  workEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "กรอกเวลาแบบชั่วโมง:นาที เช่น 09:00 / Use HH:mm, for example 09:00."),
  gracePeriodMinutes: z.coerce.number().int().min(0).max(120),
  standardWorkingHours: z.coerce.number().min(1).max(24),
})

export type AttendanceRulesFormInput = z.infer<typeof attendanceRulesFormSchema>

// ฟอร์มฝั่งหน้าจอเก็บตัวเลขไว้แล้ว จึงใช้ชนิด number ได้โดยตรง
// Client forms already hold numbers, so no string conversion is needed.
export const attendanceRulesFormClientSchema = attendanceRulesFormSchema.extend({
  gracePeriodMinutes: z.number().int().min(0).max(120),
  standardWorkingHours: z.number().min(1).max(24),
})
