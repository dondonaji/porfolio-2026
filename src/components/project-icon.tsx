import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface ProjectIconProps {
    icons: readonly LucideIcon[]
    colors?: readonly string[]
    size?: "sm" | "md" | "lg"
}

const sizeMap = {
    sm: { container: "w-16 h-16", primary: "w-6 h-6", secondary: "w-4 h-4" },
    md: { container: "w-24 h-24", primary: "w-10 h-10", secondary: "w-6 h-6" },
    lg: { container: "w-32 h-32", primary: "w-14 h-14", secondary: "w-8 h-8" }
}

export function ProjectIcon({ icons, colors = [], size = "md" }: ProjectIconProps) {
    const sizes = sizeMap[size]

    // Layout strategy: first icon is primary, rest are arranged around it
    const [PrimaryIcon, ...secondaryIcons] = icons
    const primaryColor = colors[0] || "#000"

    return (
        <div className={`relative ${sizes.container} flex items-center justify-center`}>
            {/* Primary Icon */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: "backOut" }}
            >
                <PrimaryIcon
                    className={sizes.primary}
                    style={{ color: primaryColor }}
                    strokeWidth={2}
                />
            </motion.div>

            {/* Secondary Icons - positioned in corners */}
            {secondaryIcons.map((Icon, i) => {
                const positions = [
                    "absolute -top-1 -right-1",  // Top right
                    "absolute -bottom-1 -right-1", // Bottom right
                    "absolute -top-1 -left-1",   // Top left
                    "absolute -bottom-1 -left-1"  // Bottom left
                ]

                return (
                    <motion.div
                        key={i}
                        className={positions[i]}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 + (i * 0.1), duration: 0.3 }}
                    >
                        <Icon
                            className={sizes.secondary}
                            style={{ color: colors[i + 1] || "#666" }}
                            strokeWidth={2.5}
                        />
                    </motion.div>
                )
            })}
        </div>
    )
}
