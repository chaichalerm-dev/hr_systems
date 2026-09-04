import { redirect } from "next/navigation"

import { requirePageSession } from "@/server/authorization"

export default async function ProfileRedirectPage() {
  const session = await requirePageSession()
  if (!session.user.employeeId) redirect("/dashboard")
  redirect(`/employees/${session.user.employeeId}`)
}
