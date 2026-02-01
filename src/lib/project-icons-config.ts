// Project icon compositions using Lucide icons
import {
    Dog,
    Cat,
    Heart,
    Camera,
    Sparkles,
    Megaphone,
    Crown,
    Paintbrush,
    FileText,
    Search,
    Fingerprint,
    Lock,
    Gamepad2,
    TrendingUp,
    Radio,
    Lightbulb
} from "lucide-react"

export const projectIconsConfig = {
    "veti": {
        icons: [Dog, Cat, Heart],
        colors: ["#3B82F6", "#FB923C", "#EF4444"]
    },
    "instaflow": {
        icons: [Camera, Sparkles],
        colors: ["#A855F7", "#FCD34D"]
    },
    "soberania": {
        icons: [Megaphone, Crown, Paintbrush],
        colors: ["#FB923C", "#FBBF24", "#A855F7"]
    },
    "invoice": {
        icons: [FileText, Search],
        colors: ["#475569", "#3B82F6"]
    },
    "asistencia": {
        icons: [Fingerprint, Lock],
        colors: ["#10B981", "#1F2937"]
    },
    "fortnite": {
        icons: [Gamepad2, TrendingUp],
        colors: ["#8B5CF6", "#10B981"]
    },
    "radar": {
        icons: [Radio, Lightbulb],
        colors: ["#06B6D4", "#FCD34D"]
    }
} as const

export type ProjectIconKey = keyof typeof projectIconsConfig
