import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { useStore } from "../store";

export default function Marketplace() {
  const { listings, recent, getListing } = useStore();
  const recentItems = recent
    .map((id) => getListing(id))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .slice(0, 6);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (category && l.category !== category) return false;
      if (
        query &&
        !`${l.title} ${l.sku} ${l.description}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [listings, query, category]);

  const hasFilter = !!query || !!category;
  const inStockCount = filtered.filter((l) => l.inStock).length;
  const avgPrice =
    filtered.length > 0
      ? filtered.reduce((s, l) => s + l.price, 0) / filtered.length
      : 0;
  const avgLead =
    filtered.length > 0
      ? filtered.reduce((s, l) => s + l.leadTimeDays, 0) / filtered.length
      : 0;

  return (
    <div>
      {/* Header / Stats strip */}
      <section className="border border-line bg-surface mb-8">
        <div className="px-6 py-5 border-b border-line flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              {category ? `Category / ${category}` : query ? `Search / "${query}"` : "Catalog / All"}
            </div>
            <h1 className="text-2xl font-semibold text-ink mt-1 tracking-tight">
              {category || (query ? `Results for "${query}"` : "Material Catalog")}
            </h1>
            <p className="text-sm text-ink-soft mt-1 max-w-2xl">
              Build-grade materials with verified specs, transparent lead
              times, and side-by-side vendor comparison.
            </p>
          </div>
          {hasFilter && (
            <button
              onClick={() => setSearchParams({})}
              className="font-mono text-[11px] uppercase tracking-wider text-ink-soft hover:text-ink border border-line hover:border-line-strong px-3 py-1.5"
            >
              Clear ×
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-line">
          <Stat label="Listings" value={filtered.length.toLocaleString()} />
          <Stat label="In stock" value={`${inStockCount}/${filtered.length}`} />
          <Stat label="Avg price" value={`$${avgPrice.toFixed(2)}`} />
          <Stat label="Avg lead" value={`${avgLead.toFixed(1)}d`} />
        </div>
      </section>

      {!hasFilter && recentItems.length > 0 && (
        <section className="mb-8">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-3">
            Recently viewed
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentItems.map((l) => (
              <Link
                key={l.id}
                to={`/product/${l.id}`}
                className="shrink-0 w-44 border border-line bg-surface hover:border-line-strong transition"
              >
                <div className="aspect-square flex items-center justify-center text-5xl bg-bg border-b border-line">
                  {l.imageEmoji}
                </div>
                <div className="p-2">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute truncate">
                    {l.sku}
                  </div>
                  <div className="text-xs text-ink truncate">{l.title}</div>
                  <div className="font-mono tabular text-sm text-ink mt-1">
                    ${l.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 ? (
        <div className="border border-line bg-surface py-16 text-center">
          <p className="text-ink-soft">No items match your filter.</p>
          <button
            onClick={() => setSearchParams({})}
            className="mt-4 font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
          >
            Show everything
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className="font-mono text-xl text-ink mt-1 tabular">{value}</div>
    </div>
  );
}
