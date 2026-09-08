import type { Metadata } from "next"
import { getDictionaryFor, getLocale } from "@/i18n/server"
import { requirePageSession } from "@/server/authorization"
import { GuideExplorer } from "@/features/guide/components/guide-explorer"
import { guideTopicsForRole } from "@/features/guide/topics"

export const metadata: Metadata = { title: "คู่มือใช้งาน | User guide" }

export default async function GuidePage() {
  const [session, locale] = await Promise.all([requirePageSession(), getLocale()])
  // โหลดเฉพาะภาษาที่เลือกและส่งเฉพาะหัวข้อของบทบาทนี้ ไม่เพิ่มเนื้อหาให้หน้าอื่น
  // Load this language on the guide route and send only topics allowed for this role.
  const content = locale === "th"
    ? (await import("@/features/guide/content/th")).guideTh
    : (await import("@/features/guide/content/en")).guideEn
  const articles = guideTopicsForRole(session.user.role).map(({ id, category, href, needsProfile }) => ({
    id, category, href, needsProfile,
    ...content[id],
  }))

  return <GuideExplorer articles={articles} labels={getDictionaryFor(locale).guide} role={session.user.role} hasProfile={!!session.user.employeeId} />
}
