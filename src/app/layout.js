import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import AppShell from "@/components/AppShell";

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
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
