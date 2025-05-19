import { useState } from "react";
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

export default function ServiceManagement({ services }: ServiceManagementProps) {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [localServices, setLocalServices] = useState<Service[]>(services);
  
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      name: "",
      status: "operational",
      description: ""
    },
    mode: "onChange"
  });
  
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

    try {
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
          OrganizationID: organization.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create service');
      }

      const newService = await response.json();
      console.log('New service created:', newService); // Debug log

      // Ensure the new service has all required fields
      const serviceToAdd = {
        ...newService,
        name: data.name, // Explicitly set the name from form data
        lastChecked: newService.lastChecked || new Date().toISOString(),
        status: newService.status || data.status
      };

      console.log('Service to add:', serviceToAdd); // Debug log for the service being added

      // Update the local state with the new service
      setLocalServices(prevServices => {
        const updatedServices = [...prevServices, serviceToAdd];
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
  
  const deleteService = (id: string) => {
    setLocalServices(localServices.filter(service => service.id !== id));
    toast({
      title: "Service deleted",
      description: "The service has been removed successfully.",
      variant: "destructive"
    });
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
            <TableRow key="header-row">
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No services found. Create a service to get started.
                </TableCell>
              </TableRow>
            ) : (
              localServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" key={`status-${service.id}`}>
                      {getStatusIcon(service.status)}
                      <span>{getStatusText(service.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(service.lastChecked).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2" key={`actions-${service.id}`}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => editService(service)}
                        key={`edit-${service.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteService(service.id)}
                        key={`delete-${service.id}`}
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
