import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, AlertCircle, LogIn, LayoutDashboard } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  OrganizationSwitcher,
  useOrganization,
} from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import { Service } from "@/lib/types";
import { useState } from "react";

interface StatusHeaderProps {
  services: Service[];
}

export function StatusHeader({ services }: StatusHeaderProps) {
  const { organization } = useOrganization();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [showSignIn, setShowSignIn] = useState(false);
  const afterSignOutUrl = organization ? `/org/${organization.slug}` : "/";

  const handleDashboardClick = () => {
    if (organization) {
      navigate(`/org/${organization.slug}/admin-dashboard`);
    }
  };

  const handleSignInClick = () => {
    if (slug) {
      setShowSignIn(true);
    } else {
      navigate('/create-organization');
    }
  };

  const allOperational = services.every(
    (service) => service.status === "operational"
  );
  const hasOutage = services.some((service) => service.status === "major_outage");

  let statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
  let statusText = "All systems operational";
  let badgeVariant: "default" | "secondary" | "destructive" = "default";

  if (hasOutage) {
    statusIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
    statusText = "System outage detected";
    badgeVariant = "destructive";
  } else if (!allOperational) {
    statusIcon = <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    statusText = "Partial system degradation";
    badgeVariant = "secondary";
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-8 md:py-12 text-center">
      {/* Login button and organization switcher in the top right */}
      <div className="absolute top-0 right-0 flex items-center gap-2">
        <SignedOut>
          {showSignIn && slug ? (
            <SignIn
              forceRedirectUrl={`/org/${slug}`}
              appearance={{
                elements: {
                  rootBox: "flex justify-center items-center",
                  card: "shadow-none",
                },
              }}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignInClick}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </SignedOut>
        <SignedIn>
          <OrganizationSwitcher 
            appearance={{
              elements: {
                rootBox: "flex justify-center items-center",
                organizationSwitcherTrigger: "py-2 px-4",
              },
            }}
            afterCreateOrganizationUrl="/org/:slug"
            afterSelectOrganizationUrl="/org/:slug"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDashboardClick}
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <UserButton afterSignOutUrl={afterSignOutUrl} />
        </SignedIn>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">Popen Status</h1>
      <div className="flex items-center gap-2 mb-2">
        {statusIcon}
        <Badge variant={badgeVariant} className="text-sm py-1 px-3">
          {statusText}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Last updated {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}
