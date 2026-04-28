import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import type { PaymentMethod } from "../types";

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cart,
    listings,
    cartSubtotal,
    shippingFlat,
    taxRate,
    user,
    businessById,
    placeOrder,
    projects,
    addresses,
  } = useStore();

  useEffect(() => {
    if (cart.length === 0) navigate("/cart", { replace: true });
  }, [cart.length, navigate]);

  const business =
    user.type === "business" ? businessById(user.businessId) : undefined;
  const canUsePO = !!business;

  const [method, setMethod] = useState<PaymentMethod>(
    canUsePO ? "purchase_order" : "credit_card",
  );

  const [projectId, setProjectId] = useState<string>("");
  const projectAddresses = addresses.filter(
    (a) => !projectId || a.projectId === projectId || !a.projectId,
  );

  const [addressId, setAddressId] = useState<string>("");
  const [shipName, setShipName] = useState(
    user.type === "individual" ? user.name : business?.contactName ?? "",
  );
  const [shipEmail, setShipEmail] = useState(
    user.type === "individual" ? user.email : business?.email ?? "",
  );
  const [shipLine1, setShipLine1] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipZip, setShipZip] = useState("");

  // when address book selection changes, fill shipping fields
  useEffect(() => {
    if (!addressId) return;
    const a = addresses.find((x) => x.id === addressId);
    if (!a) return;
    setShipName(a.contactName);
    setShipLine1(a.line1);
    setShipCity(a.city);
    setShipState(a.state);
    setShipZip(a.zip);
    if (a.projectId) setProjectId(a.projectId);
  }, [addressId, addresses]);

  // delivery slot
  const slots = useMemo(() => {
    const out: { value: string; label: string }[] = [];
    const today = new Date();
    for (let d = 1; d <= 5; d++) {
      const date = new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
      const dStr = date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      out.push({ value: `${date.toISOString().slice(0, 10)}_AM`, label: `${dStr} · AM` });
      out.push({ value: `${date.toISOString().slice(0, 10)}_PM`, label: `${dStr} · PM` });
    }
    return out;
  }, []);
  const [deliverySlot, setDeliverySlot] = useState<string>(slots[0].value);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [poNumber, setPoNumber] = useState(
    `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
  );
  const [poNotes, setPoNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const shipping = shippingFlat;
    const tax = Math.round(cartSubtotal * taxRate * 100) / 100;
    const total = Math.round((cartSubtotal + shipping + tax) * 100) / 100;
    return { shipping, tax, total };
  }, [cartSubtotal, shippingFlat, taxRate]);

  const creditAvailable = business
    ? business.creditLimit - business.creditUsed
    : 0;
  const exceedsCredit = method === "purchase_order" && totals.total > creditAvailable;

  const requireApproval = !!business && totals.total > business.approvalThreshold;

  function formatCardNumber(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }
  function formatExp(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (method === "credit_card") {
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length !== 16) return setError("Card number must be 16 digits.");
      if (!/^\d{2}\/\d{2}$/.test(cardExp)) return setError("Expiration must be MM/YY.");
      if (!/^\d{3,4}$/.test(cardCvc)) return setError("CVC must be 3 or 4 digits.");
    }
    if (method === "purchase_order") {
      if (!poNumber.trim()) return setError("PO number is required.");
      if (exceedsCredit) return setError("Order exceeds available credit.");
    }

    setSubmitting(true);
    setTimeout(() => {
      const shippingAddress = `${shipLine1}, ${shipCity}, ${shipState} ${shipZip}`;
      const order = placeOrder({
        paymentMethod: method,
        paymentRef:
          method === "credit_card"
            ? `Visa •••• ${cardNumber.replace(/\D/g, "").slice(-4)}`
            : `${poNumber} (Net ${business?.netTerms ?? 30})`,
        buyerLabel:
          user.type === "business"
            ? business?.name ?? "Business"
            : user.type === "individual"
            ? user.name
            : shipName || "Guest",
        buyerEmail: shipEmail,
        shippingAddress,
        netTerms: method === "purchase_order" ? business?.netTerms : undefined,
        projectId: projectId || undefined,
        deliverySlot: slots.find((s) => s.value === deliverySlot)?.label,
        requireApproval,
        approverName: business?.approverName,
        approverEmail: business?.approverEmail,
        approvalThreshold: business?.approvalThreshold,
      });
      navigate(`/order/${order.id}`, { replace: true });
    }, 600);
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-bg border border-line text-sm text-ink placeholder-ink-mute focus:outline-none focus:border-brand-500";

  return (
    <div>
      <Link
        to="/cart"
        className="font-mono text-[11px] uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        ← Cart
      </Link>
      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-2 tracking-tightest">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          {/* Project + delivery */}
          <Section title="Project & delivery">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project (optional)" full>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Delivery slot" full>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className={`${inputClass} font-mono`}
                >
                  {slots.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* Address book */}
          <Section title="Ship to">
            {projectAddresses.length > 0 && (
              <div className="mb-3">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
                  Saved addresses
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {projectAddresses.map((a) => {
                    const active = addressId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAddressId(active ? "" : a.id)}
                        className={`text-left border p-3 transition ${
                          active
                            ? "border-brand-500 bg-brand-500/5"
                            : "border-line bg-bg hover:border-line-strong"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-ink text-sm truncate">{a.label}</span>
                          {active && (
                            <span className="font-mono text-[10px] text-brand-400">●</span>
                          )}
                        </div>
                        <div className="text-xs text-ink-soft truncate">
                          {a.line1}, {a.city}, {a.state}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name" full>
                <input
                  required
                  value={shipName}
                  onChange={(e) => setShipName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Email" full>
                <input
                  required
                  type="email"
                  value={shipEmail}
                  onChange={(e) => setShipEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Address" full>
                <input
                  required
                  value={shipLine1}
                  onChange={(e) => setShipLine1(e.target.value)}
                  placeholder="123 Main St"
                  className={inputClass}
                />
              </Field>
              <Field label="City">
                <input
                  required
                  value={shipCity}
                  onChange={(e) => setShipCity(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="State">
                  <input
                    required
                    value={shipState}
                    onChange={(e) => setShipState(e.target.value.toUpperCase())}
                    maxLength={2}
                    placeholder="WI"
                    className={`${inputClass} font-mono`}
                  />
                </Field>
                <Field label="ZIP">
                  <input
                    required
                    value={shipZip}
                    onChange={(e) => setShipZip(e.target.value)}
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Payment method">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PaymentOption
                value="credit_card"
                current={method}
                onSelect={setMethod}
                title="Credit / Debit Card"
                subtitle="Visa, Mastercard, Amex"
              />
              <PaymentOption
                value="purchase_order"
                current={method}
                onSelect={setMethod}
                title="Purchase Order"
                subtitle={
                  canUsePO
                    ? `Net ${business?.netTerms} · ${business?.name}`
                    : "Sign in as a business"
                }
                disabled={!canUsePO}
              />
            </div>

            {!canUsePO && (
              <div className="mt-4 text-xs text-ink-soft bg-bg border border-line p-3 flex items-center justify-between gap-4">
                <span>Pay with PO — sign in as a business to unlock net terms.</span>
                <Link
                  to="/login?next=/checkout"
                  className="px-3 py-1.5 border border-line-strong hover:border-ink hover:bg-surface text-[11px] font-mono uppercase tracking-wider shrink-0 transition"
                >
                  Sign in
                </Link>
              </div>
            )}

            {requireApproval && method === "purchase_order" && (
              <div className="mt-4 text-xs bg-hi/5 border border-hi/30 p-3 font-mono uppercase tracking-wider text-hi">
                ● Approval required · order exceeds ${business?.approvalThreshold.toLocaleString()} threshold ·
                will be routed to {business?.approverName}
              </div>
            )}

            {method === "credit_card" ? (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Field label="Name on card" full>
                  <input
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Card number" full>
                  <input
                    required
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className={`${inputClass} font-mono tabular`}
                  />
                </Field>
                <Field label="Expiry">
                  <input
                    required
                    inputMode="numeric"
                    value={cardExp}
                    onChange={(e) => setCardExp(formatExp(e.target.value))}
                    placeholder="12/28"
                    className={`${inputClass} font-mono tabular`}
                  />
                </Field>
                <Field label="CVC">
                  <input
                    required
                    inputMode="numeric"
                    value={cardCvc}
                    onChange={(e) =>
                      setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="123"
                    className={`${inputClass} font-mono tabular`}
                  />
                </Field>
                <p className="col-span-2 text-[11px] text-ink-mute font-mono uppercase tracking-wider">
                  Demo · no real charge
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {business && (
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <Stat label="Net terms" value={`Net ${business.netTerms}`} />
                    <Stat
                      label="Credit avail."
                      value={`$${creditAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    />
                    <Stat label="Tax ID" value={business.taxId} />
                  </div>
                )}
                <Field label="PO number" full>
                  <input
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className={`${inputClass} font-mono`}
                  />
                </Field>
                <Field label="Notes / cost code (optional)" full>
                  <textarea
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    rows={2}
                    className={inputClass}
                    placeholder="Job site, GL code, project ref…"
                  />
                </Field>

                {exceedsCredit && (
                  <div className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/20 p-3">
                    Order total ${totals.total.toFixed(2)} exceeds credit available ($
                    {creditAvailable.toFixed(2)}).
                  </div>
                )}
              </div>
            )}
          </Section>

          {error && (
            <div className="text-sm text-rose-400 bg-rose-500/5 border border-rose-500/20 p-3">
              {error}
            </div>
          )}
        </div>

        <aside className="border border-line bg-surface p-5 h-fit lg:sticky lg:top-32">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Order summary
          </div>
          <ul className="mt-4 space-y-3">
            {cart.map((c) => {
              const l = listings.find((x) => x.id === c.listingId);
              if (!l) return null;
              return (
                <li key={c.listingId} className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">{l.imageEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-ink truncate">{l.title}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ink-mute">
                      {c.quantity} × ${l.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-mono tabular text-ink">
                    ${(l.price * c.quantity).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>

          <dl className="mt-5 space-y-2 text-sm font-mono tabular border-t border-line pt-4">
            <Row label="Subtotal" value={`$${cartSubtotal.toFixed(2)}`} />
            <Row label="Shipping" value={`$${totals.shipping.toFixed(2)}`} />
            <Row label="Tax" value={`$${totals.tax.toFixed(2)}`} />
            <div className="border-t border-line pt-3 flex justify-between text-base">
              <dt className="text-ink">Total</dt>
              <dd className="text-ink font-semibold">${totals.total.toFixed(2)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting || (method === "purchase_order" && exceedsCredit)}
            className="mt-5 w-full h-11 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Processing…"
              : requireApproval
              ? `Submit for approval · $${totals.total.toFixed(2)}`
              : method === "credit_card"
              ? `Pay $${totals.total.toFixed(2)}`
              : `Submit PO · $${totals.total.toFixed(2)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-surface">
      <div className="px-5 py-3 border-b border-line font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        {title}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
        {label}
      </label>
      {children}
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

function PaymentOption({
  value,
  current,
  onSelect,
  title,
  subtitle,
  disabled,
}: {
  value: PaymentMethod;
  current: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(value)}
      disabled={disabled}
      className={`text-left border p-4 transition ${
        active
          ? "border-brand-500 bg-brand-500/5"
          : "border-line bg-bg hover:border-line-strong"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-ink font-medium">{title}</span>
        <span
          className={`w-3.5 h-3.5 border ${
            active ? "border-brand-500 bg-brand-500" : "border-line-strong"
          }`}
        />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-mute mt-1">
        {subtitle}
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg border border-line p-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-mute">
        {label}
      </div>
      <div className="text-sm text-ink mt-0.5 font-mono tabular truncate">{value}</div>
    </div>
  );
}
