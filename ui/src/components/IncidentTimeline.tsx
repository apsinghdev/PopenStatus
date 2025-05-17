
import { TimelineEvent, Incident } from "@/lib/types";
import { getRelativeTimeString } from "@/lib/mockData";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentTimelineProps {
  events: TimelineEvent[];
  incidents: Incident[];
}

export function IncidentTimeline({ events, incidents }: IncidentTimelineProps) {
  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Incident History</h2>
      
      {sortedEvents.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">No incidents in history</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-border" />
          
          <div className="space-y-6 pl-8">
            {sortedEvents.map((event) => {
              const incidentTitle = event.incidentId
                ? incidents.find(i => i.id === event.incidentId)?.title
                : null;
                
              // Determine icon based on event type
              let StatusIcon;
              let iconColor;
              
              switch (event.type) {
                case 'incident_created':
                  StatusIcon = AlertTriangle;
                  iconColor = "text-yellow-500 bg-yellow-100";
                  break;
                case 'status_updated':
                  StatusIcon = AlertCircle;
                  iconColor = "text-blue-500 bg-blue-100";
                  break;
                case 'resolved':
                  StatusIcon = CheckCircle;
                  iconColor = "text-green-500 bg-green-100";
                  break;
              }

              return (
                <div key={event.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-8 mt-1.5">
                    <div className={cn("p-1 rounded-full", iconColor)}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {incidentTitle || event.description}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTimeString(event.timestamp)}
                      </span>
                    </div>
                    
                    {incidentTitle && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}