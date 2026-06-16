"use client";
import { useState, useRef } from "react";
import TshirtViewer from "./TshirtViewer";

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
// MUG — true CSS 3D cylinder (24 panels) so the portrait wraps realistically
// ─────────────────────────────────────────────────────────────────────────────
function MugViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();

  const N      = 24;          // number of vertical cylinder panels
  const R      = 84;          // cylinder radius px
  const H      = 230;         // cylinder body height px
  const C      = 2 * Math.PI * R; // circumference ≈ 528px
  const pW     = C / N;       // width of each panel ≈ 22px
  const RIM_H  = 18;          // ceramic rim height above body

  // handle opacity: visible on right side, fades as left side faces viewer
  const handleOp = Math.max(0, Math.min(1, 0.45 + Math.sin((rotY * Math.PI) / 180) * 0.85));

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

      {/* perspective stage */}
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

          {/* ── Top opening disc (coffee visible inside) ── */}
          {/* Ceramic rim ring: slightly above body top */}
          <div style={{
            position: "absolute",
            top: 0, left: 0,
            width: R * 2, height: R * 2,
            borderRadius: "50%",
            background: "#D8D3CC",
            marginTop: -R,
            transform: "rotateX(90deg)",
            transformOrigin: "50% 100%",
          }} />
          {/* Coffee surface (darker oval inside rim) */}
          <div style={{
            position: "absolute",
            top: R * 0.18, left: R * 0.18,
            width: R * 1.64, height: R * 1.64,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 38% 38%, #5C3A1E 0%, #2A1508 60%, #1A0E05 100%)",
            marginTop: -R,
            transform: "rotateX(90deg)",
            transformOrigin: "50% 100%",
          }} />
          {/* Tiny coffee highlight (light reflection) */}
          <div style={{
            position: "absolute",
            top: R * 0.38, left: R * 0.42,
            width: R * 0.28, height: R * 0.18,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            marginTop: -R,
            transform: "rotateX(90deg)",
            transformOrigin: "50% 100%",
          }} />

          {/* ── Cylinder panels (portrait wraps around here) ── */}
          {Array.from({ length: N }).map((_, i) => {
            const angle = (i / N) * 360;
            // shadow darkens toward edges of the cylinder (cos curve)
            const edgeDark = 0.18 * Math.pow(Math.abs(Math.sin((angle * Math.PI) / 180)), 1.4);

            return (
              <div key={i} style={{
                position: "absolute",
                top: RIM_H, // below rim
                left: `calc(50% - ${(pW + 0.5) / 2}px)`,
                width: pW + 0.5, // tiny overlap to kill seams
                height: H,
                transform: `rotateY(${angle}deg) translateZ(${R}px)`,
                transformOrigin: "50% 0",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                overflow: "hidden",
                background: "#F5F2EE", // ceramic white base
              }}>
                {/* portrait slice */}
                {portraitUrl && (
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url(${portraitUrl})`,
                    backgroundSize: `${C}px ${H}px`,
                    backgroundPosition: `${-i * pW}px 0`,
                    backgroundRepeat: "no-repeat",
                  }} />
                )}
                {/* cylindrical edge shading */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `rgba(0,0,0,${edgeDark.toFixed(3)})`,
                  pointerEvents: "none",
                }} />
              </div>
            );
          })}

          {/* ── Ceramic rim band (top ring visible above panels) ── */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: RIM_H,
            overflow: "hidden",
            pointerEvents: "none",
          }}>
            {/* Reuse a simplified band of panels for the rim */}
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
              background: "#E8E4DE",
              borderTop: "1px solid rgba(255,255,255,0.4)",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              pointerEvents: "none",
              // flat overlay – only visible panels show through
            }} />
          </div>

          {/* ── Bottom base disc ── */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0,
            width: R * 2, height: R * 2,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, #D8D3CC 40%, #C4BFB8 100%)",
            marginBottom: -R,
            transform: "rotateX(-90deg)",
            transformOrigin: "50% 0%",
          }} />

          {/* ── Handle (in 3D space on the right side) ──
               Placed at the right of the cylinder, pre-rotated 90° so it
               sticks out to the right. rotate‑Y(90deg) then translateZ(R)
               puts it at the mug's right surface. */}
          <div style={{
            position: "absolute",
            top: H * 0.18 + RIM_H,
            left: "50%",
            width: 62,
            height: H * 0.56,
            transform: `rotateY(90deg) translateZ(${R}px)`,
            transformOrigin: "0% 50%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            overflow: "visible",
          }}>
            <svg viewBox="0 0 62 130" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              {/* Handle outer arc */}
              <path d="M 2,0 Q 58,0 58,65 Q 58,130 2,130"
                    fill="none" stroke="#E2DDD7" strokeWidth="20" strokeLinecap="round" />
              {/* Handle inner groove (shadow) */}
              <path d="M 2,0 Q 58,0 58,65 Q 58,130 2,130"
                    fill="none" stroke="#C0BBB3" strokeWidth="9" strokeLinecap="round" />
              {/* Handle outer edge highlight */}
              <path d="M 10,4 Q 56,4 56,65 Q 56,126 10,126"
                    fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS / FRAMED — CSS 3D box, wood-grain frame, gallery mat, draggable
// ─────────────────────────────────────────────────────────────────────────────
function CanvasViewer({ portraitUrl, framed }: { portraitUrl: string | null; framed: boolean }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const DEPTH  = 28;
  const MAT    = framed ? 18 : 0;    // white mat width (framed prints only)
  const FRAME  = framed ? 16 : 0;    // outer frame width

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
            background: framed ? "#2A1F14" : "#F0EDE8",
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
            {/* Gallery-wrap fold shadows (subtle inner shadow to simulate canvas wrap) */}
            {!framed && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                boxShadow: "inset 0 0 18px rgba(0,0,0,0.18)",
              }} />
            )}
          </div>

          {/* ── Right depth side ── */}
          <div style={{
            position: "absolute", top: 0, right: -DEPTH,
            width: DEPTH, height: "100%",
            background: framed ? woodGrain : "linear-gradient(to right, #3A2810, #4E3618)",
            backgroundSize: framed ? "40px 200px" : undefined,
            transform: "rotateY(-90deg)", transformOrigin: "0% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Left depth side ── */}
          <div style={{
            position: "absolute", top: 0, left: -DEPTH,
            width: DEPTH, height: "100%",
            background: framed ? woodGrain : "linear-gradient(to left, #2E1F0C, #3A2810)",
            backgroundSize: framed ? "40px 200px" : undefined,
            transform: "rotateY(90deg)", transformOrigin: "100% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Top depth side ── */}
          <div style={{
            position: "absolute", top: -DEPTH, left: 0,
            width: "100%", height: DEPTH,
            background: framed ? woodGrain : "linear-gradient(to top, #3A2810, #4E3618)",
            backgroundSize: framed ? "200px 40px" : undefined,
            transform: "rotateX(90deg)", transformOrigin: "50% 100%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Bottom depth side ── */}
          <div style={{
            position: "absolute", bottom: -DEPTH, left: 0,
            width: "100%", height: DEPTH,
            background: framed ? woodGrain : "linear-gradient(to bottom, #2E1F0C, #3A2810)",
            backgroundSize: framed ? "200px 40px" : undefined,
            transform: "rotateX(-90deg)", transformOrigin: "50% 0%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Back face ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#C4B89A",
          }}>
            {/* Canvas stretcher bars */}
            <div style={{ position: "absolute", inset: 10, border: "1.5px solid #9A8060", opacity: 0.6 }} />
            <div style={{ position: "absolute", top: "50%", left: 10, right: 10, height: "1.5px", background: "#9A8060", opacity: 0.5 }} />
            <div style={{ position: "absolute", left: "50%", top: 10, bottom: 10, width: "1.5px", background: "#9A8060", opacity: 0.5 }} />
            <p style={{
              position: "absolute", bottom: 18, left: 0, right: 0,
              textAlign: "center", fontSize: 9, letterSpacing: 3, fontFamily: "serif",
              color: "#7A6040", opacity: 0.8,
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
function PhoneViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const uid = "iph";

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

      {/* Dynamic Island */}
      <rect x="86" y="22" width="85" height="30" rx="15" fill="#000" />

      {/* Front camera dot inside island */}
      <circle cx="152" cy="37" r="5.5" fill="#0A0A0A" />
      <circle cx="152" cy="37" r="3" fill="#0D0D14" />

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
          <stop offset="0%"   stopColor="#B8B6B4" />
          <stop offset="40%"  stopColor="#9A9896" />
          <stop offset="70%"  stopColor="#AEACAA" />
          <stop offset="100%" stopColor="#888684" />
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

      {/* Ultra-wide lens */}
      <circle cx="100" cy="42" r="16" fill="#0A0A12" />
      <circle cx="100" cy="42" r="13" fill={`url(#${uid}-lens)`} />
      <circle cx="100" cy="42" r="10" fill="#12121A" />
      <circle cx="100" cy="42" r="5"  fill="rgba(40,40,60,0.8)" />
      <ellipse cx="96"  cy="38" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.1)" transform="rotate(-30 96 38)" />

      {/* LiDAR sensor */}
      <circle cx="54" cy="92" r="9" fill="#0C0C14" />
      <circle cx="54" cy="92" r="6" fill="#161620" />

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
function BlanketViewer({ portraitUrl }: { portraitUrl: string | null }) {
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
            background: "#162844",
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
            background: "#1E3558",
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

            {/* Sherpa/plush weave texture */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: [
                "repeating-linear-gradient(0deg,   transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
                "repeating-linear-gradient(90deg,  transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
              ].join(", "),
            }} />

            {/* Gold stitched border */}
            <div style={{
              position: "absolute", inset: 10,
              border: "1.5px solid rgba(201,148,74,0.45)",
              borderRadius: "4px",
              pointerEvents: "none",
            }} />

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
// GENERIC — pillow, tote, journal, ornament, tumbler
// ─────────────────────────────────────────────────────────────────────────────
function GenericViewer({
  portraitUrl, label, icon,
}: { portraitUrl: string | null; label: string; icon: string }) {
  const lc = label.toLowerCase();

  // Shape profiles per product
  const profiles: Record<string, { aspect: string; radius: string; bg: string; padding: number }> = {
    pillow:  { aspect: "1/1",   radius: "50%",  bg: "#E8E4DF", padding: 18 },
    tote:    { aspect: "3/4",   radius: "6px",  bg: "#D0C4A8", padding: 14 },
    journal: { aspect: "3/4",   radius: "4px",  bg: "#1E3558", padding: 10 },
    ornament:{ aspect: "1/1",   radius: "50%",  bg: "#1E3558", padding: 20 },
    tumbler: { aspect: "1/2.8", radius: "30%",  bg: "#2A2A3A", padding: 8  },
    hoodie:  { aspect: "4/5",   radius: "8px",  bg: "#1E3558", padding: 16 },
  };
  const p = profiles[lc] ?? { aspect: "3/4", radius: "8px", bg: "#1E3558", padding: 12 };

  const w = lc === "tumbler" ? "120px" : "220px";

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
            boxShadow: lc === "pillow"
              ? "inset 0 0 30px rgba(0,0,0,0.12), inset 0 0 0 3px rgba(255,255,255,0.3)"
              : "none",
          }}>
            {/* Pillow seam */}
            {lc === "pillow" && (
              <div style={{
                position: "absolute", inset: 12,
                borderRadius: "50%",
                border: "1.5px solid rgba(0,0,0,0.08)",
              }} />
            )}

            {portraitUrl ? (
              <img src={portraitUrl} alt="" style={{
                position: "absolute",
                inset: p.padding,
                width: `calc(100% - ${p.padding * 2}px)`,
                height: `calc(100% - ${p.padding * 2}px)`,
                objectFit: "cover",
                borderRadius: lc === "pillow" ? "50%" : "2px",
              }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
                <span style={{ color: "white", fontSize: 10, letterSpacing: 2, fontFamily: "serif" }}>PORTRAIT</span>
              </div>
            )}

            {/* Tote bag handles */}
            {lc === "tote" && (
              <>
                <div style={{ position: "absolute", top: -18, left: "25%", width: 8, height: 28, borderRadius: "4px 4px 0 0", border: "4px solid #8B7040", borderBottom: "none" }} />
                <div style={{ position: "absolute", top: -18, right: "25%", width: 8, height: 28, borderRadius: "4px 4px 0 0", border: "4px solid #8B7040", borderBottom: "none" }} />
              </>
            )}

            {/* Ornament cap */}
            {lc === "ornament" && (
              <div style={{
                position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                width: 16, height: 20,
                background: "#C9944A",
                borderRadius: "2px 2px 0 0",
              }} />
            )}

            {/* Tumbler cap */}
            {lc === "tumbler" && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "10%",
                background: "#1A1A28",
                borderRadius: "30% 30% 0 0",
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

export default function ProductViewer({
  productKey, productLabel, productIcon, portraitUrl,
  photo, verse, verseRef, lovedOne, birthDate, passDate, shirtColor = "navy",
}: ProductViewerProps) {
  if (productKey === "tshirt" || productKey === "hoodie") {
    return (
      <>
        <TshirtViewer
          photo={photo} verse={verse} verseRef={verseRef}
          lovedOne={lovedOne} birthDate={birthDate} passDate={passDate}
          color={shirtColor}
        />
        {productKey === "hoodie" && (
          <p className="text-center text-white/25 text-[10px] mt-1">
            Hoodie — same portrait placement as T-Shirt
          </p>
        )}
      </>
    );
  }
  if (productKey === "mug" || productKey === "tumbler") {
    if (productKey === "tumbler") {
      return <GenericViewer portraitUrl={portraitUrl} label="Tumbler" icon="🥤" />;
    }
    return <MugViewer portraitUrl={portraitUrl} />;
  }
  if (productKey === "canvas" || productKey === "framed") {
    return <CanvasViewer portraitUrl={portraitUrl} framed={productKey === "framed"} />;
  }
  if (productKey === "phonecase") {
    return <PhoneViewer portraitUrl={portraitUrl} />;
  }
  if (productKey === "blanket") {
    return <BlanketViewer portraitUrl={portraitUrl} />;
  }
  return <GenericViewer portraitUrl={portraitUrl} label={productLabel} icon={productIcon} />;
}
