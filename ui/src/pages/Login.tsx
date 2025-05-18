import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";

const Login = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams();

  const handleSignOut = async () => {
    await signOut();
    if (slug) {
      navigate(`/org/${slug}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn afterSignOutUrl={slug ? `/org/${slug}` : "/"} />
      <SignUp path="/create-organization" />
    </div>
  );
};

export default Login; 