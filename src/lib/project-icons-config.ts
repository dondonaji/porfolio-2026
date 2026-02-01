/**
 * 🎨 CONFIGURACIÓN DE ICONOS SVG POR PROYECTO
 * 
 * Este archivo define qué iconos y colores se muestran para cada proyecto.
 * Los iconos provienen de Lucide React (https://lucide.dev)
 * 
 * 📐 ESTRUCTURA:
 * {
 *    icons: [Primario, Secundario1, Secundario2, ...],
 *    colors: ["#HEX1", "#HEX2", ...]
 * }
 * 
 * 💡 PRIMARIO vs SECUNDARIOS:
 * - Primario: Icono central más grande (índice 0)
 * - Secundarios: Iconos pequeños en esquinas (índice 1+)
 * 
 * 🔄 PARA AGREGAR NUEVO PROYECTO:
 * 1. Importa los iconos que necesites desde "lucide-react"
 * 2. Agrega nueva key en projectIconsConfig
 * 3. Define icons array y colors array
 * 4. Usa el key en projects-grid.tsx como iconKey
 */

// 📦 IMPORTACIONES DE ICONOS LUCIDE
import {
    Dog,          // 🐕 Para VetI
    Cat,          // 🐈 Para VetI
    Heart,        // ❤️ Para VetI
    Camera,       // 📷 Para InstaFlow
    Sparkles,     // ✨ Para InstaFlow
    Megaphone,    // 📣 Para Soberanía
    Crown,        // 👑 Para Soberanía
    Paintbrush,   // 🖌️ Para Soberanía
    FileText,     // 📄 Para Invoice
    Search,       // 🔍 Para Invoice
    Fingerprint,  // 👆 Para Asistencia IoT
    Lock,         // 🔒 Para Asistencia IoT
    Gamepad2,     // 🎮 Para Fortnite
    TrendingUp,   // 📈 Para Fortnite
    Radio,        // 📡 Para AI Radar
    Lightbulb     // 💡 Para AI Radar
} from "lucide-react"

// 🎨 CONFIGURACIÓN DE ICONOS
export const projectIconsConfig = {
    // VetI - Sistema Veterinario
    "veti": {
        icons: [Dog, Cat, Heart],  // Perro (centro), Gato (esquina), Corazón (esquina)
        colors: ["#3B82F6", "#FB923C", "#EF4444"]  // Azul, Naranja, Rojo
    },

    // InstaFlow - Generador IA de contenido Instagram
    "instaflow": {
        icons: [Camera, Sparkles],  // Cámara (centro), Destellos IA (esquina)
        colors: ["#A855F7", "#FCD34D"]  // Morado, Amarillo
    },

    // Soberanía Creativa - Crowdfunding Manifesto
    "soberania": {
        icons: [Megaphone, Crown, Paintbrush],  // Megáfono (centro), Corona + Pincel (esquinas)
        colors: ["#FB923C", "#FBBF24", "#A855F7"]  // Naranja, Dorado, Morado
    },

    // Invoice Audit - Detección de riesgos fiscales
    "invoice": {
        icons: [FileText, Search],  // Documento (centro), Lupa (esquina)
        colors: ["#475569", "#3B82F6"]  // Gris oscuro, Azul
    },

    // Asistencia IoT - Control de acceso biométrico
    "asistencia": {
        icons: [Fingerprint, Lock],  // Huella (centro), Candado (esquina)
        colors: ["#10B981", "#1F2937"]  // Verde, Gris oscuro
    },

    // Fortnite Stats - Dashboard de eSports
    "fortnite": {
        icons: [Gamepad2, TrendingUp],  // Control (centro), Gráfica (esquina)
        colors: ["#8B5CF6", "#10B981"]  // Morado, Verde
    },

    // AI Radar - Análisis de tendencias en IA
    "radar": {
        icons: [Radio, Lightbulb],  // Radar (centro), Bombilla (esquina)
        colors: ["#06B6D4", "#FCD34D"]  // Cyan, Amarillo
    }
} as const

export type ProjectIconKey = keyof typeof projectIconsConfig
