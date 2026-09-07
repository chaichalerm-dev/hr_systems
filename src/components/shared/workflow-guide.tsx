import { ArrowRight } from "lucide-react"

export function WorkflowGuide({ title, steps }: { title: string; steps: string[] }) {
  return (
    <aside className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm lg:flex-row lg:items-center lg:gap-6">
      <p className="shrink-0 font-semibold text-primary">{title}</p>
      <ol className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            {index > 0 && <ArrowRight className="mr-1 hidden size-3 text-muted-foreground sm:block" aria-hidden />}
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-card text-xs font-semibold text-primary">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
