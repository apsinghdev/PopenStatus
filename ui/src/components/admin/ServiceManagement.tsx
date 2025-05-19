import { useState, useEffect } from "react";
import { Service, ServiceStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CheckCircle, AlertTriangle, AlertCircle, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface ServiceManagementProps {
  services: Service[];
}

type ServiceFormValues = {
  id?: string;
  name: string;
  status: ServiceStatus;
  description: string;
};

export default function ServiceManagement({ services: initialServices }: ServiceManagementProps) {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [localServices, setLocalServices] = useState<Service[]>(initialServices);
  
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      name: "",
      status: "operational",
      description: ""
    },
    mode: "onChange"
  });
  
  useEffect(() => {
    const fetchServices = async () => {
      if (!organization) {
        console.log('No organization found');
        return;
      }

      console.log('Current organization:', organization);
      const orgId = organization.id;
      
      if (!orgId) {
        console.error('Organization ID is missing');
        toast({
          title: "Error",
          description: "Organization ID is missing. Please try again.",
          variant: "destructive"
        });
        return;
      }

      try {
        console.log('Fetching services for organization:', orgId);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/services/list?organization_id=${orgId}`
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
        }

        const services = await response.json();
        console.log('Fetched services:', services);
        if (Array.isArray(services)) {
          // Transform the services data to match our interface
          const transformedServices = services.map(service => ({
            id: service.ID?.toString() || service.id?.toString(),
            name: service.Name || service.name,
            status: (service.Status || service.status || 'operational') as ServiceStatus,
            lastChecked: service.UpdatedAt || service.lastChecked || new Date().toISOString(),
            description: service.Description || service.description
          }));
          console.log('Transformed services:', transformedServices);
          setLocalServices(transformedServices);
        } else {
          console.error('Received non-array services data:', services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Failed to fetch services. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchServices();
  }, [organization]);
  
  const onSubmit = async (data: ServiceFormValues) => {
    if (!data.name || !data.status || !data.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!user || !organization) {
      toast({
        title: "Error",
        description: "User or organization not found. Please try again.",
        variant: "destructive"
      });
      return;
    }

    const orgId = organization.id;
    if (!orgId) {
      toast({
        title: "Error",
        description: "Organization ID is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating service with organization ID:', orgId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/services/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          status: data.status,
          user_id: user.id,
          OrganizationID: orgId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create service');
      }

      const newService = await response.json();
      console.log('New service created:', newService);

      // Ensure the new service has all required fields
      const serviceToAdd = {
        ...newService,
        name: data.name,
        organization_id: orgId,
        lastChecked: newService.lastChecked || new Date().toISOString(),
        status: newService.status || data.status
      };

      console.log('Service to add:', serviceToAdd);

      // Update the local state with the new service
      setLocalServices(prevServices => {
        const updatedServices = [...prevServices, serviceToAdd];
        console.log('Updated services:', updatedServices);
        return updatedServices;
      });
      
      toast({
        title: "Service created",
        description: `${data.name} has been added successfully.`,
      });

      // Close the dialog and reset form
      setIsOpen(false);
      setCurrentService(null);
      form.reset();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const editService = (service: Service) => {
    setCurrentService(service);
    form.reset({
      name: service.name,
      status: service.status,
      description: service.description || ""
    });
    setIsOpen(true);
  };
  
  const deleteService = async (id: string) => {
    if (!organization) {
      toast({
        title: "Error",
        description: "Organization not found. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/services/${id}?organization_id=${organization.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 404) {
          // If service not found, remove it from local state anyway
          setLocalServices(localServices.filter(service => service.id !== id));
          toast({
            title: "Service deleted",
            description: "The service has been removed from the list.",
          });
          return;
        }
        throw new Error(errorData?.error || 'Failed to delete service');
      }

      setLocalServices(localServices.filter(service => service.id !== id));
      toast({
        title: "Service deleted",
        description: "The service has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete service. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const openCreateDialog = () => {
    setCurrentService(null);
    form.reset({
      name: "",
      status: "operational",
      description: ""
    });
    setIsOpen(true);
  };
  
  const getStatusIcon = (status: ServiceStatus) => {
    switch(status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "partial_outage":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "major_outage":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: ServiceStatus) => {
    switch(status) {
      case "operational":
        return "Operational";
      case "degraded":
        return "Degraded Performance";
      case "partial_outage":
        return "Partial Outage";
      case "major_outage":
        return "Major Outage";
      default:
        return status;
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Services</h2>
        <Button onClick={openCreateDialog} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow key="header">
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!localServices || localServices.length === 0 ? (
              <TableRow key="no-services">
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No services found. Create a service to get started.
                </TableCell>
              </TableRow>
            ) : (
              localServices.map((service, index) => (
                <TableRow key={`${service.name || 'unnamed'}-${service.status || 'unknown'}-${service.lastChecked || Date.now()}-${index}`}>
                  <TableCell className="font-medium">
                    {service.name || 'Unnamed Service'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span>{getStatusText(service.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.lastChecked ? new Date(service.lastChecked).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => editService(service)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentService ? "Edit Service" : "Create New Service"}
            </DialogTitle>
            <DialogDescription>
              {currentService 
                ? "Update the service details below." 
                : "Enter the details for the new service."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Website, API, Database" 
                        {...field}
                        value={field.value || ""}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the service and its purpose..."
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || "operational"}
                      required
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="degraded">Degraded Performance</SelectItem>
                        <SelectItem value="partial_outage">Partial Outage</SelectItem>
                        <SelectItem value="major_outage">Major Outage</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {currentService ? "Update Service" : "Create Service"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
