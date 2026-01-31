"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface CollapsibleSectionProps {
    title: string
    subtitle?: string
    defaultOpen?: boolean
    children: React.ReactNode
}

export function CollapsibleSection({ title, subtitle, defaultOpen = false, children }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="w-full border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 transition-colors"
            >
                <div className="text-left">
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs font-mono text-gray-600 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-6 h-6 md:w-8 md:h-8 stroke-[3px]" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden border-t-[3px] border-black"
                    >
                        <div className="p-4 md:p-6">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
