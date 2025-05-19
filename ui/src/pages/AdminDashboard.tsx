
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminHeader from "@/components/AdminHeader";
import ServiceManagement from "@/components/admin/ServiceManagement";
import IncidentManagement from "@/components/admin/IncidentManagement";
import { useStatusWebSocket } from "@/hooks/useStatusWebSocket";
import { mockServices, mockIncidents } from "@/lib/mockData";

const AdminDashboard = () => {
  const { services, incidents } = useStatusWebSocket(mockServices, mockIncidents);
  
  return (
    <div className="container mx-auto p-4 md:p-6 min-h-screen">
      <AdminHeader />
      
      <Tabs defaultValue="services" className="mt-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="services">Service Management</TabsTrigger>
          <TabsTrigger value="incidents">Incident Management</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-6">
          <ServiceManagement services={services} />
        </TabsContent>
        <TabsContent value="incidents" className="mt-6">
          <IncidentManagement 
            incidents={incidents} 
            services={services} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
