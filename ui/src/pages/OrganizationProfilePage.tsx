import { OrganizationProfile } from '@clerk/clerk-react'

export default function OrganizationProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <OrganizationProfile 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none",
            navbar: "hidden",
            pageScrollBox: "p-0",
          },
        }}
      />
    </div>
  )
} 