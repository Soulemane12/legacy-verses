import Link from "next/link";

export const metadata = {
  title: "Memorial T-Shirt — Legacy Verses™",
  description:
    "Custom memorial T-shirts featuring your loved one's photo, a meaningful Bible verse, name, and dates. Premium quality. Faith-inspired.",
};

const includes = [
  "Your loved one's photo printed in full color",
  "Your chosen Bible verse in elegant typography",
  "Full name and significant dates",
  "Premium quality unisex T-shirt",
  "Available in all sizes (S–5XL)",
  "Multiple color options (Black, White, Navy, Maroon)",
];

export default function Products() {
  return (
    <main>
      <section className="bg-navy py-20 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-4">Our Product</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-cream mb-4">Custom Memorial T-Shirt</h1>
          <p className="text-cream/70 text-lg leading-relaxed">
            A wearable tribute to the ones you love — personalized with faith, love, and Scripture.
          </p>
        </div>
      </section>

      <section className="bg-soft py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* T-shirt visual mockup */}
          <div className="flex justify-center">
            <div className="relative w-72">
              {/* Shirt SVG shape */}
              <svg viewBox="0 0 200 220" className="w-full drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M60 10 Q70 4 80 2 Q90 12 100 14 Q110 12 120 2 Q130 4 140 10 L190 40 L165 65 L155 55 L155 210 L45 210 L45 55 L35 65 L10 40 Z"
                  fill="#1E3558"
                  stroke="#1E3558"
                  strokeWidth="1"
                />
                {/* Print area */}
                <rect x="65" y="70" width="70" height="110" rx="4" fill="white" fillOpacity="0.08" />
                {/* Photo circle */}
                <circle cx="100" cy="100" r="22" fill="white" fillOpacity="0.15" stroke="#C9944A" strokeWidth="1.5" />
                <text x="100" y="104" textAnchor="middle" fill="#C9944A" fontSize="10" fontFamily="serif">Photo</text>
                {/* Verse line */}
                <line x1="72" y1="132" x2="128" y2="132" stroke="#C9944A" strokeWidth="0.5" strokeOpacity="0.6" />
                <text x="100" y="145" textAnchor="middle" fill="white" fillOpacity="0.7" fontSize="5.5" fontFamily="serif" fontStyle="italic">"I can do all things through</text>
                <text x="100" y="153" textAnchor="middle" fill="white" fillOpacity="0.7" fontSize="5.5" fontFamily="serif" fontStyle="italic">Christ who strengthens me."</text>
                <text x="100" y="162" textAnchor="middle" fill="#C9944A" fontSize="5" fontFamily="serif">— Phil. 4:13</text>
                {/* Name area */}
                <line x1="75" y1="170" x2="125" y2="170" stroke="white" strokeWidth="0.3" strokeOpacity="0.3" />
                <text x="100" y="180" textAnchor="middle" fill="white" fillOpacity="0.5" fontSize="4.5" fontFamily="serif">IN LOVING MEMORY</text>
                <text x="100" y="188" textAnchor="middle" fill="white" fillOpacity="0.8" fontSize="6" fontFamily="serif" fontWeight="bold">Mary Jane Smith</text>
              </svg>
            </div>
          </div>

          {/* Details */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">What's Included</h2>
            <p className="text-charcoal/65 text-sm mb-6 leading-relaxed">
              Every shirt is made to order and carefully reviewed before printing to ensure the highest quality tribute.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-charcoal/75">
                  <span className="text-gold mt-0.5 shrink-0">✦</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/customize"
              className="inline-block bg-gold text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity text-sm"
            >
              Customize Your Shirt →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream py-14 px-4 sm:px-6 text-center border-t border-soft">
        <p className="text-navy text-lg font-semibold mb-2">Ready to honor their legacy?</p>
        <p className="text-charcoal/60 text-sm mb-6">
          Upload a photo, pick a verse, and we'll take care of the rest.
        </p>
        <Link
          href="/customize"
          className="bg-navy text-cream font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity inline-block text-sm"
        >
          Start Designing
        </Link>
      </section>
    </main>
  );
}
