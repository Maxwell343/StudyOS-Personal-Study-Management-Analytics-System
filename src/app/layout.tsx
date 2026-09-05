import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TimerProvider } from "@/context/TimerContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "StudyOS — Personal Study Operating System",
    template: "%s | StudyOS",
  },
  description:
    "AI-augmented personal study management, curriculum tracking, automated daily scheduling, and deep performance analytics system.",
  applicationName: "StudyOS",
  keywords: [
    "study tracker",
    "learning management",
    "spaced repetition",
    "JARVIS analytics",
    "automated study planner",
    "productivity",
  ],
  authors: [{ name: "StudyOS Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "StudyOS — Personal Study Operating System",
    description:
      "Plan, execute, record, analyze, and adapt your study workflow with StudyOS.",
    type: "website",
    siteName: "StudyOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyOS — Personal Study Operating System",
    description:
      "Plan, execute, record, analyze, and adapt your study workflow with StudyOS.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className="h-full antialiased bg-background text-foreground selection:bg-cyan-500/30"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <TimerProvider>{children}</TimerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
