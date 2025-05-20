
import { Incident, Service } from "@/lib/types";
import { getRelativeTimeString } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface IncidentDetailsProps {
  incident: Incident;
  services: Service[];
}

export function IncidentDetails({ incident, services }: IncidentDetailsProps) {
  const statusColor = {
    investigating: "bg-yellow-100 text-yellow-800 border-yellow-300",
    identified: "bg-blue-100 text-blue-800 border-blue-300",
    monitoring: "bg-purple-100 text-purple-800 border-purple-300",
    resolved: "bg-green-100 text-green-800 border-green-300",
  }[incident.status];

  const affectedServiceNames = incident.affectedServices.map((id) => {
    const service = services.find((s) => s.id === id);
    return service ? service.name : "Unknown Service";
  });

  return (
    <div className="rounded-lg border p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
        <h3 className="font-medium">{incident.title}</h3>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`capitalize ${statusColor} border`}
          >
            {incident.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {getRelativeTimeString(incident.createdAt)}
          </span>
        </div>
      </div>

      <div className="text-sm">
        <span className="text-muted-foreground">Affected: </span>
        <span>{affectedServiceNames.join(", ")}</span>
      </div>
    </div>
  );
}
