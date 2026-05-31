import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/nav/Sidebar";
import { MobileTabBar } from "@/components/nav/MobileTabBar";
import { Topbar } from "@/components/nav/Topbar";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { CommandPalette } from "@/components/nav/CommandPalette";
import { AuthProvider } from "@/lib/auth";
import { AuthGate } from "@/components/auth/AuthGate";
import { ProgressSync } from "@/components/sync/ProgressSync";

export const metadata: Metadata = {
  title: "MoonshotsMastery — Turn every Moonshots episode into mastery",
  description:
    "Turn the Moonshots with Peter Diamandis feed into durable knowledge: AI mastery checks, a chronological timeline, and tracked threads over time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <div className="cosmic-bg" aria-hidden />
          <AuthGate>
            <div className="relative z-10 flex min-h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 pb-24 md:pb-6">{children}</main>
              </div>
            </div>
            <MobileTabBar />
            <Onboarding />
            <CommandPalette />
          </AuthGate>
          <ProgressSync />
        </AuthProvider>
      </body>
    </html>
  );
}
