import { Link } from "react-router-dom";
import { useStore } from "../store";

export default function Watchlist() {
  const {
    watchlist,
    listings,
    sellerById,
    toggleWatch,
    setWatchThreshold,
  } = useStore();

  const items = watchlist
    .map((w) => {
      const l = listings.find((x) => x.id === w.listingId);
      return l ? { w, l } : null;
    })
    .filter((x): x is { w: typeof watchlist[number]; l: typeof listings[number] } => x !== null);

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Workspace
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
        Watchlist
      </h1>
      <p className="text-sm text-ink-soft mt-1">
        Save items, set price alerts, get notified when out-of-stock items return.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 border border-line bg-surface py-16 text-center">
          <p className="text-ink-soft text-sm">Nothing watched yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
          >
            Browse catalog →
          </Link>
        </div>
      ) : (
        <div className="mt-6 border border-line bg-surface">
          <ul className="divide-y divide-line">
            {items.map(({ w, l }) => {
              const triggered =
                w.threshold !== undefined && l.price <= w.threshold;
              return (
                <li key={l.id} className="flex gap-4 p-4">
                  <Link
                    to={`/product/${l.id}`}
                    className="w-20 h-20 shrink-0 flex items-center justify-center text-4xl bg-bg border border-line"
                  >
                    {l.imageEmoji}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                      {l.sku}
                    </div>
                    <Link
                      to={`/product/${l.id}`}
                      className="text-ink hover:text-brand-400"
                    >
                      {l.title}
                    </Link>
                    <div className="text-xs text-ink-mute mt-0.5">
                      {sellerById(l.sellerId)?.name} ·{" "}
                      {l.inStock ? (
                        <span className="text-emerald-400">In stock</span>
                      ) : (
                        <span className="text-rose-400">Out of stock</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
                        Notify if &lt;
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={w.threshold ?? ""}
                        placeholder="—"
                        onChange={(e) => {
                          const v = e.target.value;
                          setWatchThreshold(
                            l.id,
                            v === "" ? undefined : Number(v),
                          );
                        }}
                        className="w-24 px-2 py-1 bg-bg border border-line text-sm text-ink font-mono tabular focus:outline-none focus:border-brand-500"
                      />
                      {triggered && (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-emerald-500/30 text-emerald-400">
                          ● Below threshold
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-base text-ink tabular">
                      ${l.price.toFixed(2)}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
                      {l.unit}
                    </div>
                    <button
                      onClick={() => toggleWatch(l.id)}
                      className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ink-mute hover:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
