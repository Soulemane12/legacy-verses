export const metadata = {
  title: "About Us — Legacy Verses™",
  description:
    "Learn about Legacy Verses™ — a faith-based memorial brand dedicated to helping families celebrate life, preserve memories, and find comfort through God's Word.",
};

const targets = [
  "Families honoring loved ones",
  "Churches and ministries",
  "Funeral homes",
  "Bereavement support groups",
  "Christian organizations",
  "Memorial event planners",
  "Hospice organizations",
  "Senior living communities",
  "Family reunion organizers",
];

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-navy py-20 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Our Story
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-cream mb-4">
            About Legacy Verses™
          </h1>
          <p className="text-cream/70 text-lg leading-relaxed">
            A faith-based memorial brand dedicated to helping families celebrate life, preserve
            memories, and find comfort through God's Word.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-cream py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">
              Who We Are
            </p>
            <h2 className="text-3xl font-bold text-navy mb-5">
              Honoring Life Through Faith & Art
            </h2>
            <p className="text-charcoal/70 leading-relaxed text-sm mb-4">
              Legacy Verses™ transforms cherished memories into timeless works of art by weaving
              meaningful Bible verses, personal stories, and treasured photographs into custom
              memorial products.
            </p>
            <p className="text-charcoal/70 leading-relaxed text-sm">
              We help families honor loved ones through faith-inspired designs that provide
              comfort, healing, hope, and a lasting connection to those who have gone before us.
              Our goal is to preserve every legacy through God's Word — creating meaningful
              keepsakes that can be shared, displayed, worn, and passed down for generations.
            </p>
          </div>
          <div className="bg-soft rounded-2xl p-8 border border-soft">
            <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">
              Our Vision
            </p>
            <p className="text-navy text-lg leading-relaxed font-light">
              To become the leading faith-based memorial and legacy brand in America, helping
              families celebrate life, preserve memories, and find comfort through God's Word —
              one portrait, one verse, one story, and one generation at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="bg-soft py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-6 text-center">
            The Legacy Verses™ Promise
          </p>
          <blockquote className="border-l-4 border-gold pl-8">
            <p className="text-charcoal text-xl sm:text-2xl leading-relaxed font-light italic">
              "Those we love never truly leave us. Their legacy lives on through faith, cherished
              memories, and the eternal promises found in God's Word."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="bg-cream py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold font-semibold text-xs uppercase tracking-widest mb-3">
            Who We Serve
          </p>
          <h2 className="text-3xl font-bold text-navy mb-10">Built for Every Family</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {targets.map((t) => (
              <div
                key={t}
                className="bg-soft rounded-xl px-5 py-4 text-sm text-charcoal/75 font-medium flex items-center gap-3"
              >
                <span className="text-gold shrink-0">✦</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-16 px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-bold text-cream mb-4">Ready to Honor a Legacy?</h2>
        <p className="text-cream/65 mb-8 text-sm">
          Reach out today and let us create something meaningful together.
        </p>
        <a
          href="/contact"
          className="bg-gold text-white font-semibold px-10 py-4 rounded-full hover:opacity-90 transition-opacity inline-block"
        >
          Start Your Order
        </a>
      </section>
    </main>
  );
}
