"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export type MetricPoint = {
  time: string;
  cpu: number;
  memory: number;
  requests: number;
};

export type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

export type LogLine = {
  id: number;
  time: string;
  level: LogLevel;
  service: string;
  message: string;
};

export type Alert = {
  id: number;
  time: string;
  type: string;
  message: string;
  count: number;
  suppressed: number;
};

const MAX_POINTS = 30;
const MAX_LOGS = 40;

function timeLabel(d: Date) {
  return d.toLocaleTimeString("en-US", { hour12: false });
}

// Keep a clean seed array for instant server-side rendering/hydration safety
function seedSeries(): MetricPoint[] {
  return Array.from({ length: MAX_POINTS }, (_, i) => {
    const d = new Date(Date.now() - (MAX_POINTS - i) * 5000); // 5s gaps
    return {
      time: timeLabel(d),
      cpu: 13,
      memory: 45,
      requests: 0,
    };
  });
}

export function useLiveMetrics() {
  const [series, setSeries] = useState<MetricPoint[]>(seedSeries);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Connect to your NestJS gateway port (defaulting to your Nest server address)
    const socket = io("https://performance-monitoring-server.onrender.com", {
      transports: ["websocket"],
    });

    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping-demo");
      }
    }, 5000);

    // Listen to real-time micro-batches sent by LogProcessor
    socket.on("metrics-update", (data: { logs: any[]; alerts: any[] }) => {
      const now = new Date();
      const timeStr = timeLabel(now);

      // 1. Calculate live performance charts from incoming batch metadata
      const incomingLogs = data.logs || [];
      const totalCount = incomingLogs.length;

      const cpuAvg =
        totalCount > 0
          ? incomingLogs.reduce((acc, curr) => acc + (curr.cpu_load || 40), 0) /
            totalCount
          : 35;

      const memAvg =
        totalCount > 0
          ? incomingLogs.reduce((acc, curr) => acc + (curr.mem_load || 50), 0) /
            totalCount
          : 48;

      // Append new coordinate point onto chart timeline array
      setSeries((prev) => {
        const nextPoint: MetricPoint = {
          time: timeStr,
          cpu: cpuAvg,
          memory: memAvg,
          requests: totalCount, // logs processed per second over the 5s interval
        };
        return [...prev.slice(-(MAX_POINTS - 1)), nextPoint];
      });

      // 2. Append lines onto console board
      if (incomingLogs.length > 0) {
        const structuralLogs: LogLine[] = incomingLogs.map(
          (l: any, index: number) => ({
            id: l.id || Date.now() + index,
            time: l.createdAt ? timeLabel(new Date(l.createdAt)) : timeStr,
            level: l.level as LogLevel,
            service: l.serverId
              ? `node-${l.serverId.slice(0, 4)}`
              : "cluster-node",
            message: l.message,
          }),
        );

        setLogs((prev) => [...structuralLogs, ...prev].slice(0, MAX_LOGS));
      }

      // 3. Process dispatch metrics board
      if (data.alerts && data.alerts.length > 0) {
        const structuralAlerts: Alert[] = data.alerts.map(
          (a: any, index: number) => ({
            id: Date.now() + index,
            time: timeStr,
            type: "CRITICAL_ERROR",
            message: a.message,
            count: a.count || 1,
            suppressed: a.suppressed || 0,
          }),
        );
        setAlerts(structuralAlerts);
      }
    });

    return () => {
      clearInterval(heartbeatInterval);
      socket.disconnect();
    };
  }, []);

  return { series, logs, alerts };
}
