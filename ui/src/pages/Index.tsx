import { useEffect, useState } from "react";
import { StatusHeader } from "@/components/StatusHeader";
import { ServiceGrid } from "@/components/ServiceGrid";
import { ActiveIncidents } from "@/components/ActiveIncidents";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { getMockData, fetchServices, fetchIncidents } from "@/lib/mockData";
import { useStatusWebSocket } from "@/hooks/useStatusWebSocket";
import { StatusApiResponse } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import {
  convertResponseToServices,
  convertResponseToIncidents,
} from "@/utils/utils";
export default function Index() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatusApiResponse | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use our mock data
        const responseData = getMockData();
        const services = await fetchServices();
        const convertedServices = convertResponseToServices(services);
        const incidents = await fetchIncidents();
        const convertedIncidents = convertResponseToIncidents(incidents);
        // TODO: separate the resolved incidents from convertedIncidents
        const resolvedIncidents = convertedIncidents.filter(
          (incident) => incident.status === "resolved"
        );

        const timelineEvents = resolvedIncidents.map(incident => ({
          id: incident.id,
          timestamp: incident.updatedAt,
          type: "resolved" as const,
          description: `${incident.title} has been resolved`,
          incidentId: incident.id
        }));

        setData({
          ...responseData,
          services: convertedServices,
          incidents: convertedIncidents,
          timelineEvents,
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch status data:", error);
        toast({
          title: "Error",
          description: "Failed to load status data. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Use our custom WebSocket hook for real-time updates
  const { services, incidents, connected } = useStatusWebSocket(
    data?.services || [],
    data?.incidents || []
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading status information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <StatusHeader services={services} />

        {connected && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              Connected to real-time updates
            </div>
          </div>
        )}

        <main>
          <ServiceGrid services={services} />

          <ActiveIncidents
            incidents={incidents.filter(
              (i) => i.status === "investigating" || i.status === "identified"
            )}
          />

          <IncidentTimeline
            events={data?.timelineEvents || []}
            incidents={incidents.filter((i) => i.status === "resolved")}
          />
        </main>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Popen Status. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
