"use client"
import React from "react"
import { CollapsibleSection } from "@/components/ui/collapsible-section"

export function ShowreelSection() {
    return (
        <CollapsibleSection
            title="Showreel 2025"
            subtitle="// CREATIVE_WORK.MP4"
            defaultOpen={false}
        >
            <div className="aspect-video w-full border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <iframe
                    src="https://player.vimeo.com/video/1140263864?badge=0&autopause=0&player_id=0&app_id=58479"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    title="Showreel 2025"
                />
            </div>
            <p className="text-sm font-mono mt-4 text-gray-700 border-l-[3px] border-black pl-3">
                Una muestra de proyectos creativos y desarrollo técnico.
            </p>
        </CollapsibleSection>
    )
}
