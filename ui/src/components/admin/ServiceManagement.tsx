import { useState } from "react";
import { Service, ServiceStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
  const [isOpen, setIsOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [localServices, setLocalServices] = useState<Service[]>(services);
  
  const form = useForm<ServiceFormValues>({
    defaultValues: {
      name: "",
      status: "operational",
      description: ""
    }
  });
  
  const onSubmit = (data: ServiceFormValues) => {
    if (!data.name || !data.status || !data.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentService) {
      // Update existing service
      const updatedServices = localServices.map(service => 
        service.id === currentService.id 
          ? { 
              ...service, 
              name: data.name, 
              status: data.status,
              description: data.description,
              lastChecked: new Date().toISOString()
            } 
          : service
      );
      setLocalServices(updatedServices);
      toast({
        title: "Service updated",
        description: `${data.name} has been updated successfully.`,
      });
    } else {
      // Create new service
      const newService: Service = {
        id: `service-${Date.now()}`,
        name: data.name,
        status: data.status,
        description: data.description,
        lastChecked: new Date().toISOString()
      };
      setLocalServices([...localServices, newService]);
      toast({
        title: "Service created",
        description: `${data.name} has been added successfully.`,
      });
    }
    setIsOpen(false);
    setCurrentService(null);
    form.reset();
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
            <TableRow>
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
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span>{getStatusText(service.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(service.lastChecked).toLocaleString()}
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
                      defaultValue={field.value}
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
