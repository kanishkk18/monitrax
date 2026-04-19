// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { toast } from "sonner";
// import { SchedulePicker } from "./schedule-picker";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import { Loader2, Plus, X } from "lucide-react";

// const schema = z.object({
//   name: z.string().min(1, "Name is required").max(100),
//   url: z.string().url("Must be a valid URL"),
//   description: z.string().optional(),
//   monitorType: z.enum(["visual", "xpath", "json_api"]),
//   xpathSelector: z.string().optional(),
//   jsonPath: z.string().optional(),
//   httpHeaders: z.string().optional(),
//   viewportWidth: z.coerce.number().int().min(320).max(3840),
//   viewportHeight: z.coerce.number().int().min(240).max(2160),
//   fullPage: z.boolean(),
//   threshold: z.coerce.number().min(0).max(100),
//   cronExpression: z.string().min(1),
//   notifyEmails: z.array(z.string().email()).default([]),
//   enabled: z.boolean(),
// });

// type FormValues = z.infer<typeof schema>;

// interface JobFormProps {
//   defaultValues?: Partial<FormValues>;
//   jobId?: string; // if editing
// }

// export function JobForm({ defaultValues, jobId }: JobFormProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [emailInput, setEmailInput] = useState("");

//   const isEdit = !!jobId;

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       monitorType: "visual",
//       viewportWidth: 1920,
//       viewportHeight: 1080,
//       fullPage: true,
//       threshold: 0.5,
//       cronExpression: "0 9 * * *",
//       enabled: true,
//       notifyEmails: [],
//       ...defaultValues,
//     },
//   });

//   const monitorType = watch("monitorType");
//   const fullPage = watch("fullPage");
//   const enabled = watch("enabled");
//   const cronExpression = watch("cronExpression");
//   const notifyEmails = watch("notifyEmails");

//   const addEmail = () => {
//     const trimmed = emailInput.trim();
//     if (!trimmed) return;
//     try {
//       z.string().email().parse(trimmed);
//       setValue("notifyEmails", [...notifyEmails, trimmed]);
//       setEmailInput("");
//     } catch {
//       toast.error("Invalid email address");
//     }
//   };

//   const removeEmail = (email: string) => {
//     setValue("notifyEmails", notifyEmails.filter((e) => e !== email));
//   };

//   const onSubmit = async (data: FormValues) => {
//     setLoading(true);
//     try {
//       const url = isEdit ? `/api/jobs/${jobId}` : "/api/jobs";
//       const method = isEdit ? "PATCH" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.error || "Failed to save");
//       }

//       toast.success(isEdit ? "Monitor updated" : "Monitor created");
//       router.push("/jobs");
//       router.refresh();
//     } catch (err) {
//       toast.error((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
//       {/* Basic Info */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Basic Information</h2>

//         <div className="space-y-2">
//           <Label htmlFor="name">Monitor name *</Label>
//           <Input id="name" {...register("name")} placeholder="My Website" />
//           {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="url">URL to monitor *</Label>
//           <Input id="url" {...register("url")} placeholder="https://example.com" type="url" />
//           {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="description">Description (optional)</Label>
//           <Input id="description" {...register("description")} placeholder="What this monitor tracks..." />
//         </div>
//       </div>

//       <Separator />

//       {/* Monitor Type */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Monitor Type</h2>
//         <Tabs
//           value={monitorType}
//           onValueChange={(v) => setValue("monitorType", v as FormValues["monitorType"])}
//         >
//           <TabsList>
//             <TabsTrigger value="visual">Visual (Screenshot)</TabsTrigger>
//             <TabsTrigger value="xpath">XPath (DOM)</TabsTrigger>
//             <TabsTrigger value="json_api">JSON API</TabsTrigger>
//           </TabsList>

//           <TabsContent value="visual" className="space-y-4 mt-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="viewportWidth">Viewport width</Label>
//                 <Input id="viewportWidth" type="number" {...register("viewportWidth")} />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="viewportHeight">Viewport height</Label>
//                 <Input id="viewportHeight" type="number" {...register("viewportHeight")} />
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <Switch
//                 id="fullPage"
//                 checked={fullPage}
//                 onCheckedChange={(v) => setValue("fullPage", v)}
//               />
//               <Label htmlFor="fullPage">Capture full page (scroll)</Label>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="threshold">
//                 Change threshold:{" "}
//                 <span className="font-mono text-primary">{watch("threshold")}%</span>
//               </Label>
//               <input
//                 type="range"
//                 min="0"
//                 max="10"
//                 step="0.1"
//                 value={watch("threshold")}
//                 onChange={(e) => setValue("threshold", parseFloat(e.target.value))}
//                 className="w-full"
//               />
//               <p className="text-xs text-muted-foreground">
//                 Minimum pixel change percentage to trigger a notification
//               </p>
//             </div>
//           </TabsContent>

//           <TabsContent value="xpath" className="space-y-4 mt-4">
//             <div className="space-y-2">
//               <Label htmlFor="xpathSelector">XPath selector *</Label>
//               <Input
//                 id="xpathSelector"
//                 {...register("xpathSelector")}
//                 placeholder="//div[@class='price']/text()"
//                 className="font-mono text-sm"
//               />
//               <p className="text-xs text-muted-foreground">
//                 The XPath expression to extract and monitor for changes
//               </p>
//             </div>
//           </TabsContent>

//           <TabsContent value="json_api" className="space-y-4 mt-4">
//             <div className="space-y-2">
//               <Label htmlFor="jsonPath">JSON path *</Label>
//               <Input
//                 id="jsonPath"
//                 {...register("jsonPath")}
//                 placeholder="data.price"
//                 className="font-mono text-sm"
//               />
//               <p className="text-xs text-muted-foreground">
//                 Dot notation path to extract from JSON response (e.g. <code className="bg-muted px-1 rounded">results[0].name</code>)
//               </p>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="httpHeaders">HTTP headers (JSON, optional)</Label>
//               <Input
//                 id="httpHeaders"
//                 {...register("httpHeaders")}
//                 placeholder='{"Authorization": "Bearer token"}'
//                 className="font-mono text-sm"
//               />
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>

//       <Separator />

//       {/* Schedule */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Schedule</h2>
//         <SchedulePicker
//           value={cronExpression}
//           onChange={(v) => setValue("cronExpression", v)}
//         />
//       </div>

//       <Separator />

//       {/* Notifications */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Notifications</h2>
//         <p className="text-sm text-muted-foreground">
//           Your account email will always be notified. Add additional recipients below.
//         </p>

//         <div className="space-y-2">
//           <Label>Additional notification emails</Label>
//           <div className="flex gap-2">
//             <Input
//               value={emailInput}
//               onChange={(e) => setEmailInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
//               placeholder="colleague@example.com"
//               type="email"
//             />
//             <Button type="button" variant="outline" onClick={addEmail}>
//               <Plus className="w-4 h-4" />
//             </Button>
//           </div>
//           {notifyEmails.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {notifyEmails.map((email) => (
//                 <div
//                   key={email}
//                   className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
//                 >
//                   {email}
//                   <button
//                     type="button"
//                     onClick={() => removeEmail(email)}
//                     className="text-muted-foreground hover:text-foreground"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <Separator />

//       {/* Enable/disable */}
//       <div className="flex items-center gap-3">
//         <div className="flex items-center gap-3">
//           <Switch 
//           className="bg-red-500"
//             id="enabled"
//             checked={enabled}
//             onCheckedChange={(v) => setValue("enabled", v)}
//           />
//         </div>
//         <div>
//           <Label htmlFor="enabled">Enable monitor</Label>
//           <p className="text-xs text-muted-foreground">
//             Disabled monitors won't run on schedule
//           </p>
//         </div>
//       </div>

//       <div className="flex gap-3">
//         <Button type="submit" disabled={loading}>
//           {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//           {isEdit ? "Save changes" : "Create monitor"}
//         </Button>
//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => router.back()}
//         >
//           Cancel
//         </Button>
//       </div>
//     </form>
//   );
// }

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { toast } from "sonner";
// import { SchedulePicker } from "./schedule-picker";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import { Loader2, Plus, X } from "lucide-react";
// import { cn } from "@/lib/utils";

// const schema = z.object({
//   name: z.string().min(1, "Name is required").max(100),
//   url: z.string().url("Must be a valid URL"),
//   description: z.string().optional(),
//   monitorType: z.enum(["visual", "text", "xpath", "json_api"]),
//   captureScreenshot: z.boolean().default(true),
//   imageFormat: z.enum(["webp", "avif", "png"]).default("webp"),
//   xpathSelector: z.string().optional(),
//   jsonPath: z.string().optional(),
//   httpHeaders: z.string().optional(),
//   viewportWidth: z.coerce.number().int().min(320).max(3840),
//   viewportHeight: z.coerce.number().int().min(240).max(2160),
//   fullPage: z.boolean(),
//   threshold: z.coerce.number().min(0).max(100),
//   cronExpression: z.string().min(1),
//   notifyEmails: z.array(z.string().email()).default([]),
//   enabled: z.boolean(),
// });

// type FormValues = z.infer<typeof schema>;

// interface JobFormProps {
//   defaultValues?: Partial<FormValues>;
//   jobId?: string; // if editing
// }

// export function JobForm({ defaultValues, jobId }: JobFormProps) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [emailInput, setEmailInput] = useState("");

//   const isEdit = !!jobId;

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       monitorType: "visual",
//       captureScreenshot: true,
//       imageFormat: "webp" as const,
//       viewportWidth: 1920,
//       viewportHeight: 1080,
//       fullPage: true,
//       threshold: 0.5,
//       cronExpression: "0 9 * * *",
//       enabled: true,
//       notifyEmails: [],
//       ...defaultValues,
//     },
//   });

//   const monitorType = watch("monitorType");
//   const captureScreenshot = watch("captureScreenshot");
//   const imageFormat = watch("imageFormat");
//   const fullPage = watch("fullPage");
//   const enabled = watch("enabled");
//   const cronExpression = watch("cronExpression");
//   const notifyEmails = watch("notifyEmails");

//   const addEmail = () => {
//     const trimmed = emailInput.trim();
//     if (!trimmed) return;
//     try {
//       z.string().email().parse(trimmed);
//       setValue("notifyEmails", [...notifyEmails, trimmed]);
//       setEmailInput("");
//     } catch {
//       toast.error("Invalid email address");
//     }
//   };

//   const removeEmail = (email: string) => {
//     setValue("notifyEmails", notifyEmails.filter((e) => e !== email));
//   };

//   const onSubmit = async (data: FormValues) => {
//     setLoading(true);
//     try {
//       const url = isEdit ? `/api/jobs/${jobId}` : "/api/jobs";
//       const method = isEdit ? "PATCH" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.error || "Failed to save");
//       }

//       toast.success(isEdit ? "Monitor updated" : "Monitor created");
//       router.push("/jobs");
//       router.refresh();
//     } catch (err) {
//       toast.error((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
//       {/* Basic Info */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Basic Information</h2>

//         <div className="space-y-2">
//           <Label htmlFor="name">Monitor name *</Label>
//           <Input id="name" {...register("name")} placeholder="My Website" />
//           {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="url">URL to monitor *</Label>
//           <Input id="url" {...register("url")} placeholder="https://example.com" type="url" />
//           {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="description">Description (optional)</Label>
//           <Input id="description" {...register("description")} placeholder="What this monitor tracks..." />
//         </div>
//       </div>

//       <Separator />

//       {/* Monitor Type */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Monitor Type</h2>
//         <Tabs
//           value={monitorType}
//           onValueChange={(v) => setValue("monitorType", v as FormValues["monitorType"])}
//         >
//           <TabsList>
//             <TabsTrigger value="visual">Visual (Screenshot)</TabsTrigger>
//             <TabsTrigger value="xpath">XPath (DOM)</TabsTrigger>
//             <TabsTrigger value="json_api">JSON API</TabsTrigger>
//             <TabsTrigger value="text">Text Monitor</TabsTrigger>
//           </TabsList>

//           <TabsContent value="visual" className="space-y-4 mt-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="viewportWidth">Viewport width</Label>
//                 <Input id="viewportWidth" type="number" {...register("viewportWidth")} />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="viewportHeight">Viewport height</Label>
//                 <Input id="viewportHeight" type="number" {...register("viewportHeight")} />
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <Switch
//               size="sm"
//                 id="fullPage"
//                 checked={fullPage}
//                 onCheckedChange={(v) => setValue("fullPage", v)}
//               />
//               <Label htmlFor="fullPage">Capture full page (scroll)</Label>
//             </div>
//             <div className="flex items-center gap-3">
//               <Switch
//               size="sm"
//                 id="captureScreenshot"
//                 checked={captureScreenshot}
//                 onCheckedChange={(v) => setValue("captureScreenshot", v)}
//               />
//               <div>
//                 <Label htmlFor="captureScreenshot">Capture screenshot image</Label>
//                 <p className="text-xs text-muted-foreground">Disable for text-only — lighter on CPU/RAM</p>
//               </div>
//             </div>

//             {captureScreenshot && (
//               <div className="space-y-2">
//                 <Label>Image format</Label>
//                 <div className="flex gap-2">
//                   {(["webp", "avif", "png"] as const).map((fmt) => (
//                     <button
//                       key={fmt}
//                       type="button"
//                       onClick={() => setValue("imageFormat", fmt)}
//                       className={cn("px-3 py-1.5 rounded-md border text-xs font-medium transition-colors", imageFormat === fmt ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted border-input")}
//                     >
//                       {fmt.toUpperCase()}
//                     </button>
//                   ))}
//                 </div>
//                 <p className="text-xs text-muted-foreground">WebP ~70% smaller · AVIF ~80% smaller · PNG lossless</p>
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="threshold">
//                 Change threshold:{" "}
//                 <span className="font-mono text-primary">{watch("threshold")}%</span>
//               </Label>
//               <input
//                 type="range"
//                 min="0"
//                 max="10"
//                 step="0.1"
//                 value={watch("threshold")}
//                 onChange={(e) => setValue("threshold", parseFloat(e.target.value))}
//                 className="w-full"
//               />
//               <p className="text-xs text-muted-foreground">
//                 Minimum pixel change percentage to trigger a notification
//               </p>
//             </div>
//           </TabsContent>

//           <TabsContent value="xpath" className="space-y-4 mt-4">
//             <div className="space-y-2">
//               <Label htmlFor="xpathSelector">XPath selector *</Label>
//               <Input
//                 id="xpathSelector"
//                 {...register("xpathSelector")}
//                 placeholder="//div[@class='price']/text()"
//                 className="font-mono text-sm"
//               />
//               <p className="text-xs text-muted-foreground">
//                 The XPath expression to extract and monitor for changes
//               </p>
//             </div>
//           </TabsContent>

//           <TabsContent value="text" className="space-y-4 mt-4">
//             <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
//               <p className="text-sm font-medium">Text-based monitoring</p>
//               <p className="text-sm text-muted-foreground">
//                 Visits the URL and extracts all visible text. Detects any additions or removals and shows a GitHub-style before/after diff. No screenshots — very lightweight on CPU and RAM.
//               </p>
//               <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
//                 <li>Great for price changes, news updates, status pages</li>
//                 <li>Shows exact lines added or removed</li>
//                 <li>Much lower resource usage than visual mode</li>
//               </ul>
//             </div>
//           </TabsContent>

//           <TabsContent value="json_api" className="space-y-4 mt-4">
//             <div className="space-y-2">
//               <Label htmlFor="jsonPath">JSON path *</Label>
//               <Input
//                 id="jsonPath"
//                 {...register("jsonPath")}
//                 placeholder="data.price"
//                 className="font-mono text-sm"
//               />
//               <p className="text-xs text-muted-foreground">
//                 Dot notation path to extract from JSON response (e.g. <code className="bg-muted px-1 rounded">results[0].name</code>)
//               </p>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="httpHeaders">HTTP headers (JSON, optional)</Label>
//               <Input
//                 id="httpHeaders"
//                 {...register("httpHeaders")}
//                 placeholder='{"Authorization": "Bearer token"}'
//                 className="font-mono text-sm"
//               />
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>

//       <Separator />

//       {/* Schedule */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Schedule</h2>
//         <SchedulePicker
//           value={cronExpression}
//           onChange={(v) => setValue("cronExpression", v)}
//         />
//       </div>

//       <Separator />

//       {/* Notifications */}
//       <div className="space-y-4">
//         <h2 className="text-lg font-semibold">Notifications</h2>
//         <p className="text-sm text-muted-foreground">
//           Your account email will always be notified. Add additional recipients below.
//         </p>

//         <div className="space-y-2">
//           <Label>Additional notification emails</Label>
//           <div className="flex gap-2">
//             <Input
//               value={emailInput}
//               onChange={(e) => setEmailInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
//               placeholder="colleague@example.com"
//               type="email"
//             />
//             <Button type="button" variant="outline" onClick={addEmail}>
//               <Plus className="w-4 h-4" />
//             </Button>
//           </div>
//           {notifyEmails.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {notifyEmails.map((email) => (
//                 <div
//                   key={email}
//                   className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
//                 >
//                   {email}
//                   <button
//                     type="button"
//                     onClick={() => removeEmail(email)}
//                     className="text-muted-foreground hover:text-foreground"
//                   >
//                     <X className="w-3 h-3" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <Separator />

//       {/* Enable/disable */}
//       <div className="flex items-center gap-3">
//         <Switch
//           id="enabled"
//           checked={enabled}
//           onCheckedChange={(v) => setValue("enabled", v)}
//         />
//         <div>
//           <Label htmlFor="enabled">Enable monitor</Label>
//           <p className="text-xs text-muted-foreground">
//             Disabled monitors won't run on schedule
//           </p>
//         </div>
//       </div>

//       <div className="flex gap-3">
//         <Button type="submit" disabled={loading}>
//           {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//           {isEdit ? "Save changes" : "Create monitor"}
//         </Button>
//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => router.back()}
//         >
//           Cancel
//         </Button>
//       </div>
//     </form>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SchedulePicker } from "./schedule-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Plus, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                Form Schema                                 */
/* -------------------------------------------------------------------------- */

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
  monitorType: z.enum(["visual", "text", "xpath", "json_api"]),
  captureScreenshot: z.boolean().default(true),
  imageFormat: z.enum(["webp", "avif", "png"]).default("webp"),
  xpathSelector: z.string().optional(),
  jsonPath: z.string().optional(),
  httpHeaders: z.string().optional(),
  viewportWidth: z.coerce.number().int().min(320).max(3840),
  viewportHeight: z.coerce.number().int().min(240).max(2160),
  fullPage: z.boolean(),
  threshold: z.coerce.number().min(0).max(100),
  cronExpression: z.string().min(1),
  notifyEmails: z.array(z.string().email()).default([]),
  enabled: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface JobFormProps {
  defaultValues?: Partial<FormValues>;
  jobId?: string; // if editing
}

/* -------------------------------------------------------------------------- */
/*                           Visual Example Components                        */
/* -------------------------------------------------------------------------- */

/** Browser mockup showing how visual monitoring captures page screenshots */
function ScreenshotExample() {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
        {/* Browser Chrome */}
        <div className="bg-muted/80 px-3 py-2 flex items-center gap-1.5 border-b">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="ml-2 flex-1 bg-background rounded px-2 py-0.5 text-[10px] text-muted-foreground font-mono truncate">
            https://example.com/pricing
          </div>
        </div>
        {/* Page Content */}
        <div className="p-3 space-y-2">
          <div className="h-2 bg-muted rounded w-2/3" />
          <div className="h-2 bg-muted rounded w-1/2" />
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="h-10 bg-muted/60 rounded" />
            <div className="h-10 bg-muted/60 rounded" />
            <div className="h-10 bg-muted/60 rounded" />
          </div>
          <div className="h-16 bg-primary/5 rounded border border-primary/10 mt-2 flex items-center justify-center">
            <span className="text-[10px] text-primary font-medium">Change detected in this region</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center leading-relaxed">
        Captures full-page or viewport screenshots and highlights pixel-level changes
      </p>
    </div>
  );
}

/** Visual explanation of XPath extraction from DOM */
function XPathExample() {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="bg-background rounded border p-3 font-mono text-xs leading-relaxed space-y-1">
        <div className="text-muted-foreground">{`<div class="product-card">`}</div>
        <div className="pl-3 text-muted-foreground">{`<h2>Wireless Headphones</h2>`}</div>
        <div className="pl-3 flex items-center gap-1">
          <span className="text-muted-foreground">{`<span class="price">`}</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">$89.99</span>
          <span className="text-muted-foreground">{`</span>`}</span>
        </div>
        <div className="text-muted-foreground">{`</div>`}</div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <code className="bg-primary/10 text-primary px-2 py-1 rounded-md font-mono">
          //span[@class=&apos;price&apos;]/text()
        </code>
        <span className="text-muted-foreground">extracts</span>
        <span className="font-semibold text-foreground">$89.99</span>
      </div>
    </div>
  );
}

/** JSON response mockup with path highlighting */
function JSONExample() {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <pre className="bg-background rounded border p-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`{
  "status": "success",
  "data": {
    "product": {
      "name": "Wireless Headphones",
      "price": 89.99,
      "currency": "USD"
    }
  }
}`}
      </pre>
      <div className="flex items-center gap-2 text-xs">
        <code className="bg-primary/10 text-primary px-2 py-1 rounded-md font-mono">
          data.product.price
        </code>
        <span className="text-muted-foreground">extracts</span>
        <span className="font-semibold text-foreground">89.99</span>
      </div>
    </div>
  );
}

/** Side-by-side diff showing text changes (red = removed, green = added) */
function TextDiffExample() {
  return (
    <div className="rounded-lg border overflow-hidden text-xs font-mono">
      <div className="grid grid-cols-2 divide-x">
        {/* Before */}
        <div className="bg-red-50 dark:bg-red-950/20 p-3">
          <div className="text-red-700 dark:text-red-400 font-semibold mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Before
          </div>
          <div className="space-y-1.5 text-red-800/80 dark:text-red-300/80">
            <div className="line-through decoration-red-400/50">Price: $99.00</div>
            <div className="line-through decoration-red-400/50">Stock: Available</div>
            <div>SKU: WH-1000XM5</div>
          </div>
        </div>
        {/* After */}
        <div className="bg-green-50 dark:bg-green-950/20 p-3">
          <div className="text-green-700 dark:text-green-400 font-semibold mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            After
          </div>
          <div className="space-y-1.5 text-green-800/80 dark:text-green-300/80">
            <div className="font-semibold">Price: $79.00</div>
            <div className="font-semibold">Stock: Low Stock</div>
            <div>SKU: WH-1000XM5</div>
          </div>
        </div>
      </div>
      <div className="bg-muted/50 px-3 py-2 text-[10px] text-muted-foreground text-center border-t">
        Detects exact lines added or removed from visible page text
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */

export function JobForm({ defaultValues, jobId }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const isEdit = !!jobId;

  // Initialize form with React Hook Form + Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      monitorType: "visual",
      captureScreenshot: true,
      imageFormat: "webp" as const,
      viewportWidth: 1920,
      viewportHeight: 1080,
      fullPage: true,
      threshold: 0.5,
      cronExpression: "0 9 * * *",
      enabled: true,
      notifyEmails: [],
      ...defaultValues,
    },
  });

  // Watch form values for conditional UI rendering
  const monitorType = watch("monitorType");
  const captureScreenshot = watch("captureScreenshot");
  const imageFormat = watch("imageFormat");
  const fullPage = watch("fullPage");
  const enabled = watch("enabled");
  const cronExpression = watch("cronExpression");
  const notifyEmails = watch("notifyEmails");

  /* ---------------------------- Email Management ---------------------------- */

  const addEmail = () => {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    try {
      z.string().email().parse(trimmed);
      setValue("notifyEmails", [...notifyEmails, trimmed]);
      setEmailInput("");
    } catch {
      toast.error("Invalid email address");
    }
  };

  const removeEmail = (email: string) => {
    setValue("notifyEmails", notifyEmails.filter((e) => e !== email));
  };

  /* ------------------------------ Form Submit ------------------------------- */

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/jobs/${jobId}` : "/api/jobs";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast.success(isEdit ? "Monitor updated" : "Monitor created");
      router.push("/jobs");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Layout                                 */
  /* -------------------------------------------------------------------------- */

  return (
    <TooltipProvider delayDuration={100}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-4xl pb-12"
      >
        {/* ========================== Basic Information ========================== */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-6 w-1 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Monitor name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. Product Pricing Page"
                className="h-10"
              />
              {errors.name && (
                <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium">
                URL to monitor <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                {...register("url")}
                placeholder="https://example.com"
                type="url"
                className="h-10 font-mono text-sm"
              />
              {errors.url && (
                <p className="text-xs text-destructive font-medium">{errors.url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="What this monitor tracks and why it matters..."
                className="h-10"
              />
            </div>
          </div>
        </section>

        {/* ============================ Monitor Type ============================ */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-6 w-1 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Monitor Type</h2>
          </div>

          <Tabs
            value={monitorType}
            onValueChange={(v) => setValue("monitorType", v as FormValues["monitorType"])}
            className="w-full flex-col flex"
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
              {/* Visual Tab */}
              <TabsTrigger value="visual" className="text-xs py-2.5 gap-1.5 relative">
                Visual
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-0 h-auto hover:bg-transparent focus:outline-none"
                        tabIndex={-1}
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                      Captures screenshots and compares pixels to detect visual layout or content changes.
                    </TooltipContent>
                  </Tooltip>
                </span>
              </TabsTrigger>

              {/* XPath Tab */}
              <TabsTrigger value="xpath" className="text-xs py-2.5 gap-1.5 relative">
                XPath
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-0 h-auto hover:bg-transparent focus:outline-none"
                        tabIndex={-1}
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                      Extracts specific values from HTML using XPath selectors. Ideal for prices, stock status, or titles.
                    </TooltipContent>
                  </Tooltip>
                </span>
              </TabsTrigger>

              {/* JSON API Tab */}
              <TabsTrigger value="json_api" className="text-xs py-2.5 gap-1.5 relative">
                JSON API
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-0 h-auto hover:bg-transparent focus:outline-none"
                        tabIndex={-1}
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                      Monitors JSON API responses using dot-notation paths. Perfect for REST APIs and data endpoints.
                    </TooltipContent>
                  </Tooltip>
                </span>
              </TabsTrigger>

              {/* Text Tab */}
              <TabsTrigger value="text" className="text-xs py-2.5 gap-1.5 relative">
                Text
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-0 h-auto hover:bg-transparent focus:outline-none"
                        tabIndex={-1}
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed">
                      Extracts all visible text and shows line-by-line diffs. Lightweight and great for content changes.
                    </TooltipContent>
                  </Tooltip>
                </span>
              </TabsTrigger>
            </TabsList>

            {/* ------------------------ Visual Content ------------------------ */}
            <TabsContent value="visual" className="space-y-6 mt-6 focus-visible:outline-none">
              {/* How it works */}
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  How it works
                </Label>
                <ScreenshotExample />
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Configuration
                </Label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="viewportWidth" className="text-sm">Viewport width</Label>
                    <Input id="viewportWidth" type="number" {...register("viewportWidth")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="viewportHeight" className="text-sm">Viewport height</Label>
                    <Input id="viewportHeight" type="number" {...register("viewportHeight")} />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <Switch
                    id="fullPage"
                    checked={fullPage}
                    onCheckedChange={(v) => setValue("fullPage", v)}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="fullPage" className="text-sm font-medium">Capture full page</Label>
                    <p className="text-xs text-muted-foreground">Scrolls and stitches the entire page</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <Switch
                    id="captureScreenshot"
                    checked={captureScreenshot}
                    onCheckedChange={(v) => setValue("captureScreenshot", v)}
                  />
                  <div className="space-y-0.5">
                    <Label htmlFor="captureScreenshot" className="text-sm font-medium">Capture screenshot image</Label>
                    <p className="text-xs text-muted-foreground">Disable for text-only detection </p>
                  </div>
                </div>

                {captureScreenshot && (
                  <div className="space-y-3 pt-1">
                    <Label className="text-sm font-medium">Image format</Label>
                    <div className="flex gap-2">
                      {(["webp", "avif", "png"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setValue("imageFormat", fmt)}
                          className={cn(
                            "px-4 py-2 rounded-lg border text-xs font-semibold transition-all",
                            imageFormat === fmt
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "hover:bg-muted border-input bg-background"
                          )}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    {/* <p className="text-xs text-muted-foreground">
                      WebP ~70% smaller · AVIF ~80% smaller · PNG lossless
                    </p> */}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold" className="text-sm font-medium">
                      Change threshold
                    </Label>
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md text-primary font-semibold">
                      {watch("threshold")}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={watch("threshold")}
                    onChange={(e) => setValue("threshold", parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum pixel change percentage required to trigger a notification
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ------------------------ XPath Content ------------------------ */}
            <TabsContent value="xpath" className="space-y-6 mt-6 focus-visible:outline-none">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  How it works
                </Label>
                <XPathExample />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Configuration
                </Label>
                <div className="space-y-2">
                  <Label htmlFor="xpathSelector" className="text-sm font-medium">
                    XPath selector <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="xpathSelector"
                    {...register("xpathSelector")}
                    placeholder="//div[@class='price']/text()"
                    className="font-mono text-sm h-10"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter a valid XPath expression to extract and monitor a specific value from the page HTML.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ------------------------ JSON API Content ------------------------ */}
            <TabsContent value="json_api" className="space-y-6 mt-6 focus-visible:outline-none">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  How it works
                </Label>
                <JSONExample />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Configuration
                </Label>
                <div className="space-y-2">
                  <Label htmlFor="jsonPath" className="text-sm font-medium">
                    JSON path <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="jsonPath"
                    {...register("jsonPath")}
                    placeholder="data.product.price"
                    className="font-mono text-sm h-10"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dot notation path to extract from JSON response. Supports array indexing like{" "}
                    <code className="bg-muted px-1 rounded text-[10px]">results[0].name</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="httpHeaders" className="text-sm font-medium">
                    HTTP headers <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="httpHeaders"
                    {...register("httpHeaders")}
                    placeholder='{"Authorization": "Bearer token"}'
                    className="font-mono text-sm h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    JSON object containing custom headers sent with each request
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ------------------------ Text Content ------------------------ */}
            <TabsContent value="text" className="space-y-6 mt-6 focus-visible:outline-none">
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  How it works
                </Label>
                <TextDiffExample />
              </div>

              <div className="rounded-lg bg-muted/40 border p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">Text-based monitoring</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Visits the URL and extracts all visible text content. Detects any additions or removals
                  and presents a clear before/after diff. No screenshots — very lightweight on resources.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Great for price changes, news updates, and status pages</li>
                  <li>Shows exact lines added or removed</li>
                  <li>Much lower resource usage compared to visual mode</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* ============================= Schedule ============================= */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-6 w-1 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Schedule</h2>
          </div>
          <SchedulePicker
            value={cronExpression}
            onChange={(v) => setValue("cronExpression", v)}
          />
        </section>

        {/* =========================== Notifications ========================== */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-6 w-1 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Notifications</h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account email will always receive alerts. Add additional recipients below.
            </p>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Additional notification emails</Label>
              <div className="flex gap-2">
                <Input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
                  placeholder="colleague@example.com"
                  type="email"
                  className="h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addEmail}
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {notifyEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {notifyEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-1.5 text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full border"
                    >
                      <span className="font-medium">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================= Status & Actions ========================= */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
              <div className="space-y-0.5">
                <Label htmlFor="enabled" className="text-sm font-medium">Enable monitor</Label>
                <p className="text-xs text-muted-foreground">Disabled monitors are paused and won't run on schedule</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-10 px-5"
              >
                Cancel
              </Button>
              <Button variant={"secondary"} type="submit" disabled={loading} className="h-10 px-5">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? "Save changes" : "Create monitor"}
              </Button>
            </div>
          </div>
        </section>
      </form>
    </TooltipProvider>
  );
}