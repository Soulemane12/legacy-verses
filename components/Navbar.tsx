"use client";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "T-Shirts" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-soft shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl text-navy tracking-tight">
          Legacy Verses<span className="text-gold">™</span>
        </Link>

        <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-charcoal">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-gold transition-colors">
              {l.label}
            </Link>
          ))}
          <Link
            href="/customize"
            className="bg-gold text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Design Yours
          </Link>
        </div>

        <button
          className="sm:hidden p-2 flex flex-col gap-1.5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          <span className={`block w-5 h-0.5 bg-charcoal transition-all duration-200 origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-charcoal transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-charcoal transition-all duration-200 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-soft bg-white px-4 py-4 flex flex-col gap-4 text-sm font-medium text-charcoal">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="hover:text-gold transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/customize" onClick={() => setOpen(false)} className="text-gold font-semibold">
            Design Yours →
          </Link>
        </div>
      )}
    </nav>
  );
}
