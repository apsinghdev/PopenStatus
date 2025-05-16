
import { ServiceCard } from "@/components/ServiceCard";
import { Service } from "@/lib/types";

interface ServiceGridProps {
  services: Service[];
}

export function ServiceGrid({ services }: ServiceGridProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Service Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
