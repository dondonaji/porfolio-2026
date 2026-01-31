"use client"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
    const scrollToContent = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth"
        })
    }

    return (
        <section className="relative h-screen min-h-[600px] md:min-h-[800px] flex items-center justify-center overflow-hidden">
            {/* Subtle Halftone Background */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                }}
            />

            {/* Main Typography */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center px-4"
            >
                <h1
                    className="font-black uppercase leading-[0.9] tracking-tighter"
                    style={{ fontSize: 'clamp(3rem, 12vw, 8rem)' }}
                >
                    Creative<br />
                    Technologist
                </h1>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.button
                onClick={scrollToContent}
                className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 cursor-pointer group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                aria-label="Scroll to content"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="w-10 h-10 stroke-[2px] group-hover:stroke-[3px] transition-all" />
                </motion.div>
            </motion.button>
        </section>
    )
}
