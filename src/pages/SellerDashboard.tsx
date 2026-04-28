import { Link } from "react-router-dom";
import { useStore } from "../store";

export default function SellerDashboard() {
  const { myListings, deleteListing } = useStore();

  const totalValue = myListings.reduce((sum, l) => sum + l.price, 0);
  const inStock = myListings.filter((l) => l.inStock).length;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Seller / Catalog
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
            My listings
          </h1>
        </div>
        <Link
          to="/seller/new"
          className="px-5 h-10 leading-10 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
        >
          + New listing
        </Link>
      </div>

      <div className="grid grid-cols-3 border border-line divide-x divide-line bg-surface mb-6">
        <Stat label="Active" value={String(myListings.length)} />
        <Stat label="In stock" value={`${inStock}/${myListings.length}`} />
        <Stat
          label="Avg unit price"
          value={`$${
            myListings.length > 0 ? (totalValue / myListings.length).toFixed(2) : "0.00"
          }`}
        />
      </div>

      {myListings.length === 0 ? (
        <div className="border border-line bg-surface py-16 text-center">
          <p className="text-ink-soft">No listings yet.</p>
          <Link
            to="/seller/new"
            className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
          >
            Create your first →
          </Link>
        </div>
      ) : (
        <div className="border border-line bg-surface">
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
                <th className="px-4 py-3 font-medium">Listing</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myListings.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0 hover:bg-bg">
                  <td className="px-4 py-3">
                    <Link
                      to={`/product/${l.id}`}
                      className="flex items-center gap-3 text-ink hover:text-brand-400"
                    >
                      <span className="text-2xl">{l.imageEmoji}</span>
                      <span>{l.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{l.sku}</td>
                  <td className="px-4 py-3 font-mono tabular text-ink">${l.price.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono tabular text-ink-soft">{l.leadTimeDays}d</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        l.inStock
                          ? "border-emerald-500/30 text-emerald-400"
                          : "border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {l.inStock ? "In stock" : "Out"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] uppercase tracking-wider">
                    <Link to={`/seller/edit/${l.id}`} className="text-brand-400 hover:text-brand-300 mr-4">
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${l.title}"?`)) deleteListing(l.id);
                      }}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="md:hidden divide-y divide-line">
            {myListings.map((l) => (
              <li key={l.id} className="p-4 flex gap-3">
                <Link to={`/product/${l.id}`} className="text-3xl shrink-0">{l.imageEmoji}</Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${l.id}`} className="text-ink hover:text-brand-400 truncate">
                      {l.title}
                    </Link>
                    <span
                      className={`shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        l.inStock ? "border-emerald-500/30 text-emerald-400" : "border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {l.inStock ? "In stock" : "Out"}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mt-0.5">
                    {l.sku}
                  </div>
                  <div className="mt-2 flex justify-between text-xs font-mono tabular text-ink-soft">
                    <span><span className="text-ink">${l.price.toFixed(2)}</span> · lead {l.leadTimeDays}d</span>
                  </div>
                  <div className="mt-3 flex gap-3 text-[11px] font-mono uppercase tracking-wider">
                    <Link to={`/seller/edit/${l.id}`} className="text-brand-400 hover:text-brand-300">
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${l.title}"?`)) deleteListing(l.id);
                      }}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div className="font-mono text-xl text-ink mt-1 tabular">{value}</div>
    </div>
  );
}
