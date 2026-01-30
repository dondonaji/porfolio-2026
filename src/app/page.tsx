"use client"

import { ProfileHeader } from "@/components/profile-header";
import { ProjectsGrid } from "@/components/projects-grid";
import { SocialLinks } from "@/components/social-links";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col items-center py-24 px-4 relative overflow-hidden font-sans selection:bg-white/20">

      {/* Cinematic Noise Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]"
        />
      </div>

      <div className="z-10 w-full max-w-2xl mx-auto flex flex-col gap-8 relative">
        <ProfileHeader />
        <ProjectsGrid />
        <SocialLinks />
        <Footer />
      </div>
    </main>
  );
}
