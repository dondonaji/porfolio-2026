"use client"

import { MapPin } from "lucide-react"
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
                {/* Neo-Brutalist Avatar: Boxy or heavy border, no blur/glow */}
                <Avatar className="w-28 h-28 border-[3px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AvatarImage src="/profile-2026.png" alt="Donaji Ramírez" className="object-cover" />
                    <AvatarFallback className="bg-white text-black font-black text-3xl">DR</AvatarFallback>
                </Avatar>
            </div>

            <div className="space-y-1">
                <h1 className="font-black tracking-tighter uppercase leading-none"
                    style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}>
                    Donaji <br /><span className="text-stroke-2 text-transparent" style={{ WebkitTextStroke: "2px black", color: "transparent" }}>Ramírez</span>
                </h1>
                <div className="flex flex-wrap items-center justify-center font-mono font-bold text-xs md:text-sm pt-2 gap-2 md:gap-3">
                    <div className="flex items-center gap-1 border border-black px-2 py-0.5 bg-[var(--accent)] text-black shadow-[2px_2px_0px_0px_black]">
                        <MapPin className="w-3 h-3" />
                        <span>CDMX</span>
                    </div>
                    <span className="text-black/30 text-xs hidden sm:inline">//</span>
                    <span className="uppercase tracking-wider text-[10px] md:text-xs">Full Stack Creative</span>
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
