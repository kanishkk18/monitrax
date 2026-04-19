import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Activity, Camera } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalScreenshots: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Monitors",
      value: stats.totalJobs,
      icon: Eye,
      description: "URLs being tracked",
    },
    {
      title: "Active Monitors",
      value: stats.activeJobs,
      icon: Activity,
      description: "Currently running",
    },
    {
      title: "Screenshots Taken",
      value: stats.totalScreenshots,
      icon: Camera,
      description: "Across all monitors",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
