"use client"

import { MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function ProfileHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-4 mb-8"
        >
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
                <Avatar className="w-24 h-24 border-2 border-background relative grayscale hover:grayscale-0 transition-all duration-500">
                    <AvatarImage src="/dondonaji.png" alt="Donaji Ramírez" className="object-cover" />
                    <AvatarFallback className="bg-muted text-2xl font-bold">DR</AvatarFallback>
                </Avatar>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Donaji Ramírez</h1>
                <div className="flex items-center justify-center text-muted-foreground space-x-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>CDMX</span>
                    <span className="text-border">|</span>
                    <span className="text-xs font-mono uppercase tracking-widest text-primary/80">Diseño • Sonido • Código</span>
                </div>
            </div>

            <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
                Explorando la intersección entre la tecnología creativa y la conciencia humana.
            </p>

            <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="glass hover:bg-white/10 transition-colors cursor-default">
                    Tech-Minimalist
                </Badge>
                <Badge variant="secondary" className="glass hover:bg-white/10 transition-colors cursor-default">
                    2026 Vision
                </Badge>
            </div>
        </motion.div>
    )
}
