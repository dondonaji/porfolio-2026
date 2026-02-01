/**
 * ProjectIcon - Componente de Iconos Compuestos con Animaciones
 * 
 * 🎨 PROPÓSITO:
 * - Muestra múltiples iconos SVG de Lucide organizados en composición
 * - Primer icono es "primario" (centro, más grande)
 * - Resto son "secundarios" (esquinas, más pequeños)
 * 
 * ✨ ANIMACIONES (Framer Motion):
 * - Primary: Entra con escala 0→1 y rotación -180°→0° (efecto "pop dramático")
 * - Secondary: Aparecen con delay escalonado (0.2s + 0.1s por cada uno)
 * - Timing: backOut easing para sensación elástica
 * 
 * 📐 SIZES:
 * - sm: Container 16x16, primary 6x6, secondary 4x4
 * - md: Container 24x24, primary 10x10, secondary 6x6 (default)
 * - lg: Container 32x32, primary 14x14, secondary 8x8
 * 
 * 💡 USO:
 * <ProjectIcon 
 *     icons={[Dog, Cat, Heart]} 
 *     colors={["#3B82F6", "#FB923C", "#EF4444"]}
 *     size="md"
 * />
 */

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface ProjectIconProps {
    icons: readonly LucideIcon[]  // Array de componentes de iconos Lucide
    colors?: readonly string[]     // Colores hex para cada icono (opcional)
    size?: "sm" | "md" | "lg"     // Tamaño del contenedor
}

const sizeMap = {
    sm: { container: "w-16 h-16", primary: "w-6 h-6", secondary: "w-4 h-4" },
    md: { container: "w-24 h-24", primary: "w-10 h-10", secondary: "w-6 h-6" },
    lg: { container: "w-32 h-32", primary: "w-14 h-14", secondary: "w-8 h-8" }
}

export function ProjectIcon({ icons, colors = [], size = "md" }: ProjectIconProps) {
    const sizes = sizeMap[size]

    // 🎯 ESTRATEGIA DE LAYOUT:
    // Primer icono = Hero (centro)
    // Resto = Satélites (esquinas: top-right, bottom-right, top-left, bottom-left)
    const [PrimaryIcon, ...secondaryIcons] = icons
    const primaryColor = colors[0] || "#000"

    return (
        <div className={`relative ${sizes.container} flex items-center justify-center`}>

            {/* 🌟 ICONO PRIMARIO - Animación de entrada dramática */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    duration: 0.5,
                    ease: "backOut"  // Efecto "spring-like" sin usar springs
                }}
            >
                <PrimaryIcon
                    className={sizes.primary}
                    style={{ color: primaryColor }}
                    strokeWidth={2}
                />
            </motion.div>

            {/* 💫 ICONOS SECUNDARIOS - Aparecen en esquinas con stagger */}
            {secondaryIcons.map((Icon, i) => {
                // Posiciones en las 4 esquinas
                const positions = [
                    "absolute -top-1 -right-1",   // Top derecha
                    "absolute -bottom-1 -right-1", // Bottom derecha
                    "absolute -top-1 -left-1",    // Top izquierda
                    "absolute -bottom-1 -left-1"   // Bottom izquierda
                ]

                return (
                    <motion.div
                        key={i}
                        className={positions[i]}
                        // Animación de fade + scale con delay escalonado
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: 0.2 + (i * 0.1),  // Cada icono espera 0.1s más que el anterior
                            duration: 0.3
                        }}
                    >
                        <Icon
                            className={sizes.secondary}
                            style={{ color: colors[i + 1] || "#666" }}
                            strokeWidth={2.5}  // Stroke más grueso para iconos pequeños
                        />
                    </motion.div>
                )
            })}
        </div>
    )
}
