import { Link } from "react-router-dom";
import { useStore } from "../store";

export default function Orders() {
  const { orders, projectById, addToCart } = useStore();

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Workspace
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
        Orders
      </h1>
      <p className="text-sm text-ink-soft mt-1">
        Order history. Reorder past line-items in one click.
      </p>

      <div className="mt-6 border border-line bg-surface">
        {orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink-soft">
            No orders placed yet.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-bg">
                    <td className="px-5 py-3">
                      <Link
                        to={`/order/${o.id}`}
                        className="font-mono text-xs text-ink hover:text-brand-400"
                      >
                        {o.id}
                      </Link>
                      <div className="text-[10px] text-ink-mute font-mono">
                        {new Date(o.placedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft text-xs">
                      {o.projectId ? projectById(o.projectId)?.name ?? o.projectId : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-soft text-xs">{o.items.length}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-5 py-3 font-mono tabular text-right text-ink">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => {
                          for (const i of o.items) addToCart(i.listingId, i.quantity);
                          alert(`Added ${o.items.length} line items to cart.`);
                        }}
                        className="font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="md:hidden divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/order/${o.id}`}
                      className="font-mono text-xs text-ink hover:text-brand-400"
                    >
                      {o.id}
                    </Link>
                    <StatusPill status={o.status} />
                  </div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-ink-mute">
                    {new Date(o.placedAt).toLocaleString()}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <Mini label="Project" value={o.projectId ? projectById(o.projectId)?.name ?? o.projectId : "—"} />
                    <Mini label="Items" value={String(o.items.length)} />
                    <Mini label="Total" value={`$${o.total.toFixed(2)}`} mono />
                  </div>
                  <button
                    onClick={() => {
                      for (const i of o.items) addToCart(i.listingId, i.quantity);
                      alert(`Added ${o.items.length} line items to cart.`);
                    }}
                    className="mt-3 w-full h-10 border border-line-strong text-ink font-mono text-[11px] uppercase tracking-widest hover:bg-bg"
                  >
                    Reorder
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_approval: "border-hi/30 text-hi",
    placed: "border-emerald-500/30 text-emerald-400",
    shipped: "border-brand-500/30 text-brand-400",
    delivered: "border-line text-ink-soft",
  };
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${map[status] ?? "border-line text-ink-soft"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function Mini({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className={`text-ink truncate ${mono ? "font-mono tabular" : ""}`}>{value}</div>
    </div>
  );
}
