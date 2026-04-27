// "use client";

// import { useState } from "react";
// import { CRON_PRESETS } from "@changd/shared";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// interface SchedulePickerProps {
//   value: string;
//   onChange: (value: string) => void;
// }

// export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
//   const [isCustom, setIsCustom] = useState(
//     !CRON_PRESETS.some((p) => p.value === value)
//   );

//   const activePreset = CRON_PRESETS.find((p) => p.value === value);

//   return (
//     <div className="space-y-3">
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
//         {CRON_PRESETS.map((preset) => (
//           <button
//             key={preset.value}
//             type="button"
//             onClick={() => {
//               onChange(preset.value);
//               setIsCustom(false);
//             }}
//             className={cn(
//               "text-left px-3 py-2 rounded-md border text-xs transition-colors",
//               value === preset.value && !isCustom
//                 ? "bg-primary text-primary-foreground border-primary"
//                 : "hover:bg-muted border-input"
//             )}
//           >
//             <div className="font-medium">{preset.label}</div>
//             <div className="text-[10px] opacity-70 mt-0.5">{preset.value}</div>
//           </button>
//         ))}
//       </div>

//       <div className="flex items-center gap-2">
//         <Button
//           type="button"
//           variant={isCustom ? "default" : "outline"}
//           size="sm"
//           onClick={() => setIsCustom(true)}
//         >
//           Custom cron
//         </Button>
//         {!isCustom && activePreset && (
//           <span className="text-xs text-muted-foreground">
//             {activePreset.description}
//           </span>
//         )}
//       </div>

//       {isCustom && (
//         <div className="space-y-1">
//           <Label htmlFor="cron-custom">Cron expression</Label>
//           <Input
//             id="cron-custom"
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             placeholder="0 9 * * *"
//             className="font-mono text-sm"
//           />
//           <p className="text-xs text-muted-foreground">
//             Format: minute hour day month weekday. Example:{" "}
//             <code className="bg-muted px-1 rounded">0 9 * * 1-5</code> = Mon–Fri at 9 AM.{" "}
//             <a
//               href="https://crontab.guru"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-primary hover:underline"
//             >
//               crontab.guru
//             </a>
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { CRON_PRESETS } from "@changd/shared";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface SchedulePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const [isCustom, setIsCustom] = useState(
    !CRON_PRESETS.some((p) => p.value === value)
  );

  const activePreset = CRON_PRESETS.find((p) => p.value === value);

  return (
    <div className="space-y-4">
      {/* Preset Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CRON_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => {
              onChange(preset.value);
              setIsCustom(false);
            }}
            className={cn(
              "text-left px-3 py-2.5 rounded-lg border text-xs transition-all duration-200",
              value === preset.value && !isCustom
                ? "bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary/20"
                : "hover:bg-muted/60 border-input bg-background hover:border-muted-foreground/20"
            )}
          >
            <div className="font-semibold text-[11px]">{preset.label}</div>
            <div className="text-[10px] opacity-70 mt-1 font-mono">{preset.value}</div>
          </button>
        ))}
      </div>

      {/* Custom Toggle */}
      {/* <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={isCustom ? "default" : "outline"}
          size="sm"
          onClick={() => setIsCustom(true)}
          className="h-8 text-xs"
        >
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Custom cron
        </Button>
        {!isCustom && activePreset && (
          <span className="text-xs text-muted-foreground">
            {activePreset.description}
          </span>
        )}
      </div> */}

      {/* Custom Input */}
      {isCustom && (
        <div className="space-y-1.5">
          <Label htmlFor="cron-custom" className="text-sm font-medium">
            Cron expression
          </Label>
          <Input
            id="cron-custom"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0 9 * * *"
            className="font-mono text-sm h-10"
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Format: minute hour day month weekday. Example:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">0 9 * * 1-5</code>{" "}
            = Mon–Fri at 9 AM.{" "}
            <a
              href="https://crontab.guru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              crontab.guru →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
