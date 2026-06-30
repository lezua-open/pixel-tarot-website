import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { TCard, LightboxData } from "./types";

const LightboxCtx = createContext<(card: TCard, reversed: boolean) => void>(() => {});

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [lightbox, setLightbox] = useState<LightboxData>(null);
  const openLightbox = useCallback((card: TCard, reversed: boolean) => setLightbox({ card, reversed }), []);

  return (
    <LightboxCtx.Provider value={openLightbox}>
      {children}

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: "fixed", inset: 0, zIndex: 300,
          background: "rgba(5,5,15,0.94)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16, cursor: "pointer",
          animation: "fadeUp 0.25s ease forwards",
        }}>
          <img
            src={lightbox.card.img}
            alt={lightbox.card.name}
            style={{
              width: "calc(100vw - 32px)", height: "calc(100vh - 32px)",
              objectFit: "contain",
              border: `3px solid ${lightbox.card.col}`,
              boxShadow: `0 0 30px ${lightbox.card.col}66, 4px 4px 0 #000`,
              transform: lightbox.reversed ? "rotate(180deg)" : undefined,
            }}
          />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "24px 16px 16px",
            background: "linear-gradient(transparent, rgba(5,5,15,0.9))",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "14px", color: lightbox.card.col, fontFamily: "'VT323', monospace" }}>
              {lightbox.card.name} {lightbox.reversed && <span style={{ color: "#dc2626" }}>· 逆位</span>}
            </div>
            <div style={{ fontSize: "8px", color: "#555", marginTop: 6 }}>点击关闭</div>
          </div>
        </div>
      )}
    </LightboxCtx.Provider>
  );
}

export function useLightbox() {
  return useContext(LightboxCtx);
}
