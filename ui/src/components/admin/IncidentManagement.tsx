import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface IncidentManagementProps {
  incidents: Incident[];
  services: Service[];
}

type IncidentFormValues = {
  title: string;
  status: IncidentStatus;
  affectedServices: string[];
};

export default function IncidentManagement({
  incidents,
  services,
}: IncidentManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [localIncidents, setLocalIncidents] = useState<Incident[]>(incidents || []);

  const form = useForm<IncidentFormValues>({
    defaultValues: {
      title: "",
      status: "investigating",
      affectedServices: [],
    },
  });

  const onSubmit = (data: IncidentFormValues) => {
    if (currentIncident) {
      // Update existing incident
      const updatedIncidents = localIncidents.map((incident) =>
        incident.id === currentIncident.id
          ? {
              ...incident,
              title: data.title,
              status: data.status,
              affectedServices: data.affectedServices,
              updatedAt: new Date().toISOString(),
            }
          : incident
      );
      setLocalIncidents(updatedIncidents);
      toast({
        title: "Incident updated",
        description: `${data.title} has been updated successfully.`,
      });
    } else {
      // Create new incident
      const newIncident: Incident = {
        id: `incident-${Date.now()}`,
        title: data.title,
        status: data.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        affectedServices: data.affectedServices || [],
        updates: [],
      };
      setLocalIncidents([...localIncidents, newIncident]);
      toast({
        title: "Incident created",
        description: `${data.title} has been added successfully.`,
      });
    }
    setIsOpen(false);
    setCurrentIncident(null);
    form.reset();
  };

  const editIncident = (incident: Incident) => {
    setCurrentIncident(incident);
    form.reset({
      title: incident.title,
      status: incident.status,
      affectedServices: incident.affectedServices,
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
      status: "investigating",
      affectedServices: [],
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
              <TableRow>
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
                          <p className="text-sm font-medium">Affected Services:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                            {(incident.affectedServices || []).length === 0 ? (
                              <li>None specified</li>
                            ) : (
                              (incident.affectedServices || []).map((serviceId) => {
                                const service = services.find(s => s.id === serviceId);
                                return (
                                  <li key={serviceId}>{service?.name || "Unknown Service"}</li>
                                );
                              })
                            )}
                          </ul>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Database Connectivity Issues"
                        {...field}
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="identified">Identified</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affectedServices"
                render={() => (
                  <FormItem>
                    <FormLabel>Affected Services</FormLabel>
                    <div className="border rounded-md p-3 space-y-2">
                      {services.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No services available. Please create services first.
                        </p>
                      ) : (
                        services.map((service) => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`service-${service.id}`}
                              onCheckedChange={(checked) => {
                                const currentServices = form.getValues("affectedServices") || [];
                                const updatedServices = checked
                                  ? [...currentServices, service.id]
                                  : currentServices.filter((id) => id !== service.id);
                                form.setValue("affectedServices", updatedServices);
                              }}
                              checked={(form.getValues("affectedServices") || []).includes(service.id)}
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

              <DialogFooter>
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
