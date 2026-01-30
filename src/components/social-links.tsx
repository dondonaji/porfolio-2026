"use client"

import { Github, Instagram, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const socials = [
    {
        name: "Instagram",
        icon: Instagram,
        link: "https://instagram.com",
        color: "hover:text-pink-500 hover:border-pink-500/50"
    },
    {
        name: "GitHub",
        icon: Github,
        link: "https://github.com",
        color: "hover:text-white hover:border-white/50"
    },
    {
        name: "Portafolio",
        icon: Globe,
        link: "#",
        color: "hover:text-blue-400 hover:border-blue-400/50"
    }
]

export function SocialLinks() {
    return (
        <div className="w-full max-w-md mx-auto space-y-4 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pl-1">Conecta</h3>
            <div className="flex gap-4 justify-center">
                {socials.map((social, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            className={`w-14 h-14 rounded-2xl bg-black/20 border-white/10 hover:bg-white/5 transition-all duration-300 ${social.color}`}
                            asChild
                        >
                            <a href={social.link} target="_blank" rel="noopener noreferrer">
                                <social.icon className="w-6 h-6" />
                                <span className="sr-only">{social.name}</span>
                            </a>
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
