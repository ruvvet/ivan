import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PriceChart from "../components/PriceChart";
import { useStore } from "../store";

export default function ProductDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const {
    getListing,
    sellerById,
    offersForSku,
    addToCart,
    isWatched,
    toggleWatch,
    recordView,
    substitutesFor,
    reviewsFor,
    questionsFor,
    addReview,
    addQuestion,
    user,
    businessById,
  } = useStore();
  const listing = getListing(id);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (id) recordView(id);
  }, [id, recordView]);

  if (!listing) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft">Listing not found.</p>
        <Link to="/" className="text-brand-400 hover:text-brand-300 mt-4 inline-block">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  const seller = sellerById(listing.sellerId);
  const otherOffers = offersForSku(listing.sku).filter(
    (o) => o.listingId !== listing.id,
  );
  const substitutes = !listing.inStock ? substitutesFor(listing.id) : [];
  const reviews = reviewsFor(listing.id);
  const questions = questionsFor(listing.id);
  const watching = isWatched(listing.id);
  const stickyTotal = listing.price * qty;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : seller?.rating ?? 0;

  return (
    <div className="pb-20 lg:pb-0">
      <Link
        to="/"
        className="font-mono text-[11px] uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        ← Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
        <div className="lg:col-span-3">
          <div className="aspect-square bg-surface border border-line flex items-center justify-center text-7xl sm:text-9xl lg:text-[14rem] relative">
            <span className="opacity-90">{listing.imageEmoji}</span>
            <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest text-ink-mute border border-line px-2 py-1 bg-bg/60 backdrop-blur">
              {listing.sku}
            </div>
            <button
              onClick={() => toggleWatch(listing.id)}
              className={`absolute top-3 right-3 px-3 h-9 border font-mono text-[11px] uppercase tracking-widest backdrop-blur transition ${
                watching
                  ? "border-brand-500 bg-brand-500 text-bg"
                  : "border-line bg-bg/60 text-ink-soft hover:border-line-strong hover:text-ink"
              }`}
            >
              {watching ? "★ Watching" : "☆ Watch"}
            </button>
            <div className="hidden sm:block absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              001 / 001
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              {listing.category}
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-2 leading-tight tracking-tightest">
              {listing.title}
            </h1>
          </div>

          <div className="border-t border-line pt-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Unit price
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-3xl text-ink tabular">
                ${listing.price.toFixed(2)}
              </span>
              <span className="text-xs text-ink-soft">{listing.unit}</span>
            </div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              ★ {avgRating.toFixed(1)} · {reviews.length} review
              {reviews.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusPill
              tone={listing.inStock ? "ok" : "bad"}
              label={listing.inStock ? "In stock" : "Out of stock"}
            />
            <StatusPill tone="neutral" label={`Lead ${listing.leadTimeDays} days`} />
            <StatusPill tone="neutral" label={seller?.name ?? ""} />
            {seller?.location && (
              <StatusPill tone="neutral" label={seller.location} />
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                Quantity
              </label>
              <div className="inline-flex items-center border border-line">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 text-ink-soft hover:bg-surface hover:text-ink"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-14 h-9 text-center bg-transparent text-ink outline-none border-x border-line font-mono tabular"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="w-9 h-9 text-ink-soft hover:bg-surface hover:text-ink"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                addToCart(listing.id, qty);
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 1600);
              }}
              disabled={!listing.inStock}
              className="w-full h-11 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {!listing.inStock
                ? "Out of stock"
                : justAdded
                ? "✓ Added"
                : "Add to cart"}
            </button>
            <button
              onClick={() => {
                addToCart(listing.id, qty);
                navigate("/cart");
              }}
              disabled={!listing.inStock}
              className="w-full h-11 bg-transparent border border-line-strong text-ink font-mono text-xs uppercase tracking-widest hover:border-ink hover:bg-surface transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Buy now · ${(listing.price * qty).toFixed(2)}
            </button>
            <Link
              to={`/compare?sku=${encodeURIComponent(listing.sku)}`}
              className="block text-center w-full h-11 leading-[44px] border border-line text-ink-soft font-mono text-[11px] uppercase tracking-wider hover:text-ink hover:border-line-strong transition"
            >
              Compare {otherOffers.length} other vendor
              {otherOffers.length === 1 ? "" : "s"} →
            </Link>
          </div>

          <a
            href={listing.specSheetUrl}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
          >
            ↗ Spec sheet (PDF)
          </a>
        </div>
      </div>

      {/* OOS substitutes */}
      {substitutes.length > 0 && (
        <section className="mt-12 border border-hi/20 bg-surface p-6">
          <SectionLabel>
            <span className="text-hi">●</span> This item is out of stock — alternates available
          </SectionLabel>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {substitutes.map((s) => (
              <Link
                key={s.id}
                to={`/product/${s.id}`}
                className="border border-line bg-bg p-3 hover:border-line-strong transition"
              >
                <div className="aspect-square flex items-center justify-center text-5xl bg-surface border border-line">
                  {s.imageEmoji}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                  {s.sku}
                </div>
                <div className="text-sm text-ink truncate">{s.title}</div>
                <div className="font-mono tabular text-ink mt-1">
                  ${s.price.toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 border border-line bg-surface p-6">
        <SectionLabel>Description</SectionLabel>
        <p className="mt-3 text-ink leading-relaxed max-w-3xl">
          {listing.description}
        </p>
      </section>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 border border-line bg-surface p-6">
          <SectionLabel>Price history · 12 months</SectionLabel>
          <div className="mt-4">
            <PriceChart data={listing.priceHistory} unit={listing.unit} />
          </div>
        </section>

        <section className="border border-line bg-surface p-6">
          <SectionLabel>Specifications</SectionLabel>
          <dl className="mt-4 divide-y divide-line">
            {Object.entries(listing.specs).map(([k, v]) => (
              <div key={k} className="py-2.5 flex justify-between gap-4 text-sm">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">
                  {k}
                </dt>
                <dd className="text-ink text-right font-mono tabular">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {otherOffers.length > 0 && (
        <section className="mt-6 border border-line bg-surface">
          <div className="p-4 sm:p-6 border-b border-line">
            <SectionLabel>Other vendors / same SKU</SectionLabel>
          </div>
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
                <th className="px-6 py-3 font-medium">Vendor</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Lead</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {otherOffers.map((o) => {
                const s = sellerById(o.sellerId);
                const delta = o.price - listing.price;
                return (
                  <tr key={o.listingId} className="border-b border-line last:border-0 hover:bg-bg">
                    <td className="px-6 py-3">
                      <div className="text-ink">{s?.name}</div>
                      <div className="text-xs text-ink-mute">{s?.location}</div>
                    </td>
                    <td className="px-6 py-3 font-mono tabular">
                      <div className="text-ink">${o.price.toFixed(2)}</div>
                      <div className={`text-[11px] ${delta < 0 ? "text-emerald-400" : delta > 0 ? "text-rose-400" : "text-ink-mute"}`}>
                        {delta < 0 ? "" : "+"}${delta.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-mono tabular text-ink-soft">{o.leadTimeDays}d</td>
                    <td className="px-6 py-3 font-mono tabular text-ink-soft">★ {s?.rating.toFixed(1)}</td>
                    <td className="px-6 py-3 text-right">
                      <Link to={`/product/${o.listingId}`} className="font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300">
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ul className="md:hidden divide-y divide-line">
            {otherOffers.map((o) => {
              const s = sellerById(o.sellerId);
              const delta = o.price - listing.price;
              return (
                <li key={o.listingId}>
                  <Link to={`/product/${o.listingId}`} className="block p-4 hover:bg-bg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-ink truncate">{s?.name}</div>
                        <div className="text-xs text-ink-mute truncate">{s?.location}</div>
                      </div>
                      <div className="text-right font-mono tabular shrink-0">
                        <div className="text-ink">${o.price.toFixed(2)}</div>
                        <div className={`text-[11px] ${delta < 0 ? "text-emerald-400" : delta > 0 ? "text-rose-400" : "text-ink-mute"}`}>
                          {delta < 0 ? "" : "+"}${delta.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between font-mono text-[11px] uppercase tracking-wider text-ink-mute">
                      <span>★ {s?.rating.toFixed(1)} · lead {o.leadTimeDays}d</span>
                      <span className="text-brand-400">View →</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Reviews + Q&A */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="border border-line bg-surface">
          <div className="px-6 py-4 border-b border-line flex items-center justify-between">
            <SectionLabel>Reviews · {reviews.length}</SectionLabel>
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              ★ {avgRating.toFixed(1)}
            </span>
          </div>
          <ul className="divide-y divide-line">
            {reviews.map((r) => (
              <li key={r.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-ink text-sm">
                    {r.authorName}
                    {r.verified && (
                      <span className="ml-2 font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-emerald-500/30 text-emerald-400">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] tabular text-ink-soft">
                    ★ {r.rating.toFixed(1)} · {r.createdAt}
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{r.body}</p>
              </li>
            ))}
          </ul>
          <ReviewForm
            listingId={listing.id}
            defaultName={
              user.type === "individual"
                ? user.name
                : user.type === "business"
                ? businessById(user.businessId)?.contactName ?? ""
                : ""
            }
            onSubmit={(rating, body, name) =>
              addReview(listing.id, { rating, body, authorName: name })
            }
          />
        </section>

        <section className="border border-line bg-surface">
          <div className="px-6 py-4 border-b border-line">
            <SectionLabel>Questions · {questions.length}</SectionLabel>
          </div>
          <ul className="divide-y divide-line">
            {questions.map((q) => (
              <li key={q.id} className="px-6 py-4">
                <div className="text-sm text-ink">Q: {q.body}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-mute mt-1">
                  Asked by {q.askerName}
                </div>
                {q.answer ? (
                  <div className="mt-3 pl-3 border-l border-brand-500/40">
                    <div className="text-sm text-ink-soft">A: {q.answer.body}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ink-mute mt-1">
                      {q.answer.authorName}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-hi">
                    ● Awaiting reply
                  </div>
                )}
              </li>
            ))}
          </ul>
          <QuestionForm
            defaultName={
              user.type === "individual"
                ? user.name
                : user.type === "business"
                ? businessById(user.businessId)?.contactName ?? ""
                : ""
            }
            onSubmit={(name, body) => addQuestion(listing.id, name, body)}
          />
        </section>
      </div>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-sm border-t border-line-strong">
        <div className="px-4 py-2 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              {qty} × ${listing.price.toFixed(2)}
            </div>
            <div className="font-mono tabular text-ink text-base">
              ${stickyTotal.toFixed(2)}
            </div>
          </div>
          <div className="inline-flex items-center border border-line">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-9 h-10 text-ink-soft hover:bg-surface hover:text-ink"
            >
              −
            </button>
            <span className="w-8 text-center bg-transparent text-ink font-mono tabular">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="w-9 h-10 text-ink-soft hover:bg-surface hover:text-ink"
            >
              +
            </button>
          </div>
          <button
            onClick={() => {
              addToCart(listing.id, qty);
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 1600);
            }}
            disabled={!listing.inStock}
            className="px-4 h-11 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {!listing.inStock ? "OOS" : justAdded ? "✓" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewForm({
  listingId,
  defaultName,
  onSubmit,
}: {
  listingId: string;
  defaultName: string;
  onSubmit: (rating: number, body: string, name: string) => void;
}) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [name, setName] = useState(defaultName);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim() || !name.trim()) return;
        onSubmit(rating, body.trim(), name.trim());
        setBody("");
      }}
      key={listingId}
      className="px-6 py-4 border-t border-line bg-bg/30 space-y-2"
    >
      <div className="flex gap-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 px-3 py-2 bg-bg border border-line text-sm text-ink focus:outline-none focus:border-brand-500"
        />
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="px-3 py-2 bg-bg border border-line text-sm text-ink font-mono"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              ★ {r}
            </option>
          ))}
        </select>
      </div>
      <textarea
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="Write a review…"
        className="w-full px-3 py-2 bg-bg border border-line text-sm text-ink focus:outline-none focus:border-brand-500"
      />
      <button
        type="submit"
        className="px-4 h-9 bg-ink text-bg font-mono text-[11px] uppercase tracking-widest hover:bg-brand-500"
      >
        Post review
      </button>
    </form>
  );
}

function QuestionForm({
  defaultName,
  onSubmit,
}: {
  defaultName: string;
  onSubmit: (name: string, body: string) => void;
}) {
  const [body, setBody] = useState("");
  const [name, setName] = useState(defaultName);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim() || !name.trim()) return;
        onSubmit(name.trim(), body.trim());
        setBody("");
      }}
      className="px-6 py-4 border-t border-line bg-bg/30 space-y-2"
    >
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full px-3 py-2 bg-bg border border-line text-sm text-ink focus:outline-none focus:border-brand-500"
      />
      <textarea
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="Ask a question…"
        className="w-full px-3 py-2 bg-bg border border-line text-sm text-ink focus:outline-none focus:border-brand-500"
      />
      <button
        type="submit"
        className="px-4 h-9 bg-ink text-bg font-mono text-[11px] uppercase tracking-widest hover:bg-brand-500"
      >
        Post question
      </button>
    </form>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
      {children}
    </div>
  );
}

function StatusPill({
  tone,
  label,
}: {
  tone: "ok" | "bad" | "neutral";
  label: string;
}) {
  const cls =
    tone === "ok"
      ? "border-emerald-500/30 text-emerald-400"
      : tone === "bad"
      ? "border-rose-500/30 text-rose-400"
      : "border-line text-ink-soft";
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] uppercase tracking-wider px-2 py-1 border ${cls} bg-bg`}
    >
      {label}
    </span>
  );
}
