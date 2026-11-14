import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { PharmacyProvider } from "@/context/PharmacyContext";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MediFlow | Pharmacy Management",
  description:
    "A modern pharmacy management and wholesale marketplace platform.",
};

const themeScript = `
  try {
    var stored = localStorage.getItem("mediflow_theme");
    var theme = stored === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <PharmacyProvider>{children}</PharmacyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
