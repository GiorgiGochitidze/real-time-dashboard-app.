"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { MetricPoint } from "@/lib/use-live-metrics"

type MetricChartProps = {
  title: string
  data: MetricPoint[]
  dataKey: keyof Omit<MetricPoint, "time">
  color: string
  current: string
  unit?: string
  max?: number
}

export function MetricChart({
  title,
  data,
  dataKey,
  color,
  current,
  unit,
  max,
}: MetricChartProps) {
  const gradientId = `grad-${dataKey}`

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {current}
            {unit ? <span className="text-muted-foreground"> {unit}</span> : null}
          </span>
        </div>
      </div>

      <div className="mt-4 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: "oklch(0.68 0.01 260)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={48}
            />
            <YAxis
              domain={[0, max ?? "auto"]}
              tick={{ fill: "oklch(0.68 0.01 260)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.2 0.006 260)",
                border: "1px solid oklch(1 0 0 / 12%)",
                borderRadius: 8,
                fontSize: 12,
                color: "oklch(0.97 0 0)",
              }}
              labelStyle={{ color: "oklch(0.68 0.01 260)" }}
              cursor={{ stroke: "oklch(1 0 0 / 15%)" }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
