"use client"

import { HeroSection } from "@/components/hero-section";
import { ProfileHeader } from "@/components/profile-header";
import { ProjectsGrid } from "@/components/projects-grid";
import { ShowreelSection } from "@/components/showreel-section";
import { SocialLinks } from "@/components/social-links";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAF5] text-black font-sans">

      {/* Subtle Grid Background - Very Light */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>

      <HeroSection />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-8 md:gap-12 px-4 py-20">
        <ProfileHeader />
        <ShowreelSection />
        <ProjectsGrid />
        <SocialLinks />
        <Footer />
      </div>
    </main>
  );
}
