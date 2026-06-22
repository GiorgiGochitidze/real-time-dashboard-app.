import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  trend?: string
  tone?: "default" | "good" | "warn" | "bad"
}

const toneMap: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  good: "text-[oklch(0.7_0.17_155)]",
  warn: "text-[oklch(0.75_0.16_80)]",
  bad: "text-destructive",
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  tone = "default",
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={cn("text-2xl font-semibold tabular-nums", toneMap[tone])}>
          {value}
        </span>
        {unit ? (
          <span className="text-sm text-muted-foreground">{unit}</span>
        ) : null}
      </div>
      {trend ? (
        <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
      ) : null}
    </div>
  )
}
