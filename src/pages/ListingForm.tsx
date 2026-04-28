import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../store";

const CATEGORIES = [
  "Steel & Rebar",
  "Lumber",
  "Concrete & Masonry",
  "Drywall",
  "Insulation",
  "Roofing",
  "Fasteners & Hardware",
  "Other",
];

const EMOJIS = ["🪵", "🌲", "🪨", "⬜", "🔩", "🏗️", "🧱", "🪟", "🚪"];

type SpecRow = { key: string; value: string };

export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addListing, updateListing, getListing } = useStore();
  const editing = id ? getListing(id) : undefined;

  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("per unit");
  const [price, setPrice] = useState(0);
  const [leadTimeDays, setLeadTimeDays] = useState(5);
  const [inStock, setInStock] = useState(true);
  const [imageEmoji, setImageEmoji] = useState(EMOJIS[0]);
  const [specSheet, setSpecSheet] = useState<File | null>(null);
  const [specs, setSpecs] = useState<SpecRow[]>([{ key: "", value: "" }]);

  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setSku(editing.sku);
    setCategory(editing.category);
    setDescription(editing.description);
    setUnit(editing.unit);
    setPrice(editing.price);
    setLeadTimeDays(editing.leadTimeDays);
    setInStock(editing.inStock);
    setImageEmoji(editing.imageEmoji);
    setSpecs(
      Object.entries(editing.specs).map(([k, v]) => ({ key: k, value: v })),
    );
  }, [editing]);

  function setSpec(i: number, patch: Partial<SpecRow>) {
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanSpecs = Object.fromEntries(
      specs
        .filter((s) => s.key.trim() && s.value.trim())
        .map((s) => [s.key.trim(), s.value.trim()]),
    );
    const draft = {
      title,
      sku,
      category,
      description,
      unit,
      price,
      leadTimeDays,
      inStock,
      imageEmoji,
      specSheetUrl: specSheet ? `#${specSheet.name}` : editing?.specSheetUrl ?? "#",
      specs: cleanSpecs,
    };
    if (editing) {
      updateListing(editing.id, draft);
      navigate("/seller");
    } else {
      addListing(draft);
      navigate("/seller");
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-bg border border-line text-sm text-ink placeholder-ink-mute focus:outline-none focus:border-brand-500";

  return (
    <div className="max-w-2xl">
      <Link
        to="/seller"
        className="font-mono text-[11px] uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        ← Catalog
      </Link>

      <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-2 tracking-tightest">
        {editing ? "Edit listing" : "New listing"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 border border-line bg-surface p-6">
        <Field label="Title" required>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder='e.g. "1/2&quot; Drywall Panel — 4x8"'
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU" required>
            <input
              required
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              className={`${inputClass} font-mono`}
              placeholder="DRY-1/2-4X8"
            />
          </Field>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Material, certifications, packaging..."
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Price (USD)" required>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={`${inputClass} font-mono tabular`}
            />
          </Field>
          <Field label="Unit">
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={inputClass}
              placeholder="per bag, per stud..."
            />
          </Field>
          <Field label="Lead time (days)">
            <input
              type="number"
              min="0"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className={`${inputClass} font-mono tabular`}
            />
          </Field>
        </div>

        <Field label="Image">
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setImageEmoji(e)}
                className={`w-12 h-12 text-2xl border ${
                  imageEmoji === e
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-line bg-bg hover:border-line-strong"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Spec sheet (PDF)">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSpecSheet(e.target.files?.[0] ?? null)}
            className="block text-sm text-ink-soft file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-bg file:text-ink-soft file:border-r file:border-line hover:file:text-ink file:font-mono file:text-[11px] file:uppercase file:tracking-wider"
          />
          {specSheet && (
            <div className="mt-1 text-[10px] font-mono uppercase tracking-wider text-ink-mute">
              Selected: {specSheet.name} (mock)
            </div>
          )}
        </Field>

        <div>
          <div className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
            Specifications
          </div>
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={s.key}
                  onChange={(e) => setSpec(i, { key: e.target.value })}
                  placeholder="Property"
                  className={`flex-1 ${inputClass}`}
                />
                <input
                  value={s.value}
                  onChange={(e) => setSpec(i, { value: e.target.value })}
                  placeholder="Value"
                  className={`flex-1 ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setSpecs((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="px-3 text-ink-mute hover:text-rose-400"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
              className="font-mono text-[11px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
            >
              + Add row
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="accent-brand-500"
          />
          In stock
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 h-11 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
          >
            {editing ? "Save" : "Create"}
          </button>
          <Link
            to="/seller"
            className="px-6 h-11 leading-[44px] border border-line-strong text-ink font-mono text-xs uppercase tracking-widest hover:border-ink hover:bg-bg transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
