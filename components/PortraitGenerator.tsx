"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  photo: string | null;
  verse: string;
  verseRef?: string;
  lovedOne?: string;
  birthDate?: string;
  passDate?: string;
  onReady?: (dataUrl: string) => void;
}

export default function PortraitGenerator({
  photo,
  verse,
  verseRef,
  lovedOne,
  birthDate,
  passDate,
  onReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"empty" | "generating" | "done">("empty");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photo || !verse.trim()) {
      setStatus("empty");
      return;
    }

    setStatus("generating");

    // Defer heavy work so "generating" state renders first
    const timer = setTimeout(() => {
      const img = new Image();

      img.onload = () => {
        const OUTPUT_W = 540;
        const scale = OUTPUT_W / img.width;
        const OUTPUT_H = Math.round(img.height * scale);

        // Extra bottom space for name/verse ref
        const FOOTER = lovedOne || verseRef ? 68 : 0;
        canvas.width  = OUTPUT_W;
        canvas.height = OUTPUT_H + FOOTER;

        const ctx = canvas.getContext("2d")!;

        // Cream background
        ctx.fillStyle = "#FEFCF8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ── Sample pixel data from image ──
        const tmp = document.createElement("canvas");
        tmp.width  = OUTPUT_W;
        tmp.height = OUTPUT_H;
        const tCtx = tmp.getContext("2d")!;
        tCtx.drawImage(img, 0, 0, OUTPUT_W, OUTPUT_H);
        const { data: px } = tCtx.getImageData(0, 0, OUTPUT_W, OUTPUT_H);

        // ── Word pool: full verse cycling ──
        const clean = verse.replace(/["""'']/g, "");
        const words = clean.split(/\s+/).filter(Boolean);
        let wi = 0;

        const CELL = 7; // pixels per text cell

        ctx.textBaseline = "top";
        ctx.textAlign    = "left";

        for (let y = 0; y < OUTPUT_H; y += CELL) {
          for (let x = 0; x < OUTPUT_W; x += CELL) {
            // Average brightness over cell block
            let sum = 0, n = 0;
            for (let dy = 0; dy < CELL && y + dy < OUTPUT_H; dy++) {
              for (let dx = 0; dx < CELL && x + dx < OUTPUT_W; dx++) {
                const i = ((y + dy) * OUTPUT_W + (x + dx)) * 4;
                // Weighted luminance
                sum += px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
                n++;
              }
            }

            const brightness = sum / n / 255; // 0 = black, 1 = white
            const density    = 1 - brightness; // invert: dark pixel → dense text

            // Skip near-white areas so the portrait "pops" on cream bg
            if (density < 0.14) continue;

            const word     = words[wi++ % words.length];
            const fontSize = +(4.5 + density * 7).toFixed(1); // 4.5 – 11.5 px
            const alpha    = Math.min(1, 0.22 + density * 0.85);

            ctx.font      = `${fontSize}px Georgia, "Times New Roman", serif`;
            ctx.fillStyle = `rgba(30, 53, 88, ${alpha.toFixed(2)})`; // navy
            ctx.fillText(word, x, y);
          }
        }

        // ── Footer decoration ──
        if (FOOTER > 0) {
          // Gold rule
          ctx.fillStyle = "#C9944A";
          ctx.fillRect(OUTPUT_W * 0.12, OUTPUT_H + 12, OUTPUT_W * 0.76, 1);

          let ty = OUTPUT_H + 20;

          if (lovedOne) {
            ctx.font      = "bold 16px Georgia, serif";
            ctx.fillStyle = "#1E3558";
            ctx.textAlign = "center";
            ctx.fillText(lovedOne, OUTPUT_W / 2, ty);
            ty += 20;
          }

          if (birthDate || passDate) {
            ctx.font      = "13px Georgia, serif";
            ctx.fillStyle = "#4A6080";
            ctx.textAlign = "center";
            const dates = [birthDate, passDate].filter(Boolean).join(" – ");
            ctx.fillText(dates, OUTPUT_W / 2, ty);
            ty += 18;
          }

          if (verseRef) {
            ctx.font      = "italic 12px Georgia, serif";
            ctx.fillStyle = "#C9944A";
            ctx.textAlign = "center";
            ctx.fillText(`— ${verseRef}`, OUTPUT_W / 2, ty);
          }

          // Second gold rule at very bottom
          ctx.fillStyle = "#C9944A";
          ctx.fillRect(OUTPUT_W * 0.12, OUTPUT_H + FOOTER - 8, OUTPUT_W * 0.76, 1);
        }

        setStatus("done");
        onReady?.(canvas.toDataURL("image/png"));
      };

      img.onerror = () => setStatus("empty");
      img.src = photo;
    }, 50);

    return () => clearTimeout(timer);
  }, [photo, verse, verseRef, lovedOne, birthDate, passDate]);

  return (
    <div className="relative w-full">
      {/* Generating overlay */}
      {status === "generating" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-soft/90 rounded-xl z-10 min-h-40">
          <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-navy text-xs font-medium">Weaving your verse into the portrait…</p>
        </div>
      )}

      {/* Canvas (hidden until done, keeps layout stable) */}
      <canvas
        ref={canvasRef}
        className={`w-full rounded-xl shadow-md transition-opacity duration-700 ${
          status === "done" ? "opacity-100" : "opacity-0 absolute"
        }`}
      />

      {/* Empty state */}
      {status === "empty" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 bg-soft/50 rounded-xl border border-dashed border-soft">
          <span className="text-5xl opacity-40">✦</span>
          <div className="text-center">
            <p className="text-sm font-medium text-charcoal/50">Your Bible verse portrait appears here</p>
            <p className="text-xs text-charcoal/35 mt-1">Upload a photo and add a verse to begin</p>
          </div>
        </div>
      )}
    </div>
  );
}
