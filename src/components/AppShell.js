"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isPublic = pathname === "/" || pathname.startsWith("/auth");

  return (
    <AuthProvider>
      <div className="app-shell" style={{ display: "flex", minHeight: "100vh" }}>
        {!isPublic && <Sidebar />}
        <main 
          style={{ 
            flex: 1, 
            marginLeft: isPublic ? 0 : "var(--sidebar-w)",
            minHeight: "100vh",
            background: "var(--bg-app)",
            transition: "all 0.3s ease"
          }}
        >
          <Navbar />
          <div style={{ padding: isPublic ? 0 : "40px 48px" }}>
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
