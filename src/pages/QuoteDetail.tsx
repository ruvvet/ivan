import { Link, useParams } from "react-router-dom";
import { useStore } from "../store";

export default function QuoteDetail() {
  const { id = "" } = useParams();
  const { quoteById, sellerById, projectById, acceptQuote } = useStore();
  const quote = quoteById(id);

  if (!quote) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft">RFQ not found.</p>
        <Link to="/quotes" className="text-brand-400 hover:text-brand-300 mt-4 inline-block">
          ← Quotes
        </Link>
      </div>
    );
  }

  const subtotal = quote.items.reduce(
    (s, i) => s + i.referencePrice * i.quantity,
    0,
  );
  const responded = quote.vendorRequests.filter((vr) => vr.status === "responded");

  return (
    <div>
      <Link
        to="/quotes"
        className="font-mono text-[11px] uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        ← Quotes
      </Link>
      <div className="mt-2 flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            RFQ · {new Date(quote.createdAt).toLocaleString()}
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest font-mono">
            {quote.id}
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            {quote.projectId
              ? `Project: ${projectById(quote.projectId)?.name ?? quote.projectId}`
              : "No project linked"}
          </p>
        </div>
        <span
          className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1 border ${
            quote.status === "open"
              ? "border-hi/30 text-hi"
              : quote.status === "accepted"
              ? "border-emerald-500/30 text-emerald-400"
              : "border-line text-ink-soft"
          }`}
        >
          {quote.status}
        </span>
      </div>

      {/* Items */}
      <section className="mt-6 border border-line bg-surface">
        <div className="px-5 py-3 border-b border-line font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          Items requested · {quote.items.length}
        </div>
        <table className="hidden md:table w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium text-right">Reference</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((it) => (
              <tr key={it.listingId} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-ink-soft">{it.sku}</td>
                <td className="px-5 py-3">
                  <span className="text-2xl mr-2">{it.imageEmoji}</span>
                  <span className="text-ink">{it.title}</span>
                </td>
                <td className="px-5 py-3 font-mono tabular text-ink">{it.quantity}</td>
                <td className="px-5 py-3 font-mono tabular text-right text-ink-soft">
                  ${(it.referencePrice * it.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="bg-bg/50">
              <td colSpan={3} className="px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-ink-mute text-right">
                Reference subtotal
              </td>
              <td className="px-5 py-3 font-mono tabular text-right text-ink">
                ${subtotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
        <ul className="md:hidden divide-y divide-line">
          {quote.items.map((it) => (
            <li key={it.listingId} className="p-4 flex gap-3">
              <span className="text-3xl">{it.imageEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                  {it.sku}
                </div>
                <div className="text-ink truncate">{it.title}</div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-ink-soft mt-1 tabular">
                  Qty {it.quantity} · ${(it.referencePrice * it.quantity).toFixed(2)}
                </div>
              </div>
            </li>
          ))}
          <li className="p-4 flex justify-between bg-bg/50">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Reference subtotal
            </span>
            <span className="font-mono tabular text-ink">${subtotal.toFixed(2)}</span>
          </li>
        </ul>
      </section>

      {/* Vendor responses */}
      <section className="mt-6 border border-line bg-surface">
        <div className="px-5 py-3 border-b border-line font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          Vendor responses · {responded.length}/{quote.vendorRequests.length}
        </div>
        <ul className="divide-y divide-line">
          {quote.vendorRequests
            .slice()
            .sort((a, b) => (a.responsePrice ?? 9e9) - (b.responsePrice ?? 9e9))
            .map((vr) => {
              const seller = sellerById(vr.sellerId);
              const lowest =
                responded.length > 0 &&
                responded.every(
                  (r) => (vr.responsePrice ?? 9e9) <= (r.responsePrice ?? 9e9),
                ) &&
                vr.status === "responded";
              return (
                <li key={vr.sellerId} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-ink flex items-center gap-2">
                        {seller?.name}
                        {lowest && quote.status === "open" && (
                          <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-emerald-500/30 text-emerald-400">
                            Lowest
                          </span>
                        )}
                        {quote.acceptedSellerId === vr.sellerId && (
                          <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-brand-500/30 text-brand-400">
                            Accepted
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-mute">{seller?.location}</div>
                    </div>
                    <div className="text-right">
                      {vr.status === "sent" && (
                        <div className="font-mono text-[11px] uppercase tracking-wider text-hi">
                          ● Awaiting…
                        </div>
                      )}
                      {vr.status === "declined" && (
                        <div className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
                          Declined
                        </div>
                      )}
                      {vr.status === "responded" && vr.responsePrice && (
                        <>
                          <div className="font-mono text-lg tabular text-ink">
                            ${vr.responsePrice.toFixed(2)}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
                            Lead {vr.responseLeadTime}d ·{" "}
                            {(((vr.responsePrice - subtotal) / subtotal) * 100).toFixed(1)}% vs ref
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {vr.responseNotes && (
                    <div className="mt-2 text-xs text-ink-soft">{vr.responseNotes}</div>
                  )}
                  {vr.status === "responded" && quote.status === "open" && (
                    <div className="mt-3">
                      <button
                        onClick={() => acceptQuote(quote.id, vr.sellerId)}
                        className="px-4 h-9 bg-ink text-bg font-mono text-[11px] uppercase tracking-widest hover:bg-brand-500 transition"
                      >
                        Accept this quote
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}
