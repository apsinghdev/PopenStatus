
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, AlertCircle, LogIn } from "lucide-react";
import { Service } from "@/lib/types";

interface StatusHeaderProps {
  services: Service[];
}

export function StatusHeader({ services }: StatusHeaderProps) {
  const allOperational = services.every((service) => service.status === "operational");
  const hasOutage = services.some((service) => service.status === "outage");
  
  let statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
  let statusText = "All systems operational";
  let badgeVariant: "default" | "secondary" | "destructive" = "default";
  
  if (hasOutage) {
    statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
    statusText = "System outage detected";
    badgeVariant = "destructive";
  } else if (!allOperational) {
    statusIcon = <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    statusText = "Partial system degradation";
    badgeVariant = "secondary";
  }
  
  return (
    <div className="relative flex flex-col items-center justify-center py-8 md:py-12 text-center">
      {/* Login button in the top right */}
      <div className="absolute top-0 right-0">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Button>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4">System Status</h1>
      <div className="flex items-center gap-2 mb-2">
        {statusIcon}
        <Badge variant={badgeVariant} className="text-sm py-1 px-3">
          {statusText}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Last updated {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}