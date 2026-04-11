"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isPublic = pathname === "/" || pathname.startsWith("/auth");

  return (
    <AuthProvider>
      <DataProvider>
        <div className="app-shell" style={{ display: "flex", minHeight: "100vh" }}>
          {!isPublic && <Sidebar />}
          <main 
            className={`page-main ${!isPublic ? 'content-shift' : ''}`}
            style={{ minHeight: "100vh" }}
          >
            <Navbar />
            <div style={{ padding: isPublic ? 0 : "40px 48px" }}>
              {children}
            </div>
          </main>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}
