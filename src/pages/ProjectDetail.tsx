import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../store";

export default function ProjectDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const {
    projectById,
    spendForProject,
    ordersForProject,
    quotes,
    addresses,
    addAddress,
    removeAddress,
    deleteProject,
    updateProject,
  } = useStore();
  const project = projectById(id);
  const [showAddrForm, setShowAddrForm] = useState(false);

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft">Project not found.</p>
        <Link to="/projects" className="text-brand-400 hover:text-brand-300 mt-4 inline-block">
          ← Projects
        </Link>
      </div>
    );
  }

  const spend = spendForProject(project.id);
  const pct = project.budget > 0 ? (spend / project.budget) * 100 : 0;
  const orders = ordersForProject(project.id);
  const projectQuotes = quotes.filter((q) => q.projectId === project.id);
  const projectAddresses = addresses.filter((a) => a.projectId === project.id);

  return (
    <div>
      <Link
        to="/projects"
        className="font-mono text-[11px] uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        ← Projects
      </Link>

      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            {project.id} · {project.status}
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-ink-soft mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {project.status !== "complete" && (
            <button
              onClick={() => updateProject(project.id, { status: "complete" })}
              className="px-4 h-10 border border-line-strong text-ink font-mono text-[11px] uppercase tracking-wider hover:bg-surface"
            >
              Mark complete
            </button>
          )}
          <button
            onClick={() => {
              if (confirm("Delete this project?")) {
                deleteProject(project.id);
                navigate("/projects");
              }
            }}
            className="px-4 h-10 border border-rose-500/30 text-rose-400 font-mono text-[11px] uppercase tracking-wider hover:bg-rose-500/10"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Budget gauge */}
      <section className="mt-6 border border-line bg-surface p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
          Budget vs spend
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <Stat label="Budget" value={`$${project.budget.toLocaleString()}`} />
          <Stat label="Spent" value={`$${spend.toFixed(2)}`} />
          <Stat
            label="Remaining"
            value={`$${(project.budget - spend).toFixed(2)}`}
            tone={project.budget - spend < 0 ? "bad" : "ok"}
          />
        </div>
        <div className="mt-4 h-2 bg-bg border border-line relative overflow-hidden">
          <div
            className={`h-full ${pct > 100 ? "bg-rose-500" : "bg-brand-500"}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-mute flex justify-between">
          <span>{pct.toFixed(1)}%</span>
          <span>
            {project.startDate}
            {project.endDate ? ` → ${project.endDate}` : ""}
          </span>
        </div>
      </section>

      {/* Orders */}
      <section className="mt-6 border border-line bg-surface">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Orders · {orders.length}
          </span>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
          >
            + Add to project
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-soft">
            No orders linked yet. Pick this project at checkout.
          </div>
        ) : (
          <>
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-mute border-b border-line">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-bg">
                    <td className="px-5 py-3">
                      <Link to={`/order/${o.id}`} className="font-mono text-xs text-ink hover:text-brand-400">
                        {o.id}
                      </Link>
                      <div className="text-[10px] text-ink-mute font-mono">
                        {new Date(o.placedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                    <td className="px-5 py-3 text-ink-soft">
                      {o.items.length} line{o.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular text-ink">
                      ${o.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="md:hidden divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/order/${o.id}`} className="font-mono text-xs text-ink hover:text-brand-400">
                      {o.id}
                    </Link>
                    <StatusPill status={o.status} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-ink-soft">
                      {o.items.length} line{o.items.length === 1 ? "" : "s"} · {new Date(o.placedAt).toLocaleDateString()}
                    </span>
                    <span className="font-mono tabular text-ink">${o.total.toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Quotes */}
      {projectQuotes.length > 0 && (
        <section className="mt-6 border border-line bg-surface">
          <div className="px-5 py-3 border-b border-line">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Quotes · {projectQuotes.length}
            </span>
          </div>
          <ul className="divide-y divide-line">
            {projectQuotes.map((q) => (
              <li key={q.id} className="px-5 py-3 flex items-center justify-between">
                <Link
                  to={`/quotes/${q.id}`}
                  className="font-mono text-xs text-ink hover:text-brand-400"
                >
                  {q.id}
                </Link>
                <span className="text-xs text-ink-soft">
                  {q.items.length} line · {q.vendorRequests.length} vendors · {q.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Job site addresses */}
      <section className="mt-6 border border-line bg-surface">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Job site addresses · {projectAddresses.length}
          </span>
          <button
            onClick={() => setShowAddrForm((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-wider text-brand-400 hover:text-brand-300"
          >
            {showAddrForm ? "Cancel" : "+ Add address"}
          </button>
        </div>
        {showAddrForm && (
          <NewAddressInline
            projectId={project.id}
            onSave={(a) => {
              addAddress({ ...a, projectId: project.id });
              setShowAddrForm(false);
            }}
          />
        )}
        {projectAddresses.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink-soft">
            No saved addresses for this project.
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {projectAddresses.map((a) => (
              <li key={a.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-ink">{a.label}</div>
                  <div className="text-xs text-ink-soft">
                    {a.line1}, {a.city}, {a.state} {a.zip} · {a.contactName}
                  </div>
                </div>
                <button
                  onClick={() => removeAddress(a.id)}
                  className="font-mono text-[10px] uppercase tracking-wider text-ink-mute hover:text-rose-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function NewAddressInline({
  projectId,
  onSave,
}: {
  projectId: string;
  onSave: (a: {
    label: string;
    contactName: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
  }) => void;
}) {
  const [label, setLabel] = useState("");
  const [contactName, setContactName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const inputClass =
    "w-full px-3 py-2 bg-bg border border-line text-sm text-ink focus:outline-none focus:border-brand-500";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ label, contactName, line1, city, state, zip });
      }}
      className="px-5 py-4 border-b border-line grid grid-cols-2 gap-3 bg-bg/40"
    >
      <input
        required
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label"
        className={`col-span-2 ${inputClass}`}
      />
      <input
        required
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        placeholder="Site contact"
        className={inputClass}
      />
      <input
        required
        value={line1}
        onChange={(e) => setLine1(e.target.value)}
        placeholder="Address"
        className={inputClass}
      />
      <input
        required
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          value={state}
          onChange={(e) => setState(e.target.value.toUpperCase())}
          placeholder="ST"
          maxLength={2}
          className={`${inputClass} font-mono`}
        />
        <input
          required
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="ZIP"
          className={`${inputClass} font-mono`}
        />
      </div>
      <button
        type="submit"
        className="col-span-2 px-4 h-10 bg-ink text-bg font-mono text-[11px] uppercase tracking-widest hover:bg-brand-500"
      >
        Save address (project: {projectId})
      </button>
    </form>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "bad";
}) {
  return (
    <div className="bg-bg border border-line p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
        {label}
      </div>
      <div
        className={`mt-1 font-mono tabular text-base ${
          tone === "bad" ? "text-rose-400" : "text-ink"
        }`}
      >
        {value}
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
