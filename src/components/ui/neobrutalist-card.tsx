"use client"
import React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { ProjectIconKey } from "@/lib/project-icons-config"

interface NeoBrutalistCardProps extends HTMLMotionProps<"a"> {
    title: string
    category: string
    description: string
    stack: string[]
    accentColor: "primary" | "secondary" | "accent" | "creative"
    href: string
    iconKey?: ProjectIconKey
}

import { ProjectIcon } from "@/components/project-icon"
import { projectIconsConfig } from "@/lib/project-icons-config"

export function NeoBrutalistCard({
    title,
    category,
    description,
    stack,
    accentColor,
    href,
    className = "",
    iconKey,
    ...props
}: NeoBrutalistCardProps) {

    // Convert generic accent names to actual tailwind classes for the "Chip" background
    const accentBg = {
        primary: "bg-[var(--primary)]",
        secondary: "bg-[var(--secondary)]",
        accent: "bg-[var(--accent)]",
        creative: "bg-[#EC4899]", // creative pink
    }[accentColor]

    return (
        <motion.a
            href={href}
            target={href.startsWith("http") ? "_blank" : "_self"}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.15, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.98 }}
            className={`
                halftone-overlay
                block relative group overflow-hidden 
                bg-white border-[3px] border-black 
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] 
                md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                hover:translate-x-[2px] hover:translate-y-[2px]
                md:hover:translate-x-[4px] md:hover:translate-y-[4px]
                hover:border-[var(--primary)]
                transition-all duration-100 ease-linear
                p-4 md:p-6 flex flex-col justify-between
                ${className}
            `}
            {...props}
        >
            {/* Top Bar: Category + Icon */}
            <div className="flex justify-between items-start mb-6">
                <span className={`
                    text-xs font-bold uppercase tracking-widest 
                    border-[2px] border-black px-2 py-1 
                    ${accentBg} text-white
                `}>
                    {category}
                </span>
                <ArrowUpRight className="w-8 h-8 text-black stroke-[3px]" />
            </div>

            {/* Project Icon - Composed SVGs */}
            {iconKey && projectIconsConfig[iconKey] && (
                <div className="flex justify-center mb-6">
                    <ProjectIcon
                        icons={projectIconsConfig[iconKey].icons}
                        colors={projectIconsConfig[iconKey].colors}
                        size="md"
                    />
                </div>
            )}

            {/* Content */}
            <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black text-black leading-none uppercase tracking-tighter">
                    {title}
                </h3>

                <p className="text-sm font-mono text-gray-800 leading-tight border-l-[3px] border-black pl-3 py-1">
                    {description}
                </p>

                {/* Stack Chips */}
                <div className="flex flex-wrap gap-2 pt-2 border-t-[3px] border-black/10 mt-4">
                    {stack.map((tech, i) => (
                        <span key={i} className="text-[10px] font-bold font-mono bg-gray-100 text-black px-1.5 py-0.5 border border-black">
                            {tech.toUpperCase()}
                        </span>
                    ))}
                </div>
            </div>

            {/* Decoration: Halftone dots or pattern overlay could go here */}
        </motion.a>
    )
}
