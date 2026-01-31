"use client"

import { motion } from "framer-motion"
import { NeoBrutalistCard } from "@/components/ui/neobrutalist-card"
import { CollapsibleSection } from "@/components/ui/collapsible-section"

// Color mapping by category
const categoryColors = {
    saas: "secondary" as const,      // Blue
    creative: "primary" as const,    // Orange  
    ai: "accent" as const,           // Yellow
    hardware: "creative" as const,   // Green (usando creative temporalmente)
    analytics: "secondary" as const  // Purple (usando secondary temporalmente)
}

const projects = [
    {
        title: "VetI - SaaS",
        category: "SaaS",
        accentColor: categoryColors.saas,
        description: "Multi-tenant Veterinary Clinic System.",
        stack: ["Next.js", "Supabase", "Stripe"],
        link: "https://github.com/dondonaji/veti-veterinaria",
        className: "md:col-span-2"
    },
    {
        title: "RUNWAY ZERO",
        category: "Creative",
        accentColor: categoryColors.creative,
        description: "Sovereign Crowdfunding Manifesto.",
        stack: ["Commerce", "Motion"],
        link: "https://github.com/dondonaji/RUNNAWAY2026",
        className: "md:col-span-1"
    },
    {
        title: "Invoice Audit",
        category: "Fintech",
        accentColor: categoryColors.saas,
        description: "Fiscal XML Risk Detection.",
        stack: ["XML", "Compliance"],
        link: "https://github.com/dondonaji/invoice-auditor-mx",
        className: "md:col-span-1"
    },
    {
        title: "Asistencia IoT",
        category: "Hardware",
        accentColor: categoryColors.hardware,
        description: "Biometric Access Control.",
        stack: ["IoT", "Real-time"],
        link: "https://github.com/dondonaji/asistencia-seguridad",
        className: "md:col-span-1"
    },
    {
        title: "Fortnite Stats",
        category: "Analytics",
        accentColor: categoryColors.analytics,
        description: "High-Performance eSports Metrics.",
        stack: ["Data Viz", "Speed"],
        link: "https://github.com/dondonaji/fortnite-stats-app",
        className: "md:col-span-1"
    },
    {
        title: "AI Radar",
        category: "Strategy",
        accentColor: categoryColors.ai,
        description: "Strategic AI Trend Analysis.",
        stack: ["React", "Strategy"],
        link: "https://github.com/dondonaji/Airadarestrategico",
        className: "md:col-span-2"
    },
    {
        title: "InstaFlow IA",
        category: "AI Tools",
        accentColor: categoryColors.ai,
        description: "AI-powered Instagram content generator.",
        stack: ["Gemini", "React", "Vite"],
        link: "https://instaflow-six.vercel.app/",
        className: "md:col-span-2"
    }
]

export function ProjectsGrid() {
    return (
        <div className="w-full max-w-6xl mx-auto mb-8 px-4">
            <CollapsibleSection
                title="Selected Works"
                subtitle="// ARCHIVE_2024-2026.DIR"
                defaultOpen={true}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
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
            </CollapsibleSection>
        </div>
    )
}
