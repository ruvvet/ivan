import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    listings,
    sellerById,
    setCartQty,
    removeFromCart,
    cartSubtotal,
    shippingFlat,
    taxRate,
    bulkAddToCart,
    sellers,
    createQuote,
    user,
    businessById,
    projects,
  } = useStore();

  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [showRFQ, setShowRFQ] = useState(false);

  const shipping = shippingFlat;
  const tax = Math.round(cartSubtotal * taxRate * 100) / 100;
  const total = Math.round((cartSubtotal + shipping + tax) * 100) / 100;

  function parseAndAdd() {
    const lines = bulkText.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const rows: Array<{ sku: string; quantity: number }> = [];
    for (const line of lines) {
      const [sku, qty] = line.split(/[,\t\s]+/).filter(Boolean);
      if (!sku) continue;
      const q = parseInt(qty ?? "1", 10);
      rows.push({ sku, quantity: isNaN(q) ? 1 : q });
    }
    const r = bulkAddToCart(rows);
    setBulkResult(
      r.notFound.length > 0
        ? `Added ${r.added} units. SKU not found: ${r.notFound.join(", ")}`
        : `Added ${r.added} units across ${rows.length} line${rows.length === 1 ? "" : "s"}.`,
    );
    setBulkText("");
  }

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Cart / {cart.length} item{cart.length === 1 ? "" : "s"}
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
        Your cart
      </h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bulk add */}
          <section className="border border-line bg-surface">
            <div className="px-5 py-3 border-b border-line flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                Bulk add · paste your takeoff list
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
                Format: SKU, qty
              </span>
            </div>
            <div className="p-4">
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={3}
                placeholder={"REBAR-#5-20FT, 240\nLMB-2X4-8-SPF, 600\nDRY-1/2-4X8, 80"}
                className="w-full px-3 py-2 bg-bg border border-line text-sm text-ink font-mono placeholder-ink-mute focus:outline-none focus:border-brand-500"
              />
              <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={parseAndAdd}
                  disabled={!bulkText.trim()}
                  className="px-4 h-9 bg-ink text-bg font-mono text-[11px] uppercase tracking-widest hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Parse + add to cart
                </button>
                {bulkResult && (
                  <span
                    className={`text-xs ${
                      bulkResult.includes("not found")
                        ? "text-hi"
                        : "text-emerald-400"
                    }`}
                  >
                    {bulkResult}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Items */}
          {cart.length === 0 ? (
            <div className="border border-line bg-surface py-16 text-center">
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                Cart / empty
              </div>
              <h2 className="text-xl font-semibold text-ink mt-3">No items</h2>
              <p className="text-ink-soft mt-2 text-sm">
                Add materials from the catalog or paste a SKU list above.
              </p>
              <Link
                to="/"
                className="mt-6 inline-block px-6 h-10 leading-10 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
              >
                Browse catalog
              </Link>
            </div>
          ) : (
            <div className="border border-line bg-surface">
              <ul className="divide-y divide-line">
                {cart.map((c) => {
                  const l = listings.find((x) => x.id === c.listingId);
                  if (!l) return null;
                  const seller = sellerById(l.sellerId);
                  const lineTotal = l.price * c.quantity;
                  return (
                    <li key={c.listingId} className="flex gap-4 p-4">
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
                          className="text-ink hover:text-brand-400 truncate block mt-0.5"
                        >
                          {l.title}
                        </Link>
                        <div className="text-xs text-ink-mute mt-0.5">
                          {seller?.name} · {l.leadTimeDays}d lead
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="inline-flex items-center border border-line text-sm">
                            <button
                              onClick={() => setCartQty(l.id, c.quantity - 1)}
                              className="w-8 h-8 text-ink-soft hover:bg-bg hover:text-ink"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={c.quantity}
                              onChange={(e) =>
                                setCartQty(l.id, Math.max(1, Number(e.target.value) || 1))
                              }
                              className="w-12 h-8 text-center bg-transparent text-ink outline-none border-x border-line font-mono tabular"
                            />
                            <button
                              onClick={() => setCartQty(l.id, c.quantity + 1)}
                              className="w-8 h-8 text-ink-soft hover:bg-bg hover:text-ink"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(l.id)}
                            className="font-mono text-[10px] uppercase tracking-wider text-ink-mute hover:text-rose-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-base text-ink tabular">
                          ${lineTotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-ink-mute mt-0.5">
                          {c.quantity} × ${l.price.toFixed(2)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* RFQ */}
          {cart.length > 0 && (
            <section className="border border-line bg-surface">
              <div className="px-5 py-3 border-b border-line flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                  Request a quote · skip checkout, ask vendors directly
                </span>
                <button
                  onClick={() => setShowRFQ((v) => !v)}
                  className="font-mono text-[10px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
                >
                  {showRFQ ? "Cancel" : "Open RFQ →"}
                </button>
              </div>
              {showRFQ && (
                <RFQForm
                  onSubmit={(vendorIds, projectId) => {
                    const items = cart
                      .map((c) => {
                        const l = listings.find((x) => x.id === c.listingId);
                        if (!l) return null;
                        return {
                          listingId: l.id,
                          sku: l.sku,
                          title: l.title,
                          imageEmoji: l.imageEmoji,
                          quantity: c.quantity,
                          referencePrice: l.price,
                        };
                      })
                      .filter((x): x is NonNullable<typeof x> => x !== null);
                    const buyerLabel =
                      user.type === "business"
                        ? businessById(user.businessId)?.name ?? "Business"
                        : user.type === "individual"
                        ? user.name
                        : "Guest";
                    const buyerEmail =
                      user.type === "business"
                        ? businessById(user.businessId)?.email ?? ""
                        : user.type === "individual"
                        ? user.email
                        : "";
                    const id = createQuote({
                      items,
                      vendorIds,
                      buyerLabel,
                      buyerEmail,
                      projectId: projectId || undefined,
                    });
                    navigate(`/quotes/${id}`);
                  }}
                  sellers={sellers.filter((s) => s.id !== "s_you")}
                  projects={projects}
                />
              )}
            </section>
          )}
        </div>

        {cart.length > 0 && (
          <aside className="border border-line bg-surface p-5 h-fit">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Order summary
            </div>
            <dl className="mt-4 space-y-2 text-sm font-mono tabular">
              <Row label="Subtotal" value={`$${cartSubtotal.toFixed(2)}`} />
              <Row label="Shipping" value={`$${shipping.toFixed(2)}`} />
              <Row label="Tax (est.)" value={`$${tax.toFixed(2)}`} />
              <div className="border-t border-line pt-3 flex justify-between text-base">
                <dt className="text-ink">Total</dt>
                <dd className="text-ink font-semibold">${total.toFixed(2)}</dd>
              </div>
            </dl>
            <button
              onClick={() => navigate("/checkout")}
              className="mt-5 w-full h-11 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
            >
              Checkout →
            </button>
            <Link
              to="/"
              className="mt-3 block text-center font-mono text-[10px] uppercase tracking-wider text-ink-mute hover:text-ink"
            >
              Continue shopping
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function RFQForm({
  onSubmit,
  sellers,
  projects,
}: {
  onSubmit: (vendorIds: string[], projectId: string) => void;
  sellers: Array<{ id: string; name: string; location: string; rating: number }>;
  projects: Array<{ id: string; name: string }>;
}) {
  const [selected, setSelected] = useState<string[]>(sellers.map((s) => s.id));
  const [project, setProject] = useState("");

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
          Send to vendors ({selected.length})
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sellers.map((s) => {
            const active = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className={`text-left border p-3 transition ${
                  active
                    ? "border-brand-500 bg-brand-500/5"
                    : "border-line bg-bg hover:border-line-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-ink text-sm">{s.name}</span>
                  <span
                    className={`w-3.5 h-3.5 border ${
                      active ? "border-brand-500 bg-brand-500" : "border-line-strong"
                    }`}
                  />
                </div>
                <div className="text-xs text-ink-mute mt-1 font-mono uppercase tracking-wider">
                  ★ {s.rating.toFixed(1)} · {s.location}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
          Link to project (optional)
        </label>
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="w-full px-3 py-2 bg-bg border border-line text-sm text-ink focus:outline-none focus:border-brand-500"
        >
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onSubmit(selected, project)}
        disabled={selected.length === 0}
        className="px-5 h-10 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Send RFQ to {selected.length} vendor{selected.length === 1 ? "" : "s"}
      </button>
    </div>
  );
}
