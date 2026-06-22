"use client"

import { useState } from "react"
import type { LogLevel, LogLine } from "@/lib/use-live-metrics"
import { cn } from "@/lib/utils"

const levelStyles: Record<LogLevel, string> = {
  INFO: "text-muted-foreground",
  WARN: "text-[oklch(0.75_0.16_80)]",
  ERROR: "text-destructive",
  CRITICAL: "text-destructive font-semibold",
}

const levelBadge: Record<LogLevel, string> = {
  INFO: "bg-muted text-muted-foreground",
  WARN: "bg-[oklch(0.75_0.16_80_/_0.15)] text-[oklch(0.75_0.16_80)]",
  ERROR: "bg-destructive/15 text-destructive",
  CRITICAL: "bg-destructive/20 text-destructive",
}

const FILTERS: ("ALL" | LogLevel)[] = ["ALL", "INFO", "WARN", "ERROR", "CRITICAL"]

export function LogTerminal({ logs }: { logs: LogLine[] }) {
  const [filter, setFilter] = useState<"ALL" | LogLevel>("ALL")
  const visible = filter === "ALL" ? logs : logs.filter((l) => l.level === filter)

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.7_0.17_155)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.7_0.17_155)]" />
          </span>
          <h3 className="text-sm font-medium text-foreground">Live Log Stream</h3>
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[360px] overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {visible.length === 0 ? (
          <p className="px-1 py-4 text-muted-foreground">Waiting for logs…</p>
        ) : (
          visible.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 rounded px-1 py-0.5 hover:bg-muted/40"
            >
              <span className="shrink-0 text-muted-foreground">{log.time}</span>
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 text-[10px] font-semibold uppercase",
                  levelBadge[log.level],
                )}
              >
                {log.level}
              </span>
              <span className="shrink-0 text-primary">{log.service}</span>
              <span className={cn("min-w-0 break-words", levelStyles[log.level])}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
