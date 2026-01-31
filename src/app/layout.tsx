import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Donaji Ramírez | Full Stack Creative Developer",
  description: "Portfolio de desarrollo creativo y tecnológico. SaaS, IA, IoT y diseño interactivo. CDMX • 2026",
  keywords: ["Full Stack Developer", "Creative Tech", "React", "Next.js", "AI", "IoT", "SaaS", "CDMX"],
  authors: [{ name: "Donaji Ramírez" }],
  creator: "Donaji Ramírez",
  metadataBase: new URL("https://porfolio-2026.vercel.app"),
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://porfolio-2026.vercel.app",
    title: "Donaji Ramírez | Full Stack Creative Developer",
    description: "Portfolio de desarrollo creativo y tecnológico. SaaS, IA, IoT y diseño interactivo.",
    siteName: "Donaji Ramírez Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donaji Ramírez | Full Stack Creative Developer",
    description: "Portfolio de desarrollo creativo y tecnológico",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
