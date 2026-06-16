"use client";
import { useState, useRef } from "react";
import TshirtPreview from "@/components/TshirtPreview";

const popularVerses = [
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "John 11:25",        text: "I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live." },
  { ref: "Psalm 23:1",        text: "The Lord is my shepherd; I shall not want." },
  { ref: "2 Timothy 4:7",     text: "I have fought the good fight, I have finished the race, I have kept the faith." },
  { ref: "John 14:2-3",       text: "In my Father's house are many rooms. I go to prepare a place for you." },
  { ref: "Jeremiah 29:11",    text: "For I know the plans I have for you, declares the Lord — plans for welfare and not for evil, to give you a future and a hope." },
  { ref: "Romans 8:38-39",    text: "Neither death nor life, nor anything else in all creation, will be able to separate us from the love of God." },
  { ref: "Revelation 21:4",   text: "He will wipe away every tear from their eyes, and death shall be no more." },
  { ref: "Matthew 5:4",       text: "Blessed are those who mourn, for they shall be comforted." },
  { ref: "Psalm 91:11",       text: "He will command His angels concerning you to guard you in all your ways." },
];

const SHIRT_COLOR_OPTIONS = [
  { key: "navy",   label: "Navy",   hex: "#1E3558" },
  { key: "black",  label: "Black",  hex: "#1A1A1A" },
  { key: "white",  label: "White",  hex: "#F0EDE8" },
  { key: "maroon", label: "Maroon", hex: "#6B1A2A" },
] as const;

type ShirtColor = (typeof SHIRT_COLOR_OPTIONS)[number]["key"];

export default function Customize() {
  const [photo, setPhoto]             = useState<string | null>(null);
  const [verse, setVerse]             = useState("");
  const [verseRef, setVerseRef]       = useState("");
  const [lovedOne, setLovedOne]       = useState("");
  const [birthDate, setBirthDate]     = useState("");
  const [passDate, setPassDate]       = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail]             = useState("");
  const [shirtColor, setShirtColor]   = useState<ShirtColor>("navy");
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function applyVerse(v: (typeof popularVerses)[0]) {
    setVerse(v.text);
    setVerseRef(v.ref);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: contactName,
        email,
        product: `Custom Memorial T-Shirt (${shirtColor})`,
        lovedOne,
        birthDate,
        passDate,
        verse,
        verseRef,
        message: `Custom T-Shirt for ${lovedOne || "loved one"}. Color: ${shirtColor}. Verse: "${verse}" — ${verseRef}. Dates: ${birthDate} – ${passDate}.`,
      }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  const shirtProps = { photo, verse, verseRef, lovedOne, birthDate, passDate, color: shirtColor };

  return (
    <main>
      {/* Header */}
      <section className="bg-navy py-12 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">Custom Memorial T-Shirt</p>
          <h1 className="text-4xl font-bold text-cream mb-3">Design Your Memorial Shirt</h1>
          <p className="text-cream/70 text-sm">
            Upload a photo, choose a scripture, and watch your design appear on the shirt in real time.
          </p>
        </div>
      </section>

      {submitted ? (
        <section className="bg-soft py-24 px-4 sm:px-6">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-10 text-center border border-soft shadow-sm">
            <div className="text-5xl mb-5 text-gold">✦</div>
            <h2 className="text-2xl font-bold text-navy mb-2">Order Submitted</h2>
            <p className="text-charcoal/65 text-sm leading-relaxed">
              Thank you, {contactName}. We'll review your design and reach out at{" "}
              <span className="text-navy font-medium">{email}</span> within 1–2 business days.
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-soft py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start">

            {/* ═══════════════════════════════
                LEFT — Form
            ═══════════════════════════════ */}
            <form
              onSubmit={handleSubmit}
              className="w-full lg:flex-1 flex flex-col gap-5 min-w-0"
            >
              {/* Step 1 — Photo */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">1. Upload a Photo</h2>
                <p className="text-xs text-charcoal/50 mb-4">A clear, front-facing photo works best.</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-soft rounded-xl p-8 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt="Uploaded preview"
                      className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-gold/40 shadow"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-charcoal/40">
                      <span className="text-4xl">📷</span>
                      <p className="text-sm font-medium">Click to upload a photo</p>
                      <p className="text-xs">JPG, PNG, WEBP — any size</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                {photo && (
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="mt-3 text-xs text-charcoal/40 hover:text-charcoal/70 transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* Step 2 — Bible verse */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">2. Choose a Bible Verse</h2>
                <p className="text-xs text-charcoal/50 mb-4">Tap a quick pick or type your own.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {popularVerses.map((v) => (
                    <button
                      key={v.ref}
                      type="button"
                      onClick={() => applyVerse(v)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        verseRef === v.ref
                          ? "bg-gold text-white border-gold"
                          : "border-soft text-charcoal/60 hover:border-gold hover:text-gold"
                      }`}
                    >
                      {v.ref}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Type or paste your verse here..."
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  rows={3}
                  className="w-full border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors resize-none"
                />
                <input
                  type="text"
                  placeholder="Reference (e.g. John 3:16)"
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  className="w-full mt-2 border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Step 3 — Name & dates */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">3. Their Details</h2>
                <p className="text-xs text-charcoal/50 mb-4">Personalize with their name and dates.</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Full name (e.g. Mary Jane Smith)"
                    value={lovedOne}
                    onChange={(e) => setLovedOne(e.target.value)}
                    className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-charcoal/50">Born</label>
                      <input
                        type="text"
                        placeholder="Jan 1, 1945"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-charcoal/50">Passed</label>
                      <input
                        type="text"
                        placeholder="June 1, 2024"
                        value={passDate}
                        onChange={(e) => setPassDate(e.target.value)}
                        className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 — Contact */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">4. Your Info</h2>
                <p className="text-xs text-charcoal/50 mb-4">We'll reach out to confirm your order.</p>
                <div className="flex flex-col gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !verse || !contactName || !email}
                className="bg-navy text-cream font-semibold py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 text-sm cursor-pointer"
              >
                {loading ? "Submitting…" : "Submit My Design →"}
              </button>
              <p className="text-xs text-charcoal/40 text-center -mt-2">
                We'll review your design and follow up within 1–2 business days.
              </p>
            </form>

            {/* ═══════════════════════════════
                RIGHT — Live 3D Comparison
            ═══════════════════════════════ */}
            <div className="w-full lg:w-[480px] shrink-0 lg:sticky lg:top-20 flex flex-col gap-5">

              {/* Color picker */}
              <div className="bg-white rounded-2xl px-5 py-4 border border-soft shadow-sm flex items-center gap-4">
                <span className="text-xs font-semibold text-charcoal/60 uppercase tracking-wider">Color</span>
                <div className="flex gap-2">
                  {SHIRT_COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      title={opt.label}
                      onClick={() => setShirtColor(opt.key)}
                      className="relative"
                    >
                      <span
                        className={`block w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                          shirtColor === opt.key
                            ? "border-gold scale-110 shadow-md"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: opt.hex }}
                      />
                      {shirtColor === opt.key && (
                        <span
                          className="absolute inset-0 flex items-center justify-center text-[10px]"
                          style={{ color: opt.key === "white" ? "#1C1C2A" : "#fff" }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-charcoal/50 ml-auto capitalize">{shirtColor}</span>
              </div>

              {/* Side-by-side comparison */}
              <div className="bg-white rounded-2xl border border-soft shadow-sm overflow-hidden">
                {/* Labels */}
                <div className="grid grid-cols-2 border-b border-soft">
                  <div className="px-4 py-2.5 text-center border-r border-soft">
                    <p className="text-[10px] font-semibold text-charcoal/50 uppercase tracking-wider">Original</p>
                  </div>
                  <div className="px-4 py-2.5 text-center relative">
                    <p className="text-[10px] font-semibold text-gold uppercase tracking-wider">Your Design</p>
                    {(photo || verse || lovedOne) && (
                      <span className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Shirts */}
                <div className="grid grid-cols-2 gap-0 bg-[#F7F4EF] p-4 gap-3">
                  {/* Blank shirt */}
                  <div>
                    <TshirtPreview
                      uid="blank"
                      {...shirtProps}
                      showContent={false}
                      tilt="right"
                    />
                  </div>

                  {/* Design shirt */}
                  <div>
                    <TshirtPreview
                      uid="design"
                      {...shirtProps}
                      showContent={true}
                      tilt="left"
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="px-5 py-3 border-t border-soft text-center">
                  <p className="text-[10px] text-charcoal/40">
                    Preview updates live as you fill in the form
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}
    </main>
  );
}
