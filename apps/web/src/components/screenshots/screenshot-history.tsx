// "use client";

// import { useState } from "react";
// import { format } from "date-fns";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import { CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, GitCompare } from "lucide-react";
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle,
// } from "@/components/ui/dialog";

// interface Screenshot {
//   id: string;
//   imageUrl: string;
//   diffUrl: string | null;
//   diffPercentage: number | null;
//   hasChanged: boolean;
//   capturedAt: Date;
//   pageTitle: string | null;
//   error: string | null;
// }

// export function ScreenshotHistory({ screenshots }: { screenshots: Screenshot[] }) {
//   const [selected, setSelected] = useState<Screenshot | null>(null);
//   const [showDiff, setShowDiff] = useState(false);

//   if (screenshots.length === 0) {
//     return (
//       <p className="text-sm text-muted-foreground text-center py-8">
//         No screenshots yet. Run the monitor to capture the first screenshot.
//       </p>
//     );
//   }

//   const selectedIdx = selected ? screenshots.findIndex((s) => s.id === selected.id) : -1;
//   const prev = selectedIdx > 0 ? screenshots[selectedIdx - 1] : null;
//   const next = selectedIdx < screenshots.length - 1 ? screenshots[selectedIdx + 1] : null;

//   return (
//     <>
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//         {screenshots.map((screenshot) => (
//           <button
//             key={screenshot.id}
//             onClick={() => setSelected(screenshot)}
//             className={cn(
//               "group relative rounded-lg border overflow-hidden text-left transition-all hover:shadow-md",
//               screenshot.hasChanged
//                 ? "border-destructive/50 ring-1 ring-destructive/20"
//                 : "border-border"
//             )}
//           >
//             {/* Thumbnail */}
//             <div className="aspect-video bg-muted">
//               {screenshot.imageUrl ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={screenshot.imageUrl}
//                   alt={`Screenshot ${screenshot.capturedAt}`}
//                   className="w-full h-full object-cover object-top"
//                 />
//               ) : screenshot.error ? (
//                 <div className="w-full h-full flex items-center justify-center text-muted-foreground">
//                   <AlertCircle className="w-6 h-6" />
//                 </div>
//               ) : null}
//             </div>

//             {/* Info */}
//             <div className="p-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs text-muted-foreground">
//                   {format(new Date(screenshot.capturedAt), "MMM d, HH:mm")}
//                 </span>
//                 {screenshot.hasChanged ? (
//                   <Badge variant="destructive" className="text-[10px] px-1 py-0">
//                     {screenshot.diffPercentage?.toFixed(1)}%
//                   </Badge>
//                 ) : (
//                   <CheckCircle2 className="w-3 h-3 text-green-500" />
//                 )}
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>

//       {/* Detail dialog */}
//       <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
//         <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center justify-between pr-8">
//               <span>
//                 {selected && format(new Date(selected.capturedAt), "PPpp")}
//               </span>
//               {selected?.hasChanged && (
//                 <Badge variant="destructive">
//                   {selected.diffPercentage?.toFixed(2)}% changed
//                 </Badge>
//               )}
//             </DialogTitle>
//           </DialogHeader>

//           {selected && (
//             <div className="space-y-4">
//               {/* Navigation */}
//               <div className="flex items-center justify-between">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setSelected(prev)}
//                   disabled={!prev}
//                 >
//                   <ChevronLeft className="w-4 h-4 mr-1" />
//                   Newer
//                 </Button>

//                 {selected.hasChanged && selected.diffUrl && (
//                   <Button
//                     variant={showDiff ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setShowDiff(!showDiff)}
//                   >
//                     <GitCompare className="w-4 h-4 mr-2" />
//                     {showDiff ? "Show screenshot" : "Show diff"}
//                   </Button>
//                 )}

//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setSelected(next)}
//                   disabled={!next}
//                 >
//                   Older
//                   <ChevronRight className="w-4 h-4 ml-1" />
//                 </Button>
//               </div>

//               {/* Image display */}
//               {showDiff && selected.diffUrl ? (
//                 <div className="space-y-2">
//                   <p className="text-xs text-muted-foreground">
//                     Red pixels = changed areas
//                   </p>
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={selected.diffUrl}
//                     alt="Diff visualization"
//                     className="w-full rounded-lg border"
//                   />
//                 </div>
//               ) : (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={selected.imageUrl}
//                   alt="Screenshot"
//                   className="w-full rounded-lg border"
//                 />
//               )}

//               {/* Error */}
//               {selected.error && (
//                 <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive font-mono">
//                   {selected.error}
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  FileText,
  Image,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TextDiffViewer } from "./text-diff-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Screenshot {
  id: string;
  imageUrl: string;
  diffUrl: string | null;
  diffPercentage: number | null;
  hasChanged: boolean;
  textChanged: boolean;
  textDiff: string | null;
  capturedAt: Date;
  pageTitle: string | null;
  error: string | null;
}

export function ScreenshotHistory({ screenshots }: { screenshots: Screenshot[] }) {
  const [selected, setSelected] = useState<Screenshot | null>(null);

  if (screenshots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No snapshots yet. Run the monitor to capture the first one.
      </p>
    );
  }

  const selectedIdx = selected
    ? screenshots.findIndex((s) => s.id === selected.id)
    : -1;
  const prev = selectedIdx > 0 ? screenshots[selectedIdx - 1] : null;
  const next =
    selectedIdx < screenshots.length - 1 ? screenshots[selectedIdx + 1] : null;

  const hasImage = (s: Screenshot) => !!s.imageUrl;
  const hasTextDiff = (s: Screenshot) => !!s.textDiff;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {screenshots.map((screenshot) => (
          <button
            key={screenshot.id}
            onClick={() => setSelected(screenshot)}
            className={cn(
              "group relative rounded-lg border overflow-hidden text-left transition-all hover:shadow-md",
              screenshot.hasChanged
                ? "border-destructive/50 ring-1 ring-destructive/20"
                : "border-border"
            )}
          >
            {/* Thumbnail or text placeholder */}
            <div className="aspect-video bg-muted relative">
              {hasImage(screenshot) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={screenshot.imageUrl}
                  alt={`Snapshot ${screenshot.capturedAt}`}
                  className="w-full h-full object-cover object-top"
                />
              ) : screenshot.error ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <AlertCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
                  <FileText className="w-6 h-6" />
                  <span className="text-[10px]">Text only</span>
                </div>
              )}

              {/* Change badge overlay */}
              {screenshot.hasChanged && (
                <div className="absolute top-1 right-1">
                  <span className="bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Changed
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(screenshot.capturedAt), "MMM d, HH:mm")}
                </span>
                {screenshot.hasChanged ? (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1 py-0"
                  >
                    {screenshot.diffPercentage != null &&
                    screenshot.diffPercentage < 100
                      ? `${screenshot.diffPercentage.toFixed(1)}%`
                      : "✎"}
                  </Badge>
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="min-w-[70vw]  max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center justify-between pr-8">
              <span>
                {selected && format(new Date(selected.capturedAt), "PPpp")}
              </span>
              {selected?.hasChanged && (
                <Badge variant="destructive">Changed</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(prev)}
                  disabled={!prev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Newer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(next)}
                  disabled={!next}
                >
                  Older
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Tabs: Screenshot | Pixel Diff | Text Diff */}
              <Tabs
                className="flex flex-col items-center"
                defaultValue={
                  hasImage(selected)
                    ? "screenshot"
                    : hasTextDiff(selected)
                    ? "textdiff"
                    : "screenshot"
                }
              >
                <TabsList>
                  {hasImage(selected) && (
                    <TabsTrigger value="screenshot" className="gap-1.5">
                      <Image className="w-3.5 h-3.5" />
                      Screenshot
                    </TabsTrigger>
                  )}
                  {selected.diffUrl && (
                    <TabsTrigger value="pixeldiff" className="gap-1.5">
                      <GitCompare className="w-3.5 h-3.5" />
                      Pixel Diff
                    </TabsTrigger>
                  )}
                  {hasTextDiff(selected) && (
                    <TabsTrigger value="textdiff" className="gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Text Diff
                    </TabsTrigger>
                  )}
                </TabsList>

                {hasImage(selected) && (
                  <TabsContent value="screenshot" className="mt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.imageUrl}
                      alt="Screenshot"
                      className="w-full rounded-lg border"
                    />
                  </TabsContent>
                )}

                {selected.diffUrl && (
                  <TabsContent value="pixeldiff" className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Red pixels = changed areas
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.diffUrl}
                      alt="Pixel diff"
                      className="w-full rounded-lg border"
                    />
                  </TabsContent>
                )}

                {hasTextDiff(selected) && (
                  <TabsContent value="textdiff" className="mt-3">
                    <TextDiffViewer
                      unifiedDiff={selected.textDiff!}
                    />
                  </TabsContent>
                )}
              </Tabs>

              {/* Error */}
              {selected.error && (
                <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive font-mono">
                  {selected.error}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
