"use client"

import { MapPin, Github, Linkedin, Mail, Code2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function ProfileHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-6 mb-8"
        >
            <div className="relative">
                {/* Neo-Brutalist Avatar: 2-frame animation effect */}
                <motion.div
                    initial={{ scale: 0.66 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.15, ease: "linear" }}
                >
                    <Avatar className="w-28 h-28 border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <AvatarImage src="/profile-2026.png" alt="Donaji Ramírez" className="object-cover" />
                        <AvatarFallback className="bg-white text-black font-black text-3xl">DR</AvatarFallback>
                    </Avatar>
                </motion.div>
            </div>

            <div className="space-y-1">
                <h1 className="font-black tracking-tighter uppercase leading-none"
                    style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
                    <span style={{ letterSpacing: '0.38em' }}>Donaji</span> <br /><span className="text-stroke-2 text-transparent" style={{ WebkitTextStroke: "3px black", color: "transparent" }}>Ramírez</span>
                </h1>
                <div className="flex flex-wrap items-center justify-center font-mono font-bold text-xs md:text-sm pt-2 gap-2 md:gap-3">
                    {/* Modern Editorial Badges */}
                    <div className="flex items-center gap-1 border-2 border-black px-3 py-1 bg-white text-black">
                        <MapPin className="w-3 h-3" />
                        <span className="tracking-wide">CDMX</span>
                    </div>
                    <div className="flex items-center gap-1 border-2 border-black px-3 py-1 bg-[var(--accent)] text-black">
                        <Code2 className="w-3 h-3" />
                        <span className="tracking-wide">FULL STACK</span>
                    </div>
                    <div className="border-2 border-black px-3 py-1 bg-[var(--primary)] text-white">
                        <span className="tracking-wide">2026 VISION</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-2">
                <Badge variant="outline" className="rounded-none border-2 border-black bg-white text-black font-bold hover:bg-black hover:text-white transition-colors cursor-default">
                    TECH_MINIMALIST
                </Badge>
                <Badge variant="outline" className="rounded-none border-2 border-black bg-[var(--secondary)] text-white font-bold hover:bg-black hover:text-white transition-colors cursor-default">
                    2026_VISION
                </Badge>
            </div>
        </motion.div>
    )
}
