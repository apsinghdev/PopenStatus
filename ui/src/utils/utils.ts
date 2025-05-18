import { subMinutes } from "date-fns";
import { Service, Incident, TimelineEvent, ServiceStatus, IncidentStatus } from "@/lib/types";


type RawService = {
  ID: number;
  Name: string;
  Status: string;
};

export function convertResponseToServices(raw: RawService[]): Service[] {
  const now = new Date();
  const statusMap: Record<string, ServiceStatus> = {
    operational: "operational",
    degraded_performance: "degraded",
    partial_outage: "outage",
    major_outage: "outage",
  };

  return raw.map((item, index) => {
    let lastChecked = now;

    // Example logic: vary lastChecked for realism
    if (index === 2) lastChecked = subMinutes(now, 5);
    else if (index === 4) lastChecked = subMinutes(now, 2);
    else if (index === 5) lastChecked = subMinutes(now, 15);
    else if (index === 6) lastChecked = subMinutes(now, 1);

    return {
      id: item.ID.toString(),
      name: item.Name,
      status: statusMap[item.Status] || "operational",
      lastChecked: lastChecked.toISOString(),
    };
  });
}

type RawIncident = {
  ID: number;
  Title: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
};

type HumanizedIncident = {
  id: string;
  title: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
};

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  return `just now`;
}

export function convertResponseToIncidents(
  rawIncidents: RawIncident[]
): HumanizedIncident[] {
  const statusMap: Record<string, IncidentStatus> = {
    investigating: "investigating",
    identified: "identified",
    resolved: "resolved",
  };

  return rawIncidents.map((incident) => ({
    id: incident.ID.toString(),
    title: incident.Title,
    status: statusMap[incident.Status] || "investigating",
    createdAt: incident.CreatedAt,
    updatedAt: incident.UpdatedAt,
  }));
}


type RawData = any;

export function convertResponseToStatusApiResponse(rawData: RawData): {
  services: Service[];
  incidents: Incident[];
  organization: { id: number; name: string; slug: string };
  timelineEvents: TimelineEvent[];
} {
  const services: Service[] = rawData.services.map((s: any) => ({
    id: String(s.ID),
    name: s.Name,
    status: s.Status as Service["status"],
    lastChecked: new Date().toISOString(), // or use s.UpdatedAt if available
  }));

  const incidents: Incident[] = rawData.incidents.map((i: any) => ({
    id: String(i.ID),
    title: i.Title,
    status: i.Status as IncidentStatus,
    createdAt: i.CreatedAt,
    updatedAt:
      i.Updates && i.Updates.length > 0
        ? i.Updates[i.Updates.length - 1].CreatedAt
        : i.CreatedAt,
  }));

  const timelineEvents: TimelineEvent[] = incidents
    .filter((i) => i.status === "resolved")
    .map((i) => ({
      id: i.id,
      timestamp: i.updatedAt,
      type: "resolved",
      description: `${i.title} has been resolved`,
      incidentId: i.id,
    }));

  const organization = {
    id: rawData.organization.id,
    name: rawData.organization.name,
    slug: rawData.organization.slug,
  };

  return {
    services,
    incidents,
    organization,
    timelineEvents,
  };
}
