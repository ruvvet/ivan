import { Link } from "react-router-dom";
import { useStore } from "../store";

export default function Quotes() {
  const { quotes, projectById } = useStore();

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Workspace
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
        Quotes / RFQ
      </h1>
      <p className="text-sm text-ink-soft mt-1">
        Request pricing from multiple suppliers. Vendor responses arrive in seconds.
      </p>

      <div className="mt-6 border border-line bg-surface">
        {quotes.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="text-ink-soft text-sm">No quotes yet.</div>
            <Link
              to="/cart"
              className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
            >
              Send your first RFQ from the cart →
            </Link>
          </div>
        ) : (
          <>
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
                  <th className="px-5 py-3 font-medium">RFQ</th>
                  <th className="px-5 py-3 font-medium">Project</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Vendors</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const responded = q.vendorRequests.filter((vr) => vr.status === "responded").length;
                  return (
                    <tr key={q.id} className="border-b border-line last:border-0 hover:bg-bg">
                      <td className="px-5 py-3">
                        <Link to={`/quotes/${q.id}`} className="font-mono text-xs text-ink hover:text-brand-400">
                          {q.id}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-ink-soft">
                        {q.projectId ? projectById(q.projectId)?.name ?? q.projectId : "—"}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{q.items.length}</td>
                      <td className="px-5 py-3 font-mono tabular text-ink-soft">
                        {responded}/{q.vendorRequests.length}
                      </td>
                      <td className="px-5 py-3"><QStatus status={q.status} /></td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-mute">
                        {new Date(q.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-line">
              {quotes.map((q) => {
                const responded = q.vendorRequests.filter((vr) => vr.status === "responded").length;
                return (
                  <li key={q.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link to={`/quotes/${q.id}`} className="font-mono text-xs text-ink hover:text-brand-400">
                        {q.id}
                      </Link>
                      <QStatus status={q.status} />
                    </div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-ink-mute">
                      {new Date(q.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute">Project</div>
                        <div className="text-ink truncate">{q.projectId ? projectById(q.projectId)?.name ?? "—" : "—"}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute">Items</div>
                        <div className="text-ink font-mono tabular">{q.items.length}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-mute">Responded</div>
                        <div className="text-ink font-mono tabular">{responded}/{q.vendorRequests.length}</div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function QStatus({ status }: { status: string }) {
  const cls =
    status === "open"
      ? "border-hi/30 text-hi"
      : status === "accepted"
      ? "border-emerald-500/30 text-emerald-400"
      : "border-line text-ink-soft";
  return (
    <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${cls}`}>
      {status}
    </span>
  );
}
