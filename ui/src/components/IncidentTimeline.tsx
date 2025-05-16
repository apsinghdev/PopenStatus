import { Incident } from "@/lib/types";
import { getRelativeTimeString } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

interface IncidentTimelineProps {
  incidents: Incident[];
}

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
      <div className="space-y-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div className="w-0.5 h-full bg-border" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">{incident.title}</h3>
                <Badge
                  variant="outline"
                  className={`capitalize ${
                    {
                      investigating:
                        "bg-yellow-100 text-yellow-800 border-yellow-300",
                      identified: "bg-blue-100 text-blue-800 border-blue-300",
                    }[incident.status]
                  } border`}
                >
                  {incident.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getRelativeTimeString(incident.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
