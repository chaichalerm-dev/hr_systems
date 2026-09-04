import { z } from "zod"

const leaveRequestShape = {
  leaveTypeId: z.string().min(1, "Select a leave type."),
  reason: z.string().min(5, "Please provide a brief reason (at least 5 characters)."),
  attachmentName: z.string().max(255).optional().or(z.literal("")),
  attachmentUrl: z.string().max(500).optional().or(z.literal("")),
}

const dateOrderRefinement = {
  message: "End date must be on or after the start date.",
  path: ["endDate"],
}

// Server-side (FormData strings -> coerced dates).
export const leaveRequestFormSchema = z
  .object({ ...leaveRequestShape, startDate: z.coerce.date(), endDate: z.coerce.date() })
  .refine((data) => data.endDate >= data.startDate, dateOrderRefinement)

export type LeaveRequestFormInput = z.infer<typeof leaveRequestFormSchema>

// Client-side (react-hook-form holds real Date objects already).
export const leaveRequestFormClientSchema = z
  .object({ ...leaveRequestShape, startDate: z.date(), endDate: z.date() })
  .refine((data) => data.endDate >= data.startDate, dateOrderRefinement)

export const leaveDecisionSchema = z.object({
  leaveRequestId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().max(1000).optional().or(z.literal("")),
})

export type LeaveDecisionInput = z.infer<typeof leaveDecisionSchema>
