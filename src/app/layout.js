import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import AppShell from "@/components/AppShell";
import Chatbot from "@/components/Chatbot";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "HeroesHub — Golf. Give. Conquer.",
  description: "The premium golf subscription platform where your rounds help global charities and earn you monthly prizes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <DataProvider>
            <AppShell>
              {children}
            </AppShell>
            <Chatbot />
            <Toaster position="top-right" toastOptions={{ style: { background: '#132030', color: '#fff', border: '1px solid #1a2d40', borderRadius: '12px' } }} />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
