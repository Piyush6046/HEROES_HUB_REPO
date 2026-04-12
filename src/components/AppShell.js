"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Menu, X } from "lucide-react";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isPublic = pathname === "/" || pathname.startsWith("/auth");

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="app-shell">
      {!isPublic && (
        <>
          <Sidebar isOpen={isSidebarOpen} />
          {isSidebarOpen && (
            <div 
              className="sidebar-overlay mobile-only" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <button 
            className="menu-trigger mobile-only"
            onClick={() => setIsSidebarOpen(prev => !prev)}
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </>
      )}
      
      <main 
        className={`page-main ${!isPublic ? 'content-shift' : ''}`}
        style={{ minHeight: "100vh" }}
      >
        <Navbar />
        <div 
          className="content-padding"
          style={{ 
            padding: isPublic ? 0 : "40px 48px",
            // We'll handle responsive padding via a new class or inline media query check
          }}
        >
          {/* Custom padding for mobile */}
          <style jsx>{`
            @media (max-width: 768px) {
              .content-padding {
                padding: ${isPublic ? '0' : '84px 20px 40px'} !important;
              }
            }
          `}</style>
          {children}
        </div>
      </main>
    </div>
  );
}
