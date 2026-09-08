"use client"

import { useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Role } from "@prisma/client"
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, Lightbulb, ListOrdered, Search, ShieldCheck } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/i18n/dictionaries/en"
import type { GuideArticle, GuideCategory } from "../types"

type Labels = Dictionary["guide"]
const categories: GuideCategory[] = ["basics", "personal", "team", "management", "admin"]

export function GuideExplorer({ articles, labels: t, role, hasProfile }: {
  articles: GuideArticle[]
  labels: Labels
  role: Role
  hasProfile: boolean
}) {
  const params = useSearchParams()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<GuideCategory | "all">("all")
  const [mode, setMode] = useState<"guided" | "overview">("guided")
  const reader = useRef<HTMLDivElement>(null)
  const needle = query.trim().toLocaleLowerCase()
  const visible = articles.filter((article) =>
    (category === "all" || article.category === category) &&
    [article.title, article.summary, article.before, ...article.steps, article.result, ...article.tips]
      .join(" ").toLocaleLowerCase().includes(needle)
  )
  const selected = visible.find((article) => article.id === params.get("topic")) ?? visible[0]

  function selectTopic(id: string) {
    // เปลี่ยนหัวข้อในเครื่องทันที และเก็บลิงก์ไว้เปิดซ้ำได้ โดยไม่โหลดข้อมูลใหม่
    // Update the topic locally and keep a reusable URL without a server round trip.
    const url = new URL(window.location.href)
    url.searchParams.set("topic", id)
    window.history.replaceState(null, "", url)
    requestAnimationFrame(() => {
      reader.current?.focus({ preventScroll: true })
      reader.current?.scrollIntoView({ block: "start", behavior: "instant" })
    })
  }

  function clearFilters() { setQuery(""); setCategory("all") }

  return (
    <div className="space-y-6" data-guide>
      <header className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary/5" />
        <div className="relative max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"><BookOpen className="size-4" aria-hidden="true" />HRFlow · {t.title}</span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">{t.subtitle}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
            <span className="inline-flex items-center gap-2 font-medium"><ShieldCheck className="size-4 text-primary" aria-hidden="true" />{t.forRole.replace("{role}", t.roles[role])}</span>
            <span className="text-muted-foreground">{t.topicCount.replace("{count}", String(articles.length))}</span>
          </div>
          <p className="text-xs leading-6 text-muted-foreground">{t.roleHint}</p>
        </div>
      </header>

      {!hasProfile && <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-7">{t.missingProfile}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <section aria-label={t.contents} className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm lg:sticky lg:top-0">
          <label htmlFor="guide-search" className="mb-2 block text-sm font-semibold">{t.search}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input id="guide-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} className="h-11 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <label htmlFor="guide-category" className="mb-2 mt-4 block text-xs font-medium text-muted-foreground">{t.category}</label>
          <Select value={category} onValueChange={(value) => setCategory(value ?? "all")} items={{ all: t.allCategories, ...t.categories }}>
            <SelectTrigger id="guide-category" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              {categories.filter((value) => articles.some((article) => article.category === value)).map((value) => <SelectItem key={value} value={value}>{t.categories[value]}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
            <h2 className="text-sm font-semibold">{t.contents}</h2>
            <span role="status" className="shrink-0 text-xs text-muted-foreground">{t.topicCount.replace("{count}", String(visible.length))}</span>
          </div>
          {(query || category !== "all") && <Button variant="link" className="h-auto min-h-11 whitespace-normal px-0 text-left" onClick={clearFilters}>{t.clear}</Button>}
          <nav aria-label={t.contents} className="mt-3 max-h-64 space-y-4 overflow-y-auto overscroll-contain pr-1 lg:max-h-[55dvh]">
            {categories.map((value) => {
              const topics = visible.filter((article) => article.category === value)
              if (!topics.length) return null
              return <div key={value}>
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">{t.categories[value]}</h3>
                <ul className="space-y-1">
                  {topics.map((article) => <li key={article.id}>
                    <button type="button" onClick={() => selectTopic(article.id)} aria-current={selected?.id === article.id ? "page" : undefined} data-guide-topic={article.id} className={cn("flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-left text-sm leading-6 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", selected?.id === article.id ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                      <span className="flex-1">{article.title}</span><ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                    </button>
                  </li>)}
                </ul>
              </div>
            })}
          </nav>
        </section>

        <div ref={reader} tabIndex={-1} aria-label={selected?.title ?? t.noResults} className="min-w-0 scroll-mt-4 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {selected ? <ArticleReader key={selected.id} article={selected} labels={t} mode={mode} setMode={setMode} hasProfile={hasProfile} /> : (
            <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
              <Search className="mx-auto mb-4 size-8 text-muted-foreground" aria-hidden="true" />
              <p className="mb-4 text-sm leading-7 text-muted-foreground">{t.noResults}</p>
              <Button variant="outline" onClick={clearFilters}>{t.clear}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ArticleReader({ article, labels: t, mode, setMode, hasProfile }: {
  article: GuideArticle
  labels: Labels
  mode: "guided" | "overview"
  setMode: (mode: "guided" | "overview") => void
  hasProfile: boolean
}) {
  const [step, setStep] = useState(0)
  const stepLabel = (index: number) => t.step.replace("{current}", String(index + 1)).replace("{total}", String(article.steps.length))
  const last = step === article.steps.length - 1

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm" data-guide-article={article.id}>
      <div className="space-y-4 border-b p-5 sm:p-7">
        <span className="text-xs font-semibold text-primary">{t.categories[article.category]}</span>
        <h2 className="text-xl font-semibold leading-relaxed tracking-tight sm:text-2xl">{article.title}</h2>
        <p className="text-sm leading-7 text-muted-foreground">{article.summary}</p>
        <div className="rounded-xl bg-muted/60 p-4">
          <h3 className="mb-1 text-sm font-semibold">{t.before}</h3>
          <p className="text-sm leading-7 text-muted-foreground">{article.before}</p>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">{t.mode}</legend>
          <div className="flex flex-wrap gap-2">
            <Button variant={mode === "guided" ? "default" : "outline"} aria-pressed={mode === "guided"} onClick={() => setMode("guided")}><BookOpen aria-hidden="true" />{t.guided}</Button>
            <Button variant={mode === "overview" ? "default" : "outline"} aria-pressed={mode === "overview"} onClick={() => setMode("overview")}><ListOrdered aria-hidden="true" />{t.overview}</Button>
          </div>
          <p className="text-xs leading-6 text-muted-foreground">{t.modeHint}</p>
        </fieldset>

        <section aria-label={t.steps}>
          {mode === "guided" ? <>
            <div aria-live="polite" aria-atomic="true" className="min-h-44 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
              <h3 className="mb-3 text-sm font-semibold text-primary">{stepLabel(step)}</h3>
              <p className="text-base leading-8">{article.steps[step]}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft aria-hidden="true" />{t.previous}</Button>
              {last ? <Button variant="secondary" onClick={() => setStep(0)}>{t.restart}</Button> : <Button onClick={() => setStep(step + 1)}>{t.next}<ArrowRight aria-hidden="true" /></Button>}
            </div>
            {last && <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.finished}</p>}
          </> : <ol className="space-y-4">
            {article.steps.map((text, index) => <li key={index} className="rounded-xl border p-5">
              <h3 className="mb-2 text-sm font-semibold text-primary">{stepLabel(index)}</h3>
              <p className="text-base leading-8">{text}</p>
            </li>)}
          </ol>}
        </section>

        <section className="rounded-xl border border-status-good/20 bg-status-good/5 p-4 sm:p-5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 shrink-0 text-status-good" aria-hidden="true" />{t.result}</h3>
          <p className="text-sm leading-7">{article.result}</p>
        </section>
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Lightbulb className="size-4 shrink-0 text-primary" aria-hidden="true" />{t.tips}</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">{article.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
        </section>
        {article.href && <footer className="space-y-3 border-t pt-5">
          {article.needsProfile && !hasProfile ? <p className="text-sm leading-7 text-muted-foreground">{t.missingProfile}</p> : <Link href={article.href} className={buttonVariants({ variant: "default" })}>{t.openPage}<ArrowRight className="size-4" aria-hidden="true" /></Link>}
          <p className="text-xs leading-6 text-muted-foreground">{t.readingOnly}</p>
        </footer>}
      </div>
    </article>
  )
}
