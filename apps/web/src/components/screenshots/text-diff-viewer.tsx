"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, Minus, Equal } from "lucide-react";

interface TextDiffViewerProps {
  unifiedDiff: string;        // raw diff string from DB
  addedLines?: number;
  removedLines?: number;
  className?: string;
}

interface ParsedLine {
  type: "added" | "removed" | "unchanged";
  content: string;
}

function parseDiff(raw: string): ParsedLine[] {
  return raw.split("\n").map((line) => {
    if (line.startsWith("+ ")) return { type: "added", content: line.slice(2) };
    if (line.startsWith("- ")) return { type: "removed", content: line.slice(2) };
    return { type: "unchanged", content: line.startsWith("  ") ? line.slice(2) : line };
  });
}

export function TextDiffViewer({
  unifiedDiff,
  addedLines = 0,
  removedLines = 0,
  className,
}: TextDiffViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = parseDiff(unifiedDiff);
  const MAX_COLLAPSED = 30;

  const visibleLines = expanded ? lines : lines.slice(0, MAX_COLLAPSED);
  const hasMore = lines.length > MAX_COLLAPSED;

  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Text Diff
        </span>
        <div className="flex items-center gap-2">
          {addedLines > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-200 text-xs gap-1">
              <Plus className="w-3 h-3" />
              {addedLines}
            </Badge>
          )}
          {removedLines > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-200 text-xs gap-1">
              <Minus className="w-3 h-3" />
              {removedLines}
            </Badge>
          )}
        </div>
      </div>

      {/* Diff lines */}
      <div className="font-mono text-xs overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {visibleLines.map((line, i) => (
              <tr
                key={i}
                className={cn(
                  "leading-5",
                  line.type === "added" && "bg-green-50 dark:bg-green-950/20",
                  line.type === "removed" && "bg-red-50 dark:bg-red-950/20",
                  line.type === "unchanged" && "bg-background"
                )}
              >
                {/* Gutter */}
                <td className="w-8 px-2 text-right select-none text-muted-foreground border-r">
                  {line.type === "added" && (
                    <span className="text-green-600">+</span>
                  )}
                  {line.type === "removed" && (
                    <span className="text-red-500">−</span>
                  )}
                  {line.type === "unchanged" && (
                    <span className="text-muted-foreground/40">·</span>
                  )}
                </td>
                {/* Content */}
                <td
                  className={cn(
                    "px-3 py-0.5 whitespace-pre-wrap break-all",
                    line.type === "added" && "text-green-800 dark:text-green-300",
                    line.type === "removed" && "text-red-800 dark:text-red-300",
                    line.type === "unchanged" && "text-muted-foreground"
                  )}
                >
                  {line.content || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expand / collapse */}
      {hasMore && (
        <div className="border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full rounded-none h-8 text-xs text-muted-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show {lines.length - MAX_COLLAPSED} more lines
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
