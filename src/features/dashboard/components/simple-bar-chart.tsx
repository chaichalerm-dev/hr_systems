"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency, formatNumber } from "@/lib/format"

export interface SimpleBarDatum {
  category: string
  value: number
}

// `format` is a string, not a function prop, plain functions can't cross
// the server->client boundary, so the formatter is resolved here instead of
// being passed in from a server-component caller.
export function SimpleBarChart({
  data,
  valueLabel,
  format = "number",
}: {
  data: SimpleBarDatum[]
  valueLabel: string
  format?: "number" | "currency"
}) {
  const formatValue = format === "currency" ? formatCurrency : formatNumber
  const chartConfig = {
    value: { label: valueLabel, color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          interval={0}
          angle={data.length > 5 ? -20 : 0}
          textAnchor={data.length > 5 ? "end" : "middle"}
          height={data.length > 5 ? 40 : 24}
        />
        <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatValue(Number(value))} />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
