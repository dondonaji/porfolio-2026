"use client"

import { ProfileHeader } from "@/components/profile-header";
import { ProjectsGrid } from "@/components/projects-grid";
import { SocialLinks } from "@/components/social-links";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAF5] text-black flex flex-col items-center py-20 px-4 relative font-sans">

      {/* Subtle Grid Background - Very Light */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>

      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col gap-8 md:gap-12 relative">
        <ProfileHeader />
        <ProjectsGrid />
        <SocialLinks />
        <Footer />
      </div>
    </main>
  );
}
