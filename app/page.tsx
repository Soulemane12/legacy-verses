import Link from "next/link";

const features = [
  { icon: "📷", title: "Upload a Photo", desc: "Add a treasured photo of your loved one." },
  { icon: "📖", title: "Choose a Verse", desc: "Pick from popular scriptures or write your own." },
  { icon: "✍️", title: "Add Their Name", desc: "Include their name and dates to personalize." },
  { icon: "👕", title: "We Handle the Rest", desc: "Premium quality T-shirt printed with care." },
];

const whyUs = [
  { icon: "✝️", title: "Faith-Centered", desc: "Every design is rooted in Scripture and created with faith at the forefront." },
  { icon: "🎨", title: "Fully Custom", desc: "Each piece is personalized with your loved one's photo, verse, and story." },
  { icon: "⭐", title: "Premium Quality", desc: "High-quality printing and materials built to last for generations." },
  { icon: "💙", title: "Compassionate Service", desc: "We serve families with care, empathy, and fast turnaround." },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-navy py-24 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-5">
            Faith · Art · Scripture
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-cream leading-tight mb-6">
            Preserve a Legacy.<br />
            <span className="text-gold">Honor a Life.</span>
          </h1>
          <p className="text-cream/75 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Custom memorial T-shirts featuring your loved one's photo and a meaningful Bible verse — designed with faith, printed with love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customize"
              className="bg-gold text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Design Your Shirt
            </Link>
            <Link
              href="/products"
              className="border border-cream/30 text-cream font-semibold px-8 py-3.5 rounded-full hover:bg-cream/10 transition-colors text-sm"
            >
              See the Product
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">Four Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-soft shadow-sm text-center">
                <div className="w-8 h-8 rounded-full bg-navy text-cream text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-navy text-sm mb-1">{f.title}</h3>
                <p className="text-charcoal/60 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/customize"
              className="inline-block bg-navy text-cream font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Start Designing →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-soft py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">Why Legacy Verses™</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">Built on Faith & Love</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUs.map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-navy text-lg mb-2">{item.title}</h3>
                <p className="text-charcoal/65 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-cream mb-4">
            Every Legacy Has a Verse.
          </h2>
          <p className="text-cream/65 mb-8 text-lg">
            Let us help you find it — and wear it with pride.
          </p>
          <Link
            href="/customize"
            className="bg-gold text-white font-semibold px-10 py-4 rounded-full hover:opacity-90 transition-opacity inline-block"
          >
            Design Your Memorial Shirt
          </Link>
        </div>
      </section>
    </main>
  );
}
