"use client"

import { motion } from "framer-motion"
import { GalleryCard } from "@/components/ui/gallery-card"

const projects = [
    {
        title: "VetI - SaaS System",
        category: "SaaS",
        imageGradient: "bg-gradient-to-tr from-emerald-950 to-emerald-900",
        description: "Sistema de gestión clínica veterinaria con arquitectura multi-tenant.",
        stack: ["Next.js 16", "Supabase", "Stripe"],
        link: "https://github.com/dondonaji/veti-veterinaria",
        className: "md:col-span-2 md:row-span-2"
    },
    {
        title: "RUNWAY ZERO",
        category: "Creative",
        imageGradient: "bg-gradient-to-bl from-rose-950 via-purple-950 to-black",
        description: "Crowdfunding soberano & Manifiesto.",
        stack: ["Framer Motion", "UI/UX", "Commerce"],
        link: "https://github.com/dondonaji/RUNNAWAY2026",
        className: "md:col-span-1 md:row-span-2"
    },
    {
        title: "Invoice Auditor",
        category: "Fintech",
        imageGradient: "bg-gradient-to-br from-blue-950 to-slate-950",
        description: "Auditoría fiscal de XMLs y detección de riesgos SAT.",
        stack: ["XML Parsing", "Compliance"],
        link: "https://github.com/dondonaji/invoice-auditor-mx",
        className: "md:col-span-1 md:row-span-1"
    },
    {
        title: "AI Radar",
        category: "Strategy",
        imageGradient: "bg-gradient-to-tl from-cyan-950 to-blue-950",
        description: "Visualización de tendencias de IA.",
        stack: ["React", "Strategy"],
        link: "https://github.com/dondonaji/Airadarestrategico",
        className: "md:col-span-1 md:row-span-1"
    },
    {
        title: "Asistencia IoT",
        category: "Hardware",
        imageGradient: "bg-gradient-to-tr from-orange-950 to-amber-950",
        description: "Control de acceso biométrico.",
        stack: ["IoT", "Biometrics", "Real-time"],
        link: "https://github.com/dondonaji/asistencia-seguridad",
        className: "md:col-span-2 md:row-span-1"
    },
    {
        title: "Fortnite Stats",
        category: "Analytics",
        imageGradient: "bg-gradient-to-r from-violet-950 to-fuchsia-950",
        description: "Métricas E-Sports Low Latency.",
        stack: ["Data Viz", "Low Latency"],
        link: "https://github.com/dondonaji/fortnite-stats-app",
        className: "md:col-span-2 md:row-span-1"
    }
]

export function ProjectsGrid() {
    return (
        <div className="w-full max-w-7xl mx-auto mb-20 px-4">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h3 className="text-2xl font-light tracking-tight text-white flex gap-2 items-center">
                    Dashboard <span className="text-white/40 italic serif">Active Projects</span>
                </h3>
                <div className="flex gap-4 text-xs font-mono text-white/30">
                    <span>OPS: ONLINE</span>
                    <span className="hidden md:inline">LOC: MEXICO</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-4">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.4,
                            delay: index * 0.05,
                            ease: "easeOut"
                        }}
                        className={`${project.className} relative group`}
                    >
                        <GalleryCard
                            title={project.title}
                            category={project.category}
                            description={project.description}
                            stack={project.stack}
                            imageGradient={project.imageGradient}
                            href={project.link}
                            className="h-full w-full hover:ring-1 hover:ring-white/20 transition-all duration-300"
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
