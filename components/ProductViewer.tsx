"use client";
import { useState, useRef } from "react";
import TshirtViewer from "./TshirtViewer";

// ─── shared drag-Y state ──────────────────────────────────────────────────────
function useDragY() {
  const [rotY, setRotY]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX   = useRef(0);
  const startRot = useRef(0);
  const active   = useRef(false); // avoid stale closure in move handler

  function down(x: number) {
    active.current = true;
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
      const candidates = [deg, deg + 360, deg - 360];
      return candidates.reduce((a, b) =>
        Math.abs(a - prev) <= Math.abs(b - prev) ? a : b
      );
    });
  }
  const isFront = Math.cos((rotY * Math.PI) / 180) > 0;
  return { rotY, dragging, down, move, up, goTo, isFront };
}

// ─── DragStage: perspective wrapper + mouse/touch handlers ───────────────────
interface StageProps {
  children: React.ReactNode;
  rotY: number;
  dragging: boolean;
  down: (x: number) => void;
  move: (x: number) => void;
  up: () => void;
}
function DragStage({ children, rotY, dragging, down, move, up }: StageProps) {
  return (
    <div
      style={{ perspective: "950px", perspectiveOrigin: "50% 50%" }}
      className={dragging ? "cursor-grabbing select-none" : "cursor-grab select-none"}
      onMouseDown={e  => down(e.clientX)}
      onMouseMove={e  => dragging && move(e.clientX)}
      onMouseUp={up}
      onMouseLeave={up}
      onTouchStart={e => { e.preventDefault(); down(e.touches[0].clientX); }}
      onTouchMove={e  => { e.preventDefault(); dragging && move(e.touches[0].clientX); }}
      onTouchEnd={up}
    >
      <div
        style={{
          transform: `rotateY(${rotY}deg)`,
          transformStyle: "preserve-3d",
          transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Viewer controls: Front / Back buttons + indicator dots ──────────────────
function Controls({
  isFront, onFront, onBack,
}: { isFront: boolean; onFront: () => void; onBack: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        {[
          { label: "Front", active: isFront,  fn: onFront },
          { label: "Back",  active: !isFront, fn: onBack  },
        ].map(({ label, active, fn }) => (
          <button
            key={label}
            type="button"
            onClick={fn}
            className={`text-xs px-4 py-1.5 rounded-full border transition-all duration-200 ${
              active
                ? "bg-gold text-white border-gold shadow-sm"
                : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="text-[10px] text-white/30 ml-auto tracking-wide">↔ drag to spin</span>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {[isFront, !isFront].map((on, i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{ background: on ? "#C9944A" : "rgba(255,255,255,0.18)", transform: on ? "scale(1.3)" : "scale(1)" }}
          />
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MugViewer — 3D rotating ceramic mug with portrait wrapped on the face
// ─────────────────────────────────────────────────────────────────────────────
function MugViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const uid = "mug";

  const MugFace = ({ withPortrait }: { withPortrait: boolean }) => (
    <svg viewBox="0 0 340 420" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-left`} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.42" />
          <stop offset="28%"  stopColor="#000" stopOpacity="0"    />
        </linearGradient>
        <linearGradient id={`${uid}-right`} x1="100%" x2="0%" y1="0%" y2="0%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.28" />
          <stop offset="28%"  stopColor="#000" stopOpacity="0"    />
        </linearGradient>
        <linearGradient id={`${uid}-bot`} x1="0%" x2="0%" y1="100%" y2="0%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0.32" />
          <stop offset="40%"  stopColor="#000" stopOpacity="0"    />
        </linearGradient>
        <radialGradient id={`${uid}-hl`} cx="38%" cy="22%" r="50%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0"    />
        </radialGradient>
        <clipPath id={`${uid}-face`}>
          <path d="M 62,72 L 62,296 Q 62,309 76,310 L 234,310 Q 248,309 248,296 L 248,72 Z" />
        </clipPath>
      </defs>

      {/* Handle (behind body) */}
      <path d="M 248,138 Q 306,138 306,196 Q 306,254 248,264"
            fill="none" stroke="#E0DBD4" strokeWidth="26" strokeLinecap="round" />
      <path d="M 248,138 Q 306,138 306,196 Q 306,254 248,264"
            fill="none" stroke="#C4C0B8" strokeWidth="12" strokeLinecap="round" />

      {/* Mug body */}
      <path d="M 52,68 L 52,296 Q 52,312 68,313 L 242,313 Q 258,312 258,296 L 258,68 Z"
            fill="#F5F2EE" />

      {/* Portrait or blank back */}
      {withPortrait && portraitUrl ? (
        <image
          href={portraitUrl}
          x="62" y="72" width="186" height="238"
          clipPath={`url(#${uid}-face)`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : !withPortrait ? (
        /* Back of mug — simple logo area */
        <>
          <rect x="102" y="150" width="106" height="30" rx="4" fill="rgba(0,0,0,0.05)" />
          <text x="155" y="170" textAnchor="middle" fill="#9C9690" fontSize="9" fontFamily="serif" letterSpacing="1.5">LEGACY VERSES™</text>
        </>
      ) : (
        /* No portrait yet — placeholder */
        <rect x="62" y="72" width="186" height="238" fill="#EAE7E2" clipPath={`url(#${uid}-face)`} />
      )}

      {/* Top rim */}
      <ellipse cx="155" cy="68" rx="103" ry="26" fill="#E2DDD6" />
      <ellipse cx="155" cy="68" rx="86"  ry="19" fill="#CEC9C0" />

      {/* Bottom base */}
      <ellipse cx="155" cy="313" rx="96" ry="22" fill="#E0DCD5" />

      {/* Lighting overlays */}
      <path d="M 52,68 L 52,296 Q 52,312 68,313 L 242,313 Q 258,312 258,296 L 258,68 Z"
            fill={`url(#${uid}-left)`} />
      <path d="M 52,68 L 52,296 Q 52,312 68,313 L 242,313 Q 258,312 258,296 L 258,68 Z"
            fill={`url(#${uid}-right)`} />
      <path d="M 52,270 L 52,313 L 258,313 L 258,270 Z" fill={`url(#${uid}-bot)`} />
      <path d="M 52,68 L 52,296 Q 52,312 68,313 L 242,313 Q 258,312 258,296 L 258,68 Z"
            fill={`url(#${uid}-hl)`} />

      {/* Top rim gloss */}
      <ellipse cx="155" cy="68" rx="103" ry="26" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.18" />
    </svg>
  );

  return (
    <div className="select-none">
      <Controls isFront={isFront} onFront={() => goTo(0)} onBack={() => goTo(180)} />
      <DragStage rotY={rotY} dragging={dragging} down={down} move={move} up={up}>
        {/* Front face */}
        <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", aspectRatio: "340/420" }}>
          <MugFace withPortrait />
        </div>
        {/* Back face */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}>
          <MugFace withPortrait={false} />
        </div>
      </DragStage>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CanvasViewer — stretched canvas on a wooden frame, 3D box with visible depth
// ─────────────────────────────────────────────────────────────────────────────
function CanvasViewer({ portraitUrl, framed }: { portraitUrl: string | null; framed: boolean }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();

  const DEPTH  = 30;   // frame depth in px (relative to the layout)
  const ASPECT = 0.82; // W/H of print (portrait oriented)

  return (
    <div className="select-none">
      <Controls isFront={isFront} onFront={() => goTo(0)} onBack={() => goTo(180)} />

      {/* Outer perspective */}
      <div style={{ perspective: "950px", perspectiveOrigin: "50% 50%" }}
           className={dragging ? "cursor-grabbing" : "cursor-grab"}
           onMouseDown={e  => down(e.clientX)}
           onMouseMove={e  => dragging && move(e.clientX)}
           onMouseUp={up} onMouseLeave={up}
           onTouchStart={e => { e.preventDefault(); down(e.touches[0].clientX); }}
           onTouchMove={e  => { e.preventDefault(); dragging && move(e.touches[0].clientX); }}
           onTouchEnd={up}>

        {/* 3D box wrapper */}
        <div style={{
          position: "relative",
          margin: "0 auto",
          width: "100%",
          aspectRatio: `${ASPECT} / 1`,
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotY}deg)`,
          transition: dragging ? "none" : "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}>

          {/* ── Front face ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            background: "#F5F2EE",
            border: framed ? "14px solid #2A1F10" : "none",
            boxShadow: framed
              ? "inset 0 0 0 6px #C9944A, 0 4px 24px rgba(0,0,0,0.5)"
              : "0 4px 24px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}>
            {portraitUrl ? (
              <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "#EAE7E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#9C9490", fontSize: "12px", fontFamily: "serif", letterSpacing: "2px" }}>PORTRAIT PREVIEW</span>
              </div>
            )}
          </div>

          {/* ── Right side (frame depth) ── */}
          <div style={{
            position: "absolute", top: 0, right: `-${DEPTH}px`,
            width: DEPTH, height: "100%",
            background: "linear-gradient(to right, #3A2810, #5C3E18)",
            transform: "rotateY(-90deg)",
            transformOrigin: "0% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Left side ── */}
          <div style={{
            position: "absolute", top: 0, left: `-${DEPTH}px`,
            width: DEPTH, height: "100%",
            background: "linear-gradient(to left, #2E1F0C, #4A3010)",
            transform: "rotateY(90deg)",
            transformOrigin: "100% 50%",
            backfaceVisibility: "hidden",
          }} />

          {/* ── Back face ── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#C4B89A",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            {/* Stretcher bars texture */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "#7A6040" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "#7A6040" }} />
              <div style={{ position: "absolute", inset: 12, border: "1px solid #8A7050" }} />
            </div>
            <p style={{ fontFamily: "serif", fontSize: "10px", letterSpacing: "3px", color: "#6A5030", position: "relative" }}>
              LEGACY VERSES™
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {[isFront, !isFront].map((on, i) => (
          <span key={i} className="block w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{ background: on ? "#C9944A" : "rgba(255,255,255,0.18)", transform: on ? "scale(1.3)" : "scale(1)" }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PhoneViewer — phone case (portrait on the back), 3D rotating
// ─────────────────────────────────────────────────────────────────────────────
function PhoneViewer({ portraitUrl }: { portraitUrl: string | null }) {
  const { rotY, dragging, down, move, up, goTo, isFront } = useDragY();
  const uid = "phone";

  // Phone silhouette viewBox: 240 × 480
  const PhoneFace = ({ isBack }: { isBack: boolean }) => (
    <svg viewBox="0 0 240 480" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`${uid}-clip-${isBack ? "b" : "f"}`}>
          <rect x="8" y="8" width="224" height="464" rx="28" />
        </clipPath>
        <radialGradient id={`${uid}-edge`} cx="50%" cy="50%" r="60%">
          <stop offset="75%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
        <linearGradient id={`${uid}-hl`} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%"   stopColor="#fff" stopOpacity="0.16" />
          <stop offset="50%"  stopColor="#fff" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      {/* Phone frame (aluminum edge) */}
      <rect x="2" y="2" width="236" height="476" rx="32" fill="#1A1A22" />

      {/* Screen / back fill */}
      <rect x="8" y="8" width="224" height="464" rx="28"
            fill={isBack ? "#1E1E28" : "#0A0A14"} />

      {isBack && portraitUrl && (
        <image
          href={portraitUrl}
          x="8" y="8" width="224" height="464"
          clipPath={`url(#${uid}-clip-b)`}
          preserveAspectRatio="xMidYMid slice"
        />
      )}

      {isBack && !portraitUrl && (
        <rect x="8" y="8" width="224" height="464" rx="28" fill="#2A2A38"
              clipPath={`url(#${uid}-clip-b)`} />
      )}

      {/* Camera bump (back) */}
      {isBack && (
        <>
          <rect x="24" y="22" width="66" height="66" rx="14" fill="#141420" />
          <circle cx="46" cy="44" r="13" fill="#0A0A14" />
          <circle cx="46" cy="44" r="10" fill="#1E1E2A" />
          <circle cx="46" cy="44" r="5"  fill="#0A0A14" />
          <circle cx="72" cy="44" r="9"  fill="#1E1E2A" />
          <circle cx="72" cy="44" r="4"  fill="#0A0A14" />
          <circle cx="58" cy="70" r="7"  fill="#1E1E2A" />
          <circle cx="77" cy="68" r="4"  fill="#252530" />
        </>
      )}

      {/* Front screen (lock screen) */}
      {!isBack && (
        <>
          {/* Status bar */}
          <rect x="60" y="22" width="120" height="6" rx="3" fill="#1C1C2A" />
          <rect x="88" y="22" width="64" height="6" rx="3" fill="#2A2A38" />
          {/* Notch / pill cutout */}
          <rect x="90" y="18" width="60" height="14" rx="7" fill="#0A0A14" />
          {/* Time */}
          <text x="120" y="200" textAnchor="middle" fill="white" fillOpacity="0.85"
                fontSize="48" fontFamily="system-ui, sans-serif" fontWeight="200">
            12:00
          </text>
          <text x="120" y="224" textAnchor="middle" fill="white" fillOpacity="0.4"
                fontSize="11" fontFamily="serif" letterSpacing="1">
            LOCKED
          </text>
          {/* Home indicator */}
          <rect x="85" y="448" width="70" height="4" rx="2" fill="white" fillOpacity="0.3" />
        </>
      )}

      {/* Edge lighting overlay */}
      <rect x="8" y="8" width="224" height="464" rx="28" fill={`url(#${uid}-edge)`}
            clipPath={`url(#${uid}-clip-${isBack ? "b" : "f"})`} />
      <rect x="8" y="8" width="224" height="464" rx="28" fill={`url(#${uid}-hl)`}
            clipPath={`url(#${uid}-clip-${isBack ? "b" : "f"})`} />

      {/* Frame sheen */}
      <rect x="2" y="2" width="236" height="476" rx="32" fill="none"
            stroke="white" strokeWidth="0.8" strokeOpacity="0.1" />

      {/* Side buttons */}
      <rect x="236" y="120" width="4" height="36" rx="2" fill="#252530" />
      <rect x="0"   y="100" width="4" height="28" rx="2" fill="#252530" />
      <rect x="0"   y="140" width="4" height="28" rx="2" fill="#252530" />
    </svg>
  );

  return (
    <div className="select-none">
      <Controls isFront={isFront} onFront={() => goTo(0)} onBack={() => goTo(180)} />
      <div className="max-w-[220px] mx-auto">
        <DragStage rotY={rotY} dragging={dragging} down={down} move={move} up={up}>
          {/* Back face shown first (portrait on case) */}
          <div style={{
            aspectRatio: "240/480",
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          }}>
            <PhoneFace isBack />
          </div>
          {/* Front face (screen) */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}>
            <PhoneFace isBack={false} />
          </div>
        </DragStage>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BlanketViewer — portrait on a blanket, subtle 3D perspective tilt
// ─────────────────────────────────────────────────────────────────────────────
function BlanketViewer({ portraitUrl, label }: { portraitUrl: string | null; label: string }) {
  return (
    <div className="select-none flex flex-col items-center gap-4">
      <p className="text-white/30 text-[10px] uppercase tracking-wider">
        {label} — portrait centered
      </p>
      <div style={{ perspective: "800px" }}>
        <div style={{
          transform: "rotateX(6deg) rotateY(-4deg)",
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.6))",
        }}>
          {/* Blanket face */}
          <div style={{
            width: "100%",
            aspectRatio: "4/3",
            background: "#1E3558",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
          }}>
            {portraitUrl ? (
              <img src={portraitUrl} alt="" style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "62%",
                height: "88%",
                objectFit: "contain",
              }} />
            ) : (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0.2,
              }}>
                <span style={{ color: "white", fontSize: 12, letterSpacing: 3, fontFamily: "serif" }}>PORTRAIT</span>
              </div>
            )}
            {/* Blanket edge stitching */}
            <div style={{
              position: "absolute", inset: 6,
              border: "1.5px solid rgba(201,148,74,0.4)",
              borderRadius: "4px", pointerEvents: "none",
            }} />
            {/* Sherpa/fabric texture suggestion */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
              pointerEvents: "none",
            }} />
          </div>
          {/* Right depth edge */}
          <div style={{
            position: "absolute", top: 0, right: "-8px",
            width: "8px", height: "100%",
            background: "linear-gradient(to right, #1A2D4A, #122035)",
            transform: "rotateY(-90deg)",
            transformOrigin: "0 50%",
          }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GenericViewer — portrait displayed on a styled product mockup card
// ─────────────────────────────────────────────────────────────────────────────
function GenericViewer({ portraitUrl, label, icon }: { portraitUrl: string | null; label: string; icon: string }) {
  const shapes: Record<string, { radius: string; aspect: string; bg: string; border: string }> = {
    pillow:  { radius: "50%",  aspect: "1/1",   bg: "#F5F2EE", border: "6px solid #E8E3DC" },
    tote:    { radius: "4px",  aspect: "3/4",   bg: "#D4C4A0", border: "none" },
    journal: { radius: "4px",  aspect: "3/4",   bg: "#1E3558", border: "none" },
    ornament:{ radius: "50%",  aspect: "1/1",   bg: "#1E3558", border: "4px solid #C9944A" },
    hoodie:  { radius: "8px",  aspect: "4/5",   bg: "#1E3558", border: "none" },
    tumbler: { radius: "40%",  aspect: "1/3.2", bg: "#2A2A3A", border: "none" },
  };
  const s = shapes[label.toLowerCase()] ?? { radius: "6px", aspect: "3/4", bg: "#1E3558", border: "none" };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-white/30 text-[10px] uppercase tracking-wider">{icon} {label}</p>
      <div style={{ perspective: "800px" }}>
        <div style={{
          transform: "rotateX(4deg) rotateY(-6deg)",
          filter: "drop-shadow(0 20px 36px rgba(0,0,0,0.55))",
        }}>
          <div style={{
            width: label.toLowerCase() === "tumbler" ? "100px" : "220px",
            aspectRatio: s.aspect,
            background: s.bg,
            borderRadius: s.radius,
            border: s.border,
            overflow: "hidden",
            position: "relative",
          }}>
            {portraitUrl ? (
              <img src={portraitUrl} alt="" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                opacity: 0.92,
              }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
                <span style={{ color: "white", fontSize: 10, letterSpacing: 2, fontFamily: "serif" }}>PORTRAIT</span>
              </div>
            )}
            {/* Lighting overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
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
  productKey: string;
  productLabel: string;
  productIcon: string;
  portraitUrl: string | null;
  // T-shirt specific
  photo?: string | null;
  verse?: string;
  verseRef?: string;
  lovedOne?: string;
  birthDate?: string;
  passDate?: string;
  shirtColor?: "navy" | "black" | "white" | "maroon";
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
    return <MugViewer portraitUrl={portraitUrl} />;
  }

  if (productKey === "canvas" || productKey === "framed") {
    return <CanvasViewer portraitUrl={portraitUrl} framed={productKey === "framed"} />;
  }

  if (productKey === "phonecase") {
    return <PhoneViewer portraitUrl={portraitUrl} />;
  }

  // blanket, pillow, tote, journal, ornament, hoodie fallback
  if (productKey === "blanket") {
    return <BlanketViewer portraitUrl={portraitUrl} label={productLabel} />;
  }

  return <GenericViewer portraitUrl={portraitUrl} label={productLabel} icon={productIcon} />;
}
