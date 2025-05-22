import { SignInButton, useOrganization, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { organization } = useOrganization();
  const { isSignedIn } = useUser();

  console.log("organization in index", organization)
  useEffect(() => {
    const ticket = searchParams.get('__clerk_ticket');
    const status = searchParams.get('__clerk_status');
    
    if (ticket && status) {
      navigate(`/invitation?__clerk_ticket=${ticket}&__clerk_status=${status}`);
    }
  }, [searchParams, navigate]);

  const handleSignInClick = () => {
    if (isSignedIn && organization) {
      navigate(`/org/${organization.slug}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to PopenStatus!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your all-in-one status page solution
        </p>
        {isSignedIn ? (
          <button 
            onClick={handleSignInClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            You are already signed in. Go to Organization!
          </button>
        ) : (
          <SignInButton mode="modal" forceRedirectUrl="/create-organization">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
};

export default Index;
