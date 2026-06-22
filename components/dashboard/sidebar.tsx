"use client"

import {
  Activity,
  Bell,
  Cpu,
  Database,
  LayoutDashboard,
  ScrollText,
  Server,
  Settings,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Overview", icon: LayoutDashboard, active: true },
]

export function Sidebar() {
  const [active, setActive] = useState("Overview")

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Sentinel</p>
          <p className="text-xs text-muted-foreground">Observability</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Monitoring
        </p>
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.label
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  )
}
