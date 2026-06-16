"use client";
import { useState } from "react";

const productOptions = [
  "Custom Scripture Portraits",
  "Faith-Inspired Memorial Apparel",
  "Memorial Home & Lifestyle Collection",
  "Family Legacy Collection",
  "Funeral & Church Memorial Package",
  "Other / Not Sure Yet",
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main>
      <section className="bg-navy py-20 px-4 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            Get in Touch
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-cream mb-4">Start Your Order</h1>
          <p className="text-cream/70 text-lg">
            Tell us about your loved one and what you'd like to create.
          </p>
        </div>
      </section>

      <section className="bg-soft py-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          {submitted ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-soft shadow-sm">
              <div className="text-5xl mb-5 text-gold">✦</div>
              <h2 className="text-2xl font-bold text-navy mb-2">Thank You</h2>
              <p className="text-charcoal/65 text-sm leading-relaxed">
                We've received your inquiry and will reach out to you soon with love and care.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 border border-soft shadow-sm flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-charcoal">
                  Full Name <span className="text-gold">*</span>
                </label>
                <input
                  required
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Smith"
                  className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-charcoal">
                  Email Address <span className="text-gold">*</span>
                </label>
                <input
                  required
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-charcoal">
                  Phone Number{" "}
                  <span className="text-charcoal/40 font-normal">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="product" className="text-sm font-medium text-charcoal">
                  Product Interest <span className="text-gold">*</span>
                </label>
                <select
                  required
                  id="product"
                  name="product"
                  className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors bg-white"
                >
                  <option value="">Select a collection...</option>
                  {productOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-sm font-medium text-charcoal">
                  Tell Us About Your Order <span className="text-gold">*</span>
                </label>
                <textarea
                  required
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Share details about your loved one, the occasion, scripture preferences, or anything else you'd like us to know..."
                  className="border border-soft rounded-lg px-4 py-2.5 text-sm text-charcoal outline-none focus:border-gold transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-navy text-cream font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 text-sm mt-1 cursor-pointer"
              >
                {loading ? "Sending..." : "Send My Inquiry"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
