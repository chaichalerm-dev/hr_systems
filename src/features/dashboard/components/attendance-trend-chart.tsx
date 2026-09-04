"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { AttendanceTrendPoint } from "@/server/services/dashboard"

const chartConfig = {
  present: { label: "Present", color: "var(--status-good)" },
  late: { label: "Late", color: "var(--status-warning)" },
  absent: { label: "Absent", color: "var(--status-critical)" },
} satisfies ChartConfig

export function AttendanceTrendChart({ data }: { data: AttendanceTrendPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="present"
          type="monotone"
          fill="var(--color-present)"
          fillOpacity={0.15}
          stroke="var(--color-present)"
          strokeWidth={2}
        />
        <Area
          dataKey="late"
          type="monotone"
          fill="var(--color-late)"
          fillOpacity={0.15}
          stroke="var(--color-late)"
          strokeWidth={2}
        />
        <Area
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
