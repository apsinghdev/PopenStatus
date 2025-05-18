
import { useEffect, useRef, useState } from "react";
import { Incident, Service, WebSocketEvent } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

export function useStatusWebSocket(
  initialServices: Service[],
  initialIncidents: Incident[]
) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [connected, setConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    // Update the state when the initial data changes (e.g., after a refresh)
    setServices(initialServices);
    setIncidents(initialIncidents);
  }, []); //initialServices, initialIncidents]);
  
  // Simulate WebSocket connection for the demo
  useEffect(() => {
    // This simulates opening a WebSocket connection
    const connectWebSocket = () => {
      console.log("Connecting to WebSocket...");
      
      // In a real app, we'd connect to a real WebSocket server
      // For now, we'll just simulate the connection
      const mockWs = {
        close: () => {
          console.log("WebSocket closed");
          setConnected(false);
        },
      } as unknown as WebSocket;
      
      wsRef.current = mockWs;
      
      // Simulate connection established
      setTimeout(() => {
        setConnected(true);
        toast({
          title: "Connected",
          description: "Real-time status updates enabled",
          variant: "default",
        });
      }, 1500);
      
      // Simulate receiving status updates
      const statusUpdateInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          const serviceIndex = Math.floor(Math.random() * services.length);
          const service = services[serviceIndex];
          
          const statuses: ("operational" | "degraded" | "outage")[] = [
            "operational",
            "degraded",
            "outage",
          ];
          const newStatus =
            statuses[Math.floor(Math.random() * statuses.length)];
          
          console.log(`Status change for ${service.name}: ${newStatus}`);
          
          // Update service status
          const updatedServices = [...services];
          updatedServices[serviceIndex] = {
            ...service,
            status: newStatus,
            lastChecked: new Date().toISOString(),
          };
          
          setServices(updatedServices);
          
          // Show toast notification
          toast({
            title: `${service.name} Status Change`,
            description: `Status changed to ${newStatus}`,
            variant: newStatus === "outage" ? "destructive" : "default",
          });
        }
      }, 30000); // Update every 30 seconds
      
      return () => {
        clearInterval(statusUpdateInterval);
        mockWs.close();
      };
    };
    
    const connection = connectWebSocket();
    
    return () => {
      if (connection) {
        connection();
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []); //[services]);
  
  return {
    services,
    incidents,
    connected,
  };
}