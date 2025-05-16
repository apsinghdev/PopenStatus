import { subMinutes } from "date-fns";
import { ServiceStatus, IncidentStatus } from "@/lib/types";

type Service = {
  id: string;
  name: string;
  status: ServiceStatus;
  lastChecked: string;
};

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
    monitoring: "monitoring",
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
