import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "../store";

export default function SellerAnalytics() {
  const { myListings, orders, currentSellerId } = useStore();

  // Sales for "you" — orders containing your line items
  const sellerSales = useMemo(() => {
    return orders.flatMap((o) =>
      o.items
        .filter((i) => i.sellerId === currentSellerId)
        .map((i) => ({
          orderId: o.id,
          listingId: i.listingId,
          title: i.title,
          revenue: i.unitPrice * i.quantity,
          quantity: i.quantity,
          placedAt: o.placedAt,
        })),
    );
  }, [orders, currentSellerId]);

  // Build last-12-month revenue (currently zero except recent) — combine real + synthetic
  const monthlyRevenue = useMemo(() => {
    const months = [
      "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10",
      "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04",
    ];
    const synthetic = [
      4200, 5100, 4800, 6300, 7200, 8100, 9300, 8800, 9900, 11200, 10400, 12800,
    ];
    return months.map((m, idx) => {
      const realRev = sellerSales
        .filter((s) => s.placedAt.startsWith(m))
        .reduce((sum, s) => sum + s.revenue, 0);
      return { month: m, revenue: realRev + synthetic[idx] };
    });
  }, [sellerSales]);

  // Top SKUs (synthetic + real)
  const topSkus = useMemo(() => {
    const totals: Record<string, { title: string; units: number; revenue: number }> = {};
    for (const l of myListings) {
      const seed = l.id.charCodeAt(0) + l.id.charCodeAt(1);
      totals[l.id] = {
        title: l.title,
        units: 80 + (seed % 200),
        revenue: l.price * (80 + (seed % 200)),
      };
    }
    for (const s of sellerSales) {
      if (!totals[s.listingId]) {
        totals[s.listingId] = { title: s.title, units: 0, revenue: 0 };
      }
      totals[s.listingId].units += s.quantity;
      totals[s.listingId].revenue += s.revenue;
    }
    return Object.entries(totals)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [myListings, sellerSales]);

  const totalRev = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const ttmAvg = totalRev / 12;
  const lowStock = myListings.filter((l) => !l.inStock);

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Seller / Analytics
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
        Sales analytics
      </h1>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 border border-line divide-x divide-line bg-surface">
        <Stat label="TTM revenue" value={`$${(totalRev / 1000).toFixed(1)}k`} />
        <Stat label="Avg / month" value={`$${(ttmAvg / 1000).toFixed(1)}k`} />
        <Stat label="Listings" value={String(myListings.length)} />
        <Stat label="Out of stock" value={String(lowStock.length)} tone={lowStock.length > 0 ? "warn" : "ok"} />
      </div>

      <section className="mt-6 border border-line bg-surface p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          Revenue · last 12 months
        </div>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="2 4" stroke="#262626" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#a1a1a1", fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                stroke="#3a3a3a"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#a1a1a1", fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                stroke="#3a3a3a"
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => `$${Number(value).toLocaleString()}`}
                contentStyle={{
                  borderRadius: 0,
                  fontSize: 11,
                  background: "#141414",
                  border: "1px solid #3a3a3a",
                  color: "#ededed",
                  fontFamily: "JetBrains Mono, ui-monospace, monospace",
                }}
                cursor={{ fill: "#1c1c1c" }}
              />
              <Bar dataKey="revenue" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="border border-line bg-surface">
          <div className="px-5 py-3 border-b border-line font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Top SKUs
          </div>
          {topSkus.length === 0 ? (
            <div className="p-6 text-sm text-ink-soft">No data yet.</div>
          ) : (
            <>
              <table className="hidden md:table w-full text-sm">
                <thead>
                  <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
                    <th className="px-5 py-3 font-medium">Listing</th>
                    <th className="px-5 py-3 font-medium">Units</th>
                    <th className="px-5 py-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topSkus.map((s) => (
                    <tr key={s.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3 text-ink truncate">{s.title}</td>
                      <td className="px-5 py-3 font-mono tabular text-ink-soft">{s.units}</td>
                      <td className="px-5 py-3 font-mono tabular text-right text-ink">
                        ${s.revenue.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="md:hidden divide-y divide-line">
                {topSkus.map((s) => (
                  <li key={s.id} className="px-5 py-3">
                    <div className="text-ink truncate">{s.title}</div>
                    <div className="mt-1 flex justify-between text-xs font-mono tabular text-ink-soft">
                      <span>{s.units} units</span>
                      <span className="text-ink">${s.revenue.toFixed(0)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="border border-line bg-surface">
          <div className="px-5 py-3 border-b border-line font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Stock alerts
          </div>
          {lowStock.length === 0 ? (
            <div className="p-6 text-sm text-emerald-400">All listings in stock.</div>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((l) => (
                <li key={l.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-ink">{l.title}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                      {l.sku}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-rose-500/30 text-rose-400">
                    Out of stock
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div
        className={`font-mono text-xl mt-1 tabular ${
          tone === "warn" ? "text-rose-400" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
