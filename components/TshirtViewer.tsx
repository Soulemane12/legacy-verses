"use client";
import { useState, useRef, useCallback } from "react";
import TshirtPreview, { type Garment } from "./TshirtPreview";

interface Props {
  photo?: string | null;
  verse?: string;
  verseRef?: string;
  lovedOne?: string;
  birthDate?: string;
  passDate?: string;
  color?: "navy" | "black" | "white" | "maroon";
  garment?: Garment;
}

export default function TshirtViewer({
  photo, verse = "", verseRef = "", lovedOne = "", birthDate = "", passDate = "", color = "navy", garment = "tshirt",
}: Props) {
  const [rotX, setRotX] = useState(0);   // vertical tilt (up/down drag)
  const [rotY, setRotY] = useState(0);   // horizontal spin (left/right drag)
  const [dragging, setDragging] = useState(false);
  const startX    = useRef(0);
  const startY    = useRef(0);
  const startRotX = useRef(0);
  const startRotY = useRef(0);

  // On release: snap Y to nearest 0° or 180°, ease X back to 0°
  const snap = useCallback(() => {
    setDragging(false);
    setRotY(r => Math.round(r / 180) * 180);
    setRotX(0);
  }, []);

  const dragStart = useCallback((x: number, y: number) => {
    setDragging(true);
    startX.current    = x;
    startY.current    = y;
    startRotX.current = rotX;
    startRotY.current = rotY;
  }, [rotX, rotY]);

  const dragMove = useCallback((x: number, y: number) => {
    if (!dragging) return;
    // Horizontal drag → Y rotation (spin left/right)
    // Vertical drag   → X rotation (tilt up/down)
    setRotY(startRotY.current + (x - startX.current) * 0.55);
    setRotX(startRotX.current - (y - startY.current) * 0.4);
  }, [dragging]);

  // Determine which face is currently facing the camera.
  // CSS transform: rotateX(rotX) rotateY(rotY) transforms the face
  // normal [0,0,1] → Z component = cos(rotX)·cos(rotY).
  // Positive Z = front face toward viewer.
  const radX   = (rotX * Math.PI) / 180;
  const radY   = (rotY * Math.PI) / 180;
  const isFront = Math.cos(radX) * Math.cos(radY) > 0;

  // Animate to a clean front or back position
  function goToFace(front: boolean) {
    setDragging(false);
    const n = ((rotY % 360) + 360) % 360;
    const target = front ? 0 : 180;
    const base = rotY - n;
    const candidates = [base + target, base + target + 360, base + target - 360];
    const closest = candidates.reduce((a, b) =>
      Math.abs(a - rotY) <= Math.abs(b - rotY) ? a : b
    );
    setRotY(closest);
    setRotX(0);
  }

  const sharedProps = {
    photo, verse, verseRef, lovedOne, birthDate, passDate,
    color, garment, noPerspective: true as const,
  };

  return (
    <div className="select-none">
      {/* ── Controls ── */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => goToFace(true)}
          className={`text-xs px-4 py-1.5 rounded-full border transition-all duration-200 ${
            isFront
              ? "bg-gold text-white border-gold shadow-sm"
              : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"
          }`}
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => goToFace(false)}
          className={`text-xs px-4 py-1.5 rounded-full border transition-all duration-200 ${
            !isFront
              ? "bg-gold text-white border-gold shadow-sm"
              : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/80"
          }`}
        >
          Back
        </button>
        <span className="text-[10px] text-white/30 ml-auto tracking-wide select-none">
          ↕↔ drag freely
        </span>
      </div>

      {/* ── 3D Stage ── */}
      {/*
        perspectiveOrigin at 50% 38% puts the vanishing point near the
        shirt chest area for a natural-looking 3D tilt.
      */}
      <div
        style={{ perspective: "1000px", perspectiveOrigin: "50% 38%" }}
        className={dragging ? "cursor-grabbing" : "cursor-grab"}
        onMouseDown={(e) => dragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => dragging && dragMove(e.clientX, e.clientY)}
        onMouseUp={snap}
        onMouseLeave={snap}
        onTouchStart={(e) => { e.preventDefault(); dragStart(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchMove={(e)  => { e.preventDefault(); dragging && dragMove(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={snap}
      >
        {/*
          Rotating wrapper.
          transform-style: preserve-3d keeps both shirt faces in the
          same 3D scene so perspective and backface-visibility work.
        */}
        <div
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transformStyle: "preserve-3d",
            transition: dragging
              ? "none"
              : "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            position: "relative",
          }}
        >
          {/* ── Front face ── */}
          <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
            <TshirtPreview uid="vf" {...sharedProps} showContent face="front" />
          </div>

          {/* ── Back face ──
              rotateY(180deg) pre-rotates this face 180° so it starts
              pointing away from the camera. CSS hides it until the
              overall rotation makes it face toward the viewer.
              position:absolute lets it overlap the front face exactly
              so the container height is determined by the front face.
          */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <TshirtPreview uid="vb" {...sharedProps} showContent={false} face="back" />
          </div>
        </div>
      </div>

      {/* ── Face indicator dots ── */}
      <div className="flex justify-center gap-1.5 mt-3">
        <span
          className="block w-1.5 h-1.5 rounded-full transition-all duration-300"
          style={{
            background: isFront ? "#C9944A" : "rgba(255,255,255,0.2)",
            transform: isFront ? "scale(1.3)" : "scale(1)",
          }}
        />
        <span
          className="block w-1.5 h-1.5 rounded-full transition-all duration-300"
          style={{
            background: !isFront ? "#C9944A" : "rgba(255,255,255,0.2)",
            transform: !isFront ? "scale(1.3)" : "scale(1)",
          }}
        />
      </div>
    </div>
  );
}
