// app/history/HistoryContent.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Screenshot {
  id: string;
  imageUrl: string | null;
  hasChanged: boolean;
  textChanged: boolean;
  diffPercentage: number | null;
  error: string | null;
  capturedAt: Date;
  job: {
    id: string;
    name: string;
    url: string;
    monitorType: string;
  };
}

interface HistoryContentProps {
  initialScreenshots: Screenshot[];
}

const BATCH_SIZE = 10;

export function HistoryContent({ initialScreenshots }: HistoryContentProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && visibleCount < initialScreenshots.length && !isLoading) {
          setIsLoading(true);
          // Small delay to prevent rapid firing and allow smooth scroll
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, initialScreenshots.length));
            setIsLoading(false);
          }, 150);
        }
      },
      {
        root: null,
        rootMargin: "200px", // Start loading before user reaches bottom
        threshold: 0,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, initialScreenshots.length, isLoading]);

  const visibleScreenshots = initialScreenshots.slice(0, visibleCount);
  const hasMore = visibleCount < initialScreenshots.length;

  // Image lazy loading with blur fade-in
  const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
    const [loaded, setLoaded] = useState(false);

    return (
      <div className="relative w-full h-full">
        {!loaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover object-top transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {visibleScreenshots.map((s, index) => (
        <Card 
          key={s.id} 
          className={cn(
            "transition-all duration-200",
            "hover:shadow-md hover:border-primary/20"
          )}
          style={{
            // Staggered animation for initial load
            animationDelay: index < BATCH_SIZE ? `${index * 30}ms` : "0ms",
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-12 rounded border overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                {s.imageUrl ? (
                  <LazyImage src={s.imageUrl} alt="" />
                ) : (
                  <FileText className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link 
                    href={`/jobs/${s.job.id}`} 
                    className="font-medium hover:underline truncate"
                  >
                    {s.job.name}
                  </Link>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">
                    {s.job.monitorType.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{s.job.url}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(s.capturedAt), "PPp")}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                {s.hasChanged || s.textChanged ? (
                  <Badge variant="destructive">
                    {s.diffPercentage != null && s.diffPercentage < 100
                      ? `${s.diffPercentage.toFixed(2)}% changed`
                      : "Text changed"}
                  </Badge>
                ) : s.error ? (
                  <Badge variant="outline" className="text-destructive border-destructive/40">
                    Error
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    No change
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {s.imageUrl ? "screenshot" : "text only"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Lazy load trigger */}
      {hasMore && (
        <div
          ref={loaderRef}
          className="py-6 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          ) : (
            <div className="h-8" /> // Invisible trigger area
          )}
        </div>
      )}

      {/* End of list */}
      {!hasMore && initialScreenshots.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-4">
          {initialScreenshots.length} snapshots total
        </p>
      )}

      {initialScreenshots.length === 0 && (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <p className="text-muted-foreground">No snapshots found.</p>
        </div>
      )}
    </div>
  );
}