import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SessionWrapper from '@/app/components/sessionWrapper'
import NavBar from "./components/Headers/NavBar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PosePro - AI Fitness Tracking",
  description: "Track and improve your fitness with AI-powered pose detection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <Toaster richColors position="top-center" />
        <SessionWrapper>
          <NavBar />
          <main className="pt-5">
            {children}
          </main>
        </SessionWrapper>
      </body>
    </html>
  );
}
