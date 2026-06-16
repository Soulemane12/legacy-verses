import Link from "next/link";

interface ProductCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  items?: string[];
  variant?: "default" | "expanded";
}

export default function ProductCard({
  title,
  description,
  icon,
  href,
  items,
  variant = "default",
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-soft shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 h-full">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold text-navy text-lg">{title}</h3>
      <p className="text-charcoal/70 text-sm leading-relaxed">{description}</p>
      {items && variant === "expanded" && (
        <ul className="text-sm text-charcoal/60 flex flex-col gap-1 mt-1">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-gold text-xs">✦</span>
              {item}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-3">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-navy transition-colors"
        >
          {variant === "expanded" ? "Inquire Now" : "Learn More"} →
        </Link>
      </div>
    </div>
  );
}
