import { SignInButton } from "@clerk/clerk-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to PopenStatus!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your all-in-one status page solution
        </p>
        <SignInButton mode="modal">
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
};

export default Index;
