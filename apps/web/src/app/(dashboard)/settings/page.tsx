// "use client";

// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// interface Settings {
//   emailNotifications: boolean;
//   inAppNotifications: boolean;
//   emailProvider: string;
//   emailFrom: string;
//   resendApiKey: string | null;
//   smtpHost: string | null;
//   smtpPort: number | null;
//   smtpUser: string | null;
//   smtpPassword: string | null;
//   smtpSecure: boolean;
//   storageProvider: string;
//   s3Bucket: string | null;
//   s3Region: string | null;
//   s3AccessKey: string | null;
//   s3SecretKey: string | null;
// }

// export default function SettingsPage() {
//   const [settings, setSettings] = useState<Settings | null>(null);
//   const [saving, setSaving] = useState(false);

//   const { register, handleSubmit, watch, setValue, reset } = useForm<Settings>();

//   useEffect(() => {
//     fetch("/api/settings")
//       .then((r) => r.json())
//       .then((data) => {
//         setSettings(data.settings);
//         reset(data.settings);
//       });
//   }, [reset]);

//   const emailProvider = watch("emailProvider");
//   const storageProvider = watch("storageProvider");
//   const emailNotifications = watch("emailNotifications");
//   const inAppNotifications = watch("inAppNotifications");
//   const smtpSecure = watch("smtpSecure");

//   const onSubmit = async (data: Settings) => {
//     setSaving(true);
//     try {
//       const res = await fetch("/api/settings", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });
//       if (!res.ok) throw new Error("Failed to save");
//       toast.success("Settings saved");
//     } catch {
//       toast.error("Failed to save settings");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!settings) {
//     return (
//       <div className="flex items-center justify-center py-16">
//         <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-2xl">
//       <div>
//         <h1 className="text-2xl font-bold">Settings</h1>
//         <p className="text-muted-foreground text-sm mt-1">
//           Configure notifications, email, and storage
//         </p>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <Tabs defaultValue="notifications">
//           <TabsList>
//             <TabsTrigger value="notifications">Notifications</TabsTrigger>
//             <TabsTrigger value="email">Email</TabsTrigger>
//             <TabsTrigger value="storage">Storage</TabsTrigger>
//           </TabsList>

//           {/* ── Notifications ── */}
//           <TabsContent value="notifications" className="space-y-4 mt-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Notification Preferences</CardTitle>
//                 <CardDescription>Choose how you want to be notified about changes</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label>Email notifications</Label>
//                     <p className="text-xs text-muted-foreground">Receive email alerts when changes are detected</p>
//                   </div>
//                   <Switch
//                     checked={emailNotifications}
//                     onCheckedChange={(v) => setValue("emailNotifications", v)}
//                   />
//                 </div>
//                 <Separator />
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label>In-app notifications</Label>
//                     <p className="text-xs text-muted-foreground">Show alerts in the notification center</p>
//                   </div>
//                   <Switch
//                     checked={inAppNotifications}
//                     onCheckedChange={(v) => setValue("inAppNotifications", v)}
//                   />
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* ── Email ── */}
//           <TabsContent value="email" className="space-y-4 mt-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Email Provider</CardTitle>
//                 <CardDescription>Configure how emails are sent</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Provider</Label>
//                   <Select
//                     value={emailProvider}
//                     onValueChange={(v) => setValue("emailProvider", v)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="resend">Resend (recommended)</SelectItem>
//                       <SelectItem value="smtp">SMTP</SelectItem>
//                       <SelectItem value="both">Both (Resend primary, SMTP fallback)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="emailFrom">From address</Label>
//                   <Input id="emailFrom" {...register("emailFrom")} placeholder="alerts@yourdomain.com" />
//                 </div>

//                 {(emailProvider === "resend" || emailProvider === "both") && (
//                   <>
//                     <Separator />
//                     <h4 className="text-sm font-semibold">Resend</h4>
//                     <div className="space-y-2">
//                       <Label htmlFor="resendApiKey">API Key</Label>
//                       <Input
//                         id="resendApiKey"
//                         {...register("resendApiKey")}
//                         type="password"
//                         placeholder="re_••••••••"
//                       />
//                       <p className="text-xs text-muted-foreground">
//                         Get your API key at{" "}
//                         <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
//                           resend.com
//                         </a>
//                       </p>
//                     </div>
//                   </>
//                 )}

//                 {(emailProvider === "smtp" || emailProvider === "both") && (
//                   <>
//                     <Separator />
//                     <h4 className="text-sm font-semibold">SMTP</h4>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="smtpHost">Host</Label>
//                         <Input id="smtpHost" {...register("smtpHost")} placeholder="smtp.gmail.com" />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="smtpPort">Port</Label>
//                         <Input id="smtpPort" {...register("smtpPort", { valueAsNumber: true })} placeholder="587" type="number" />
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="smtpUser">Username</Label>
//                         <Input id="smtpUser" {...register("smtpUser")} placeholder="user@gmail.com" />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="smtpPassword">Password</Label>
//                         <Input id="smtpPassword" {...register("smtpPassword")} type="password" placeholder="••••••••" />
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Switch
//                         checked={smtpSecure}
//                         onCheckedChange={(v) => setValue("smtpSecure", v)}
//                       />
//                       <Label>Use TLS/SSL</Label>
//                     </div>
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* ── Storage ── */}
//           <TabsContent value="storage" className="space-y-4 mt-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Screenshot Storage</CardTitle>
//                 <CardDescription>Where screenshots are stored</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Storage provider</Label>
//                   <Select
//                     value={storageProvider}
//                     onValueChange={(v) => setValue("storageProvider", v)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="uploadthing">UploadThing (default)</SelectItem>
//                       <SelectItem value="s3">AWS S3</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {storageProvider === "s3" && (
//                   <>
//                     <Separator />
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="s3Bucket">Bucket name</Label>
//                         <Input id="s3Bucket" {...register("s3Bucket")} placeholder="my-screenshots" />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="s3Region">Region</Label>
//                         <Input id="s3Region" {...register("s3Region")} placeholder="us-east-1" />
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="s3AccessKey">Access Key ID</Label>
//                         <Input id="s3AccessKey" {...register("s3AccessKey")} type="password" placeholder="AKIA••••••••" />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="s3SecretKey">Secret Access Key</Label>
//                         <Input id="s3SecretKey" {...register("s3SecretKey")} type="password" placeholder="••••••••" />
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         <Button type="submit" disabled={saving}>
//           {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//           Save settings
//         </Button>
//       </form>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  Loader2, 
  Bell, 
  Mail, 
  HardDrive, 
  Server, 
  Key, 
  Shield, 
  Database, 
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Settings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  emailProvider: string;
  emailFrom: string;
  resendApiKey: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpSecure: boolean;
  storageProvider: string;
  s3Bucket: string | null;
  s3Region: string | null;
  s3AccessKey: string | null;
  s3SecretKey: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } = useForm<Settings>();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings);
        reset(data.settings);
      });
  }, [reset]);

  const emailProvider = watch("emailProvider");
  const storageProvider = watch("storageProvider");
  const emailNotifications = watch("emailNotifications");
  const inAppNotifications = watch("inAppNotifications");
  const smtpSecure = watch("smtpSecure");

  const onSubmit = async (data: Settings) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <span className="hover:text-foreground cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Settings</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Configure notification channels, email delivery providers, and screenshot storage backends.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 ">
        <Tabs defaultValue="notifications" className="w-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 h-11 bg-muted/50 p-1 mb-2">
            <TabsTrigger value="notifications" className="gap-2 text-xs sm:text-sm font-medium">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2 text-xs sm:text-sm font-medium">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2 text-xs sm:text-sm font-medium">
              <HardDrive className="w-4 h-4" />
              Storage
            </TabsTrigger>
          </TabsList>

          {/* ── Notifications ── */}
          <div className="">
          <TabsContent value="notifications" className="mt-6 focus-visible:outline-none">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-base">Notification Preferences</CardTitle>
                    <CardDescription>Control how and when you receive alerts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <Label className="text-sm font-medium">Email notifications</Label>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                      Receive email alerts when monitors detect changes on your tracked pages.
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(v) => setValue("emailNotifications", v)}
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <Label className="text-sm font-medium">In-app notifications</Label>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                      Show real-time alerts in the dashboard notification center.
                    </p>
                  </div>
                  <Switch
                    checked={inAppNotifications}
                    onCheckedChange={(v) => setValue("inAppNotifications", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Email ── */}
          <TabsContent value="email" className="mt-6 focus-visible:outline-none space-y-4">
            {/* Provider Selection */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Server className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-base">Email Provider</CardTitle>
                    <CardDescription>Configure your email delivery service</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Provider</Label>
                  <Select value={emailProvider} onValueChange={(v) => setValue("emailProvider", v)}>
                    <SelectTrigger className="h-10 w-full sm:w-80">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">
                        <div className="flex items-center gap-2">
                          <span>Resend</span>
                          <Badge variant="secondary" className="text-[10px] h-5">Recommended</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="both">Both (Resend primary, SMTP fallback)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFrom" className="text-sm font-medium">From address</Label>
                  <Input 
                    id="emailFrom" 
                    {...register("emailFrom")} 
                    placeholder="alerts@yourdomain.com" 
                    className="h-10 w-full sm:max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">The sender address shown in notification emails.</p>
                </div>
              </CardContent>
            </Card>

            {/* Resend Configuration */}
            {(emailProvider === "resend" || emailProvider === "both") && (
              <Card className={cn(
                "border shadow-sm transition-all duration-300",
                emailProvider === "both" && "border-l-4 border-l-indigo-500"
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Key className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <CardTitle className="text-base">Resend Configuration</CardTitle>
                      <CardDescription>API key for Resend email delivery</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resendApiKey" className="text-sm font-medium">API Key</Label>
                    <Input
                      id="resendApiKey"
                      {...register("resendApiKey")}
                      type="password"
                      placeholder="re_••••••••"
                      className="h-10 font-mono text-sm w-full sm:max-w-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API key at{" "}
                      <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        resend.com →
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SMTP Configuration */}
            {(emailProvider === "smtp" || emailProvider === "both") && (
              <Card className={cn(
                "border shadow-sm transition-all duration-300",
                emailProvider === "both" && "border-l-4 border-l-orange-500"
              )}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <Server className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <CardTitle className="text-base">SMTP Configuration</CardTitle>
                      <CardDescription>Direct SMTP server settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost" className="text-sm font-medium">Host</Label>
                      <Input id="smtpHost" {...register("smtpHost")} placeholder="smtp.gmail.com" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort" className="text-sm font-medium">Port</Label>
                      <Input id="smtpPort" {...register("smtpPort", { valueAsNumber: true })} placeholder="587" type="number" className="h-10" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser" className="text-sm font-medium">Username</Label>
                      <Input id="smtpUser" {...register("smtpUser")} placeholder="user@gmail.com" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword" className="text-sm font-medium">Password</Label>
                      <Input id="smtpPassword" {...register("smtpPassword")} type="password" placeholder="••••••••" className="h-10" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 border">
                    <Switch
                      checked={smtpSecure}
                      onCheckedChange={(v) => setValue("smtpSecure", v)}
                    />
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Use TLS/SSL encryption</Label>
                      <p className="text-xs text-muted-foreground">Enable for secure connections on port 465 or 587</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Storage ── */}
          <TabsContent value="storage" className="mt-6 focus-visible:outline-none">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-base">Screenshot Storage</CardTitle>
                    <CardDescription>Where captured screenshots are persisted</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Storage provider</Label>
                  <Select value={storageProvider} onValueChange={(v) => setValue("storageProvider", v)}>
                    <SelectTrigger className="h-10 w-full sm:w-80">
                      <SelectValue placeholder="Select storage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uploadthing">
                        <div className="flex items-center gap-2">
                          <span>UploadThing</span>
                          <Badge variant="secondary" className="text-[10px] h-5">Default</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="s3">AWS S3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {storageProvider === "s3" && (
                  <div className="space-y-5 pt-2 border-t">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-medium">S3 credentials are encrypted at rest</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="s3Bucket" className="text-sm font-medium">Bucket name</Label>
                        <Input id="s3Bucket" {...register("s3Bucket")} placeholder="my-screenshots" className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="s3Region" className="text-sm font-medium">Region</Label>
                        <Input id="s3Region" {...register("s3Region")} placeholder="us-east-1" className="h-10" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="s3AccessKey" className="text-sm font-medium">Access Key ID</Label>
                        <Input 
                          id="s3AccessKey" 
                          {...register("s3AccessKey")} 
                          type="password" 
                          placeholder="AKIA••••••••" 
                          className="h-10 font-mono text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="s3SecretKey" className="text-sm font-medium">Secret Access Key</Label>
                        <Input 
                          id="s3SecretKey" 
                          {...register("s3SecretKey")} 
                          type="password" 
                          placeholder="••••••••" 
                          className="h-10 font-mono text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {storageProvider === "uploadthing" && (
                  <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-100 dark:border-emerald-900/50 text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">Managed storage active</p>
                        Screenshots are stored on UploadThing's managed infrastructure. No additional configuration required.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </Tabs>

        {/* ── Action Bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 shrink-0" />
            <span>Changes are applied immediately after saving</span>
          </div>
          <Button type="submit" disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}