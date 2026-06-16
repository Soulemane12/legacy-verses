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
}: Props) {
  const c = SHIRT_COLORS[color];
  const ink = c.isLight ? "#1C1C2A" : "#FFFFFF";
  const rotY = tilt === "left" ? "-9deg" : tilt === "right" ? "9deg" : "0deg";

  // Unique gradient IDs per instance to avoid SVG ID collisions
  const ls = `ls-${uid}`;
  const rs = `rs-${uid}`;
  const bs = `bs-${uid}`;
  const hl = `hl-${uid}`;

  return (
    <div style={{ perspective: "900px" }}>
      <div
        style={{
          transform: `rotateY(${rotY}) rotateX(3deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.35s ease",
        }}
      >
        {/*
          Container uses the SVG's natural aspect ratio (400 × 440 = 10:11).
          The SVG fills it absolutely; content overlay uses % coords that match
          the print-area region inside the SVG viewBox.
        */}
        <div className="relative w-full" style={{ aspectRatio: "400 / 440" }}>

          {/* ── T-Shirt SVG ── */}
          <svg
            viewBox="0 0 400 440"
            className="absolute inset-0 w-full h-full"
            style={{ filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.45))" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Left edge shadow — simulates shirt curving away */}
              <linearGradient id={ls} x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%"   stopColor="#000" stopOpacity="0.42" />
                <stop offset="50%"  stopColor="#000" stopOpacity="0" />
              </linearGradient>
              {/* Right edge shadow */}
              <linearGradient id={rs} x1="100%" x2="0%" y1="0%" y2="0%">
                <stop offset="0%"   stopColor="#000" stopOpacity="0.32" />
                <stop offset="50%"  stopColor="#000" stopOpacity="0" />
              </linearGradient>
              {/* Bottom shadow — hem area */}
              <linearGradient id={bs} x1="0%" x2="0%" y1="100%" y2="0%">
                <stop offset="0%"   stopColor="#000" stopOpacity="0.32" />
                <stop offset="55%"  stopColor="#000" stopOpacity="0" />
              </linearGradient>
              {/* Shoulder highlight — light catching the top center */}
              <radialGradient id={hl} cx="50%" cy="10%" r="58%">
                <stop offset="0%"   stopColor="#fff" stopOpacity={c.isLight ? "0.32" : "0.16"} />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base shirt shape */}
            <path
              d="M 138,22
                 C 122,48 108,60 94,68
                 L 20,76 L 5,155 L 88,172
                 L 88,430 L 312,430
                 L 312,172 L 395,155 L 380,76
                 L 306,68
                 C 292,60 278,48 262,22
                 Q 234,62 200,65 Q 166,62 138,22 Z"
              fill={c.bg}
            />

            {/* Collar (inner neckline) */}
            <path
              d="M 138,22
                 Q 166,62 200,65 Q 234,62 262,22
                 C 244,80 220,91 200,94
                 C 180,91 156,80 138,22 Z"
              fill={c.collar}
            />

            {/* Left side shadow */}
            <path
              d="M 94,68 L 20,76 L 5,155
                 L 88,172 L 88,430
                 L 158,430 L 158,172 L 88,172 Z"
              fill={`url(#${ls})`}
            />

            {/* Right side shadow */}
            <path
              d="M 306,68 L 380,76 L 395,155
                 L 312,172 L 312,430
                 L 242,430 L 242,172 L 312,172 Z"
              fill={`url(#${rs})`}
            />

            {/* Bottom hem shadow */}
            <path d="M 88,392 L 88,430 L 312,430 L 312,392 Z" fill={`url(#${bs})`} />

            {/* Top highlight */}
            <path
              d="M 138,22
                 C 122,48 108,60 94,68
                 L 20,76 L 5,155 L 88,172
                 L 88,430 L 312,430
                 L 312,172 L 395,155 L 380,76
                 L 306,68
                 C 292,60 278,48 262,22
                 Q 234,62 200,65 Q 166,62 138,22 Z"
              fill={`url(#${hl})`}
            />

            {/* Hem stitch detail */}
            <line
              x1="95" y1="420" x2="305" y2="420"
              stroke={ink} strokeOpacity="0.07"
              strokeWidth="1" strokeDasharray="4 4"
            />

            {/* Armhole seam lines */}
            <line x1="88" y1="70" x2="88" y2="172" stroke="#000" strokeOpacity="0.09" strokeWidth="1.5" />
            <line x1="312" y1="70" x2="312" y2="172" stroke="#000" strokeOpacity="0.09" strokeWidth="1.5" />

            {/* Shoulder fold on sleeves */}
            <line x1="20" y1="76" x2="88" y2="68" stroke={ink} strokeOpacity="0.06" strokeWidth="1" />
            <line x1="380" y1="76" x2="312" y2="68" stroke={ink} strokeOpacity="0.06" strokeWidth="1" />
          </svg>

          {/*
            Content overlay.
            Print-area in SVG viewBox: roughly x=110–290 (180w), y=106–425 (319h).
            As % of 400×440: left=27.5%, top=24%, width=45%, height=72.5%.
            We don't use all the height — let flexbox centre the content naturally.
          */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: "27.5%",
              top: "24%",
              width: "45%",
              height: "68%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "5%",
            }}
          >
            {/* Photo */}
            {showContent && photo ? (
              <img
                src={photo}
                alt=""
                style={{
                  width: "44%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `2px solid ${ACCENT}`,
                  boxShadow: "0 3px 10px rgba(0,0,0,0.45)",
                  flexShrink: 0,
                }}
              />
            ) : (
              /* Placeholder circle */
              <div
                style={{
                  width: "44%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  border: `1.5px dashed ${ink}22`,
                  flexShrink: 0,
                }}
              />
            )}

            {/* Bible verse */}
            {showContent && verse ? (
              <div style={{ width: "100%", textAlign: "center" }}>
                <p style={{
                  color: ink, fontSize: "7px", fontStyle: "italic",
                  lineHeight: 1.55, margin: 0, opacity: 0.9,
                }}>
                  &ldquo;{verse.length > 90 ? verse.slice(0, 90) + "…" : verse}&rdquo;
                </p>
                {verseRef && (
                  <p style={{ color: ACCENT, fontSize: "6.5px", fontWeight: 700, margin: "3px 0 0" }}>
                    — {verseRef}
                  </p>
                )}
              </div>
            ) : (
              /* Placeholder verse lines */
              <div style={{ width: "80%", display: "flex", flexDirection: "column", gap: "3.5px" }}>
                <div style={{ height: "1px", background: ink, opacity: 0.1 }} />
                <div style={{ height: "1px", background: ink, opacity: 0.07, width: "75%", margin: "0 auto" }} />
                <div style={{ height: "1px", background: ink, opacity: 0.05, width: "55%", margin: "0 auto" }} />
              </div>
            )}

            {/* Name + dates */}
            {showContent && lovedOne ? (
              <div style={{
                borderTop: `0.5px solid ${ink}20`,
                paddingTop: "6%",
                width: "78%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                textAlign: "center",
              }}>
                <p style={{ color: ink, fontSize: "6px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, margin: 0 }}>
                  In Loving Memory
                </p>
                <p style={{ color: ink, fontSize: "10px", fontWeight: 700, margin: "1px 0 0" }}>
                  {lovedOne}
                </p>
                {(birthDate || passDate) && (
                  <p style={{ color: ink, fontSize: "6.5px", opacity: 0.5, margin: "1px 0 0" }}>
                    {birthDate}{birthDate && passDate ? " – " : ""}{passDate}
                  </p>
                )}
              </div>
            ) : (
              /* Placeholder name lines */
              <div style={{
                borderTop: `0.5px solid ${ink}12`,
                paddingTop: "6%",
                width: "62%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}>
                <div style={{ height: "1px", background: ink, opacity: 0.09, width: "80%" }} />
                <div style={{ height: "1px", background: ink, opacity: 0.06, width: "55%" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
