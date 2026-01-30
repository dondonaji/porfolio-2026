import { ProfileHeader } from "@/components/profile-header";
// import { CampaignHero } from "@/components/campaign-hero";
import { ProjectsGrid } from "@/components/projects-grid";
import { SocialLinks } from "@/components/social-links";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center py-16 px-4 relative overflow-hidden font-sans">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-2xl mx-auto flex flex-col gap-8">
        <ProfileHeader />
        {/* <CampaignHero /> */}
        <ProjectsGrid />
        <SocialLinks />
        <Footer />
      </div>
    </main>
  );
}
