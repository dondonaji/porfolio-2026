"use client"

import { motion } from "framer-motion"
import { NeoBrutalistCard } from "@/components/ui/neobrutalist-card"
import { CollapsibleSection } from "@/components/ui/collapsible-section"

// Color mapping by category
const categoryColors = {
    saas: "secondary" as const,      // Blue
    creative: "primary" as const,    // Orange  
    ai: "accent" as const,           // Yellow
    hardware: "creative" as const,   // Orange
    analytics: "secondary" as const  // Blue
}

const projects = [
    // FEATURED PROJECT (2x2)
    {
        title: "Soberanía Creativa",
        category: "Creative Manifesto",
        accentColor: categoryColors.creative,
        description: "Manifiesto de crowdfunding soberano y herramientas de contenido con IA.",
        stack: ["Commerce", "Gemini AI", "Motion"],
        link: "https://github.com/dondonaji/RUNNAWAY2026",
        className: "md:col-span-2 md:row-span-2",
        featured: true
    },
    // Regular projects
    {
        title: "VetI - SaaS",
        category: "SaaS",
        accentColor: categoryColors.saas,
        description: "Sistema multi-tenant para clínicas veterinarias.",
        stack: ["Next.js", "Supabase", "Stripe"],
        link: "https://github.com/dondonaji/veti-veterinaria",
        className: "md:col-span-1"
    },
    {
        title: "Invoice Audit",
        category: "Fintech",
        accentColor: categoryColors.saas,
        description: "Detección de riesgos fiscales en XML.",
        stack: ["XML", "Compliance"],
        link: "https://github.com/dondonaji/invoice-auditor-mx",
        className: "md:col-span-1"
    },
    {
        title: "Asistencia IoT",
        category: "Hardware",
        accentColor: categoryColors.hardware,
        description: "Control de acceso biométrico.",
        stack: ["IoT", "Real-time"],
        link: "https://github.com/dondonaji/asistencia-seguridad",
        className: "md:col-span-1"
    },
    {
        title: "Fortnite Stats",
        category: "Analytics",
        accentColor: categoryColors.analytics,
        description: "Métricas de alto rendimiento para eSports.",
        stack: ["Data Viz", "Speed"],
        link: "https://github.com/dondonaji/fortnite-stats-app",
        className: "md:col-span-1"
    },
    {
        title: "AI Radar",
        category: "Strategy",
        accentColor: categoryColors.ai,
        description: "Análisis estratégico de tendencias en IA.",
        stack: ["React", "Strategy"],
        link: "https://github.com/dondonaji/Airadarestrategico",
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
