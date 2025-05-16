import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export default function Dashboard() {
  const { getToken } = useAuth();

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const token = await getToken();
      return axios
        .get("http://localhost:8000/api/services", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((res) => res.data);
    },
  });

  return (
    <div>
      <h1>Services</h1>
      {/* <ul>
        {services?.map((service: any) => (
          <li key={service.id}>{service.name} - {service.status}</li>
        ))}
      </ul> */}
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </div>
  );
}
