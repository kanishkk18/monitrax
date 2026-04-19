"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Eye, Play, Pause, Trash2, ExternalLink,
  Clock, AlertCircle, CheckCircle2, RefreshCw, Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  monitorType: string;
  cronExpression: string;
  lastRunAt: Date | null;
  lastStatus: string | null;
  failureCount: number;
  totalRuns: number;
  screenshots: {
    id: string;
    imageUrl: string;
    hasChanged: boolean;
    diffPercentage: number | null;
    capturedAt: Date;
    error: string | null;
  }[];
  _count: { screenshots: number };
}

function StatusBadge({ status, enabled }: { status: string | null; enabled: boolean }) {
  if (!enabled) return <Badge variant="secondary">Paused</Badge>;
  if (!status) return <Badge variant="outline">Never run</Badge>;
  if (status === "changed") return <Badge variant="destructive">Changed</Badge>;
  if (status === "error") return <Badge variant="destructive">Error</Badge>;
  if (status === "no_change") return <Badge variant="outline" className="text-green-600 border-green-200">No change</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function JobList({ jobs: initialJobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const setLoading = (id: string, loading: boolean) => {
    setLoadingIds((prev) => {
      const next = new Set(prev);
      loading ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const toggleEnabled = async (job: Job) => {
    setLoading(job.id, true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !job.enabled }),
      });
      if (!res.ok) throw new Error("Failed");
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, enabled: !j.enabled } : j))
      );
      toast.success(job.enabled ? "Monitor paused" : "Monitor resumed");
    } catch {
      toast.error("Failed to update monitor");
    } finally {
      setLoading(job.id, false);
    }
  };

  const runNow = async (job: Job) => {
    setLoading(job.id, true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_now" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Job queued — check back shortly");
    } catch {
      toast.error("Failed to queue job");
    } finally {
      setLoading(job.id, false);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Monitor deleted");
    } catch {
      toast.error("Failed to delete monitor");
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 border rounded-xl bg-muted/30">
        <Eye className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No monitors yet</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-4">
          Create your first monitor to start tracking website changes.
        </p>
        <Link href="/jobs/new">
          <Button>Create Monitor</Button>
        </Link>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {jobs.map((job) => {
          const latest = job.screenshots[0];
          const isLoading = loadingIds.has(job.id);
          return (
            <Card key={job.id} className={cn(!job.enabled && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-10 rounded border overflow-hidden bg-muted shrink-0">
                    {latest?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={latest.imageUrl}
                        alt={job.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-semibold hover:underline truncate"
                      >
                        {job.name}
                      </Link>
                      <StatusBadge status={job.lastStatus} enabled={job.enabled} />
                      <Badge variant="outline" className="text-xs capitalize">
                        {job.monitorType.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground truncate max-w-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{job.url}</span>
                      </a>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.lastRunAt
                          ? `Last run ${formatDistanceToNow(new Date(job.lastRunAt), { addSuffix: true })}`
                          : "Never run"}
                      </span>
                      <span>{job._count.screenshots} screenshots</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => runNow(job)}
                          disabled={isLoading}
                        >
                          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Run now</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleEnabled(job)}
                          disabled={isLoading}
                        >
                          {job.enabled ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{job.enabled ? "Pause" : "Resume"}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/jobs/${job.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>

                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete monitor?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>{job.name}</strong> and all its screenshots and history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteJob(job.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
