import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <p className="font-bold text-lg mb-2">
            Legacy Verses<span className="text-gold">™</span>
          </p>
          <p className="text-sm text-cream/60 leading-relaxed">
            Where Memories Meet God's Word. Faith-based memorial T-shirts crafted with love, Scripture, and compassion.
          </p>
        </div>

        <div>
          <p className="font-semibold mb-4 text-gold text-xs uppercase tracking-widest">Navigate</p>
          <div className="flex flex-col gap-2 text-sm text-cream/60">
            <Link href="/" className="hover:text-gold transition-colors w-fit">Home</Link>
            <Link href="/products" className="hover:text-gold transition-colors w-fit">T-Shirts</Link>
            <Link href="/customize" className="hover:text-gold transition-colors w-fit">Design Yours</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-4 text-gold text-xs uppercase tracking-widest">Start an Order</p>
          <p className="text-sm text-cream/60 mb-3">
            Upload your photo, choose a scripture, and we'll handle the rest.
          </p>
          <Link href="/customize" className="text-gold hover:underline text-sm w-fit block">
            Customize now →
          </Link>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} Legacy Verses™. All rights reserved.</p>
          <p>Honoring Life · Preserving Legacy · Inspiring Faith</p>
        </div>
      </div>
    </footer>
  );
}
