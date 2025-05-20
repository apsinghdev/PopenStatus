import { useState, useEffect } from "react";
import { Incident, IncidentStatus, Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  FormLabel,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CheckCircle, AlertTriangle, AlertCircle, Pencil, Trash2, Plus, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/clerk-react";

interface IncidentManagementProps {
  incidents: Incident[];
  services: Service[];
}

type IncidentFormValues = {
  title: string;
  description: string;
  status: IncidentStatus;
  organization_id: string;
  affectedServices?: string[];
  serviceName?: string;
  serviceId?: string;
};

export default function IncidentManagement({
  incidents,
  services,
}: IncidentManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [localIncidents, setLocalIncidents] = useState<Incident[]>(incidents || []);
  const { organization } = useOrganization();
  const organizationId = organization?.id || "";

  useEffect(() => {
    setLocalIncidents(incidents || []);
  }, [incidents]);

  const form = useForm<IncidentFormValues>({
    defaultValues: {  
      title: "",
      description: "",
      status: "investigating" as IncidentStatus,
      organization_id: "",
      affectedServices: [],
    },
  });

  const onSubmit = async (data: IncidentFormValues) => {
    try {
      // Log form data
      console.log('Form Data:', {
        title: data.title,
        description: data.description,
        status: data.status,
        organization_id: organizationId,
        serviceName: data.serviceName,
        affectedServices: data.affectedServices,
        serviceId: data.serviceId,
      });

      // Validate required fields
      if (!data.title.trim() || !data.status || !data.organization_id) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields including at least one affected service.",
          variant: "destructive",
        });
        return;
      }

      if (currentIncident) {
        // Update existing incident
        const requestData = {
          title: data.title,
          description: data.description,
          status: data.status.toLowerCase(),
        };

        console.log('Update Request Data:', requestData);
        console.log("currentIncident", currentIncident);
        
        // Find the service ID from the services array based on the service name
        console.log("data", data);
        const selectedService = services.find(service => service.name === data.serviceName);
        const serviceId = selectedService?.id || currentIncident.affectedServices?.[0];
        console.log("serviceId", serviceId);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/incidents/update/${currentIncident.id}?organization_id=${organizationId}&service_id=${serviceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'Failed to update incident');
        }

        const updatedIncident = await response.json();
        console.log('Update API Response:', updatedIncident);

        // Update local state with the response from the server
        setLocalIncidents(prevIncidents => 
          prevIncidents.map(incident => 
            incident.id === currentIncident.id 
              ? {
                  ...incident,
                  title: updatedIncident.Title || updatedIncident.name || data.title,
                  status: (updatedIncident.status || data.status) as IncidentStatus,
                  affectedServices: data.affectedServices || [],
                  serviceName: data.serviceName || "",
                  updatedAt: new Date().toISOString(),
                }
              : incident
          )
        );

        toast({
          title: "Incident updated",
          description: `${data.title} has been updated successfully.`,
        });
      } else {
        // Create new incident
        const requestData = {
          title: data.title,
          description: data.description,
          status: data.status.toLowerCase(),
          organization_id: organizationId,
          service_id: data.affectedServices[0] || "",
          service_name: data.serviceName || "",
          affected_services: data.affectedServices,
        };

        console.log('Request Data:', requestData); // Log the actual request data

        const response = await fetch(`${import.meta.env.VITE_API_URL}/incidents/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'Failed to create incident');
        }

        const newIncident = await response.json();
        console.log('Raw API Response:', newIncident);

        // Find the selected service to get its name
        const selectedService = services.find(service => service.id === data.affectedServices[0]);

        // Format the incident to match our type definition
        const formattedIncident: Incident = {
          id: newIncident.id,
          title: newIncident.Title || newIncident.name || '',
          status: (newIncident.status || 'investigating') as IncidentStatus,
          createdAt: newIncident.created_at || new Date().toISOString(),
          updatedAt: newIncident.updated_at || new Date().toISOString(),
          updates: newIncident.updates || [],
          serviceName: selectedService?.name || '',
          affectedServices: data.affectedServices || []
        };
        console.log('Formatted Incident:', formattedIncident);
        console.log('Title:', formattedIncident.title);
        console.log('Affected Services:', formattedIncident.affectedServices);

        setLocalIncidents(prevIncidents => {
          const updatedIncidents = [...prevIncidents, formattedIncident];
          console.log('Updated Incidents:', updatedIncidents);
          return updatedIncidents;
        });
        toast({
          title: "Incident created",
          description: `${data.title} has been added successfully.`,
        });
      }
      setIsOpen(false);
      setCurrentIncident(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create incident. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editIncident = (incident: Incident) => {
    setCurrentIncident(incident);
    form.reset({
      title: incident.title || "",
      description: "",
      status: incident.status,
      organization_id: organizationId,
      affectedServices: incident.affectedServices || [],
      serviceName: incident.serviceName || "",
    });
    setIsOpen(true);
  };

  const deleteIncident = (id: string) => {
    setLocalIncidents(localIncidents.filter((incident) => incident.id !== id));
    toast({
      title: "Incident deleted",
      description: "The incident has been removed successfully.",
      variant: "destructive",
    });
  };

  const openCreateDialog = () => {
    setCurrentIncident(null);
    form.reset({
      title: "",
      description: "",
      status: "investigating" as IncidentStatus,
      organization_id: organizationId,
      affectedServices: [],
      serviceName: "",
    });
    setIsOpen(true);
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case "investigating":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            <AlertTriangle className="h-3 w-3" />
            Investigating
          </div>
        );
      case "identified":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            Identified
          </div>
        );
      case "resolved":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Incidents</h2>
        <Button onClick={openCreateDialog} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create Incident
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localIncidents.length === 0 ? (
              <TableRow key="empty-state">
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No incidents found. Create an incident to get started.
                </TableCell>
              </TableRow>
            ) : (
              localIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    <Collapsible>
                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        {incident.title}
                      </div>
                      <CollapsibleContent className="mt-2 pl-6 border-l-2 border-muted space-y-2">
                        <div>
                          <p className="text-sm font-medium">Service:</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {incident.serviceName || 'No service specified'}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(incident.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(incident.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editIncident(incident)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteIncident(incident.id)}
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

      {/* Create/Edit Incident Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle>
              {currentIncident ? "Edit Incident" : "Create New Incident"}
            </DialogTitle>
            <DialogDescription>
              {currentIncident
                ? "Update the incident details below."
                : "Enter the details for the new incident."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Database Issues"
                          {...field}
                          value={field.value || ""}
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
                      <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "investigating"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="identified">Identified</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe the incident details"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!currentIncident && (
                <FormField
                  control={form.control}
                  name="affectedServices"
                  render={() => (
                    <FormItem>
                      <FormLabel>Affected Service <span className="text-red-500">*</span></FormLabel>
                      <div className="border rounded-md p-2 space-y-1 max-h-[150px] overflow-y-auto">
                        {services.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No services available
                          </p>
                        ) : (
                          services.map((service) => (
                            <div key={service.id} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`service-${service.id}`}
                                name="affectedService"
                                checked={(form.getValues("affectedServices") || [])[0] === service.id}
                                onChange={() => {
                                  form.setValue("affectedServices", [service.id], {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                }}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              />
                              <label
                                htmlFor={`service-${service.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {service.name}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter className="pt-2">
                <Button type="submit">
                  {currentIncident ? "Update Incident" : "Create Incident"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
