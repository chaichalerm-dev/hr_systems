import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { en } from "@/i18n/dictionaries/en"
import { EmployeesToolbar } from "./employees-toolbar"

const navigation = vi.hoisted(() => ({ replace: vi.fn(), params: "" }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => "/employees",
  useSearchParams: () => new URLSearchParams(navigation.params),
}))
vi.mock("@/i18n/client", () => ({ useTranslations: () => en }))

describe("Employee search / การค้นหาพนักงาน", () => {
  beforeEach(() => { vi.useFakeTimers(); navigation.params = ""; navigation.replace.mockClear() })
  afterEach(() => { cleanup(); vi.useRealTimers() })

  it("sends one request after typing pauses / ส่งคำขอครั้งเดียวเมื่อหยุดพิมพ์", () => {
    render(<EmployeesToolbar departments={[]} />)
    const input = screen.getByRole("textbox", { name: "Search" })
    for (const value of ["S", "So", "Som"]) fireEvent.change(input, { target: { value } })
    expect(input).toHaveValue("Som")
    expect(navigation.replace).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(350))
    expect(navigation.replace).toHaveBeenCalledTimes(1)
    expect(navigation.replace).toHaveBeenCalledWith("/employees?search=Som&page=1", { scroll: false })
  })

  it("clearing or leaving cancels queued searches / ล้างตัวกรองหรือออกจากหน้าจะยกเลิกคำขอที่รออยู่", () => {
    const view = render(<EmployeesToolbar departments={[]} />)
    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), { target: { value: "old" } })
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }))
    act(() => vi.advanceTimersByTime(350))
    expect(navigation.replace).toHaveBeenCalledTimes(1)
    expect(navigation.replace).toHaveBeenLastCalledWith("/employees", { scroll: false })
    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), { target: { value: "new" } })
    view.unmount()
    act(() => vi.advanceTimersByTime(350))
    expect(navigation.replace).toHaveBeenCalledTimes(1)
  })

  it("keeps newer text when an older response arrives / ผลค้นหาเก่าไม่ทับคำที่พิมพ์ใหม่", () => {
    const view = render(<EmployeesToolbar departments={[]} />)
    const input = screen.getByRole("textbox", { name: "Search" })
    fireEvent.change(input, { target: { value: "old" } })
    act(() => vi.advanceTimersByTime(350))
    fireEvent.change(input, { target: { value: "new" } })
    navigation.params = "search=old&page=1"
    view.rerender(<EmployeesToolbar departments={[]} />)
    expect(input).toHaveValue("new")
    act(() => vi.advanceTimersByTime(350))
    expect(navigation.replace).toHaveBeenLastCalledWith("/employees?search=new&page=1", { scroll: false })
  })

  it("Enter searches immediately and preserves filters / Enter ค้นหาทันทีพร้อมตัวกรองเดิม", () => {
    navigation.params = "departmentId=engineering&page=4"
    render(<EmployeesToolbar departments={[{ id: "engineering", name: "Engineering" }]} />)
    const input = screen.getByRole("textbox", { name: "Search" })
    fireEvent.change(input, { target: { value: "Som" } })
    fireEvent.keyDown(input, { key: "Enter" })
    act(() => vi.advanceTimersByTime(350))
    expect(navigation.replace).toHaveBeenCalledTimes(1)
    const params = new URL(navigation.replace.mock.calls[0][0], "http://localhost").searchParams
    expect(params.get("departmentId")).toBe("engineering")
    expect(params.get("search")).toBe("Som")
    expect(params.get("page")).toBe("1")
  })
})
