export type ServiceStatus = "operational" | "degraded" | "outage";

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  lastChecked: string; // ISO date string
}

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export interface IncidentUpdate {
  id: string;
  timestamp: string; // ISO date string
  message: string;
  status: IncidentStatus;
}

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO date string
  type: "incident_created" | "status_updated" | "resolved";
  description: string;
  incidentId?: string;
}

export interface StatusApiResponse {
  services: Service[];
  incidents: Incident[];
  activeIncidents: Incident[];
  timelineEvents: TimelineEvent[];
}

export interface WebSocketStatusChangeEvent {
  type: "statusChange";
  service: string; // service ID
  status: ServiceStatus;
}

export interface WebSocketIncidentUpdateEvent {
  type: "incidentUpdate";
  incident: Incident;
}

export type WebSocketEvent =
  | WebSocketStatusChangeEvent
  | WebSocketIncidentUpdateEvent;
