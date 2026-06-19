"use client";

const SHIRT_COLORS = {
  navy:   { bg: "#1E3558", collar: "#142338", isLight: false },
  black:  { bg: "#1A1A1A", collar: "#0D0D0D", isLight: false },
  white:  { bg: "#F0EDE8", collar: "#DEDAD4", isLight: true  },
  maroon: { bg: "#6B1A2A", collar: "#4A0F1B", isLight: false },
} as const;

const ACCENT = "#C9944A";

export type Garment = "tshirt" | "hoodie" | "polo" | "jacket";
const LONG_SLEEVE: Record<Garment, boolean> = { tshirt: false, hoodie: true, polo: false, jacket: true };

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
  garment?: Garment;
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
  garment = "tshirt",
}: Props) {
  const c = SHIRT_COLORS[color];
  const ink = c.isLight ? "#1C1C2A" : "#FFFFFF";
  const rotY = tilt === "left" ? "-9deg" : tilt === "right" ? "9deg" : "0deg";
  const longSleeve = LONG_SLEEVE[garment];

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

        {/* ── Base shirt body (sleeve length varies by garment) ── */}
        <path
          d={longSleeve
            ? `M 138,22
               C 120,50 106,62 92,70
               L 18,78  L 4,158  L 14,250 L 66,245 L 88,175
               L 88,430
               L 312,430
               L 312,175 L 334,245 L 386,250 L 396,158 L 382,78
               L 308,70
               C 294,62 280,50 262,22
               Q 233,64 200,67 Q 167,64 138,22 Z`
            : `M 138,22
               C 120,50 106,62 92,70
               L 18,78  L 4,158  L 88,175
               L 88,430
               L 312,430
               L 312,175 L 396,158 L 382,78
               L 308,70
               C 294,62 280,50 262,22
               Q 233,64 200,67 Q 167,64 138,22 Z`}
          fill={c.bg}
        />

        {/* ── Front collar/neckline — garment-specific ── */}
        {face === "front" && garment === "tshirt" && (
          <path
            d="M 138,22 Q 167,64 200,67 Q 233,64 262,22
               C 243,82 220,93 200,96
               C 180,93 157,82 138,22 Z"
            fill={c.collar}
          />
        )}
        {face === "front" && garment === "polo" && (
          <>
            {/* Open V with two flat collar points */}
            <path d="M 152,24 L 200,72 L 176,28 Z" fill={c.collar} />
            <path d="M 248,24 L 200,72 L 224,28 Z" fill={c.collar} />
            {/* Button placket */}
            <rect x="196" y="58" width="8" height="58" fill={c.collar} opacity="0.9" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx="200" cy={70 + i * 16} r="2.4" fill={ink} fillOpacity="0.35" />
            ))}
          </>
        )}
        {face === "front" && garment === "jacket" && (
          <>
            {/* Stand-up collar */}
            <path d="M 158,18 L 242,18 L 232,42 L 168,42 Z" fill={c.collar} />
            {/* Center zipper */}
            <line x1="200" y1="44" x2="200" y2="428" stroke={ink} strokeOpacity="0.28" strokeWidth="3" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1="197" y1={50 + i * 16} x2="203" y2={50 + i * 16} stroke={ink} strokeOpacity="0.18" strokeWidth="1.2" />
            ))}
            {/* Zipper pull */}
            <rect x="195" y="40" width="10" height="14" rx="2" fill="#C9C4BC" />
            {/* Hand pockets */}
            <path d="M 108,300 L 160,300 L 152,340 L 100,336 Z" fill="none" stroke={ink} strokeOpacity="0.18" strokeWidth="1.5" />
            <path d="M 292,300 L 240,300 L 248,340 L 300,336 Z" fill="none" stroke={ink} strokeOpacity="0.18" strokeWidth="1.5" />
          </>
        )}
        {face === "front" && garment === "hoodie" && (
          <>
            {/* Hood peeking above the shoulder line */}
            <path d="M 148,12 Q 200,-12 252,12 Q 234,42 200,48 Q 166,42 148,12 Z" fill={c.collar} />
            {/* Drawstrings */}
            <line x1="186" y1="40" x2="180" y2="92" stroke={ink} strokeOpacity="0.4" strokeWidth="2" />
            <line x1="214" y1="40" x2="220" y2="92" stroke={ink} strokeOpacity="0.4" strokeWidth="2" />
            <circle cx="180" cy="94" r="2.6" fill={ink} fillOpacity="0.4" />
            <circle cx="220" cy="94" r="2.6" fill={ink} fillOpacity="0.4" />
            {/* Kangaroo pocket */}
            <path d="M 122,352 Q 200,338 278,352 L 270,408 Q 200,420 130,408 Z" fill={c.collar} opacity="0.55" />
            <line x1="200" y1="352" x2="200" y2="412" stroke={ink} strokeOpacity="0.12" strokeWidth="1.2" />
          </>
        )}

        {/* Collar ribbing — fine horizontal lines for texture (t-shirt only) */}
        {face === "front" && garment === "tshirt" && Array.from({ length: 5 }).map((_, i) => {
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

        {/* ── Back collar/hood — garment-specific ── */}
        {face === "back" && garment !== "hoodie" && (
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
          </>
        )}
        {face === "back" && garment === "hoodie" && (
          <>
            {/* Full hood pouch draped over the back */}
            <path d="M 140,16 Q 200,-16 260,16 Q 254,76 200,86 Q 146,76 140,16 Z" fill={c.collar} />
            {/* Hood lining shadow + drawstring channel */}
            <path d="M 200,86 Q 240,72 250,30" stroke="#000" strokeOpacity="0.12" strokeWidth="2" fill="none" />
            <line x1="170" y1="20" x2="230" y2="20" stroke={ink} strokeOpacity="0.15" strokeWidth="1.4" strokeDasharray="3 3" />
          </>
        )}
        {/* Size-tag detail (non-hoodie backs only, hood covers this area) */}
        {face === "back" && garment !== "hoodie" && (
          <>
            <rect x="191" y="30" width="18" height="11" rx="1.5" fill="white" fillOpacity="0.1" />
            <text x="200" y="38" textAnchor="middle" fill="white" fillOpacity="0.3" fontSize="5" fontFamily="Arial">LV</text>
          </>
        )}

        {/* ── Edge shadows ── */}
        {/* Left body + sleeve */}
        <path d={longSleeve
          ? "M 92,70 L 18,78 L 4,158 L 14,250 L 66,245 L 88,175 L 88,430 L 155,430 L 155,175 L 88,175 Z"
          : "M 92,70 L 18,78 L 4,158 L 88,175 L 88,430 L 155,430 L 155,175 L 88,175 Z"} fill={`url(#${ls})`} />
        {/* Right body + sleeve */}
        <path d={longSleeve
          ? "M 308,70 L 382,78 L 396,158 L 386,250 L 334,245 L 312,175 L 312,430 L 245,430 L 245,175 L 312,175 Z"
          : "M 308,70 L 382,78 L 396,158 L 312,175 L 312,430 L 245,430 L 245,175 L 312,175 Z"} fill={`url(#${rs})`} />
        {/* Bottom hem */}
        <path d="M 88,394 L 88,430 L 312,430 L 312,394 Z" fill={`url(#${bs})`} />

        {/* ── Highlights ── */}
        {/* Chest area highlight */}
        <path
          d={longSleeve
            ? `M 138,22 C 120,50 106,62 92,70 L 18,78 L 4,158 L 14,250 L 66,245 L 88,175 L 88,430 L 312,430 L 312,175 L 334,245 L 386,250 L 396,158 L 382,78 L 308,70 C 294,62 280,50 262,22 Q 233,64 200,67 Q 167,64 138,22 Z`
            : `M 138,22 C 120,50 106,62 92,70 L 18,78 L 4,158 L 88,175 L 88,430 L 312,430 L 312,175 L 396,158 L 382,78 L 308,70 C 294,62 280,50 262,22 Q 233,64 200,67 Q 167,64 138,22 Z`}
          fill={`url(#${hl})`}
        />
        {/* Left sleeve top highlight */}
        <ellipse cx="53" cy="90" rx="30" ry="20" fill={`url(#${sl})`} />
        {/* Right sleeve top highlight */}
        <ellipse cx="347" cy="90" rx="30" ry="20" fill={`url(#${sl})`} />

        {/* Cuffs (long-sleeve garments only) */}
        {longSleeve && (
          <>
            <rect x="6" y="240" width="62" height="14" rx="3" fill="#000" opacity="0.1" />
            <rect x="332" y="240" width="62" height="14" rx="3" fill="#000" opacity="0.1" />
          </>
        )}

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
            left: "27.5%", top: "25%", width: "45%",
            height: garment === "hoodie" ? "55%" : garment === "jacket" ? "58%" : "65%",
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
