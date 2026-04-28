import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store";

export default function Projects() {
  const { projects, spendForProject, addProject } = useStore();
  const [showNew, setShowNew] = useState(false);

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-ink mt-1 tracking-tightest">
            Projects
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Group orders and quotes by job. Track spend against budget.
          </p>
        </div>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="px-5 h-10 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
        >
          {showNew ? "Cancel" : "+ New project"}
        </button>
      </div>

      {showNew && <NewProjectForm onCreate={() => setShowNew(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => {
          const spend = spendForProject(p.id);
          const pct = p.budget > 0 ? (spend / p.budget) * 100 : 0;
          const overBudget = pct > 100;
          return (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="block border border-line bg-surface hover:border-line-strong transition p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                    {p.id} · {p.status}
                  </div>
                  <div className="text-lg text-ink mt-1">{p.name}</div>
                  {p.description && (
                    <div className="text-sm text-ink-soft mt-1">{p.description}</div>
                  )}
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${
                    p.status === "active"
                      ? "border-emerald-500/30 text-emerald-400"
                      : p.status === "complete"
                      ? "border-line text-ink-soft"
                      : "border-hi/30 text-hi"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs font-mono tabular text-ink-soft">
                  <span>${spend.toFixed(2)}</span>
                  <span>${p.budget.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1.5 bg-bg border border-line relative overflow-hidden">
                  <div
                    className={`h-full ${overBudget ? "bg-rose-500" : "bg-brand-500"}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-mute flex justify-between">
                  <span>{pct.toFixed(1)}% spent</span>
                  <span>
                    {p.startDate}
                    {p.endDate ? ` → ${p.endDate}` : ""}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NewProjectForm({ onCreate }: { onCreate: () => void }) {
  const { addProject } = useStore();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(10000);
  const [startDate, setStartDate] = useState("2026-04-27");
  const [description, setDescription] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addProject({
      name,
      budget,
      startDate,
      description,
      status: "active",
    });
    onCreate();
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-bg border border-line text-sm text-ink focus:outline-none focus:border-brand-500";

  return (
    <form
      onSubmit={submit}
      className="border border-line bg-surface p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="md:col-span-2">
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
          Name
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Main St Renovation"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
          Budget (USD)
        </label>
        <input
          type="number"
          min={0}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className={`${inputClass} font-mono tabular`}
        />
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
          Start date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={`${inputClass} font-mono`}
        />
      </div>
      <div className="md:col-span-2">
        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-mute mb-1">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>
      <div className="md:col-span-2 flex gap-3">
        <button
          type="submit"
          className="px-5 h-10 bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500 transition"
        >
          Create project
        </button>
      </div>
    </form>
  );
}
