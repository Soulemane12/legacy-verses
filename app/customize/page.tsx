"use client";
import { useState, useRef } from "react";
import PortraitGenerator from "@/components/PortraitGenerator";
import ProductViewer from "@/components/ProductViewer";

const POPULAR_VERSES = [
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "John 11:25",        text: "I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live." },
  { ref: "Psalm 23:1-4",      text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul." },
  { ref: "2 Timothy 4:7",     text: "I have fought the good fight, I have finished the race, I have kept the faith." },
  { ref: "John 14:2-3",       text: "In my Father's house are many rooms. I go to prepare a place for you." },
  { ref: "Jeremiah 29:11",    text: "For I know the plans I have for you, declares the Lord — plans for welfare and not for evil, to give you a future and a hope." },
  { ref: "Romans 8:38-39",    text: "Neither death nor life, nor anything else in all creation, will be able to separate us from the love of God." },
  { ref: "Revelation 21:4",   text: "He will wipe away every tear from their eyes, and death shall be no more." },
  { ref: "Matthew 5:4",       text: "Blessed are those who mourn, for they shall be comforted." },
  { ref: "Psalm 91:11",       text: "For He will command His angels concerning you to guard you in all your ways." },
];

const SHIRT_COLORS = [
  { key: "navy",   label: "Navy",   hex: "#1E3558" },
  { key: "black",  label: "Black",  hex: "#1A1A1A" },
  { key: "white",  label: "White",  hex: "#F0EDE8" },
  { key: "maroon", label: "Maroon", hex: "#6B1A2A" },
] as const;

// Products available in the right-panel product switcher.
// "portrait" is a special tab that shows the raw portrait canvas.
const PRODUCT_TABS = [
  { key: "portrait",  label: "Portrait",  icon: "✦" },
  { key: "tshirt",    label: "T-Shirt",   icon: "👕" },
  { key: "mug",       label: "Mug",       icon: "☕" },
  { key: "canvas",    label: "Canvas",    icon: "🖼️" },
  { key: "phonecase", label: "Phone",     icon: "📱" },
  { key: "blanket",   label: "Blanket",   icon: "🛏️" },
  { key: "hoodie",    label: "Hoodie",    icon: "🧥" },
  { key: "tumbler",   label: "Tumbler",   icon: "🥤" },
  { key: "framed",    label: "Framed",    icon: "🪞" },
  { key: "pillow",    label: "Pillow",    icon: "🛋️" },
  { key: "tote",      label: "Tote",      icon: "👜" },
  { key: "journal",   label: "Journal",   icon: "📖" },
] as const;

type ShirtColor = (typeof SHIRT_COLORS)[number]["key"];
type TabKey     = (typeof PRODUCT_TABS)[number]["key"];

export default function Customize() {
  // ── Form state ──────────────────────────────────────────────
  const [photo, setPhoto]         = useState<string | null>(null);
  const [verse, setVerse]         = useState("");
  const [verseRef, setVerseRef]   = useState("");
  const [lovedOne, setLovedOne]   = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [passDate, setPassDate]   = useState("");
  const [shirtColor, setShirtColor] = useState<ShirtColor>("navy");
  const [contactName, setContactName] = useState("");
  const [email, setEmail]         = useState("");
  const [notes, setNotes]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Right-panel state ────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>("portrait");
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function applyVerse(v: (typeof POPULAR_VERSES)[number]) {
    setVerse(v.text);
    setVerseRef(v.ref);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const activeTabData = PRODUCT_TABS.find(t => t.key === activeTab);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: contactName,
        email,
        lovedOne,
        birthDate,
        passDate,
        verse,
        verseRef,
        shirtColor: activeTab === "tshirt" || activeTab === "hoodie" ? shirtColor : undefined,
        selectedProduct: activeTabData?.label ?? activeTab,
        notes,
        message: `Scripture portrait order for ${lovedOne || "loved one"}.\nProduct: ${activeTabData?.label}\nVerse: "${verse}" — ${verseRef}\nDates: ${birthDate} – ${passDate}\nNotes: ${notes}`,
      }),
    });
    setLoading(false);
    setSubmitted(true);
  }

  const currentTab = PRODUCT_TABS.find(t => t.key === activeTab)!;

  return (
    <main>
      {/* ── Page header ── */}
      <section className="bg-navy py-12 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">
            Legacy Verses™ Studio
          </p>
          <h1 className="text-4xl font-bold text-cream mb-3">Create Your Scripture Portrait</h1>
          <p className="text-cream/65 text-sm leading-relaxed">
            Fill in the details on the left. Switch products on the right to see your portrait applied live in 3D.
          </p>
        </div>
      </section>

      {submitted ? (
        <section className="bg-soft py-24 px-4 sm:px-6">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-10 text-center border border-soft shadow-sm">
            <div className="text-5xl mb-5 text-gold">✦</div>
            <h2 className="text-2xl font-bold text-navy mb-2">Order Received</h2>
            <p className="text-charcoal/65 text-sm leading-relaxed">
              Thank you, {contactName}. We're creating the scripture portrait for{" "}
              <strong className="text-navy">{lovedOne || "your loved one"}</strong> and will
              reach out at <span className="text-navy font-medium">{email}</span> within 1–2 business days.
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-soft py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start">

            {/* ═══════════════════════════════════════════════
                LEFT — Form
            ═══════════════════════════════════════════════ */}
            <form onSubmit={handleSubmit} className="w-full lg:flex-1 flex flex-col gap-5 min-w-0">

              {/* Step 1: Photo */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">1. Upload Their Photo</h2>
                <p className="text-xs text-charcoal/50 mb-4">
                  A clear, front-facing photo gives the best portrait. The image is recreated from scripture.
                </p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-soft rounded-xl p-8 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  {photo ? (
                    <img src={photo} alt="Uploaded" className="w-32 h-32 rounded-xl object-cover mx-auto border-4 border-gold/30 shadow" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-charcoal/40">
                      <span className="text-5xl">📷</span>
                      <p className="text-sm font-medium">Click to upload a photo</p>
                      <p className="text-xs">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                {photo && (
                  <button type="button" onClick={() => { setPhoto(null); setPortraitUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
                          className="mt-3 text-xs text-charcoal/40 hover:text-charcoal/70 transition-colors">
                    Remove photo
                  </button>
                )}
              </div>

              {/* Step 2: Verse */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">2. Choose a Bible Verse</h2>
                <p className="text-xs text-charcoal/50 mb-4">
                  These words will form their portrait — woven into every shadow and highlight.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {POPULAR_VERSES.map((v) => (
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

              {/* Step 3: Details */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">3. Their Details</h2>
                <p className="text-xs text-charcoal/50 mb-4">Added at the bottom of the portrait.</p>
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
                      <input type="text" placeholder="Jan 1, 1945" value={birthDate}
                             onChange={(e) => setBirthDate(e.target.value)}
                             className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-charcoal/50">Passed</label>
                      <input type="text" placeholder="June 1, 2024" value={passDate}
                             onChange={(e) => setPassDate(e.target.value)}
                             className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Contact */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">4. Your Info</h2>
                <p className="text-xs text-charcoal/50 mb-4">
                  We'll send a proof before printing. Tell us any other products you'd like in the notes.
                </p>
                <div className="flex flex-col gap-3">
                  <input required type="text" placeholder="Your name" value={contactName}
                         onChange={(e) => setContactName(e.target.value)}
                         className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors" />
                  <input required type="email" placeholder="Email address" value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors" />
                  <textarea placeholder="Additional products or notes... (e.g. 'also want a mug and blanket')"
                             value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                             className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors resize-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !verse || !contactName || !email}
                className="bg-navy text-cream font-semibold py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 text-sm cursor-pointer"
              >
                {loading ? "Submitting…" : `Order My ${currentTab.key === "portrait" ? "Portrait" : currentTab.label} →`}
              </button>
              <p className="text-xs text-charcoal/40 text-center -mt-2">
                We'll review your order and send a proof within 1–2 business days.
              </p>
            </form>

            {/* ═══════════════════════════════════════════════
                RIGHT — Live 3D Product Preview
            ═══════════════════════════════════════════════ */}
            <div className="w-full lg:w-[480px] shrink-0 lg:sticky lg:top-6 flex flex-col gap-3">

              {/* Product tab strip */}
              <div className="bg-white rounded-2xl border border-soft shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-0">
                  <p className="text-[10px] font-semibold text-charcoal/40 uppercase tracking-widest mb-3">
                    Choose a product to preview
                  </p>
                </div>
                {/* Scrollable tab row */}
                <div className="flex gap-1 overflow-x-auto px-4 pb-3 scrollbar-hide"
                     style={{ scrollbarWidth: "none" }}>
                  {PRODUCT_TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all duration-200 ${
                          isActive
                            ? "border-gold bg-gold/8 shadow-sm"
                            : "border-transparent hover:border-soft hover:bg-soft/50"
                        }`}
                      >
                        <span className="text-lg leading-none">{tab.icon}</span>
                        <span className={`text-[10px] font-medium leading-none whitespace-nowrap ${isActive ? "text-gold" : "text-charcoal/50"}`}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dark studio viewer panel */}
              <div className="bg-[#111827] rounded-2xl border border-[#1a2540] shadow-2xl overflow-hidden">

                {/* Panel header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06]">
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {currentTab.icon} {currentTab.label}
                    </p>
                    <p className="text-white/35 text-[10px] mt-0.5">
                      {activeTab === "portrait" ? "Portrait updates as you fill the form" : "Drag to rotate · portrait updates live"}
                    </p>
                  </div>
                  {/* T-shirt color picker (only when tshirt/hoodie tab active) */}
                  {(activeTab === "tshirt" || activeTab === "hoodie") && (
                    <div className="flex items-center gap-1.5">
                      {SHIRT_COLORS.map(c => (
                        <button
                          key={c.key}
                          type="button"
                          title={c.label}
                          onClick={() => setShirtColor(c.key)}
                          className="relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: c.hex,
                            borderColor: shirtColor === c.key ? "#C9944A" : "transparent",
                            transform: shirtColor === c.key ? "scale(1.15)" : "scale(1)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Viewer body */}
                <div className="p-5">
                  {/* PortraitGenerator: always mounted (keeps regenerating when data changes).
                      Shown only when "portrait" tab is active; otherwise hidden via CSS
                      but the canvas still draws and calls onReady to keep portraitUrl fresh. */}
                  <div className={activeTab === "portrait" ? "block" : "hidden"}>
                    <PortraitGenerator
                      photo={photo}
                      verse={verse}
                      verseRef={verseRef}
                      lovedOne={lovedOne}
                      birthDate={birthDate}
                      passDate={passDate}
                      onReady={setPortraitUrl}
                    />
                  </div>

                  {/* Product 3D viewer */}
                  {activeTab !== "portrait" && (
                    <ProductViewer
                      productKey={activeTab}
                      productLabel={currentTab.label}
                      productIcon={currentTab.icon}
                      portraitUrl={portraitUrl}
                      photo={photo}
                      verse={verse}
                      verseRef={verseRef}
                      lovedOne={lovedOne}
                      birthDate={birthDate}
                      passDate={passDate}
                      shirtColor={shirtColor}
                    />
                  )}
                </div>
              </div>

              {/* Download portrait link */}
              {portraitUrl && (
                <div className="flex justify-center">
                  <a
                    href={portraitUrl}
                    download="legacy-verses-portrait.png"
                    className="text-xs text-gold/70 hover:text-gold transition-colors"
                  >
                    Download portrait preview ↓
                  </a>
                </div>
              )}
            </div>

          </div>
        </section>
      )}
    </main>
  );
}
