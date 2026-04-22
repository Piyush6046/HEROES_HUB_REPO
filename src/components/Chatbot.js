"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/context/AuthContext";
import { useGlobalData } from "@/context/DataContext";

const SUGGESTED = [
  "How do draws work?",
  "Upcoming prizes?",
  "How to donate?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey there! 👋 I'm the HeroesHub AI. Ask me about draws, charities, scores, or anything else on the platform!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { scores, profile } = useGlobalData();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMessage = { role: "user", content: msg };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const context = {
        userName: user?.email || "Anonymous",
        totalScoresCount: scores?.length || 0,
        recentScores: scores?.slice(0,3).map(s => s.score) || [],
        charitySet: !!profile?.charity_id
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, context }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* ── Floating Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Chat"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 9998,
            width: "62px",
            height: "62px",
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #10b981 0%, #6366f1 100%)",
            boxShadow: "0 0 0 4px rgba(16,185,129,0.15), 0 12px 32px rgba(16,185,129,0.45)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fabFloat 3s ease-in-out infinite",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.12)";
            e.currentTarget.style.boxShadow = "0 0 0 6px rgba(16,185,129,0.2), 0 16px 40px rgba(16,185,129,0.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.15), 0 12px 32px rgba(16,185,129,0.45)";
          }}
        >
          <MessageCircle size={26} color="white" />
          {/* Ping ring */}
          <span style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid rgba(16,185,129,0.5)",
            animation: "pingRing 2s ease-out infinite",
          }} />
        </button>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 9999,
            width: "370px",
            height: "560px",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 80px)",
            display: "flex",
            flexDirection: "column",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)",
            animation: "chatOpen 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
          }}
        >
          {/* ── Header ── */}
          <div style={{
            padding: "18px 20px",
            background: "linear-gradient(135deg, #059669 0%, #4f46e5 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Shimmer stripe */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
              animation: "headerShimmer 3s ease-in-out infinite",
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px",
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "white", fontFamily: "Outfit, sans-serif" }}>
                  HeroesHub AI
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", display: "inline-block", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Online · Powered by Groq</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
              color: "white", cursor: "pointer", borderRadius: "10px",
              width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s", position: "relative",
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Messages ── */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            background: "linear-gradient(180deg, #070d12 0%, #0d1620 100%)",
          }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-end",
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  animation: "msgIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                  background: m.role === "assistant"
                    ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                    : "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: m.role === "assistant"
                    ? "0 0 10px rgba(99,102,241,0.4)"
                    : "0 0 10px rgba(16,185,129,0.4)",
                }}>
                  {m.role === "assistant" ? <Bot size={14} color="white" /> : <User size={14} color="white" />}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: "82%",
                  padding: "12px 16px",
                  borderRadius: "18px",
                  borderBottomRightRadius: m.role === "user" ? "4px" : "18px",
                  borderBottomLeftRadius: m.role === "assistant" ? "4px" : "18px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  background: m.role === "user"
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "#132030",
                  color: "white",
                  border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "none",
                  boxShadow: m.role === "user"
                    ? "0 6px 20px rgba(16,185,129,0.3)"
                    : "0 2px 12px rgba(0,0,0,0.3)",
                }}>
                  <div className="prose prose-sm prose-invert" style={{ margin: 0 }}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", animation: "msgIn 0.25s ease both" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{
                  padding: "14px 18px", borderRadius: "18px", borderBottomLeftRadius: "4px",
                  background: "#132030", border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", gap: "5px", alignItems: "center",
                }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", animation: "typingDot 1.2s ease-in-out infinite" }} />
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", animation: "typingDot 1.2s ease-in-out 0.2s infinite" }} />
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", animation: "typingDot 1.2s ease-in-out 0.4s infinite" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Suggestions ── */}
          {messages.length <= 1 && (
            <div style={{
              padding: "10px 16px",
              background: "#0d1620",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    color: "#a5b4fc",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.2)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"; }}
                >
                  <Sparkles size={11} /> {s}
                </button>
              ))}
            </div>
          )}

          {/* ── Input Area ── */}
          <div style={{
            padding: "14px 16px",
            background: "#0d1620",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything…"
              style={{
                flex: 1,
                background: "#132030",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px",
                padding: "12px 20px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                fontFamily: "Inter, sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(99,102,241,0.6)";
                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "none",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "#132030",
                color: input.trim() && !loading ? "white" : "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                flexShrink: 0,
                boxShadow: input.trim() && !loading ? "0 4px 14px rgba(16,185,129,0.4)" : "none",
              }}
              onMouseEnter={(e) => { if (input.trim()) e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {loading ? <Zap size={18} style={{ animation: "pulse 0.8s infinite" }} /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fabFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pingRing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes chatOpen {
          from { opacity: 0; transform: scale(0.88) translateY(20px); transform-origin: bottom right; }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes headerShimmer {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(200%); }
        }
        .prose p { margin: 0 0 8px 0; }
        .prose p:last-child { margin: 0; }
        .prose ul, .prose ol { margin: 0 0 8px 0; padding-left: 20px; }
        .prose li { margin-bottom: 4px; }
        .prose strong { font-weight: 700; color: inherit; }
      `}</style>
    </>
  );
}
