import { Link } from "react-router-dom";
import { useStore } from "../store";

export default function Approvals() {
  const { orders, currentBusiness, approveOrder, denyOrder } = useStore();

  if (!currentBusiness) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft">Sign in as a business to view approvals.</p>
        <Link
          to="/login?next=/approvals"
          className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  const pending = orders.filter((o) => o.status === "pending_approval");
  const decided = orders.filter(
    (o) =>
      o.approval &&
      (o.approval.status === "approved" || o.approval.status === "denied"),
  );

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Workspace · {currentBusiness.name}
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
        Approval queue
      </h1>
      <p className="text-sm text-ink-soft mt-1">
        Orders over ${currentBusiness.approvalThreshold.toLocaleString()} require approval from{" "}
        <span className="text-ink">{currentBusiness.approverName}</span>.
      </p>

      <section className="mt-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-2">
          Pending · {pending.length}
        </div>
        {pending.length === 0 ? (
          <div className="border border-line bg-surface py-12 text-center text-sm text-ink-soft">
            No pending approvals.
          </div>
        ) : (
          <ul className="space-y-3">
            {pending.map((o) => (
              <li key={o.id} className="border border-hi/20 bg-surface p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                      {o.id} · {new Date(o.placedAt).toLocaleString()}
                    </div>
                    <div className="text-ink mt-1">
                      {o.items.length} line{o.items.length === 1 ? "" : "s"} ·{" "}
                      <span className="font-mono tabular">${o.total.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-ink-soft mt-1">
                      Submitted by {o.buyerLabel} · {o.paymentRef}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => denyOrder(o.id)}
                      className="px-4 h-10 border border-rose-500/30 text-rose-400 font-mono text-[11px] uppercase tracking-wider hover:bg-rose-500/10"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => approveOrder(o.id)}
                      className="px-4 h-10 bg-ink text-bg font-mono text-[11px] uppercase tracking-widest hover:bg-brand-500"
                    >
                      Approve
                    </button>
                  </div>
                </div>
                <ul className="mt-3 pt-3 border-t border-line text-xs text-ink-soft space-y-1 font-mono">
                  {o.items.map((i) => (
                    <li key={i.listingId} className="flex justify-between">
                      <span>
                        {i.quantity} × {i.title}
                      </span>
                      <span className="tabular">
                        ${(i.unitPrice * i.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-2">
          Decided · {decided.length}
        </div>
        {decided.length === 0 ? (
          <div className="border border-line bg-surface py-8 text-center text-sm text-ink-mute">
            No decisions yet.
          </div>
        ) : (
          <div className="border border-line bg-surface">
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Decision</th>
                  <th className="px-4 py-3 font-medium">Decided</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-ink">{o.id}</td>
                    <td className="px-4 py-3 font-mono tabular text-ink">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                          o.approval?.status === "approved"
                            ? "border-emerald-500/30 text-emerald-400"
                            : "border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {o.approval?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                      {o.approval?.decidedAt
                        ? new Date(o.approval.decidedAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="md:hidden divide-y divide-line">
              {decided.map((o) => (
                <li key={o.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs text-ink">{o.id}</span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        o.approval?.status === "approved"
                          ? "border-emerald-500/30 text-emerald-400"
                          : "border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {o.approval?.status}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs font-mono">
                    <span className="text-ink-mute">
                      {o.approval?.decidedAt ? new Date(o.approval.decidedAt).toLocaleString() : "—"}
                    </span>
                    <span className="text-ink tabular">${o.total.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
