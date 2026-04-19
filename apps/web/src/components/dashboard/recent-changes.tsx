import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface Change {
  id: string;
  capturedAt: Date;
  diffPercentage: number | null;
  job: { id: string; name: string; url: string };
}

interface ErrorLog {
  id: string;
  message: string;
  createdAt: Date;
  job: { id: string; name: string };
}

export function RecentChanges({
  changes,
  errors,
}: {
  changes: Change[];
  errors: ErrorLog[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="dark:bg-black">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Changes</CardTitle>
          <Link
            href="/history"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {changes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No changes detected yet
            </p>
          ) : (
            <div className="space-y-3">
              {changes.map((c) => (
                <Link
                  key={c.id}
                  href={`/jobs/${c.job.id}`}
                  className="flex items-start justify-between p-3 dark:bg-[#090A0A] rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.job.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.job.url}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(c.capturedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Badge variant="destructive" className="ml-2 shrink-0">
                    {c.diffPercentage?.toFixed(1)}% changed
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-black">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Errors</CardTitle>
          <Link
            href="/jobs"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            View jobs <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No errors — everything running smoothly
            </p>
          ) : (
            <div className="space-y-3">
              {errors.map((e) => (
                <Link
                  key={e.id}
                  href={`/jobs/${e.job.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{e.job.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {e.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(e.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
