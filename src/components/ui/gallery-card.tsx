import React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GalleryCardProps extends HTMLMotionProps<"a"> {
    title: string
    category: string
    description: string
    stack: string[]
    imageGradient: string
    href: string
}

export function GalleryCard({
    title,
    category,
    description,
    stack,
    imageGradient,
    href,
    className = "",
    ...props
}: GalleryCardProps) {
    return (
        <motion.a
            href={href}
            target={href.startsWith("http") ? "_blank" : "_self"}
            className={`block relative group overflow-hidden rounded-2xl border border-white/10 bg-black/40 ${className}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            {...props}
        >
            {/* Background Gradient (Placeholder for Screenshot) */}
            <div className={`absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 ${imageGradient}`} />

            {/* Overlay Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

            <div className="relative p-6 h-[320px] flex flex-col justify-end">
                {/* Top Status */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-white/10 border-none text-white/90 backdrop-blur-sm">
                            {category}
                        </Badge>
                        <div className="flex gap-1">
                            {stack.slice(0, 2).map((tech, i) => (
                                <span key={i} className="text-[10px] text-white/60 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                        {title}
                    </h3>

                    <p className="text-sm text-gray-300 line-clamp-2 max-w-[90%] group-hover:text-white/90 transition-colors">
                        {description}
                    </p>
                </div>
            </div>
        </motion.a>
    )
}
