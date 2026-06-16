import Link from "next/link";

const steps = [
  { n: "01", title: "Upload a Photo", desc: "Any treasured photo of your loved one — we handle the rest." },
  { n: "02", title: "Choose a Bible Verse", desc: "Pick a meaningful scripture or write your own." },
  { n: "03", title: "We Generate the Portrait", desc: "Their image is recreated entirely from the words of the verse." },
  { n: "04", title: "Select Your Products", desc: "Apply the portrait to shirts, mugs, blankets, canvas prints, and more." },
];

const products = [
  { icon: "👕", label: "T-Shirts & Hoodies" },
  { icon: "☕", label: "Coffee Mugs & Tumblers" },
  { icon: "🖼️", label: "Canvas & Framed Prints" },
  { icon: "🛏️", label: "Blankets & Pillows" },
  { icon: "📱", label: "Phone Cases" },
  { icon: "📖", label: "Memory Books & Journals" },
];

const reasons = [
  {
    title: "Scripture Becomes the Portrait",
    desc: "The actual words of the Bible verse you choose are woven together to form your loved one's face. Faith made visible.",
  },
  {
    title: "Every Product, One Design",
    desc: "T-shirts, blankets, mugs, canvas prints — your portrait goes on whatever your family needs.",
  },
  {
    title: "Made With Compassion",
    desc: "We review every order personally. Each piece is handled with the care and reverence it deserves.",
  },
  {
    title: "Lasting Quality",
    desc: "Premium printing on premium materials — built to be passed down, not forgotten.",
  },
];

export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="bg-navy py-28 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-5">
            Faith · Art · Scripture
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-cream leading-tight mb-6">
            Their Portrait,<br />
            <span className="text-gold">Written in God's Word.</span>
          </h1>
          <p className="text-cream/75 text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            Upload a photo of your loved one and choose a Bible verse.
            We recreate their image using nothing but the words of that scripture —
            then print it on T-shirts, blankets, mugs, canvas prints, and more.
          </p>
          <p className="text-gold/80 text-sm font-medium italic mb-10">
            Not a photo with a verse. A portrait made <em>of</em> verses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customize"
              className="bg-gold text-white font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Create Your Portrait
            </Link>
            <Link
              href="/products"
              className="border border-cream/30 text-cream font-semibold px-8 py-4 rounded-full hover:bg-cream/10 transition-colors text-sm"
            >
              See All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── What Makes This Different ── */}
      <section className="bg-cream py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-4">The Legacy Verses™ Difference</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-6">
            The image is made entirely from scripture.
          </h2>
          <p className="text-charcoal/65 text-base leading-relaxed">
            Most memorial products put a photo <em>next to</em> a Bible verse.
            We do something different — your loved one's face is formed by the verse itself.
            Every shadow, every contour, every detail of the portrait is composed of
            the sacred words you choose. It's typographic art, scripture portrait, and
            family memorial all in one.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-soft py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">Four Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="bg-white rounded-2xl p-6 border border-soft shadow-sm">
                <p className="text-gold font-bold text-2xl mb-4 font-mono">{s.n}</p>
                <h3 className="font-semibold text-navy text-sm mb-2">{s.title}</h3>
                <p className="text-charcoal/60 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/customize"
              className="inline-block bg-navy text-cream font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Start Creating →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="bg-cream py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">Available On</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">One Portrait. Every Product.</h2>
            <p className="text-charcoal/60 text-sm mt-3 max-w-xl mx-auto">
              Your scripture portrait applied to anything your family needs for the memorial, the home, or the heart.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.label} className="bg-white rounded-2xl p-5 text-center border border-soft shadow-sm hover:border-gold/40 transition-colors">
                <div className="text-3xl mb-3">{p.icon}</div>
                <p className="text-navy font-semibold text-sm">{p.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="text-gold text-sm font-semibold hover:underline">
              Browse the full catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="bg-soft py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">Why Legacy Verses™</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">Built on Faith &amp; Love</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {reasons.map((r) => (
              <div key={r.title}>
                <div className="w-8 h-px bg-gold mb-4" />
                <h3 className="font-semibold text-navy text-base mb-2">{r.title}</h3>
                <p className="text-charcoal/65 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-navy py-24 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-4">Begin Today</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-cream mb-4">
            Every Legacy Has a Verse.
          </h2>
          <p className="text-cream/65 mb-8 text-lg">
            Let us weave it into a portrait that lasts forever.
          </p>
          <Link
            href="/customize"
            className="bg-gold text-white font-semibold px-10 py-4 rounded-full hover:opacity-90 transition-opacity inline-block"
          >
            Create Your Portrait →
          </Link>
        </div>
      </section>
    </main>
  );
}
