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

  // Scroll Reveal Observer — handles both initial elements AND ones added after async data loads
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target); // stop watching once revealed
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -20px 0px" });

    // Observe any .reveal elements already in the DOM
    function observeAll() {
      document.querySelectorAll(".reveal:not(.revealed)").forEach(el => io.observe(el));
    }
    observeAll();

    // Watch for new .reveal elements added dynamically (after data loads)
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
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
