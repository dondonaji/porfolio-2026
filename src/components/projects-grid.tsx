"use client"

import { motion } from "framer-motion"
import { GalleryCard } from "@/components/ui/gallery-card"

const projects = [
    {
        title: "VetI - SaaS System",
        category: "SaaS",
        imageGradient: "bg-gradient-to-tr from-emerald-900 to-emerald-500",
        description: "Sistema de gestión clínica veterinaria con arquitectura multi-tenant y pagos en tiempo real.",
        stack: ["Next.js 16", "Supabase", "Stripe"],
        link: "https://github.com/dondonaji/veti-veterinaria",
        size: "large"
    },
    {
        title: "RUNWAY ZERO",
        category: "Creative",
        imageGradient: "bg-gradient-to-bl from-pink-900 via-purple-900 to-black",
        description: "Manifiesto digital y plataforma de crowdfunding soberano con narrativa visual inmersiva.",
        stack: ["Framer Motion", "High-Impact UI", "Commerce"],
        link: "https://github.com/dondonaji/RUNNAWAY2026",
        size: "large"
    },
    {
        title: "Invoice Auditor",
        category: "Fintech",
        imageGradient: "bg-gradient-to-br from-blue-900 to-slate-800",
        description: "Auditoría fiscal de XMLs y detección de riesgos SAT con procesamiento local seguro.",
        stack: ["XML Parsing", "Compliance", "Local Logic"],
        link: "https://github.com/dondonaji/invoice-auditor-mx",
        size: "medium"
    },
    {
        title: "Asistencia IoT",
        category: "Hardware",
        imageGradient: "bg-gradient-to-tr from-orange-900 to-amber-700",
        description: "Control de acceso empresarial con integración biométrica en tiempo real.",
        stack: ["IoT", "Biometrics", "Real-time"],
        link: "https://github.com/dondonaji/asistencia-seguridad",
        size: "medium"
    },
    {
        title: "Fortnite Stats",
        category: "Analytics",
        imageGradient: "bg-gradient-to-r from-violet-900 to-fuchsia-900",
        description: "Dashboard de alto rendimiento para métricas de E-Sports con baja latencia.",
        stack: ["Data Viz", "Low Latency"],
        link: "https://github.com/dondonaji/fortnite-stats-app",
        size: "medium"
    },
    {
        title: "AI Radar",
        category: "Strategy",
        imageGradient: "bg-gradient-to-tl from-cyan-900 to-blue-900",
        description: "Visualización estratégica de tendencias de Inteligencia Artificial.",
        stack: ["React", "Strategy", "Trends"],
        link: "https://github.com/dondonaji/Airadarestrategico",
        size: "medium"
    }
]

export function ProjectsGrid() {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 mb-16">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                    Selected Works
                </h3>
                <span className="text-xs font-mono text-white/30">2024 — 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={project.size === "large" ? "md:col-span-2" : ""}
                    >
                        <GalleryCard
                            title={project.title}
                            category={project.category}
                            description={project.description}
                            stack={project.stack}
                            imageGradient={project.imageGradient}
                            href={project.link}
                            className={project.size === "large" ? "h-[400px]" : ""}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
