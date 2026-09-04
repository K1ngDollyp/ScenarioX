import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ScenarioX: Bespoke Scenario Simulation & Decision Support Platform",
  description: "Test business decisions before you spend real money. Verified Python mathematics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#faf8f5] text-[#1c1917] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

