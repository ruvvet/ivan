import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../store";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/";
  const { businesses, signInAsBusiness, signInAsIndividual } = useStore();

  const [tab, setTab] = useState<"business" | "individual">("business");
  const [selectedBiz, setSelectedBiz] = useState(businesses[0]?.id ?? "");
  const [bizPassword, setBizPassword] = useState("demo-password");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleBusinessSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBiz) return;
    signInAsBusiness(selectedBiz);
    navigate(next, { replace: true });
  }

  function handleIndividualSubmit(e: React.FormEvent) {
    e.preventDefault();
    signInAsIndividual(name, email);
    navigate(next, { replace: true });
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-bg border border-line text-sm text-ink placeholder-ink-mute focus:outline-none focus:border-brand-500";

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="w-3 h-3 bg-brand-500" />
          <span className="font-mono text-sm uppercase tracking-widest">IVAN&apos;S</span>
        </div>
        <h1 className="text-2xl font-semibold text-ink tracking-tightest">
          Sign in
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Business accounts unlock purchase orders.
        </p>
      </div>

      <div className="inline-flex w-full border border-line mb-6 font-mono text-[11px] uppercase tracking-wider">
        <button
          onClick={() => setTab("business")}
          className={`flex-1 px-4 py-2.5 transition ${
            tab === "business" ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
          }`}
        >
          Business
        </button>
        <button
          onClick={() => setTab("individual")}
          className={`flex-1 px-4 py-2.5 transition border-l border-line ${
            tab === "individual" ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
          }`}
        >
          Individual
        </button>
      </div>

      {tab === "business" ? (
        <form
          onSubmit={handleBusinessSubmit}
          className="space-y-4 border border-line bg-surface p-6"
        >
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
              Business
            </label>
            <select
              value={selectedBiz}
              onChange={(e) => setSelectedBiz(e.target.value)}
              className={inputClass}
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {selectedBiz && (() => {
              const b = businesses.find((x) => x.id === selectedBiz)!;
              const available = b.creditLimit - b.creditUsed;
              return (
                <div className="mt-3 text-xs bg-bg border border-line p-3 grid grid-cols-2 gap-2 font-mono">
                  <div className="text-ink-mute">Contact</div>
                  <div className="text-ink text-right">{b.contactName}</div>
                  <div className="text-ink-mute">Net terms</div>
                  <div className="text-ink text-right">Net {b.netTerms}</div>
                  <div className="text-ink-mute">Credit avail.</div>
                  <div className="text-ink text-right tabular">
                    ${available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })()}
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
              Password
            </label>
            <input
              type="password"
              value={bizPassword}
              onChange={(e) => setBizPassword(e.target.value)}
              className={inputClass}
            />
            <div className="mt-1 text-[10px] font-mono uppercase tracking-wider text-ink-mute">
              Demo · any password accepted
            </div>
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
          >
            Sign in
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleIndividualSubmit}
          className="space-y-4 border border-line bg-surface p-6"
        >
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
              Full name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="jane@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full h-11 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
          >
            Sign in
          </button>
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-mute text-center">
            Individual · pays via credit card
          </p>
        </form>
      )}

      <p className="text-center mt-4 font-mono text-[10px] uppercase tracking-wider text-ink-mute">
        <Link to="/" className="hover:text-ink">
          ← Back to catalog
        </Link>
      </p>
    </div>
  );
}
