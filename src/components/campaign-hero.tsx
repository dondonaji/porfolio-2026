"use client"

import { Heart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export function CampaignHero() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md mx-auto mb-8"
        >
            <Card className="overflow-hidden border-none relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-background to-background z-0"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>

                <CardContent className="relative z-10 p-6 flex flex-col items-center text-center space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest">Campaña Actual</span>
                    </div>

                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Impulsando la fase creativa 2026
                    </h2>

                    <p className="text-sm text-gray-400 leading-relaxed">
                        El financiamiento independiente me permite crear sin compromisos.
                        Tu apoyo directo hace posible la próxima ola de proyectos en 3D, música y código.
                    </p>

                    <Button
                        className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/20 transition-all rounded-xl py-6"
                        size="lg"
                    >
                        <Heart className="w-4 h-4 mr-2 fill-current" />
                        Apoyar Proyecto
                    </Button>
                </CardContent>

                {/* Glow effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            </Card>
        </motion.div>
    )
}
