"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  AlertTriangle,
  ShieldCheck,
  Play,
  Square,
  RefreshCw,
} from "lucide-react";
import type { Alert } from "@/lib/use-live-metrics";

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch initial active state from backend when panel mounts
  useEffect(() => {
    async function checkInitialState() {
      try {
        const res = await fetch("https://performance-monitoring-server.onrender.com/api/v1/demo/state");
        if (res.ok) {
          const data = (await res.json()) as { active: boolean };
          setIsDemoActive(data.active);
        }
      } catch (err) {
        console.error("Failed to fetch initial simulator state:", err);
      }
    }
    void checkInitialState();
  }, []);

  // Listen for the real stop signal from the backend (manual stop, TTL expiry,
  // or MAX_LOGS_PER_SESSION cap) instead of guessing with a client-side timer
  useEffect(() => {
    const socket = io("https://performance-monitoring-server.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("demo-stopped", () => {
      setIsDemoActive(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handler to explicitly force-start or force-stop the stream
  const toggleDemoStream = async () => {
    setIsLoading(true);
    const targetState = !isDemoActive;

    try {
      const res = await fetch("https://performance-monitoring-server.onrender.com/api/v1/demo/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: targetState }),
      });

      if (res.ok) {
        setIsDemoActive(targetState);
      } else {
        console.error("Failed to update simulator state on backend.");
      }
    } catch (err) {
      console.error("Network error updating simulator state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-medium text-foreground">Alerts</h3>
        </div>

        {/* Actions Section: Control Button + Active Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => void toggleDemoStream()}
            disabled={isLoading}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors border disabled:opacity-50 ${
              isDemoActive
                ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                : "bg-primary text-primary-foreground border-transparent hover:bg-primary/90"
            }`}
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : isDemoActive ? (
              <>
                <Square className="h-3 w-3 fill-current" />
                Stop Simulator
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                Start Simulator
              </>
            )}
          </button>

          <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
            {alerts.length} active
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {alerts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
            <ShieldCheck className="h-8 w-8 text-[oklch(0.7_0.17_155)]" />
            <p className="text-sm font-medium text-foreground">
              All systems healthy
            </p>
            <p className="text-xs text-muted-foreground">
              No critical errors detected
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="rounded-md border border-destructive/30 bg-destructive/5 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                    {alert.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {alert.time}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground">{alert.message}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Webhook sent</span>
                  {alert.suppressed > 0 ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                      {alert.suppressed} suppressed
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Throttled to 1 webhook per error type / 10s window
        </p>
      </div>
    </div>
  );
}
