"use client"
import React, { useState } from "react"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { Loader2 } from "lucide-react"

export function ShowreelSection() {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <CollapsibleSection
            title="Showreel 2025"
            subtitle="// CREATIVE_WORK.MP4"
            defaultOpen={false}
        >
            <div className="aspect-video w-full border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative bg-gray-100">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin stroke-[3px]" />
                            <span className="text-xs font-mono font-bold uppercase">Loading Video...</span>
                        </div>
                    </div>
                )}
                <iframe
                    src="https://player.vimeo.com/video/1140263864?badge=0&autopause=0&player_id=0&app_id=58479"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    title="Showreel 2025"
                    onLoad={() => setIsLoading(false)}
                />
            </div>
            <p className="text-sm font-mono mt-4 text-gray-700 border-l-[3px] border-black pl-3">
                Una muestra de proyectos creativos y desarrollo técnico.
            </p>
        </CollapsibleSection>
    )
}
