"use client";
import { useState, useRef } from "react";
import PortraitGenerator from "@/components/PortraitGenerator";

const popularVerses = [
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "John 11:25",        text: "I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live." },
  { ref: "Psalm 23:1-4",      text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul." },
  { ref: "2 Timothy 4:7",     text: "I have fought the good fight, I have finished the race, I have kept the faith." },
  { ref: "John 14:2-3",       text: "In my Father's house are many rooms. I go to prepare a place for you." },
  { ref: "Jeremiah 29:11",    text: "For I know the plans I have for you, declares the Lord — plans for welfare and not for evil, to give you a future and a hope." },
  { ref: "Romans 8:38-39",    text: "Neither death nor life, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord." },
  { ref: "Revelation 21:4",   text: "He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore." },
  { ref: "Matthew 5:4",       text: "Blessed are those who mourn, for they shall be comforted." },
  { ref: "Psalm 91:11",       text: "For He will command His angels concerning you to guard you in all your ways." },
];

const PRODUCT_OPTIONS = [
  { key: "tshirt",       label: "T-Shirt",       icon: "👕" },
  { key: "hoodie",       label: "Hoodie",         icon: "🧥" },
  { key: "mug",          label: "Coffee Mug",     icon: "☕" },
  { key: "tumbler",      label: "Tumbler",        icon: "🥤" },
  { key: "canvas",       label: "Canvas Print",   icon: "🖼️" },
  { key: "framed",       label: "Framed Print",   icon: "🪞" },
  { key: "blanket",      label: "Blanket",        icon: "🛏️" },
  { key: "pillow",       label: "Pillow",         icon: "🛋️" },
  { key: "phonecase",    label: "Phone Case",     icon: "📱" },
  { key: "tote",         label: "Tote Bag",       icon: "👜" },
  { key: "journal",      label: "Prayer Journal", icon: "📖" },
  { key: "ornament",     label: "Ornament",       icon: "✨" },
] as const;

type ProductKey = (typeof PRODUCT_OPTIONS)[number]["key"];

export default function Customize() {
  const [photo, setPhoto]               = useState<string | null>(null);
  const [verse, setVerse]               = useState("");
  const [verseRef, setVerseRef]         = useState("");
  const [lovedOne, setLovedOne]         = useState("");
  const [birthDate, setBirthDate]       = useState("");
  const [passDate, setPassDate]         = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<ProductKey>>(new Set(["tshirt"]));
  const [contactName, setContactName]   = useState("");
  const [email, setEmail]               = useState("");
  const [notes, setNotes]               = useState("");
  const [submitted, setSubmitted]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [portraitUrl, setPortraitUrl]   = useState<string | null>(null);
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

  function toggleProduct(key: ProductKey) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedProducts.size === 0) return;
    setLoading(true);

    const productList = Array.from(selectedProducts)
      .map((k) => PRODUCT_OPTIONS.find((p) => p.key === k)?.label)
      .filter(Boolean)
      .join(", ");

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
        products: productList,
        notes,
        message: `Scripture portrait order for ${lovedOne || "loved one"}.\nVerse: "${verse}" — ${verseRef}\nDates: ${birthDate} – ${passDate}\nProducts: ${productList}\nNotes: ${notes}`,
      }),
    });

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main>
      {/* Header */}
      <section className="bg-navy py-12 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">Legacy Verses™ Studio</p>
          <h1 className="text-4xl font-bold text-cream mb-3">Create Your Scripture Portrait</h1>
          <p className="text-cream/70 text-sm leading-relaxed">
            Upload a photo, choose a Bible verse, and watch your loved one's portrait
            emerge from the words of scripture — then pick the products you want it on.
          </p>
        </div>
      </section>

      {submitted ? (
        <section className="bg-soft py-24 px-4 sm:px-6">
          <div className="max-w-md mx-auto bg-white rounded-2xl p-10 text-center border border-soft shadow-sm">
            <div className="text-5xl mb-5 text-gold">✦</div>
            <h2 className="text-2xl font-bold text-navy mb-2">Portrait Order Received</h2>
            <p className="text-charcoal/65 text-sm leading-relaxed">
              Thank you, {contactName}. We'll begin crafting the scripture portrait for{" "}
              <strong className="text-navy">{lovedOne || "your loved one"}</strong> and reach out at{" "}
              <span className="text-navy font-medium">{email}</span> within 1–2 business days.
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-soft py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start">

            {/* ═════════════════════════════════
                LEFT COLUMN — Form
            ═════════════════════════════════ */}
            <form onSubmit={handleSubmit} className="w-full lg:flex-1 flex flex-col gap-5 min-w-0">

              {/* ── Step 1: Photo ── */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">1. Upload Their Photo</h2>
                <p className="text-xs text-charcoal/50 mb-4">
                  A clear, front-facing photo works best. The portrait will be generated from this image.
                </p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-soft rounded-xl p-8 text-center cursor-pointer hover:border-gold transition-colors"
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt="Uploaded preview"
                      className="w-32 h-32 rounded-xl object-cover mx-auto border-4 border-gold/30 shadow"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-charcoal/40">
                      <span className="text-5xl">📷</span>
                      <p className="text-sm font-medium">Click to upload a photo</p>
                      <p className="text-xs">JPG, PNG, WEBP — any size</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                {photo && (
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPortraitUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="mt-3 text-xs text-charcoal/40 hover:text-charcoal/70 transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* ── Step 2: Bible Verse ── */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">2. Choose a Bible Verse</h2>
                <p className="text-xs text-charcoal/50 mb-4">
                  This verse will form the portrait — its words are woven into their likeness.
                </p>
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

              {/* ── Step 3: Name & Dates ── */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">3. Their Details</h2>
                <p className="text-xs text-charcoal/50 mb-4">Added to the portrait and printed on every product.</p>
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

              {/* ── Step 4: Select Products ── */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">4. Choose Your Products</h2>
                <p className="text-xs text-charcoal/50 mb-4">
                  Select everything you'd like the portrait applied to. You can choose multiple.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRODUCT_OPTIONS.map((p) => {
                    const selected = selectedProducts.has(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => toggleProduct(p.key)}
                        className={`flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all text-center ${
                          selected
                            ? "border-gold bg-gold/5 shadow-sm"
                            : "border-soft hover:border-gold/40"
                        }`}
                      >
                        <span className="text-2xl">{p.icon}</span>
                        <span className={`text-xs font-medium ${selected ? "text-navy" : "text-charcoal/65"}`}>
                          {p.label}
                        </span>
                        {selected && (
                          <span className="w-4 h-4 rounded-full bg-gold text-white text-[9px] flex items-center justify-center font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedProducts.size === 0 && (
                  <p className="text-xs text-red-400 mt-3">Please select at least one product.</p>
                )}
              </div>

              {/* ── Step 5: Contact Info ── */}
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <h2 className="font-semibold text-navy text-base mb-1">5. Your Info</h2>
                <p className="text-xs text-charcoal/50 mb-4">We'll confirm your order and send proofs before printing.</p>
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
                  <textarea
                    placeholder="Any special notes or requests... (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !verse || !contactName || !email || selectedProducts.size === 0}
                className="bg-navy text-cream font-semibold py-3.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 text-sm cursor-pointer"
              >
                {loading ? "Submitting…" : "Submit My Portrait Order →"}
              </button>
              <p className="text-xs text-charcoal/40 text-center -mt-2">
                We review every order personally and send a proof before printing.
              </p>
            </form>

            {/* ═════════════════════════════════
                RIGHT COLUMN — Live Portrait Preview
            ═════════════════════════════════ */}
            <div className="w-full lg:w-[460px] shrink-0 lg:sticky lg:top-20 flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-navy text-base">Scripture Portrait</h2>
                    <p className="text-xs text-charcoal/50 mt-0.5">Updates as you fill the form</p>
                  </div>
                  {portraitUrl && (
                    <a
                      href={portraitUrl}
                      download="legacy-verses-portrait.png"
                      className="text-xs text-gold font-semibold hover:underline"
                    >
                      Download preview
                    </a>
                  )}
                </div>

                <PortraitGenerator
                  photo={photo}
                  verse={verse}
                  verseRef={verseRef}
                  lovedOne={lovedOne}
                  birthDate={birthDate}
                  passDate={passDate}
                  onReady={(url) => setPortraitUrl(url)}
                />
              </div>

              {/* Explainer */}
              {!photo && !verse && (
                <div className="bg-navy/5 rounded-xl p-5 border border-navy/10">
                  <p className="text-navy text-xs font-semibold uppercase tracking-wider mb-2">How the portrait works</p>
                  <p className="text-charcoal/65 text-xs leading-relaxed">
                    Upload a photo and add a verse above. Our system maps the words of the verse
                    to every shadow and highlight in the image — dark areas get denser text,
                    light areas stay open. The result is their face, drawn entirely from scripture.
                  </p>
                </div>
              )}

              {/* Selected products summary */}
              {selectedProducts.size > 0 && (
                <div className="bg-white rounded-xl p-5 border border-soft shadow-sm">
                  <p className="text-xs font-semibold text-charcoal/50 uppercase tracking-wider mb-3">
                    Portrait applied to:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedProducts).map((key) => {
                      const p = PRODUCT_OPTIONS.find((o) => o.key === key);
                      return p ? (
                        <span key={key} className="flex items-center gap-1.5 text-xs bg-soft rounded-full px-3 py-1.5 text-navy font-medium">
                          <span>{p.icon}</span>
                          {p.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      )}
    </main>
  );
}
