"use client"

import { motion } from "framer-motion"
import { NeoBrutalistCard } from "@/components/ui/neobrutalist-card"

const projects = [
    {
        title: "VetI - SaaS",
        category: "SaaS",
        accentColor: "secondary" as const, // Blue
        description: "Multi-tenant Veterinary Clinic System.",
        stack: ["Next.js", "Supabase", "Stripe"],
        link: "https://github.com/dondonaji/veti-veterinaria",
        className: "md:col-span-2"
    },
    {
        title: "RUNWAY ZERO",
        category: "Creative",
        accentColor: "creative" as const, // Pink
        description: "Sovereign Crowdfunding Manifesto.",
        stack: ["Commerce", "Motion"],
        link: "https://github.com/dondonaji/RUNNAWAY2026",
        className: "md:col-span-1"
    },
    {
        title: "Invoice Audit",
        category: "Fintech",
        accentColor: "primary" as const, // Orange
        description: "Fiscal XML Risk Detection.",
        stack: ["XML", "Compliance"],
        link: "https://github.com/dondonaji/invoice-auditor-mx",
        className: "md:col-span-1"
    },
    {
        title: "Asistencia IoT",
        category: "Hardware",
        accentColor: "accent" as const, // Yellow
        description: "Biometric Access Control.",
        stack: ["IoT", "Real-time"],
        link: "https://github.com/dondonaji/asistencia-seguridad",
        className: "md:col-span-1"
    },
    {
        title: "Fortnite Stats",
        category: "Analytics",
        accentColor: "secondary" as const, // Blue
        description: "High-Performance eSports Metrics.",
        stack: ["Data Viz", "Speed"],
        link: "https://github.com/dondonaji/fortnite-stats-app",
        className: "md:col-span-1"
    },
    {
        title: "AI Radar",
        category: "Strategy",
        accentColor: "creative" as const, // Pink
        description: "Strategic AI Trend Analysis.",
        stack: ["React", "Strategy"],
        link: "https://github.com/dondonaji/Airadarestrategico",
        className: "md:col-span-2"
    }
]

export function ProjectsGrid() {
    return (
        <div className="w-full max-w-6xl mx-auto mb-20 px-4">
            {/* Swiss Grid Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b-[3px] border-black mb-8">
                <div className="col-span-1 p-2 font-black text-xl uppercase tracking-tighter bg-black text-white">
                    Selected Works
                </div>
                <div className="col-span-1 md:col-span-2 p-2 font-mono text-sm border-r-[3px] border-black hidden md:block">
                    // ARCHIVE_2024-2026.DIR
                </div>
                <div className="col-span-1 p-2 font-mono text-sm text-right font-bold">
                    [INDEX: 001]
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={project.className}
                    >
                        <NeoBrutalistCard
                            title={project.title}
                            category={project.category}
                            description={project.description}
                            stack={project.stack}
                            accentColor={project.accentColor}
                            href={project.link}
                            className="h-full min-h-[250px]"
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
