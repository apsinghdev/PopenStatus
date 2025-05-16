import { subMinutes } from "date-fns";
import { ServiceStatus } from "@/lib/types";

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
