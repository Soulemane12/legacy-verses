"use client";

const SHIRT_COLORS = {
  navy:   { bg: "#1E3558", collar: "#142338", isLight: false },
  black:  { bg: "#1A1A1A", collar: "#0D0D0D", isLight: false },
  white:  { bg: "#F0EDE8", collar: "#DEDAD4", isLight: true  },
  maroon: { bg: "#6B1A2A", collar: "#4A0F1B", isLight: false },
} as const;

const ACCENT = "#C9944A";

interface Props {
  photo?: string | null;
  verse?: string;
  verseRef?: string;
  lovedOne?: string;
  birthDate?: string;
  passDate?: string;
  color?: keyof typeof SHIRT_COLORS;
  showContent?: boolean;
  tilt?: "left" | "right" | "none";
  uid: string;
  noPerspective?: boolean;
  face?: "front" | "back";
}

export default function TshirtPreview({
  photo,
  verse = "",
  verseRef = "",
  lovedOne = "",
  birthDate = "",
  passDate = "",
  color = "navy",
  showContent = true,
  tilt = "left",
  uid,
  noPerspective = false,
  face = "front",
}: Props) {
  const c = SHIRT_COLORS[color];
  const ink = c.isLight ? "#1C1C2A" : "#FFFFFF";
  const rotY = tilt === "left" ? "-9deg" : tilt === "right" ? "9deg" : "0deg";

  // Unique gradient IDs per shirt instance to avoid SVG ID collisions
  const ls  = `ls-${uid}`;   // left shadow
  const rs  = `rs-${uid}`;   // right shadow
  const bs  = `bs-${uid}`;   // bottom shadow
  const hl  = `hl-${uid}`;   // center highlight
  const sl  = `sl-${uid}`;   // sleeve gradient
  const cf  = `cf-${uid}`;   // center fold
  const fld = `fld-${uid}`;  // under-arm fold

  /*
    Shirt SVG path reference (viewBox 0 0 400 440):
      Shoulders : L(94,68) R(306,68)
      Sleeve tips: L(20,76)→(5,155)  R(380,76)→(395,155)
      Armholes  : L join (88,172)  R join (312,172)
      Body hem  : (88,430) – (312,430)
  */

  const inner = (
    <div className="relative w-full" style={{ aspectRatio: "400 / 440" }}>
      <svg
        viewBox="0 0 400 440"
        className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.5)) drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Left edge — shirt curves away from viewer */}
          <linearGradient id={ls} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%"  stopColor="#000" stopOpacity="0.46" />
            <stop offset="42%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          {/* Right edge */}
          <linearGradient id={rs} x1="100%" x2="0%" y1="0%" y2="0%">
            <stop offset="0%"  stopColor="#000" stopOpacity="0.34" />
            <stop offset="42%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          {/* Bottom hem shadow */}
          <linearGradient id={bs} x1="0%" x2="0%" y1="100%" y2="0%">
            <stop offset="0%"  stopColor="#000" stopOpacity="0.36" />
            <stop offset="52%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          {/* Center-chest highlight — simulates chest curvature */}
          <radialGradient id={hl} cx="50%" cy="30%" r="42%">
            <stop offset="0%"   stopColor="#fff" stopOpacity={c.isLight ? "0.28" : "0.18"} />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          {/* Sleeve top highlight (light catching shoulder) */}
          <radialGradient id={sl} cx="50%" cy="0%" r="100%">
            <stop offset="0%"   stopColor="#fff" stopOpacity={c.isLight ? "0.2" : "0.1"} />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          {/* Subtle center-front vertical crease */}
          <linearGradient id={cf} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%"   stopColor="#000" stopOpacity="0" />
            <stop offset="48%"  stopColor="#000" stopOpacity="0.06" />
            <stop offset="50%"  stopColor="#000" stopOpacity="0.08" />
            <stop offset="52%"  stopColor="#000" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </linearGradient>
          {/* Under-arm fold shadow */}
          <radialGradient id={fld} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#000" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Base shirt body ── */}
        <path
          d="M 138,22
             C 120,50 106,62 92,70
             L 18,78  L 4,158  L 88,175
             L 88,430
             L 312,430
             L 312,175 L 396,158 L 382,78
             L 308,70
             C 294,62 280,50 262,22
             Q 233,64 200,67 Q 167,64 138,22 Z"
          fill={c.bg}
        />

        {/* ── Front V-collar ── */}
        {face === "front" && (
          <path
            d="M 138,22 Q 167,64 200,67 Q 233,64 262,22
               C 243,82 220,93 200,96
               C 180,93 157,82 138,22 Z"
            fill={c.collar}
          />
        )}

        {/* Collar ribbing — fine horizontal lines for texture */}
        {face === "front" && Array.from({ length: 5 }).map((_, i) => {
          const t = (i + 1) / 6;
          // Interpolate along the collar path (simplified as horizontal lines)
          const y1 = 22 + t * (96 - 22);
          const halfW = 62 * (1 - Math.pow(t - 0.5, 2) * 4) * (1 - t * 0.3);
          return (
            <line
              key={i}
              x1={200 - halfW} y1={y1}
              x2={200 + halfW} y2={y1}
              stroke={ink} strokeOpacity="0.06" strokeWidth="0.8"
            />
          );
        })}

        {/* ── Back crew-neck collar ── */}
        {face === "back" && (
          <>
            <path
              d="M 168,24 Q 200,36 232,24
                 Q 220,48 200,50
                 Q 180,48 168,24 Z"
              fill={c.collar}
            />
            {/* Back collar ribbing */}
            {Array.from({ length: 4 }).map((_, i) => {
              const t = (i + 1) / 5;
              const y1 = 24 + t * (50 - 24);
              const hw = 32 * (1 - t * 0.4);
              return (
                <line
                  key={i}
                  x1={200 - hw} y1={y1}
                  x2={200 + hw} y2={y1}
                  stroke={ink} strokeOpacity="0.06" strokeWidth="0.7"
                />
              );
            })}
            {/* Size-tag detail */}
            <rect x="191" y="30" width="18" height="11" rx="1.5" fill="white" fillOpacity="0.1" />
            <text x="200" y="38" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="5" fontFamily="Arial">LV</text>
          </>
        )}

        {/* ── Edge shadows ── */}
        {/* Left body + sleeve */}
        <path d="M 92,70 L 18,78 L 4,158 L 88,175 L 88,430 L 155,430 L 155,175 L 88,175 Z" fill={`url(#${ls})`} />
        {/* Right body + sleeve */}
        <path d="M 308,70 L 382,78 L 396,158 L 312,175 L 312,430 L 245,430 L 245,175 L 312,175 Z" fill={`url(#${rs})`} />
        {/* Bottom hem */}
        <path d="M 88,394 L 88,430 L 312,430 L 312,394 Z" fill={`url(#${bs})`} />

        {/* ── Highlights ── */}
        {/* Chest area highlight */}
        <path
          d="M 138,22 C 120,50 106,62 92,70 L 18,78 L 4,158 L 88,175 L 88,430 L 312,430 L 312,175 L 396,158 L 382,78 L 308,70 C 294,62 280,50 262,22 Q 233,64 200,67 Q 167,64 138,22 Z"
          fill={`url(#${hl})`}
        />
        {/* Left sleeve top highlight */}
        <ellipse cx="53" cy="90" rx="30" ry="20" fill={`url(#${sl})`} />
        {/* Right sleeve top highlight */}
        <ellipse cx="347" cy="90" rx="30" ry="20" fill={`url(#${sl})`} />

        {/* ── Fabric details ── */}
        {/* Center vertical crease */}
        <rect x="88" y="100" width="224" height="330" fill={`url(#${cf})`} />
        {/* Under-arm fold (left) */}
        <ellipse cx="88" cy="175" rx="22" ry="16" fill={`url(#${fld})`} />
        {/* Under-arm fold (right) */}
        <ellipse cx="312" cy="175" rx="22" ry="16" fill={`url(#${fld})`} />
        {/* Shoulder tension line (left) */}
        <path d="M 92,70 Q 88,120 88,175" stroke="#000" strokeOpacity="0.06" strokeWidth="1.5" fill="none" />
        {/* Shoulder tension line (right) */}
        <path d="M 308,70 Q 312,120 312,175" stroke="#000" strokeOpacity="0.06" strokeWidth="1.5" fill="none" />

        {/* Hem stitch */}
        <line x1="96" y1="421" x2="304" y2="421" stroke={ink} strokeOpacity="0.07" strokeWidth="0.8" strokeDasharray="3 3.5" />

        {/* Back watermark */}
        {face === "back" && (
          <text
            x="200" y="285"
            textAnchor="middle" fill={ink} fillOpacity="0.06"
            fontSize="10" fontFamily="Arial" letterSpacing="3"
          >
            LEGACY VERSES™
          </text>
        )}
      </svg>

      {/* ── Content overlay (front face only) ── */}
      {face === "front" && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: "27.5%", top: "25%", width: "45%", height: "65%",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "5%",
          }}
        >
          {/* Photo */}
          {showContent && photo ? (
            <img
              src={photo} alt=""
              style={{
                width: "44%", aspectRatio: "1", borderRadius: "50%",
                objectFit: "cover", border: `2px solid ${ACCENT}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)", flexShrink: 0,
              }}
            />
          ) : (
            <div style={{ width: "44%", aspectRatio: "1", borderRadius: "50%", border: `1.5px dashed ${ink}20`, flexShrink: 0 }} />
          )}

          {/* Verse */}
          {showContent && verse ? (
            <div style={{ width: "100%", textAlign: "center" }}>
              <p style={{ color: ink, fontSize: "7px", fontStyle: "italic", lineHeight: 1.55, margin: 0, opacity: 0.88 }}>
                &ldquo;{verse.length > 90 ? verse.slice(0, 90) + "…" : verse}&rdquo;
              </p>
              {verseRef && (
                <p style={{ color: ACCENT, fontSize: "6.5px", fontWeight: 700, margin: "3px 0 0" }}>— {verseRef}</p>
              )}
            </div>
          ) : (
            <div style={{ width: "80%", display: "flex", flexDirection: "column", gap: "3.5px" }}>
              <div style={{ height: "1px", background: ink, opacity: 0.1 }} />
              <div style={{ height: "1px", background: ink, opacity: 0.07, width: "75%", margin: "0 auto" }} />
              <div style={{ height: "1px", background: ink, opacity: 0.05, width: "55%", margin: "0 auto" }} />
            </div>
          )}

          {/* Name + dates */}
          {showContent && lovedOne ? (
            <div style={{
              borderTop: `0.5px solid ${ink}20`, paddingTop: "6%", width: "78%",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center",
            }}>
              <p style={{ color: ink, fontSize: "6px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, margin: 0 }}>
                In Loving Memory
              </p>
              <p style={{ color: ink, fontSize: "10px", fontWeight: 700, margin: "1px 0 0" }}>{lovedOne}</p>
              {(birthDate || passDate) && (
                <p style={{ color: ink, fontSize: "6.5px", opacity: 0.5, margin: "1px 0 0" }}>
                  {birthDate}{birthDate && passDate ? " – " : ""}{passDate}
                </p>
              )}
            </div>
          ) : (
            <div style={{
              borderTop: `0.5px solid ${ink}12`, paddingTop: "6%", width: "62%",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
            }}>
              <div style={{ height: "1px", background: ink, opacity: 0.09, width: "80%" }} />
              <div style={{ height: "1px", background: ink, opacity: 0.06, width: "55%" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (noPerspective) return inner;

  return (
    <div style={{ perspective: "900px" }}>
      <div
        style={{
          transform: `rotateY(${rotY}) rotateX(3deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.35s ease",
        }}
      >
        {inner}
      </div>
    </div>
  );
}
