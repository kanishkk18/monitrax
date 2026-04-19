"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, XCircle } from "lucide-react";

interface Log {
  id: string;
  level: string;
  message: string;
  createdAt: Date;
  metadata: string | null;
}

export function JobLogsPanel({ logs }: { logs: Log[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No logs yet.
      </p>
    );
  }

  return (
    <div className="space-y-1 font-mono text-xs max-h-80 overflow-y-auto">
      {logs.map((log) => (
        <div
          key={log.id}
          className={cn(
            "flex items-start gap-2 px-3 py-2 rounded",
            log.level === "error" && "bg-destructive/10 text-destructive",
            log.level === "warn" && "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
            log.level === "info" && "bg-muted/50 text-muted-foreground"
          )}
        >
          {log.level === "error" && <XCircle className="w-3 h-3 mt-0.5 shrink-0" />}
          {log.level === "warn" && <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />}
          {log.level === "info" && <Info className="w-3 h-3 mt-0.5 shrink-0" />}
          <span className="text-[10px] opacity-60 shrink-0">
            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
          </span>
          <span className="break-all">{log.message}</span>
        </div>
      ))}
    </div>
  );
}
