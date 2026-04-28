import { Link, useParams } from "react-router-dom";
import { useStore } from "../store";

export default function OrderConfirmation() {
  const { id = "" } = useParams();
  const { getOrder } = useStore();
  const order = getOrder(id);

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-soft">Order not found.</p>
        <Link to="/" className="text-brand-400 hover:text-brand-300 mt-4 inline-block">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  const isPO = order.paymentMethod === "purchase_order";
  const placedDate = new Date(order.placedAt);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-emerald-400">
          <span className="w-2 h-2 bg-emerald-500" />
          {isPO ? "PO submitted" : "Payment received"}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-3 tracking-tightest">
          Thanks, {order.buyerLabel.split(" ")[0]}.
        </h1>
        <p className="text-ink-soft mt-1 text-sm">
          Receipt sent to <span className="text-ink">{order.buyerEmail}</span>
        </p>
      </div>

      <div className="mt-8 border border-line bg-surface">
        <div className="px-6 py-4 border-b border-line grid grid-cols-2 md:grid-cols-4 gap-4">
          <Meta label="Order" value={order.id} mono />
          <Meta label="Placed" value={placedDate.toLocaleString()} />
          <Meta label="Payment" value={order.paymentRef} mono />
          {isPO && order.netTerms ? (
            <Meta
              label="Due"
              value={
                new Date(
                  placedDate.getTime() + order.netTerms * 24 * 60 * 60 * 1000,
                ).toLocaleDateString() + ` (Net ${order.netTerms})`
              }
            />
          ) : (
            <Meta label="Status" value="Processing" />
          )}
        </div>

        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.listingId} className="flex items-center gap-4 px-6 py-4">
              <span className="text-3xl">{i.imageEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-ink truncate">{i.title}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-mute">
                  {i.quantity} × ${i.unitPrice.toFixed(2)} {i.unit}
                </div>
              </div>
              <div className="font-mono tabular text-ink">
                ${(i.unitPrice * i.quantity).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>

        <div className="px-6 py-4 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-1">
              Ship to
            </div>
            <div className="text-sm text-ink">{order.buyerLabel}</div>
            <div className="text-sm text-ink-soft">{order.shippingAddress}</div>
          </div>

          <dl className="text-sm space-y-1.5 sm:text-right font-mono tabular">
            <Row label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
            <Row label="Shipping" value={`$${order.shipping.toFixed(2)}`} />
            <Row label="Tax" value={`$${order.tax.toFixed(2)}`} />
            <div className="border-t border-line pt-2 mt-2 flex sm:justify-end gap-4">
              <dt className="text-ink">Total</dt>
              <dd className="font-semibold text-ink w-24 text-right">
                ${order.total.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/"
          className="px-6 h-11 leading-[44px] bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
        >
          Back to catalog
        </Link>
        <button
          onClick={() => window.print()}
          className="px-6 h-11 border border-line-strong text-ink font-mono text-xs uppercase tracking-widest hover:border-ink hover:bg-surface transition"
        >
          Print receipt
        </button>
      </div>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className={`text-sm text-ink mt-0.5 ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex sm:justify-end gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-ink w-24 text-right">{value}</dd>
    </div>
  );
}
