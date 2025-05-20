import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ServiceManagement from "@/components/admin/ServiceManagement";
import IncidentManagement from "@/components/admin/IncidentManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Service, Incident } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { convertResponseToStatusApiResponse } from "@/utils/utils";
import AdminHeader from "@/components/AdminHeader";

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
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/organizations/${slug}/status`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch organization status");
  }
  const data = await response.json();
  return convertResponseToStatusApiResponse(data);
};

const AdminDashboard = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["organizationStatus", slug],
    queryFn: () => fetchOrganizationStatus(slug!),
    enabled: !!slug,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
  });

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
        <div className="text-red-500">Error loading dashboard</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      <h1 className="text-2xl font-bold mb-6">
        {data.organization.name} Dashboard
      </h1>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServiceManagement services={data.services} />
        </TabsContent>

        <TabsContent value="incidents">
          <IncidentManagement 
            incidents={data.incidents} 
            services={data.services}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
