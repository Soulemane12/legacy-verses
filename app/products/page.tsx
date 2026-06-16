import Link from "next/link";

export const metadata = {
  title: "Products — Legacy Verses™",
  description:
    "Bible verse portrait memorial products — T-shirts, mugs, blankets, canvas prints, phone cases, and more. Your loved one's image created from scripture.",
};

const categories = [
  {
    icon: "👕",
    name: "Apparel",
    tagline: "Wear their memory close.",
    desc: "Each garment features your loved one's scripture portrait — their face formed by the words of the verse. Available in sizes S–5XL.",
    items: ["Unisex T-Shirts", "Hoodies & Sweatshirts", "Polo Shirts", "Baseball Caps", "Jackets", "Tote Bags"],
  },
  {
    icon: "☕",
    name: "Drinkware",
    tagline: "Start every morning in their memory.",
    desc: "A full-wrap portrait on every mug and tumbler so the scripture surrounds the image from every angle.",
    items: ["Coffee Mugs", "Travel Mugs", "Stainless Tumblers", "Water Bottles", "Glass Tumblers"],
  },
  {
    icon: "🖼️",
    name: "Art & Prints",
    tagline: "Gallery-quality, scripture-built.",
    desc: "The portrait rendered at full resolution for display in the home — from canvas gallery wraps to museum-grade frames.",
    items: ["Canvas Gallery Wrap", "Framed Print", "Acrylic Display", "Metal Print", "Digital Download", "Memorial Poster"],
  },
  {
    icon: "🛋️",
    name: "Home & Lifestyle",
    tagline: "Surround your home with their legacy.",
    desc: "Soft goods and home accents that bring the portrait into everyday life — comforting, beautiful, and faith-filled.",
    items: ["Sherpa Blanket", "Throw Blanket", "Decorative Pillow", "Pillow Case", "Wall Tapestry", "Mouse Pad", "Memorial Candle"],
  },
  {
    icon: "📱",
    name: "Accessories",
    tagline: "Carry them everywhere.",
    desc: "Slim, protective cases and everyday carry items featuring the scripture portrait on the back.",
    items: ["iPhone Cases", "Android Cases", "Laptop Sleeves", "Keychains", "Ornaments", "Luggage Tags"],
  },
  {
    icon: "📖",
    name: "Family Legacy Collection",
    tagline: "Preserve the story for generations.",
    desc: "Bound keepsakes, journals, and Bibles that carry the portrait and scripture together — heirlooms meant to be passed down.",
    items: ["Tribute & Memory Book", "Prayer Journal", "Personalized Bible", "Memorial Calendar", "Family Recipe Book", "Guest Sign-In Book"],
  },
  {
    icon: "⛪",
    name: "Funeral & Church Packages",
    tagline: "Dignified tributes for the service.",
    desc: "Professional memorial materials for the celebration of life — designed, printed, and delivered quickly.",
    items: ["Memorial Programs", "Prayer Cards", "Funeral Bulletin", "Church Banner", "Lapel Pins", "Memorial Bookmarks"],
  },
];

export default function Products() {
  return (
    <main>
      {/* Header */}
      <section className="bg-navy py-20 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-4">Full Catalog</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-cream mb-4">
            One Portrait. Every Product.
          </h1>
          <p className="text-cream/70 text-lg leading-relaxed max-w-2xl mx-auto">
            Your loved one's image — recreated from the words of a Bible verse —
            applied to whatever your family needs to honor their memory.
          </p>
        </div>
      </section>

      {/* How the portrait works */}
      <section className="bg-cream py-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-navy mb-4">What Makes It Different</h2>
          <p className="text-charcoal/65 leading-relaxed text-sm">
            Every product starts with the same foundation: a scripture portrait.
            We take your uploaded photo and use the Bible verse you choose to reconstruct
            your loved one's likeness — their face is drawn entirely from the text of the scripture,
            word by word, in varying sizes and densities that follow the light and shadow of the original photo.
            The result is a portrait that <strong className="text-navy">is</strong> the verse —
            not one that just quotes it.
          </p>
        </div>
      </section>

      {/* Product categories */}
      <section className="bg-soft py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-white rounded-2xl p-7 border border-soft shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h2 className="font-bold text-navy text-lg leading-tight">{cat.name}</h2>
                  <p className="text-gold text-xs font-medium italic">{cat.tagline}</p>
                </div>
              </div>
              <p className="text-charcoal/65 text-sm leading-relaxed">{cat.desc}</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {cat.items.map((item) => (
                  <li key={item} className="text-xs text-charcoal/70 flex items-center gap-1.5">
                    <span className="text-gold text-[8px]">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                <Link
                  href="/customize"
                  className="text-xs font-semibold text-gold hover:underline"
                >
                  Order this category →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-cream mb-3">Ready to create their portrait?</h2>
          <p className="text-cream/60 text-sm mb-7">
            Upload a photo, choose a verse, and see it come to life — then select any products you'd like.
          </p>
          <Link
            href="/customize"
            className="bg-gold text-white font-semibold px-9 py-3.5 rounded-full hover:opacity-90 transition-opacity inline-block text-sm"
          >
            Start Creating →
          </Link>
        </div>
      </section>
    </main>
  );
}
