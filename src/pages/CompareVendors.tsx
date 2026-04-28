import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "../store";

const COLORS = ["#f97316", "#22c55e", "#3b82f6", "#a855f7", "#facc15"];

export default function CompareVendors() {
  const { listings, sellerById } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSku = searchParams.get("sku") ?? "";

  const skus = useMemo(() => {
    const counts = new Map<string, { sku: string; title: string; count: number }>();
    for (const l of listings) {
      const cur = counts.get(l.sku);
      if (cur) cur.count += 1;
      else counts.set(l.sku, { sku: l.sku, title: l.title, count: 1 });
    }
    return Array.from(counts.values()).filter((s) => s.count > 1);
  }, [listings]);

  const [sku, setSku] = useState(initialSku || skus[0]?.sku || "");
  const [quantity, setQuantity] = useState(100);

  const offers = listings.filter((l) => l.sku === sku);

  const chartData = useMemo(() => {
    if (offers.length === 0) return [];
    const dates = offers[0].priceHistory.map((p) => p.date);
    return dates.map((date, i) => {
      const row: Record<string, number | string> = { date };
      offers.forEach((o) => {
        const seller = sellerById(o.sellerId);
        row[seller?.name ?? o.sellerId] = o.priceHistory[i].price;
      });
      return row;
    });
  }, [offers, sellerById]);

  const sortedOffers = [...offers].sort((a, b) => a.price - b.price);
  const lowest = sortedOffers[0];

  const inputClass =
    "px-3 py-2 bg-bg border border-line text-sm text-ink focus:outline-none focus:border-brand-500";

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        Tools / Compare vendors
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
        Compare vendors
      </h1>
      <p className="text-sm text-ink-soft mt-1">
        Total cost across suppliers for the same SKU.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4 border border-line bg-surface p-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
            SKU
          </label>
          <select
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              setSearchParams({ sku: e.target.value });
            }}
            className={`${inputClass} min-w-[280px] font-mono`}
          >
            {skus.length === 0 && <option value="">No multi-vendor SKUs</option>}
            {skus.map((s) => (
              <option key={s.sku} value={s.sku}>
                {s.sku} — {s.title} ({s.count} vendors)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className={`${inputClass} w-32 font-mono tabular`}
          />
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="mt-8 border border-line bg-surface py-16 text-center text-ink-soft">
          Pick a SKU above to compare offers.
        </div>
      ) : (
        <>
          <div className="mt-6 border border-line bg-surface">
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
                  <th className="px-6 py-3 font-medium">Vendor</th>
                  <th className="px-6 py-3 font-medium">Unit price</th>
                  <th className="px-6 py-3 font-medium">Lead</th>
                  <th className="px-6 py-3 font-medium">Rating</th>
                  <th className="px-6 py-3 font-medium text-right">
                    Est. total · {quantity} units
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOffers.map((o) => {
                  const s = sellerById(o.sellerId);
                  const total = o.price * quantity;
                  const isBest = o.id === lowest.id;
                  return (
                    <tr
                      key={o.id}
                      className={`border-b border-line last:border-0 ${
                        isBest ? "bg-emerald-500/[0.04]" : ""
                      }`}
                    >
                      <td className="px-6 py-3">
                        <div className="text-ink flex items-center gap-2">
                          {s?.name}
                          {isBest && (
                            <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-emerald-500/30 text-emerald-400">
                              Lowest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink-mute">{s?.location}</div>
                      </td>
                      <td className="px-6 py-3 font-mono tabular text-ink">
                        ${o.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 font-mono tabular text-ink-soft">
                        {o.leadTimeDays}d
                      </td>
                      <td className="px-6 py-3 font-mono tabular text-ink-soft">
                        ★ {s?.rating.toFixed(1)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono tabular text-ink">
                        ${total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-line">
              {sortedOffers.map((o) => {
                const s = sellerById(o.sellerId);
                const total = o.price * quantity;
                const isBest = o.id === lowest.id;
                return (
                  <li key={o.id} className={`p-4 ${isBest ? "bg-emerald-500/[0.04]" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-ink flex items-center gap-2">
                          {s?.name}
                          {isBest && (
                            <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-emerald-500/30 text-emerald-400">
                              Lowest
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-ink-mute">{s?.location}</div>
                      </div>
                      <div className="font-mono tabular text-right">
                        <div className="text-ink">${o.price.toFixed(2)}</div>
                        <div className="text-[10px] text-ink-mute uppercase tracking-wider">
                          ★ {s?.rating.toFixed(1)} · lead {o.leadTimeDays}d
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-line flex justify-between font-mono text-xs">
                      <span className="text-ink-soft uppercase tracking-wider">
                        Est. total · {quantity}u
                      </span>
                      <span className="text-ink tabular">
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <section className="mt-6 border border-line bg-surface p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Price history · 12 months
            </div>
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#262626" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#a1a1a1", fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                    stroke="#3a3a3a"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#a1a1a1", fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                    stroke="#3a3a3a"
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(value) => `$${Number(value).toFixed(2)}`}
                    contentStyle={{
                      borderRadius: 0,
                      fontSize: 11,
                      background: "#141414",
                      border: "1px solid #3a3a3a",
                      color: "#ededed",
                      fontFamily: "JetBrains Mono, ui-monospace, monospace",
                    }}
                    labelStyle={{ color: "#a1a1a1" }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: 11,
                      color: "#a1a1a1",
                      fontFamily: "JetBrains Mono, ui-monospace, monospace",
                    }}
                  />
                  {offers.map((o, i) => {
                    const name = sellerById(o.sellerId)?.name ?? o.sellerId;
                    return (
                      <Line
                        key={o.id}
                        type="monotone"
                        dataKey={name}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={1.75}
                        dot={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
