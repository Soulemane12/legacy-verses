"use client";
import { useState, useRef } from "react";
import TshirtViewer from "./TshirtViewer";
import type { Garment } from "./TshirtPreview";

// ─── drag-Y hook ──────────────────────────────────────────────────────────────
function useDragY() {
  const [rotY, setRotY]         = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX   = useRef(0);
  const startRot = useRef(0);
  const active   = useRef(false);

  function down(x: number) {
    active.current  = true;
    setDragging(true);
    startX.current   = x;
    startRot.current = rotY;
  }
  function move(x: number) {
    if (!active.current) return;
    setRotY(startRot.current + (x - startX.current) * 0.55);
  }
  function up() {
    active.current = false;
    setDragging(false);
    setRotY(r => Math.round(r / 180) * 180);
  }
  function goTo(deg: number) {
    active.current = false;
    setDragging(false);
    setRotY(prev => {
      const cands = [deg, deg + 360, deg - 360];
      return cands.reduce((a, b) => (Math.abs(a - prev) <= Math.abs(b - prev) ? a : b));
    });
  }
  const isFront = Math.cos((rotY * Math.PI) / 180) > 0;
  return { rotY, dragging, down, move, up, goTo, isFront };
}

// ─── controls bar ────────────────────────────────────────────────────────────
function Controls({
  isFront, onFront, onBack,
}: { isFront: boolean; onFront(): void; onBack(): void }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        {[
          { label: "Front", active: isFront,  fn: onFront },
          { label: "Back",  active: !isFront, fn: onBack  },
        ].map(({ label, active, fn }) => (
          <button key={label} type="button" onClick={fn}
            className={`text-xs px-4 py-1.5 rounded-full border transition-all ${
              active
                ? "bg-gold text-white border-gold shadow-sm"
                : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"
            }`}>
            {label}
          </button>
        ))}
        <span className="text-[10px] text-white/30 ml-auto">↔ drag to spin</span>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {[isFront, !isFront].map((on, i) => (
          <span key={i} className="block w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: on ? "#C9944A" : "rgba(255,255,255,0.18)",
              transform: on ? "scale(1.3)" : "scale(1)",
            }} />
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CYLINDER3D — shared true CSS 3D cylinder (N panels) that any round product
// (mug, tumbler, bottle, candle) builds on. The portrait wraps realistically
// around the body; rim/topper/base/handle are all swappable per product.
// ─────────────────────────────────────────────────────────────────────────────
function Cylinder3D({
  portraitUrl, N = 24, R, H, RIM_H = 16,
  panelBase, rimColor, baseColor, glassy = false, specular = false,
  topper, handle,
}: {
  portraitUrl: string | null;
  N?: number; R: number; H: number; RIM_H?: number;
  panelBase: string; rimColor: string; baseColor: string; glassy?: boolean; specular?: boolean;
  topper?: React.ReactNode;
  handle?: React.ReactNode;
}) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const C  = 2 * Math.PI * R; // circumference
  const pW = C / N;           // width of each panel

  const panelDrag = {
    onMouseDown: (e: React.MouseEvent) => down(e.clientX),
    onMouseMove: (e: React.MouseEvent) => { if (dragging) move(e.clientX); },
    onMouseUp:   up,
    onMouseLeave: up,
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); down(e.touches[0].clientX); },
    onTouchMove:  (e: React.TouchEvent) => { e.preventDefault(); if (dragging) move(e.touches[0].clientX); },
    onTouchEnd:   up,
  };

  return (
    <div className="select-none flex flex-col">
      <Controls isFront={isFront} onFront={() => goTo(0)} onBack={() => goTo(180)} />

      <div style={{ perspective: "700px", perspectiveOrigin: "50% 28%" }}
           className={dragging ? "cursor-grabbing" : "cursor-grab"}
           {...panelDrag}>

        {/* rotation wrapper — everything inside shares the same Y rotation */}
        <div style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotY}deg)`,
          transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
          position: "relative",
          width: R * 2,
          height: H + RIM_H,
          margin: "0 auto",
        }}>

          {/* ── Rim ring (sits just above the body) ── */}
          <div style={{
            position: "absolute",
            top: 0, left: 0,
            width: R * 2, height: R * 2,
            borderRadius: "50%",
            background: rimColor,
            marginTop: -R,
            transform: "rotateX(90deg)",
            transformOrigin: "50% 100%",
          }} />

          {/* ── Topper (liquid surface / lid / cap / flame — product-specific) ── */}
          {topper}

          {/* ── Cylinder panels (portrait wraps around here) ── */}
          {Array.from({ length: N }).map((_, i) => {
            const angle = (i / N) * 360;
            const edgeDark = 0.18 * Math.pow(Math.abs(Math.sin((angle * Math.PI) / 180)), 1.4);
            // Glossy specular band that sits just left of the front face
            const spec = specular
              ? 0.22 * Math.pow(Math.max(0, Math.cos(((angle + 26) * Math.PI) / 180)), 7)
              : 0;

            return (
              <div key={i} style={{
                position: "absolute",
                top: RIM_H,
                left: `calc(50% - ${(pW + 0.5) / 2}px)`,
                width: pW + 0.5,
                height: H,
                transform: `rotateY(${angle}deg) translateZ(${R}px)`,
                transformOrigin: "50% 0",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                overflow: "hidden",
                background: panelBase,
                opacity: glassy ? 0.82 : 1,
              }}>
                {portraitUrl && (
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url(${portraitUrl})`,
                    backgroundSize: `${C}px ${H}px`,
                    backgroundPosition: `${-i * pW}px 0`,
                    backgroundRepeat: "no-repeat",
                    opacity: glassy ? 0.85 : 1,
                  }} />
                )}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `rgba(0,0,0,${edgeDark.toFixed(3)})`,
                  pointerEvents: "none",
                }} />
                {spec > 0.004 && (
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: `rgba(255,255,255,${spec.toFixed(3)})`,
                  }} />
                )}
                {glassy && (
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: "linear-gradient(90deg, rgba(255,255,255,0.22) 0%, transparent 30%)",
                  }} />
                )}
              </div>
            );
          })}

          {/* ── Rim band (thin ring visible above panels) ── */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: RIM_H,
            overflow: "hidden",
            pointerEvents: "none",
          }}>
            {Array.from({ length: N }).map((_, i) => {
              const angle = (i / N) * 360;
              const edgeDark = 0.2 * Math.pow(Math.abs(Math.sin((angle * Math.PI) / 180)), 1.2);
              return (
                <div key={i} style={{
                  position: "absolute",
                  top: 0,
                  left: `calc(50% - ${(pW + 0.5) / 2}px)`,
                  width: pW + 0.5,
                  height: RIM_H,
                  transform: `rotateY(${angle}deg) translateZ(${R}px)`,
                  transformOrigin: "50% 0",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  background: `rgba(0,0,0,${edgeDark.toFixed(3)})`,
                  mixBlendMode: "multiply",
                }} />
              );
            })}
            <div style={{
              position: "absolute", inset: 0,
              background: rimColor,
              borderTop: "1px solid rgba(255,255,255,0.4)",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              pointerEvents: "none",
            }} />
          </div>

          {/* ── Bottom base disc ── */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0,
            width: R * 2, height: R * 2,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${baseColor} 40%, rgba(0,0,0,0.18) 100%)`,
            marginBottom: -R,
            transform: "rotateX(-90deg)",
            transformOrigin: "50% 0%",
          }} />

          {handle}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MUG — ceramic, with handle, open coffee surface or travel lid
// ─────────────────────────────────────────────────────────────────────────────
function MugViewer({ portraitUrl, lidded = false }: { portraitUrl: string | null; lidded?: boolean }) {
  const R = 84, H = 230, RIM_H = 18;
  return (
    <Cylinder3D
      portraitUrl={portraitUrl}
      R={R} H={H} RIM_H={RIM_H}
      panelBase="#F5F2EE"
      rimColor={lidded ? "#22242B" : "#D8D3CC"}
      baseColor="#D8D3CC"
      specular
      topper={lidded ? (
        <>
          <div style={{ position: "absolute", top: R * 0.12, left: R * 0.12, width: R * 1.76, height: R * 1.76, borderRadius: "50%", background: "radial-gradient(ellipse at 35% 35%, #3A3D46 0%, #1C1E24 70%, #101115 100%)", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
          <div style={{ position: "absolute", top: R * 0.42, left: R * 0.62, width: R * 0.5, height: R * 0.3, borderRadius: "40%", background: "#0A0A0D", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", top: R * 0.18, left: R * 0.18, width: R * 1.64, height: R * 1.64, borderRadius: "50%", background: "radial-gradient(ellipse at 38% 38%, #5C3A1E 0%, #2A1508 60%, #1A0E05 100%)", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
          <div style={{ position: "absolute", top: R * 0.38, left: R * 0.42, width: R * 0.28, height: R * 0.18, borderRadius: "50%", background: "rgba(255,255,255,0.12)", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
        </>
      )}
      handle={
        <div style={{
          position: "absolute", top: H * 0.18 + RIM_H, left: "50%", width: 62, height: H * 0.56,
          transform: `rotateY(90deg) translateZ(${R}px)`, transformOrigin: "0% 50%",
          backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", overflow: "visible",
        }}>
          <svg viewBox="0 0 62 130" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <path d="M 2,0 Q 58,0 58,65 Q 58,130 2,130" fill="none" stroke="#E2DDD7" strokeWidth="20" strokeLinecap="round" />
            <path d="M 2,0 Q 58,0 58,65 Q 58,130 2,130" fill="none" stroke="#C0BBB3" strokeWidth="9" strokeLinecap="round" />
            <path d="M 10,4 Q 56,4 56,65 Q 56,126 10,126" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAINLESS TUMBLER — slim metal cylinder, brushed dome lid + straw slot
// ─────────────────────────────────────────────────────────────────────────────
function TumblerViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const R = 50, H = 290, RIM_H = 10;
  return (
    <Cylinder3D
      portraitUrl={portraitUrl}
      N={20} R={R} H={H} RIM_H={RIM_H}
      panelBase="#3A3D45"
      rimColor="#1E2024"
      baseColor="#2A2C32"
      specular
      topper={
        <>
          <div style={{ position: "absolute", top: R * 0.1, left: R * 0.1, width: R * 1.8, height: R * 1.8, borderRadius: "50%", background: "radial-gradient(ellipse at 35% 30%, #5A5E68 0%, #2A2C32 70%, #15161A 100%)", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
          <div style={{ position: "absolute", top: R * 0.62, left: R * 0.42, width: R * 0.4, height: R * 0.22, borderRadius: "40%", background: "#0A0A0C", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
        </>
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLASS TUMBLER — translucent glass cylinder, open rim, pale drink surface
// ─────────────────────────────────────────────────────────────────────────────
function GlassTumblerViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const R = 54, H = 220, RIM_H = 10;
  return (
    <Cylinder3D
      portraitUrl={portraitUrl}
      N={20} R={R} H={H} RIM_H={RIM_H}
      panelBase="rgba(210,225,232,0.55)"
      rimColor="rgba(225,235,240,0.7)"
      baseColor="rgba(190,205,212,0.8)"
      glassy
      topper={
        <div style={{ position: "absolute", top: R * 0.18, left: R * 0.18, width: R * 1.64, height: R * 1.64, borderRadius: "50%", background: "radial-gradient(ellipse at 38% 38%, #E8D9A8 0%, #C9A857 70%, #B89238 100%)", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WATER BOTTLE — slim sport bottle, screw cap + flip-top loop nozzle
// ─────────────────────────────────────────────────────────────────────────────
function WaterBottleViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const R = 42, H = 280, RIM_H = 12;
  return (
    <Cylinder3D
      portraitUrl={portraitUrl}
      N={18} R={R} H={H} RIM_H={RIM_H}
      panelBase="#E8E4DF"
      rimColor="#1E3558"
      baseColor="#C9C4BC"
      specular
      topper={
        <>
          <div style={{ position: "absolute", top: R * 0.18, left: R * 0.18, width: R * 1.64, height: R * 1.64, borderRadius: "50%", background: "#162844", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
          <div style={{ position: "absolute", top: R * 0.5, left: R * 0.5, width: R, height: R * 0.45, borderRadius: "30%", border: "3px solid #C9944A", background: "transparent", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
        </>
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDLE — glass jar with wax surface, wick + flame, portrait wraps as label
// ─────────────────────────────────────────────────────────────────────────────
function CandleViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const R = 46, H = 150, RIM_H = 8;
  return (
    <Cylinder3D
      portraitUrl={portraitUrl}
      N={18} R={R} H={H} RIM_H={RIM_H}
      panelBase="#F8F4EC"
      rimColor="#E8E0CC"
      baseColor="#D8D0BC"
      topper={
        <>
          <div style={{ position: "absolute", top: R * 0.12, left: R * 0.12, width: R * 1.76, height: R * 1.76, borderRadius: "50%", background: "radial-gradient(ellipse at 40% 40%, #FBF7EC 0%, #F0E8D2 70%, #E0D6B8 100%)", marginTop: -R, transform: "rotateX(90deg)", transformOrigin: "50% 100%" }} />
          {/* Wick */}
          <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%) translateZ(1px)", width: 2, height: 14, background: "#3A3026" }} />
          {/* Flame */}
          <div style={{
            position: "absolute", top: -34, left: "50%", transform: "translateX(-50%) translateZ(1px)",
            width: 11, height: 17, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            background: "radial-gradient(circle at 50% 70%, #FFD27A 0%, #F5982A 55%, #C9580A 100%)",
            filter: "drop-shadow(0 0 6px rgba(245,152,42,0.6))",
          }} />
        </>
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS / FRAMED — CSS 3D box, wood-grain frame, gallery mat, draggable
// ─────────────────────────────────────────────────────────────────────────────
type CanvasMaterial = "canvas" | "framed" | "acrylic" | "metal" | "poster";

function CanvasViewer({ portraitUrl, material }: { portraitUrl: string | null; material: CanvasMaterial }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const framed = material === "framed";
  const DEPTH  = material === "acrylic" || material === "metal" || material === "poster" ? 6 : 28;
  const MAT    = framed ? 18 : 0;    // white mat width (framed prints only)
  const FRAME  = framed ? 16 : 0;    // outer frame width

  // Edge styling per material (used for the 4 depth sides + front border)
  const edgeStyle: Record<CanvasMaterial, { front: string; right: string; left: string; top: string; bottom: string }> = {
    canvas:  { front: "#F0EDE8", right: "linear-gradient(to right, #3A2810, #4E3618)", left: "linear-gradient(to left, #2E1F0C, #3A2810)", top: "linear-gradient(to top, #3A2810, #4E3618)", bottom: "linear-gradient(to bottom, #2E1F0C, #3A2810)" },
    framed:  { front: "#2A1F14", right: "", left: "", top: "", bottom: "" }, // wood grain applied separately
    acrylic: { front: "#EAEAEE", right: "linear-gradient(to right, rgba(255,255,255,0.5), rgba(180,190,200,0.7))", left: "linear-gradient(to left, rgba(255,255,255,0.5), rgba(180,190,200,0.7))", top: "linear-gradient(to top, rgba(255,255,255,0.5), rgba(180,190,200,0.7))", bottom: "linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(180,190,200,0.7))" },
    metal:   { front: "#C8CCD2", right: "linear-gradient(to right, #9CA2AC, #C8CCD2)", left: "linear-gradient(to left, #9CA2AC, #C8CCD2)", top: "linear-gradient(to top, #9CA2AC, #C8CCD2)", bottom: "linear-gradient(to bottom, #9CA2AC, #C8CCD2)" },
    poster:  { front: "#F5F3EE", right: "#E2DFD6", left: "#E2DFD6", top: "#E2DFD6", bottom: "#E2DFD6" },
  };
  const edge = edgeStyle[material];

  const panelDrag = {
    onMouseDown:  (e: React.MouseEvent)  => down(e.clientX),
    onMouseMove:  (e: React.MouseEvent)  => { if (dragging) move(e.clientX); },
    onMouseUp:    up,
    onMouseLeave: up,
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); down(e.touches[0].clientX); },
    onTouchMove:  (e: React.TouchEvent) => { e.preventDefault(); if (dragging) move(e.touches[0].clientX); },
    onTouchEnd:   up,
  };

  // Wood grain: encoded as an SVG data URL for the frame sides
  const woodGrain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='200'%3E%3Crect width='40' height='200' fill='%235C3A18'/%3E%3Cpath d='M0 20 Q20 25 40 18' stroke='%23482C10' stroke-width='1' fill='none' opacity='.5'/%3E%3Cpath d='M0 55 Q15 60 40 52' stroke='%23704520' stroke-width='1.5' fill='none' opacity='.4'/%3E%3Cpath d='M0 90 Q25 96 40 88' stroke='%23402010' stroke-width='1' fill='none' opacity='.6'/%3E%3Cpath d='M0 130 Q18 135 40 127' stroke='%23583415' stroke-width='1.5' fill='none' opacity='.3'/%3E%3Cpath d='M0 165 Q22 170 40 161' stroke='%23482C10' stroke-width='1' fill='none' opacity='.5'/%3E%3C/svg%3E")`;

  return (
    <div className="select-none">
      <Controls isFront={isFront} onFront={() => goTo(0)} onBack={() => goTo(180)} />

      <div style={{ perspective: "950px", perspectiveOrigin: "50% 50%" }}
           className={dragging ? "cursor-grabbing" : "cursor-grab"}
           {...panelDrag}>

        {/* 3D box */}
        <div style={{
          position: "relative",
          margin: "0 auto",
          width: "100%",
          aspectRatio: "0.78",
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotY}deg)`,
          transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}>

          {/* ── Front face ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            background: edge.front,
            boxShadow: "0 6px 32px rgba(0,0,0,0.55)",
          }}>
            {/* Frame border */}
            {FRAME > 0 && (
              <div style={{
                position: "absolute", inset: 0,
                border: `${FRAME}px solid #2A1F14`,
                background: woodGrain,
                backgroundSize: "40px 200px",
              }} />
            )}
            {/* White mat */}
            {MAT > 0 && (
              <div style={{
                position: "absolute",
                inset: FRAME,
                border: `${MAT}px solid #F5F3F0`,
                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.12)",
              }} />
            )}
            {/* Portrait area */}
            <div style={{
              position: "absolute",
              inset: FRAME + MAT,
              overflow: "hidden",
              background: "#EAE7E2",
            }}>
              {portraitUrl ? (
                <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.25 }}>
                  <span style={{ color: "#1E3558", fontSize: 11, fontFamily: "serif", letterSpacing: 3 }}>PORTRAIT PREVIEW</span>
                </div>
              )}
            </div>
            {/* Gallery-wrap fold shadows (canvas only) */}
            {material === "canvas" && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                boxShadow: "inset 0 0 18px rgba(0,0,0,0.18)",
              }} />
            )}
            {/* Glossy sheen sweep (acrylic + metal) */}
            {(material === "acrylic" || material === "metal") && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(115deg, rgba(255,255,255,0.32) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.1) 100%)",
              }} />
            )}
          </div>

          {/* ── Right depth side ── */}
          <div style={{
            position: "absolute", top: 0, right: -DEPTH,
            width: DEPTH, height: "100%",
            background: framed ? woodGrain : edge.right,
            backgroundSize: framed ? "40px 200px" : undefined,
            transform: "rotateY(-90deg)", transformOrigin: "0% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Left depth side ── */}
          <div style={{
            position: "absolute", top: 0, left: -DEPTH,
            width: DEPTH, height: "100%",
            background: framed ? woodGrain : edge.left,
            backgroundSize: framed ? "40px 200px" : undefined,
            transform: "rotateY(90deg)", transformOrigin: "100% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Top depth side ── */}
          <div style={{
            position: "absolute", top: -DEPTH, left: 0,
            width: "100%", height: DEPTH,
            background: framed ? woodGrain : edge.top,
            backgroundSize: framed ? "200px 40px" : undefined,
            transform: "rotateX(90deg)", transformOrigin: "50% 100%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Bottom depth side ── */}
          <div style={{
            position: "absolute", bottom: -DEPTH, left: 0,
            width: "100%", height: DEPTH,
            background: framed ? woodGrain : edge.bottom,
            backgroundSize: framed ? "200px 40px" : undefined,
            transform: "rotateX(-90deg)", transformOrigin: "50% 0%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Back face ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: material === "canvas" ? "#C4B89A" : material === "poster" ? "#EDEAE2" : "#A8ACB2",
          }}>
            {material === "canvas" && (
              <>
                <div style={{ position: "absolute", inset: 10, border: "1.5px solid #9A8060", opacity: 0.6 }} />
                <div style={{ position: "absolute", top: "50%", left: 10, right: 10, height: "1.5px", background: "#9A8060", opacity: 0.5 }} />
                <div style={{ position: "absolute", left: "50%", top: 10, bottom: 10, width: "1.5px", background: "#9A8060", opacity: 0.5 }} />
              </>
            )}
            <p style={{
              position: "absolute", bottom: 18, left: 0, right: 0,
              textAlign: "center", fontSize: 9, letterSpacing: 3, fontFamily: "serif",
              color: material === "canvas" ? "#7A6040" : "#6A6E76", opacity: 0.8,
            }}>LEGACY VERSES™</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {[isFront, !isFront].map((on, i) => (
          <span key={i} className="block w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: on ? "#C9944A" : "rgba(255,255,255,0.18)", transform: on ? "scale(1.3)" : "scale(1)" }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHONE — iPhone 15 Pro style, portrait on the case back, drag-rotatable
// ─────────────────────────────────────────────────────────────────────────────
function PhoneViewer({ portraitUrl, platform = "ios" }: { portraitUrl: string | null; platform?: "ios" | "android" }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const uid = "iph";
  const isAndroid = platform === "android";

  // Screen side (front) — shows lock screen
  const FrontFace = () => (
    <svg viewBox="0 0 257 524" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-frame-f`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#B8B6B4" />
          <stop offset="40%"  stopColor="#9A9896" />
          <stop offset="70%"  stopColor="#AEACAA" />
          <stop offset="100%" stopColor="#888684" />
        </linearGradient>
        <clipPath id={`${uid}-screen`}>
          <rect x="10" y="10" width="237" height="504" rx="42" />
        </clipPath>
      </defs>

      {/* Titanium frame */}
      <rect x="0" y="0" width="257" height="524" rx="50" fill={`url(#${uid}-frame-f)`} />

      {/* Screen */}
      <rect x="10" y="10" width="237" height="504" rx="42" fill="#000" />

      {/* Lock screen wallpaper (subtle dark gradient) */}
      <rect x="10" y="10" width="237" height="504" rx="42" fill="none"
            clipPath={`url(#${uid}-screen)`} />
      <rect x="10" y="10" width="237" height="504" rx="42"
            fill="url(#ls-wall)" clipPath={`url(#${uid}-screen)`} />
      <defs>
        <linearGradient id="ls-wall" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#1A1A3E" />
          <stop offset="100%" stopColor="#0A0A1A" />
        </linearGradient>
      </defs>

      {/* Dynamic Island (iOS) or punch-hole front camera (Android) */}
      {isAndroid ? (
        <>
          <circle cx="128" cy="34" r="7" fill="#000" />
          <circle cx="128" cy="34" r="4" fill="#0D0D14" />
        </>
      ) : (
        <>
          <rect x="86" y="22" width="85" height="30" rx="15" fill="#000" />
          <circle cx="152" cy="37" r="5.5" fill="#0A0A0A" />
          <circle cx="152" cy="37" r="3" fill="#0D0D14" />
        </>
      )}

      {/* Time */}
      <text x="128" y="205" textAnchor="middle" fill="white" fillOpacity="0.95"
            fontSize="58" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="200" letterSpacing="-2">
        9:41
      </text>
      <text x="128" y="234" textAnchor="middle" fill="white" fillOpacity="0.55"
            fontSize="13" fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="0.5">
        Monday, June 16
      </text>

      {/* Notification cards */}
      <rect x="22" y="268" width="213" height="52" rx="14" fill="rgba(255,255,255,0.08)" />
      <rect x="22" y="328" width="213" height="52" rx="14" fill="rgba(255,255,255,0.06)" />

      {/* Flash indicator */}
      <circle cx="40" cy="290" r="12" fill="rgba(255,255,255,0.12)" />
      <text x="40" y="294.5" textAnchor="middle" fill="white" fillOpacity="0.5" fontSize="10">✉</text>
      <rect x="58" y="283" width="100" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
      <rect x="58" y="295" width="70"  height="5" rx="2" fill="rgba(255,255,255,0.1)" />

      {/* Home indicator */}
      <rect x="91" y="497" width="75" height="4" rx="2" fill="rgba(255,255,255,0.28)" />

      {/* Screen edge glow */}
      <rect x="10" y="10" width="237" height="504" rx="42" fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" clipPath={`url(#${uid}-screen)`} />

      {/* Frame edge highlight */}
      <rect x="0" y="0" width="257" height="524" rx="50" fill="none"
            stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* Side buttons (left: volume up, volume down, mute) */}
      <rect x="-3" y="108" width="5" height="34" rx="2.5" fill="#A0A09E" />
      <rect x="-3" y="152" width="5" height="34" rx="2.5" fill="#A0A09E" />
      <rect x="-3" y="78"  width="5" height="24" rx="2.5" fill="#A0A09E" />
      {/* Right: power/side button */}
      <rect x="255" y="138" width="5" height="58" rx="2.5" fill="#A0A09E" />

      {/* USB-C port */}
      <rect x="99" y="517" width="59" height="7" rx="3.5" fill="#888" />
      <rect x="99" y="517" width="59" height="7" rx="3.5" fill="rgba(0,0,0,0.4)" />
    </svg>
  );

  // Case back (portrait on the back)
  const BackFace = () => (
    <svg viewBox="0 0 257 524" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-frame-b`} x1="100%" y1="0%" x2="0%" y2="100%">
          {isAndroid ? (
            <>
              <stop offset="0%"   stopColor="#5A6B7A" />
              <stop offset="40%"  stopColor="#3E4A56" />
              <stop offset="70%"  stopColor="#4A5662" />
              <stop offset="100%" stopColor="#2E3640" />
            </>
          ) : (
            <>
              <stop offset="0%"   stopColor="#B8B6B4" />
              <stop offset="40%"  stopColor="#9A9896" />
              <stop offset="70%"  stopColor="#AEACAA" />
              <stop offset="100%" stopColor="#888684" />
            </>
          )}
        </linearGradient>
        {/* Case back: softer matte plastic */}
        <linearGradient id={`${uid}-case`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1C1C28" />
          <stop offset="100%" stopColor="#0E0E18" />
        </linearGradient>
        <clipPath id={`${uid}-back-clip`}>
          <rect x="10" y="10" width="237" height="504" rx="42" />
        </clipPath>
        <clipPath id={`${uid}-portrait-clip`}>
          {/* Portrait area: clear of camera module */}
          <rect x="10" y="10" width="237" height="504" rx="42" />
        </clipPath>
        {/* Lens clip for each camera circle */}
        <radialGradient id={`${uid}-lens`} cx="35%" cy="30%" r="60%">
          <stop offset="0%"  stopColor="#3A3A50" />
          <stop offset="60%" stopColor="#18181E" />
          <stop offset="100%" stopColor="#0A0A10" />
        </radialGradient>
      </defs>

      {/* Titanium frame */}
      <rect x="0" y="0" width="257" height="524" rx="50" fill={`url(#${uid}-frame-b)`} />

      {/* Case back surface */}
      <rect x="10" y="10" width="237" height="504" rx="42" fill={`url(#${uid}-case)`} />

      {/* Portrait on case back */}
      {portraitUrl ? (
        <image href={portraitUrl}
               x="10" y="10" width="237" height="504"
               clipPath={`url(#${uid}-back-clip)`}
               preserveAspectRatio="xMidYMid slice"
               opacity="0.88" />
      ) : (
        <rect x="10" y="10" width="237" height="504" rx="42"
              fill="#1E1E2A" clipPath={`url(#${uid}-back-clip)`} />
      )}

      {/* Dark overlay in camera zone so module is legible */}
      <rect x="18" y="18" width="106" height="106" rx="22"
            fill="rgba(0,0,0,0.55)" />

      {/* Camera module housing */}
      <rect x="18" y="18" width="106" height="106" rx="22"
            fill="#111118" />
      <rect x="18" y="18" width="106" height="106" rx="22"
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Main lens (large) */}
      <circle cx="54" cy="54" r="28" fill="#0A0A12" />
      <circle cx="54" cy="54" r="25" fill={`url(#${uid}-lens)`} />
      <circle cx="54" cy="54" r="22" fill="#12121A" />
      <circle cx="54" cy="54" r="10" fill="rgba(40,40,60,0.8)" />
      {/* Lens reflection flare */}
      <ellipse cx="47" cy="47" rx="5" ry="3" fill="rgba(255,255,255,0.12)" transform="rotate(-30 47 47)" />

      {/* Telephoto lens */}
      <circle cx="82" cy="88" r="20" fill="#0A0A12" />
      <circle cx="82" cy="88" r="17" fill={`url(#${uid}-lens)`} />
      <circle cx="82" cy="88" r="14" fill="#12121A" />
      <circle cx="82" cy="88" r="7"  fill="rgba(40,40,60,0.8)" />
      <ellipse cx="77" cy="83" rx="3.5" ry="2" fill="rgba(255,255,255,0.1)" transform="rotate(-30 77 83)" />

      {/* Ultra-wide lens + LiDAR (iOS triple-camera only) */}
      {!isAndroid && (
        <>
          <circle cx="100" cy="42" r="16" fill="#0A0A12" />
          <circle cx="100" cy="42" r="13" fill={`url(#${uid}-lens)`} />
          <circle cx="100" cy="42" r="10" fill="#12121A" />
          <circle cx="100" cy="42" r="5"  fill="rgba(40,40,60,0.8)" />
          <ellipse cx="96"  cy="38" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.1)" transform="rotate(-30 96 38)" />

          <circle cx="54" cy="92" r="9" fill="#0C0C14" />
          <circle cx="54" cy="92" r="6" fill="#161620" />
        </>
      )}

      {/* Flash */}
      <circle cx="92" cy="54" r="8" fill="#1A1A10" />
      <circle cx="92" cy="54" r="5" fill="#2A2818" />

      {/* Case back surface gloss */}
      <rect x="10" y="10" width="237" height="504" rx="42"
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            clipPath={`url(#${uid}-back-clip)`} />

      {/* Frame edge highlight */}
      <rect x="0" y="0" width="257" height="524" rx="50" fill="none"
            stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* Side buttons */}
      <rect x="-3" y="108" width="5" height="34" rx="2.5" fill="#A0A09E" />
      <rect x="-3" y="152" width="5" height="34" rx="2.5" fill="#A0A09E" />
      <rect x="-3" y="78"  width="5" height="24" rx="2.5" fill="#A0A09E" />
      <rect x="255" y="138" width="5" height="58" rx="2.5" fill="#A0A09E" />
      <rect x="99" y="517" width="59" height="7" rx="3.5" fill="#444" />
    </svg>
  );

  const panelDrag = {
    onMouseDown:  (e: React.MouseEvent)  => down(e.clientX),
    onMouseMove:  (e: React.MouseEvent)  => { if (dragging) move(e.clientX); },
    onMouseUp:    up,
    onMouseLeave: up,
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); down(e.touches[0].clientX); },
    onTouchMove:  (e: React.TouchEvent) => { e.preventDefault(); if (dragging) move(e.touches[0].clientX); },
    onTouchEnd:   up,
  };

  return (
    <div className="select-none">
      <Controls isFront={isFront} onFront={() => goTo(0)} onBack={() => goTo(180)} />
      <div className="max-w-[200px] mx-auto">
        <div style={{ perspective: "900px", perspectiveOrigin: "50% 50%", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.7))" }}
             className={dragging ? "cursor-grabbing" : "cursor-grab"}
             {...panelDrag}>
          <div style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotY}deg)`,
            transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
            position: "relative",
            aspectRatio: "257/524",
          }}>
            {/* Back face (portrait case — shown first / at rotY=0) */}
            <div style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            }}>
              <BackFace />
            </div>
            {/* Front face (screen side — at rotY=180) */}
            <div style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}>
              <FrontFace />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLANKET — draped perspective with fold detail and fabric texture
// ─────────────────────────────────────────────────────────────────────────────
function BlanketViewer({ portraitUrl, variant = "sherpa" }: { portraitUrl: string | null; variant?: "sherpa" | "throw" }) {
  const isThrow = variant === "throw";
  const baseColor = isThrow ? "#6B7280" : "#1E3558";
  const foldColor = isThrow ? "#565D68" : "#162844";
  return (
    <div className="select-none flex flex-col items-center gap-3">
      <div style={{ perspective: "900px" }}>
        <div style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(6deg) rotateY(-4deg)",
          filter: "drop-shadow(0 28px 50px rgba(0,0,0,0.65))",
          position: "relative",
        }}>
          {/* ── Folded-over top flap ── */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "14%",
            background: foldColor,
            borderRadius: "8px 8px 0 0",
            transformOrigin: "50% 100%",
            transform: "rotateX(-8deg)",
            zIndex: 2,
          }}>
            {/* Plush texture on fold */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 5px)",
              borderRadius: "8px 8px 0 0",
            }} />
            {/* Fold crease shadow */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.3))",
            }} />
          </div>

          {/* ── Main blanket face ── */}
          <div style={{
            width: "100%",
            aspectRatio: "4/3",
            background: baseColor,
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Portrait centered on blanket */}
            {portraitUrl ? (
              <img src={portraitUrl} alt="" style={{
                position: "absolute",
                top: "12%", left: "50%",
                transform: "translateX(-50%)",
                width: "58%",
                height: "82%",
                objectFit: "contain",
              }} />
            ) : (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 11, letterSpacing: 3, fontFamily: "serif" }}>PORTRAIT</span>
              </div>
            )}

            {/* Sherpa/plush weave or knit/waffle texture */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: isThrow ? [
                "repeating-linear-gradient(45deg,  transparent, transparent 5px, rgba(0,0,0,0.06) 5px, rgba(0,0,0,0.06) 6px)",
                "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(255,255,255,0.04) 5px, rgba(255,255,255,0.04) 6px)",
              ].join(", ") : [
                "repeating-linear-gradient(0deg,   transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
                "repeating-linear-gradient(90deg,  transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
              ].join(", "),
            }} />

            {/* Border: knit fringe row (throw) or gold stitching (sherpa) */}
            {isThrow ? (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 8,
                backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1.5px, transparent 1.5px, transparent 6px)",
                pointerEvents: "none",
              }} />
            ) : (
              <div style={{
                position: "absolute", inset: 10,
                border: "1.5px solid rgba(201,148,74,0.45)",
                borderRadius: "4px",
                pointerEvents: "none",
              }} />
            )}

            {/* Lighting: lighter top-left, darker bottom-right */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.12) 100%)",
            }} />
          </div>

          {/* ── Right depth edge ── */}
          <div style={{
            position: "absolute", top: 0, right: -10,
            width: 10, height: "100%",
            background: "linear-gradient(to right, #0E1A2A, #0A1220)",
            transform: "rotateY(-90deg)", transformOrigin: "0 50%",
            borderRadius: "0 4px 4px 0",
          }} />

          {/* ── Bottom depth edge ── */}
          <div style={{
            position: "absolute", bottom: -8, left: 0,
            width: "100%", height: 8,
            background: "#0A1220",
            transform: "rotateX(-90deg)", transformOrigin: "50% 0%",
          }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOK — closed-book 3D box: front cover, spine, stacked-page edges, back cover
// ─────────────────────────────────────────────────────────────────────────────
type BookVariant = "journal" | "prayerjournal" | "bible" | "calendar" | "recipebook" | "guestbook";

function BookViewer({ portraitUrl, variant }: { portraitUrl: string | null; variant: BookVariant }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const DEPTH = 24;

  const covers: Record<BookVariant, { bg: string; trim: string; emblem: string; pageColor: string }> = {
    journal:       { bg: "#1E3558", trim: "#C9944A", emblem: "✦", pageColor: "#F2EFE6" },
    prayerjournal: { bg: "#6B4A2A", trim: "#D8B98A", emblem: "🙏", pageColor: "#F2EFE6" },
    bible:         { bg: "#0E0E18", trim: "#C9944A", emblem: "✝", pageColor: "#E8D9A8" },
    calendar:      { bg: "#F5F3EE", trim: "#1E3558", emblem: "",  pageColor: "#FFFFFF" },
    recipebook:    { bg: "#8B5E3C", trim: "#F2EFE6", emblem: "🍳", pageColor: "#F2EFE6" },
    guestbook:     { bg: "#E8E4DF", trim: "#C9944A", emblem: "✍", pageColor: "#FFFFFF" },
  };
  const cover = covers[variant];
  const pageStripes = `repeating-linear-gradient(0deg, ${cover.pageColor} 0px, ${cover.pageColor} 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 2.4px)`;

  const panelDrag = {
    onMouseDown:  (e: React.MouseEvent)  => down(e.clientX),
    onMouseMove:  (e: React.MouseEvent)  => { if (dragging) move(e.clientX); },
    onMouseUp:    up,
    onMouseLeave: up,
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); down(e.touches[0].clientX); },
    onTouchMove:  (e: React.TouchEvent) => { e.preventDefault(); if (dragging) move(e.touches[0].clientX); },
    onTouchEnd:   up,
  };

  return (
    <div className="select-none">
      <Controls isFront={isFront} onFront={() => goTo(0)} onBack={() => goTo(180)} />

      <div style={{ perspective: "950px", perspectiveOrigin: "50% 50%" }}
           className={dragging ? "cursor-grabbing" : "cursor-grab"}
           {...panelDrag}>
        <div style={{
          position: "relative", margin: "0 auto", width: "78%", aspectRatio: "0.74",
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotY}deg)`,
          transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}>

          {/* ── Front cover ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            background: cover.bg,
            boxShadow: "0 10px 34px rgba(0,0,0,0.55)",
            border: variant === "calendar" || variant === "guestbook" ? `1px solid rgba(0,0,0,0.08)` : "none",
          }}>
            {/* Spiral binding (calendar only) */}
            {variant === "calendar" && (
              <div style={{ position: "absolute", top: -4, left: 0, right: 0, height: 10, display: "flex", justifyContent: "space-evenly" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", border: "2px solid #9A9690", background: "#fff" }} />
                ))}
              </div>
            )}
            {/* Trim border */}
            <div style={{ position: "absolute", inset: 10, border: `1.5px solid ${cover.trim}`, opacity: 0.55, pointerEvents: "none" }} />
            {/* Emblem */}
            {cover.emblem && (
              <div style={{ position: "absolute", top: 14, left: 0, right: 0, textAlign: "center", fontSize: 18, opacity: 0.85 }}>
                <span style={{ color: cover.trim }}>{cover.emblem}</span>
              </div>
            )}
            {/* Portrait inset */}
            <div style={{
              position: "absolute", inset: "26% 12% 14% 12%",
              border: `2px solid ${cover.trim}`, overflow: "hidden", background: "rgba(0,0,0,0.15)",
            }}>
              {portraitUrl ? (
                <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                  <span style={{ color: cover.trim, fontSize: 9, letterSpacing: 2, fontFamily: "serif" }}>PORTRAIT</span>
                </div>
              )}
            </div>
            {/* Cover surface sheen */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(125deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)" }} />
          </div>

          {/* ── Spine (left depth side) ── */}
          <div style={{
            position: "absolute", top: 0, left: -DEPTH, width: DEPTH, height: "100%",
            background: `linear-gradient(to left, ${cover.bg}, rgba(0,0,0,0.35))`,
            transform: "rotateY(90deg)", transformOrigin: "100% 50%",
            backfaceVisibility: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ writingMode: "vertical-rl", color: cover.trim, fontSize: 8, letterSpacing: 2, fontFamily: "serif", opacity: 0.7 }}>
              LEGACY VERSES
            </span>
          </div>

          {/* ── Page-edge stack (right side) ── */}
          <div style={{
            position: "absolute", top: 2, right: -DEPTH, width: DEPTH, height: "calc(100% - 4px)",
            backgroundImage: pageStripes,
            transform: "rotateY(-90deg)", transformOrigin: "0% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Page-edge stack (top) ── */}
          <div style={{
            position: "absolute", top: -DEPTH, left: 2, width: "calc(100% - 4px)", height: DEPTH,
            backgroundImage: `repeating-linear-gradient(90deg, ${cover.pageColor} 0px, ${cover.pageColor} 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 2.4px)`,
            transform: "rotateX(90deg)", transformOrigin: "50% 100%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Page-edge stack (bottom) ── */}
          <div style={{
            position: "absolute", bottom: -DEPTH, left: 2, width: "calc(100% - 4px)", height: DEPTH,
            backgroundImage: `repeating-linear-gradient(90deg, ${cover.pageColor} 0px, ${cover.pageColor} 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 2.4px)`,
            transform: "rotateX(-90deg)", transformOrigin: "50% 0%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Back cover ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: cover.bg,
          }}>
            <div style={{ position: "absolute", inset: 10, border: `1.5px solid ${cover.trim}`, opacity: 0.4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOTE BAG — canvas box with gusseted sides + 3D-space handles
// ─────────────────────────────────────────────────────────────────────────────
function ToteViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const DEPTH = 26;
  const canvasWeave = `repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px)`;

  const panelDrag = {
    onMouseDown:  (e: React.MouseEvent)  => down(e.clientX),
    onMouseMove:  (e: React.MouseEvent)  => { if (dragging) move(e.clientX); },
    onMouseUp:    up,
    onMouseLeave: up,
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); down(e.touches[0].clientX); },
    onTouchMove:  (e: React.TouchEvent) => { e.preventDefault(); if (dragging) move(e.touches[0].clientX); },
    onTouchEnd:   up,
  };

  return (
    <div className="select-none">
      <Controls isFront={isFront} onFront={() => goTo(0)} onBack={() => goTo(180)} />

      <div style={{ perspective: "950px", perspectiveOrigin: "50% 35%" }}
           className={dragging ? "cursor-grabbing" : "cursor-grab"}
           {...panelDrag}>
        <div style={{
          position: "relative", margin: "0 auto", width: "70%", aspectRatio: "0.86",
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotY}deg)`,
          transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}>

          {/* ── Front canvas panel ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            background: "#D0C4A8",
            backgroundImage: canvasWeave,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            <div style={{
              position: "absolute", inset: "14% 10%",
              border: "2px solid #8B7040", overflow: "hidden", background: "rgba(0,0,0,0.08)",
            }}>
              {portraitUrl ? (
                <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                  <span style={{ color: "#5C4A30", fontSize: 9, letterSpacing: 2, fontFamily: "serif" }}>PORTRAIT</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right gusset ── */}
          <div style={{
            position: "absolute", top: 0, right: -DEPTH, width: DEPTH, height: "100%",
            background: "#B8AC8E", backgroundImage: canvasWeave,
            transform: "rotateY(-90deg)", transformOrigin: "0% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Left gusset ── */}
          <div style={{
            position: "absolute", top: 0, left: -DEPTH, width: DEPTH, height: "100%",
            background: "#A89C7E", backgroundImage: canvasWeave,
            transform: "rotateY(90deg)", transformOrigin: "100% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Bottom gusset ── */}
          <div style={{
            position: "absolute", bottom: -DEPTH, left: 0, width: "100%", height: DEPTH,
            background: "#A89C7E", backgroundImage: canvasWeave,
            transform: "rotateX(-90deg)", transformOrigin: "50% 0%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Back canvas panel ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#C4B89A", backgroundImage: canvasWeave,
          }}>
            <p style={{ position: "absolute", bottom: "10%", left: 0, right: 0, textAlign: "center", fontSize: 9, letterSpacing: 3, fontFamily: "serif", color: "#5C4A30", opacity: 0.7 }}>
              LEGACY VERSES™
            </p>
          </div>

          {/* ── Handles (arc up from front+back top edge, in 3D space) ── */}
          {[ -0.62, 0.62 ].map((xFrac, idx) => (
            <div key={idx} style={{
              position: "absolute",
              top: -34, left: `calc(50% + ${xFrac * 50}%)`,
              width: 30, height: 44,
              transform: "translateX(-50%) translateZ(1px)",
              backfaceVisibility: "hidden",
            }}>
              <svg viewBox="0 0 30 44" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                <path d="M 4,44 Q 4,4 15,4 Q 26,4 26,44" fill="none" stroke="#6B5638" strokeWidth="6" strokeLinecap="round" />
                <path d="M 4,44 Q 4,4 15,4 Q 26,4 26,44" fill="none" stroke="#8B7040" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORNAMENT — shaded sphere bauble with cap + hanger loop
// ─────────────────────────────────────────────────────────────────────────────
function OrnamentViewer({ portraitUrl }: { portraitUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ perspective: "700px" }}>
        <div style={{
          position: "relative", width: 190, height: 190,
          filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.6))",
        }}>
          {/* Sphere base shading */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "radial-gradient(circle at 32% 28%, #4A6BA8 0%, #1E3558 55%, #0E1C32 100%)",
          }} />
          {/* Portrait clipped to circle, slightly inset so sphere shading frames it */}
          <div style={{
            position: "absolute", inset: 14, borderRadius: "50%", overflow: "hidden",
          }}>
            {portraitUrl ? (
              <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92 }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#1E3558" }} />
            )}
            {/* Sphere shading overlay on top of the portrait so it still reads as round */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.35) 0%, transparent 35%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.45) 100%)",
            }} />
          </div>
          {/* Glossy highlight */}
          <div style={{
            position: "absolute", top: "14%", left: "20%", width: "26%", height: "16%",
            borderRadius: "50%", background: "rgba(255,255,255,0.5)", filter: "blur(2px)",
          }} />
          {/* Gold cap */}
          <div style={{
            position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
            width: 26, height: 22, background: "linear-gradient(to bottom, #E0B468, #B8893A)",
            borderRadius: "4px 4px 8px 8px",
          }} />
          {/* Hanger loop */}
          <div style={{
            position: "absolute", top: -26, left: "50%", transform: "translateX(-50%)",
            width: 12, height: 12, borderRadius: "50%",
            border: "2.5px solid #C9944A", background: "transparent",
          }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAP — domed crown panels + curved brim, embroidered portrait patch
// ─────────────────────────────────────────────────────────────────────────────
function CapViewer({ portraitUrl }: { portraitUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ perspective: "700px" }}>
        <div style={{
          position: "relative", width: 220, height: 170,
          transform: "rotateX(8deg)",
          filter: "drop-shadow(0 20px 36px rgba(0,0,0,0.55))",
        }}>
          {/* Crown panels (curved dome made of 5 wedge panels) */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "72%", display: "flex" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                flex: 1, height: "100%",
                background: i % 2 === 0 ? "#1E3558" : "#192C49",
                borderRadius: i === 0 ? "60% 0 0 0" : i === 4 ? "0 60% 0 0" : "0",
                borderLeft: i > 0 ? "1px solid rgba(0,0,0,0.25)" : "none",
              }} />
            ))}
          </div>
          {/* Crown top curve mask */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "30%",
            background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 70%)",
            borderRadius: "50% 50% 0 0",
          }} />
          {/* Button on top */}
          <div style={{ position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: "#C9944A" }} />
          {/* Embroidered portrait patch on front panel */}
          <div style={{
            position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 76, height: 76, borderRadius: "50%", overflow: "hidden",
            border: "3px solid #C9944A", background: "#0E1C32",
          }}>
            {portraitUrl ? (
              <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                <span style={{ color: "white", fontSize: 8, letterSpacing: 1, fontFamily: "serif" }}>PORTRAIT</span>
              </div>
            )}
          </div>
          {/* Curved brim */}
          <svg viewBox="0 0 220 60" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "34%", overflow: "visible" }}>
            <path d="M 10,4 Q 110,46 210,4 Q 215,30 110,40 Q 5,30 10,4 Z" fill="#162844" />
            <path d="M 10,4 Q 110,46 210,4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          </svg>
          {/* Adjustable strap hint (back) */}
          <div style={{ position: "absolute", top: "8%", right: "2%", width: 14, height: 8, background: "#0E1C32", borderRadius: 2, opacity: 0.7 }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC — every catalog item that doesn't need a dedicated 3D component.
// `shapeKey` is the product's tab key (not the display label), so multi-word
// labels like "Wall Tapestry" still resolve to a single lookup key ("tapestry").
// ─────────────────────────────────────────────────────────────────────────────
function GenericViewer({
  portraitUrl, shapeKey,
}: { portraitUrl: string | null; shapeKey: string }) {
  const lc = shapeKey.toLowerCase();

  // Shape profiles per product (flat/2D goods only — 3D-shaped products have
  // their own dedicated viewers: drinkware, books, tote, ornament, cap)
  const profiles: Record<string, { aspect: string; radius: string; bg: string; padding: number }> = {
    pillow:        { aspect: "1/1",    radius: "50%",   bg: "#E8E4DF", padding: 18 },
    pillowcase:    { aspect: "4/3",    radius: "6px",   bg: "#E8E4DF", padding: 14 },
    digital:       { aspect: "16/10",  radius: "10px",  bg: "#0E0E18", padding: 14 },
    tapestry:      { aspect: "2/3",    radius: "2px",   bg: "#1E3558", padding: 16 },
    mousepad:      { aspect: "16/9",   radius: "6px",   bg: "#1A1A22", padding: 8  },
    laptopsleeve:  { aspect: "4/3",    radius: "4px",   bg: "#2A2A36", padding: 14 },
    keychain:      { aspect: "1/1.3",  radius: "12px",  bg: "#1E3558", padding: 16 },
    luggagetag:    { aspect: "1.6/1",  radius: "8px",   bg: "#D0C4A8", padding: 12 },
    program:       { aspect: "0.77/1", radius: "2px",   bg: "#FFFFFF", padding: 16 },
    bulletin:      { aspect: "0.77/1", radius: "2px",   bg: "#FAFAF7", padding: 16 },
    prayercard:    { aspect: "2/3.4",  radius: "6px",   bg: "#FFFFFF", padding: 10 },
    banner:        { aspect: "1/2.4",  radius: "4px",   bg: "#1E3558", padding: 14 },
    lapelpin:      { aspect: "1/1",    radius: "50%",   bg: "#C9944A", padding: 10 },
    bookmark:      { aspect: "1/3.6",  radius: "4px",   bg: "#1E3558", padding: 6  },
  };
  const p = profiles[lc] ?? { aspect: "3/4", radius: "8px", bg: "#1E3558", padding: 12 };

  const w = lc === "bookmark" ? "120px" : "220px";

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ perspective: "700px" }}>
        <div style={{
          transform: "rotateX(5deg) rotateY(-7deg)",
          filter: "drop-shadow(0 22px 40px rgba(0,0,0,0.6))",
        }}>
          <div style={{
            width: w, aspectRatio: p.aspect,
            background: p.bg,
            borderRadius: p.radius,
            overflow: "hidden",
            position: "relative",
            border: lc === "glasstumbler" ? "1.5px solid rgba(255,255,255,0.4)" : "none",
            boxShadow: lc === "pillow"
              ? "inset 0 0 30px rgba(0,0,0,0.12), inset 0 0 0 3px rgba(255,255,255,0.3)"
              : "none",
          }}>
            {/* Pillow — plush puffed body: corner lift + soft center swell */}
            {lc === "pillow" && (
              <>
                <div style={{
                  position: "absolute", inset: 12,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(0,0,0,0.08)",
                }} />
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.35) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(0,0,0,0.16) 100%)",
                }} />
                {/* Corner pucker dimples where the seam pulls in */}
                {[[10, 10], [10, 90], [90, 10], [90, 90]].map(([x, y], i) => (
                  <div key={i} style={{
                    position: "absolute", left: `${x}%`, top: `${y}%`, width: 10, height: 10,
                    transform: "translate(-50%,-50%)", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,0,0,0.14) 0%, transparent 70%)",
                  }} />
                ))}
              </>
            )}

            {/* Mousepad — stitched edge + matte rubber surface */}
            {lc === "mousepad" && (
              <>
                <div style={{
                  position: "absolute", inset: 3, borderRadius: 4,
                  border: "1px dashed rgba(255,255,255,0.22)",
                }} />
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "linear-gradient(115deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
                }} />
              </>
            )}

            {/* Tapestry / banner — soft hanging fabric folds */}
            {(lc === "tapestry" || lc === "banner") && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0px, transparent 14px, rgba(255,255,255,0.07) 28px, transparent 42px)",
                mixBlendMode: "soft-light",
              }} />
            )}

            {/* Fold line (program / bulletin bifold) */}
            {(lc === "program" || lc === "bulletin") && (
              <div style={{
                position: "absolute", top: 0, bottom: 0, left: "50%",
                width: "1.5px", background: "rgba(0,0,0,0.12)",
              }} />
            )}

            {portraitUrl ? (
              <img src={portraitUrl} alt="" style={{
                position: "absolute",
                inset: p.padding,
                width: `calc(100% - ${p.padding * 2}px)`,
                height: `calc(100% - ${p.padding * 2}px)`,
                objectFit: "cover",
                borderRadius: lc === "pillow" || lc === "lapelpin" ? "50%" : "2px",
              }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
                <span style={{ color: lc === "program" || lc === "bulletin" || lc === "prayercard" ? "#1E3558" : "white", fontSize: 10, letterSpacing: 2, fontFamily: "serif" }}>PORTRAIT</span>
              </div>
            )}

            {/* Laptop sleeve zipper */}
            {lc === "laptopsleeve" && (
              <div style={{
                position: "absolute", top: 6, left: "8%", right: "8%", height: 3,
                background: "linear-gradient(to bottom, #555, #222)", borderRadius: 2,
              }} />
            )}

            {/* Keychain ring */}
            {lc === "keychain" && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                width: 16, height: 16, borderRadius: "50%",
                border: "3px solid #C9C4BC", background: "transparent",
              }} />
            )}

            {/* Luggage tag strap + ID window */}
            {lc === "luggagetag" && (
              <>
                <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", width: 10, height: 18, border: "3px solid #6B5638", borderRadius: "6px 6px 0 0", borderBottom: "none" }} />
                <div style={{ position: "absolute", bottom: 6, left: "10%", right: "10%", height: "30%", background: "rgba(255,255,255,0.85)", borderRadius: 2 }} />
              </>
            )}

            {/* Church banner rod + point */}
            {lc === "banner" && (
              <>
                <div style={{ position: "absolute", top: -6, left: -6, right: -6, height: 8, background: "#8B7040", borderRadius: 4 }} />
                <div style={{ position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `14px solid ${p.bg}` }} />
              </>
            )}

            {/* Lapel pin clasp */}
            {lc === "lapelpin" && (
              <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: 4, height: 10, background: "#9A9690", borderRadius: 2 }} />
            )}

            {/* Bookmark tassel */}
            {lc === "bookmark" && (
              <div style={{
                position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)",
                width: 8, height: 18, background: "#C9944A", clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }} />
            )}

            {/* Surface lighting */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%, rgba(0,0,0,0.18) 100%)",
              borderRadius: p.radius,
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductViewer — main switch
// ─────────────────────────────────────────────────────────────────────────────
export interface ProductViewerProps {
  productKey:   string;
  productLabel: string;
  productIcon:  string;
  portraitUrl:  string | null;
  photo?:       string | null;
  verse?:       string;
  verseRef?:    string;
  lovedOne?:    string;
  birthDate?:   string;
  passDate?:    string;
  shirtColor?:  "navy" | "black" | "white" | "maroon";
}

// Apparel keys that reuse the garment viewer, each with its own silhouette.
const APPAREL_GARMENTS: Record<string, Garment> = {
  tshirt: "tshirt", hoodie: "hoodie", sweater: "sweater", polo: "polo", jacket: "jacket",
};

export default function ProductViewer({
  productKey, portraitUrl,
  photo, verse, verseRef, lovedOne, birthDate, passDate, shirtColor = "navy",
}: ProductViewerProps) {
  // Apparel — each garment gets its own silhouette (sleeves, hood, collar, zipper)
  if (productKey in APPAREL_GARMENTS) {
    return (
      <TshirtViewer
        photo={photo} verse={verse} verseRef={verseRef}
        lovedOne={lovedOne} birthDate={birthDate} passDate={passDate}
        color={shirtColor} garment={APPAREL_GARMENTS[productKey]}
      />
    );
  }

  // Drinkware — true 3D cylinders, each shaped/material'd like the real object
  if (productKey === "mug")          return <MugViewer portraitUrl={portraitUrl} />;
  if (productKey === "travelmug")    return <MugViewer portraitUrl={portraitUrl} lidded />;
  if (productKey === "tumbler")      return <TumblerViewer portraitUrl={portraitUrl} />;
  if (productKey === "glasstumbler") return <GlassTumblerViewer portraitUrl={portraitUrl} />;
  if (productKey === "waterbottle")  return <WaterBottleViewer portraitUrl={portraitUrl} />;

  // Art & Prints — same 3D box, different material dressing
  if (productKey === "canvas")     return <CanvasViewer portraitUrl={portraitUrl} material="canvas" />;
  if (productKey === "framed")     return <CanvasViewer portraitUrl={portraitUrl} material="framed" />;
  if (productKey === "acrylic")    return <CanvasViewer portraitUrl={portraitUrl} material="acrylic" />;
  if (productKey === "metalprint") return <CanvasViewer portraitUrl={portraitUrl} material="metal" />;
  if (productKey === "poster")     return <CanvasViewer portraitUrl={portraitUrl} material="poster" />;
  if (productKey === "digital")    return <GenericViewer portraitUrl={portraitUrl} shapeKey="digital" />;

  // Home & Lifestyle — true product shapes for the 3D ones
  if (productKey === "blanket")      return <BlanketViewer portraitUrl={portraitUrl} variant="sherpa" />;
  if (productKey === "throwblanket") return <BlanketViewer portraitUrl={portraitUrl} variant="throw" />;
  if (productKey === "candle")       return <CandleViewer portraitUrl={portraitUrl} />;

  // Accessories — phone cases share the iPhone-style 3D model, platform-skinned;
  // tote and ornament get their true bag/sphere shapes
  if (productKey === "phonecase")   return <PhoneViewer portraitUrl={portraitUrl} platform="ios" />;
  if (productKey === "androidcase") return <PhoneViewer portraitUrl={portraitUrl} platform="android" />;
  if (productKey === "tote")        return <ToteViewer portraitUrl={portraitUrl} />;
  if (productKey === "ornament")    return <OrnamentViewer portraitUrl={portraitUrl} />;

  // Apparel accessory — domed cap shape
  if (productKey === "cap") return <CapViewer portraitUrl={portraitUrl} />;

  // Family Legacy Collection — every book-shaped item gets the closed-book viewer
  if (["journal", "prayerjournal", "bible", "calendar", "recipebook", "guestbook"].includes(productKey)) {
    return <BookViewer portraitUrl={portraitUrl} variant={productKey as BookVariant} />;
  }

  // Everything else (flat paper/fabric goods) falls back to the shape-profile viewer
  return <GenericViewer portraitUrl={portraitUrl} shapeKey={productKey} />;
}
