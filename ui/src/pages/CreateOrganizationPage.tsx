import { CreateOrganization } from "@clerk/clerk-react";

const CreateOrganizationPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <CreateOrganization afterCreateOrganizationUrl="/org/:slug" />
    </div>
  );
};

export default CreateOrganizationPage; 