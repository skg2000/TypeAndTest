import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = { success: "✅", error: "❌", info: "💬", warning: "⚠️", achievement: "🏆", race: "🏁", elo: "📈" };
const COLORS = { success: "#22c55e", error: "#f87171", info: "#38bdf8", warning: "#fb923c", achievement: "#facc15", race: "#a78bfa", elo: "#22c55e" };

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id}
          onClick={() => onRemove(t.id)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#1a1a2e", border: `1px solid ${COLORS[t.type] || COLORS.info}`,
            borderLeft: `4px solid ${COLORS[t.type] || COLORS.info}`,
            borderRadius: 12, padding: "12px 18px",
            color: "#e2e8f0", fontSize: 14, fontFamily: "Inter, system-ui, sans-serif",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            cursor: "pointer", pointerEvents: "all", maxWidth: 340,
            animation: "slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{ICONS[t.type] || ICONS.info}</span>
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}
