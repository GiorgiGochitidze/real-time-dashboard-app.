"use client"

import { Activity, Cpu, MemoryStick, Zap } from "lucide-react"
import { useLiveMetrics } from "@/lib/use-live-metrics"
import { AlertsPanel } from "./alerts-panel"
import { LogTerminal } from "./log-terminal"
import { MetricChart } from "./metric-chart"
import { Sidebar } from "./sidebar"
import { StatCard } from "./stat-card"

export function Dashboard() {
  const { series, logs, alerts } = useLiveMetrics()
  const latest = series[series.length - 1]

  const cpu = latest.cpu
  const mem = latest.memory
  const rps = latest.requests
  const errors = logs.filter((l) => l.level === "ERROR" || l.level === "CRITICAL")
    .length

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Server Health
            </h1>
            <p className="text-xs text-muted-foreground">
              Real-time metrics, logs &amp; alerting
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.7_0.17_155)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.7_0.17_155)]" />
              </span>
              Streaming · 1s
            </span>
            <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              prod-cluster-eu
            </span>
          </div>
        </header>

        <main className="flex-1 space-y-4 p-4 md:p-6">
          {/* Stat cards */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="CPU Usage"
              value={cpu.toFixed(1)}
              unit="%"
              icon={Cpu}
              trend="across 5 instances"
              tone={cpu > 85 ? "bad" : cpu > 70 ? "warn" : "good"}
            />
            <StatCard
              label="Memory"
              value={mem.toFixed(1)}
              unit="%"
              icon={MemoryStick}
              trend="14.2 GB / 32 GB"
              tone={mem > 85 ? "bad" : mem > 70 ? "warn" : "good"}
            />
            <StatCard
              label="Requests"
              value={Math.round(rps).toString()}
              unit="req/s"
              icon={Zap}
              trend="ingest throughput"
            />
            <StatCard
              label="Errors (window)"
              value={errors.toString()}
              icon={Activity}
              trend="last 40 log lines"
              tone={errors > 5 ? "bad" : errors > 0 ? "warn" : "good"}
            />
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <MetricChart
              title="CPU Usage"
              data={series}
              dataKey="cpu"
              color="oklch(0.62 0.19 255)"
              current={cpu.toFixed(1)}
              unit="%"
              max={100}
            />
            <MetricChart
              title="Memory Usage"
              data={series}
              dataKey="memory"
              color="oklch(0.7 0.13 300)"
              current={mem.toFixed(1)}
              unit="%"
              max={100}
            />
            <MetricChart
              title="Request Rate"
              data={series}
              dataKey="requests"
              color="oklch(0.7 0.17 155)"
              current={Math.round(rps).toString()}
              unit="req/s"
            />
          </section>

          {/* Logs + Alerts */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LogTerminal logs={logs} />
            </div>
            <div className="lg:col-span-1">
              <AlertsPanel alerts={alerts} />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
