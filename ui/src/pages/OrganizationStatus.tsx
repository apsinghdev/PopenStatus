import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { StatusHeader } from "@/components/StatusHeader";
import { ServiceGrid } from "@/components/ServiceGrid";
import { ActiveIncidents } from "@/components/ActiveIncidents";
import { IncidentTimeline } from "@/components/IncidentTimeline";
import { useStatusWebSocket } from "@/hooks/useStatusWebSocket";
import { useToast } from "@/components/ui/use-toast";
import { Service, Incident, TimelineEvent } from "@/lib/types";
import { convertResponseToStatusApiResponse } from "@/utils/utils";

// Flag to disable WebSocket functionality
const ENABLE_WEBSOCKET = false;

interface Organization {
  id: number;
  name: string;
  slug: string;
}

interface OrganizationStatus {
  organization: Organization;
  services: Service[];
  incidents: Incident[];
}

const fetchOrganizationStatus = async (
  slug: string
): Promise<OrganizationStatus> => {
  console.log("fetching organization status", slug);
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/organizations/${slug}/status`
  );
  console.log("response", response);
  if (!response.ok) {
    throw new Error("Failed to fetch organization status");
  }
  const data = await response.json();
  console.log("raw data", data);
  return convertResponseToStatusApiResponse(data);
};

const OrganizationStatus = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["organizationStatus", slug],
    queryFn: () => fetchOrganizationStatus(slug!),
    enabled: !!slug,
  });

  // Use our custom WebSocket hook for real-time updates
  const {
    services: wsServices,
    incidents: wsIncidents,
    connected,
  } = useStatusWebSocket(data?.services || [], data?.incidents || []);

  // Use WebSocket data if enabled, otherwise use fetched data
  const services = ENABLE_WEBSOCKET ? wsServices : data?.services || [];
  const incidents = ENABLE_WEBSOCKET ? wsIncidents : data?.incidents || [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">Error loading organization status</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const timelineEvents: TimelineEvent[] = incidents
    .filter((incident) => incident.status === "resolved")
    .map((incident) => ({
      id: String(incident.id),
      timestamp: incident.updatedAt,
      type: "resolved",
      description: `${incident.title} has been resolved`,
      incidentId: incident.id,
    }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <StatusHeader services={services} />

        {ENABLE_WEBSOCKET && connected && (
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
            events={timelineEvents}
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
};

export default OrganizationStatus;
