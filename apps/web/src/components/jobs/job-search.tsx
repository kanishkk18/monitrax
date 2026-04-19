"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCcw, Search, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Changed", value: "changed" },
  { label: "Error", value: "error" },
];

const TYPE_FILTERS = [
  { label: "All types", value: "all" },
  { label: "Visual", value: "visual" },
  { label: "Text", value: "text" },
  { label: "XPath", value: "xpath" },
  { label: "JSON API", value: "json_api" },
];

export function JobSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "all";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router]
  );

  const currentStatusLabel = STATUS_FILTERS.find((f) => f.value === status)?.label || "All";
  const currentTypeLabel = TYPE_FILTERS.find((f) => f.value === type)?.label || "All types";

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="border-b border-border py-1 flex justify-between items-center ">
        <div className="relative ml-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-white " />
          <Input
            className="pl-9 pr-9 !bg-transparent hover:!bg-[#222] border-none dark:text-white "
            placeholder="Search by name, URL or description..."
            defaultValue={q}
            onChange={(e) => {
              const val = e.target.value;
              clearTimeout((window as any)._jobSearchTimer);
              (window as any)._jobSearchTimer = setTimeout(() => {
                updateParams({ q: val });
              }, 350);
            }}
          />
          {q && (
            <button
              onClick={() => updateParams({ q: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
<div className="flex items-center gap-3 flex-wrap">
        
        <div className="flex items-center gap-2 flex-wrap">
        {/* Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                status
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-input text-muted-foreground"
              )}
            >
              Status: {currentStatusLabel}
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {STATUS_FILTERS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => updateParams({ status: f.value })}
                className="text-xs cursor-pointer flex items-center justify-between"
              >
                {f.label}
                {status === f.value && <Check className="w-3 h-3" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
                type && type !== "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-input text-muted-foreground"
              )}
            >
              Type: {currentTypeLabel}
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {TYPE_FILTERS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => updateParams({ type: f.value })}
                className="text-xs cursor-pointer flex items-center justify-between"
              >
                {f.label}
                {(type || "all") === f.value && <Check className="w-3 h-3" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear filters */}
        {(q || status || (type && type !== "all")) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => router.push(pathname)}
          >
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
      <div className="">
          <Button onClick={() => router.refresh()} variant="outline" className="">
            <RefreshCcw className="w-4 h-4 " />
            <p className="text-xs"> Refresh </p>
          </Button>
        </div>
        </div>
      </div>

      {isPending && (
        <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
      )}
    </div>
  );
}