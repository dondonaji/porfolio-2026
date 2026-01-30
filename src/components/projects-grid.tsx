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
        layout: "hero"
    },
    {
        title: "RUNWAY ZERO",
        category: "Creative",
        imageGradient: "bg-gradient-to-bl from-rose-950 via-purple-950 to-black",
        description: "Manifiesto digital y crowdfunding soberano.",
        stack: ["Framer Motion", "UI/UX", "Commerce"],
        link: "https://github.com/dondonaji/RUNNAWAY2026",
        layout: "column"
    },
    {
        title: "Invoice Auditor",
        category: "Fintech",
        imageGradient: "bg-gradient-to-br from-blue-950 to-slate-950",
        description: "Auditoría fiscal de XMLs y detección de riesgos SAT.",
        stack: ["XML Parsing", "Compliance", "Local Logic"],
        link: "https://github.com/dondonaji/invoice-auditor-mx",
        layout: "column-offset"
    },
    {
        title: "Asistencia IoT",
        category: "Hardware",
        imageGradient: "bg-gradient-to-tr from-orange-950 to-amber-950",
        description: "Control de acceso empresarial con biometría.",
        stack: ["IoT", "Biometrics", "Real-time"],
        link: "https://github.com/dondonaji/asistencia-seguridad",
        layout: "hero"
    },
    {
        title: "Fortnite Stats",
        category: "Analytics",
        imageGradient: "bg-gradient-to-r from-violet-950 to-fuchsia-950",
        description: "Dashboard de métricas de E-Sports.",
        stack: ["Data Viz", "Low Latency"],
        link: "https://github.com/dondonaji/fortnite-stats-app",
        layout: "column"
    },
    {
        title: "AI Radar",
        category: "Strategy",
        imageGradient: "bg-gradient-to-tl from-cyan-950 to-blue-950",
        description: "Visualización de tendencias de IA.",
        stack: ["React", "Strategy", "Trends"],
        link: "https://github.com/dondonaji/Airadarestrategico",
        layout: "column-offset"
    }
]

export function ProjectsGrid() {
    return (
        <div className="w-full max-w-5xl mx-auto mb-24 px-4 sm:px-0">
            <div className="flex items-end justify-between px-2 mb-16 border-b border-white/5 pb-4">
                <h3 className="text-4xl font-light tracking-tighter text-white">
                    Selected <span className="text-white/40 italic serif">Works</span>
                </h3>
                <span className="text-xs font-mono text-white/30 hidden md:block">
                    [ 2024 — 2026 ]
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
                {projects.map((project, index) => {
                    const isHero = project.layout === "hero"
                    const isOffset = project.layout === "column-offset"

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{
                                type: "spring",
                                stiffness: 50,
                                damping: 20,
                                delay: index * 0.1
                            }}
                            className={`
                                ${isHero ? "md:col-span-12 h-[500px]" : "md:col-span-6 h-[400px]"} 
                                ${isOffset ? "md:translate-y-24" : ""}
                            `}
                        >
                            <GalleryCard
                                title={project.title}
                                category={project.category}
                                description={project.description}
                                stack={project.stack}
                                imageGradient={project.imageGradient}
                                href={project.link}
                                className="h-full w-full shadow-2xl hover:shadow-3xl transition-shadow duration-500"
                            />
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
