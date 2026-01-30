"use client"

import { 
    Gamepad2, 
    Headphones, 
    Box, 
    ArrowUpRight, 
    Stethoscope, 
    ShieldCheck, 
    Fingerprint, 
    Zap, 
    Globe, 
    Ghost, 
    Radar 
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const projects = [
    {
        title: "VetI - SaaS",
        category: "SaaS",
        icon: Stethoscope,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
        description: "Sistema de gestión clínica veterinaria con arquitectura multi-tenant.",
        stack: ["Next.js 16", "Supabase", "Stripe"],
        link: "https://github.com/dondonaji/veti-veterinaria",
        featured: true
    },
    {
        title: "Invoice Auditor MX",
        category: "Fintech",
        icon: ShieldCheck,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
        description: "Auditoría fiscal de XMLs y detección de riesgos SAT (CFDI 4.0).",
        stack: ["XML Parsing", "Compliance", "Local Logic"],
        link: "https://github.com/dondonaji/invoice-auditor-mx"
    },
    {
        title: "RUNWAY ZERO",
        category: "Creative",
        icon: Zap,
        color: "text-pink-500",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20",
        description: "Plataforma de crowdfunding soberano con narrativa visual inmersiva.",
        stack: ["Framer Motion", "High-Impact UI", "Commerce"],
        link: "https://github.com/dondonaji/RUNNAWAY2026",
        featured: true
    },
    {
        title: "Asistencia IoT",
        category: "Hardware",
        icon: Fingerprint,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        border: "border-orange-400/20",
        description: "Control de acceso empresarial con integración biométrica.",
        stack: ["IoT", "Biometrics", "Real-time"],
        link: "https://github.com/dondonaji/asistencia-seguridad"
    },
    {
        title: "Fortnite Stats",
        category: "Analytics",
        icon: Gamepad2,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20",
        description: "Dashboard de alto rendimiento para métricas de E-Sports.",
        stack: ["Data Viz", "Low Latency"],
        link: "https://github.com/dondonaji/fortnite-stats-app"
    },
    {
        title: "AI Strategy Radar",
        category: "Strategy",
        icon: Radar,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/20",
        description: "Visualización de tendencias estratégicas de Inteligencia Artificial.",
        stack: ["React", "Strategy", "Trends"],
        link: "https://github.com/dondonaji/Airadarestrategico"
    },
    {
        title: "Órbitas Planetarias",
        category: "Science",
        icon: Globe,
        color: "text-yellow-200",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
        description: "Simulación heliocéntrica precisa usando astronomy-engine.",
        stack: ["Astronomy", "Math", "Canvas"],
        link: "https://github.com/dondonaji/Orbitasplanetarias"
    },
    {
        title: "Life Game RPG",
        category: "Game",
        icon: Ghost,
        color: "text-indigo-400",
        bg: "bg-indigo-400/10",
        border: "border-indigo-400/20",
        description: "Test de personalidad gamificado en Pixel Art.",
        stack: ["Vanilla JS", "Pixel Art", "i18n"],
        link: "https://github.com/dondonaji/Life-Game"
    },
    {
        title: "Producción Musical",
        category: "Art",
        icon: Headphones,
        color: "text-slate-400",
        bg: "bg-white/5",
        border: "border-white/10",
        description: "Diseño sonoro, Ableton Live y Beatbox.",
        stack: ["Audio", "Creative"],
        link: "#"
    },
    {
        title: "Diseño 3D",
        category: "Design",
        icon: Box,
        color: "text-slate-400",
        bg: "bg-white/5",
        border: "border-white/10",
        description: "Modelado orgánico y Hard Surface (Blender/ZBrush).",
        stack: ["3D", "Visuals"],
        link: "#"
    }
]

export function ProjectsGrid() {
    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 mb-12">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50 pl-1">
                Portafolio & Proyectos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, index) => (
                    <motion.a
                        key={index}
                        href={project.link}
                        target={project.link.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`block group ${project.featured ? "md:col-span-2" : ""}`}
                    >
                        <Card className={`glass-card h-full hover:bg-white/5 transition-all duration-300 ${project.border} group-hover:border-white/30`}>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${project.bg} ${project.color} ring-1 ring-white/10`}>
                                        <project.icon className="w-6 h-6" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-lg text-foreground group-hover:text-white transition-colors">
                                            {project.title}
                                        </h4>
                                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${project.color} border-white/10 bg-black/20`}>
                                            {project.category}
                                        </Badge>
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {project.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {project.stack.map((tech, i) => (
                                            <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.a>
                ))}
            </div>
        </div>
    )
}
