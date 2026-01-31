"use client"

import { ProfileHeader } from "@/components/profile-header";
import { ProjectsGrid } from "@/components/projects-grid";
import { SocialLinks } from "@/components/social-links";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center py-20 px-4 relative font-sans pattern-grid-lg">

      {/* Swiss Background Decoration: Simple Grid or Stripes */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col gap-12 relative">
        <ProfileHeader />
        <ProjectsGrid />
        <SocialLinks />
        <Footer />
      </div>
    </main>
  );
}
