import { Card, CardContent } from "@/components/ui/card";
import { Service } from "@/lib/types";
import { getRelativeTimeString } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { name, status, lastChecked } = service;

  const statusConfig = {
    operational: {
      color: "bg-green-500",
      text: "Operational",
      textColor: "text-green-700",
    },
    degraded: {
      color: "bg-yellow-400",
      text: "Degraded Performance",
      textColor: "text-yellow-700",
    },
    partial_outage: {
      color: "bg-orange-500",
      text: "Partial Outage",
      textColor: "text-orange-700",
    },
    major_outage: {
      color: "bg-red-500",
      text: "Major Outage",
      textColor: "text-red-700",
    },
  };

  // Default to operational if status is undefined or invalid
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.operational;

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm md:text-base">{name}</h3>
            <div className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", config.color)}></span>
              <span className={cn("text-xs font-medium", config.textColor)}>
                {config.text}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Updated {getRelativeTimeString(lastChecked)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
