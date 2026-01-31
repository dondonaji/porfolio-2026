import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Donaji Ramírez | Full Stack Creative Developer",
    description: "Portfolio de desarrollo creativo y tecnológico. SaaS, IA, IoT y diseño interactivo. CDMX • 2026",
    keywords: ["Full Stack Developer", "Creative Tech", "React", "Next.js", "AI", "IoT", "SaaS", "CDMX"],
    authors: [{ name: "Donaji Ramírez" }],
    creator: "Donaji Ramírez",
    publisher: "Donaji Ramírez",
    metadataBase: new URL("https://porfolio-2026.vercel.app"),

    openGraph: {
        type: "website",
        locale: "es_MX",
        url: "https://porfolio-2026.vercel.app",
        title: "Donaji Ramírez | Full Stack Creative Developer",
        description: "Portfolio de desarrollo creativo y tecnológico. SaaS, IA, IoT y diseño interactivo.",
        siteName: "Donaji Ramírez Portfolio",
        images: [
            {
                url: "/og-image.png", // Generaremos esto después
                width: 1200,
                height: 630,
                alt: "Donaji Ramírez Portfolio - Swiss Pop Design",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Donaji Ramírez | Full Stack Creative Developer",
        description: "Portfolio de desarrollo creativo y tecnológico",
        images: ["/og-image.png"],
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },

    manifest: "/site.webmanifest",
};
