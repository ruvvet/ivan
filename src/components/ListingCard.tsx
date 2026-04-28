import { Link } from "react-router-dom";
import { useStore } from "../store";
import type { Listing } from "../types";

export default function ListingCard({ listing }: { listing: Listing }) {
  const { sellerById } = useStore();
  const seller = sellerById(listing.sellerId);

  return (
    <Link
      to={`/product/${listing.id}`}
      className="group block bg-surface border border-line hover:border-line-strong transition"
    >
      <div className="relative aspect-square bg-bg border-b border-line overflow-hidden flex items-center justify-center text-7xl">
        <span className="opacity-90 group-hover:opacity-100 transition">
          {listing.imageEmoji}
        </span>

        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-mute bg-bg/80 backdrop-blur px-1.5 py-0.5 border border-line">
            {listing.sku}
          </span>
          {!listing.inStock && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-rose-400 bg-bg/80 backdrop-blur px-1.5 py-0.5 border border-rose-500/30">
              OOS
            </span>
          )}
        </div>

        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 ${
              listing.inStock ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">
            Lead {listing.leadTimeDays}d
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
          {listing.category}
        </div>
        <h3 className="text-sm text-ink mt-1 leading-snug clamp-2 group-hover:text-brand-400 transition">
          {listing.title}
        </h3>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="font-mono text-base text-ink tabular">
            ${listing.price.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-mute">
            {listing.unit.replace("per ", "/")}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-line text-[11px] text-ink-soft truncate">
          {seller?.name}
        </div>
      </div>
    </Link>
  );
}
