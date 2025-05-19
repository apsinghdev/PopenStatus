import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AdminHeader = () => {
  const { slug } = useParams();
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage services and incidents</p>
      </div>
      <Button asChild variant="outline">
        <Link to={`/org/${slug}`} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Return to Status Page
        </Link>
      </Button>
    </div>
  );
};

export default AdminHeader;