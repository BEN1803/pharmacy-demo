
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { PharmacyProvider } from "@/context/PharmacyContext";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PharmacyProvider>
          {children}
        </PharmacyProvider>
      </body>
    </html>
  );
}
