import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { Role } from "@prisma/client"
import { en } from "@/i18n/dictionaries/en"
import { guideEn } from "./content/en"
import { guideTh } from "./content/th"
import { GUIDE_TOPICS, guideTopicsForRole } from "./topics"
import { GuideExplorer } from "./components/guide-explorer"

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }))
afterEach(() => { cleanup(); window.history.replaceState(null, "", "/") })

const articlesFor = (role: Role) => guideTopicsForRole(role).map((topic) => ({ ...topic, ...guideEn[topic.id] }))

describe("User guide / คู่มือใช้งาน", () => {
  it("covers every topic in both languages / ทุกหัวข้อมีทั้งไทยและอังกฤษ", () => {
    expect(new Set(GUIDE_TOPICS.map((topic) => topic.id)).size).toBe(23)
    expect(Object.keys(guideEn).sort()).toEqual(Object.keys(guideTh).sort())
    for (const topic of GUIDE_TOPICS) {
      for (const copy of [guideEn[topic.id], guideTh[topic.id]]) {
        expect(copy.title.length).toBeGreaterThan(0)
        expect(copy.before.length).toBeGreaterThan(0)
        expect(copy.result.length).toBeGreaterThan(0)
        expect(copy.steps.length).toBeGreaterThanOrEqual(4)
        expect(copy.steps.every((step) => step.trim().length > 0)).toBe(true)
        expect(copy.tips.length).toBeGreaterThan(0)
      }
      expect(guideEn[topic.id].steps.length).toBe(guideTh[topic.id].steps.length)
    }
  })

  it("keeps management and admin instructions within their roles / หัวข้อตรงกับบทบาท", () => {
    const ids = (role: Role) => guideTopicsForRole(role).map((topic) => topic.id)
    expect(ids("EMPLOYEE")).toHaveLength(11)
    expect(ids("MANAGER")).toHaveLength(14)
    expect(ids("HR")).toHaveLength(21)
    expect(ids("ADMIN")).toHaveLength(23)
    expect(ids("EMPLOYEE")).not.toContain("leaveApprovals")
    expect(ids("MANAGER")).not.toContain("payrollCreate")
    expect(ids("HR")).not.toContain("payrollSettings")
    expect(ids("MANAGER")).toContain("payslips")
  })

  it("supports beginners and a complete reference / อ่านทีละขั้นหรือทั้งหมด", () => {
    render(<GuideExplorer articles={articlesFor("EMPLOYEE")} labels={en.guide} role="EMPLOYEE" hasProfile />)
    expect(screen.getByRole("button", { name: "Previous step" })).toBeDisabled()
    expect(screen.getByText(guideEn.basics.steps[0])).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Next step" }))
    expect(screen.getByText(guideEn.basics.steps[1])).toBeVisible()
    expect(screen.queryByText(guideEn.basics.steps[0])).not.toBeInTheDocument()
    for (let index = 2; index < guideEn.basics.steps.length; index++) fireEvent.click(screen.getByRole("button", { name: "Next step" }))
    expect(screen.getByText(en.guide.finished)).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Read from the start" }))
    expect(screen.getByText(guideEn.basics.steps[0])).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Show all steps" }))
    guideEn.basics.steps.forEach((step) => expect(screen.getByText(step)).toBeVisible())
  })

  it("searches instructions and recovers from empty results / ค้นหาเนื้อหาและล้างตัวกรอง", async () => {
    const user = userEvent.setup()
    render(<GuideExplorer articles={articlesFor("EMPLOYEE")} labels={en.guide} role="EMPLOYEE" hasProfile />)
    const search = screen.getByRole("searchbox", { name: "Search the guide" })
    fireEvent.change(search, { target: { value: guideEn.leaveRequest.steps[2] } })
    expect(screen.getByRole("heading", { name: guideEn.leaveRequest.title })).toBeVisible()
    fireEvent.change(search, { target: { value: "zz-no-matching-topic-zz" } })
    expect(screen.getByText(en.guide.noResults)).toBeVisible()
    fireEvent.click(screen.getAllByRole("button", { name: en.guide.clear })[0])
    expect(search).toHaveValue("")
    expect(screen.getByRole("heading", { name: guideEn.basics.title })).toBeVisible()
    await user.click(screen.getByRole("combobox", { name: en.guide.category }))
    await user.click(await screen.findByRole("option", { name: en.guide.categories.personal }))
    expect(screen.getByRole("heading", { name: guideEn.profile.title })).toBeVisible()
  })

  it("handles inaccessible deep links and unlinked profiles / ลิงก์ที่ไม่มีสิทธิ์และบัญชียังไม่ผูกประวัติ", () => {
    window.history.replaceState(null, "", "/guide?topic=payrollSettings")
    const view = render(<GuideExplorer articles={articlesFor("EMPLOYEE")} labels={en.guide} role="EMPLOYEE" hasProfile={false} />)
    expect(screen.queryByText(guideEn.payrollSettings.title)).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: guideEn.basics.title })).toBeVisible()
    window.history.replaceState(null, "", "/guide?topic=attendance")
    view.rerender(<GuideExplorer articles={articlesFor("EMPLOYEE")} labels={en.guide} role="EMPLOYEE" hasProfile={false} />)
    expect(screen.getByRole("heading", { name: guideEn.attendance.title })).toBeVisible()
    expect(screen.queryByRole("link", { name: en.guide.openPage })).not.toBeInTheDocument()
    expect(screen.getAllByText(en.guide.missingProfile)).toHaveLength(2)
  })
})
