"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { AttendanceTrendPoint } from "@/server/services/dashboard"
import { useTranslations } from "@/i18n/client"

export function AttendanceTrendChart({ data }: { data: AttendanceTrendPoint[] }) {
  const t = useTranslations()
  const chartConfig = {
    present: { label: t.status.PRESENT, color: "var(--status-good)" },
    late: { label: t.status.LATE, color: "var(--status-warning)" },
    absent: { label: t.status.ABSENT, color: "var(--status-critical)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={chartConfig} className="h-64 min-w-0 w-full aspect-auto">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          isAnimationActive={false}
          dataKey="present"
          type="monotone"
          fill="var(--color-present)"
          fillOpacity={0.15}
          stroke="var(--color-present)"
          strokeWidth={2}
        />
        <Area
          isAnimationActive={false}
          dataKey="late"
          type="monotone"
          fill="var(--color-late)"
          fillOpacity={0.15}
          stroke="var(--color-late)"
          strokeWidth={2}
        />
        <Area
          isAnimationActive={false}
          dataKey="absent"
          type="monotone"
          fill="var(--color-absent)"
          fillOpacity={0.15}
          stroke="var(--color-absent)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
