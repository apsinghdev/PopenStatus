import { Incident, Service } from "@/lib/types";
import { IncidentDetails } from "@/components/IncidentDetails";

interface ActiveIncidentsProps {
  incidents: Incident[];
}

export function ActiveIncidents({ incidents }: ActiveIncidentsProps) {
  if (!incidents.length) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Incidents</h2>
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">No active incidents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Active Incidents</h2>
      <div className="space-y-4">
        {incidents.map((incident) => (
          <IncidentDetails key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}
