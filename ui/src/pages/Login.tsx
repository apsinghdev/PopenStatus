import { SignIn, SignUp } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
      <SignUp path="/create-organization" />
    </div>
  );
};

export default Login; 