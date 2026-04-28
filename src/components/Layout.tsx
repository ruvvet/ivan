import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store";

const CATEGORY_NAV = [
  "All",
  "Steel & Rebar",
  "Lumber",
  "Concrete & Masonry",
  "Drywall",
  "Roofing",
  "Fasteners & Hardware",
];

function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (location.pathname !== "/") setQ("");
  }, [location.pathname]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    navigate(`/?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-stretch w-full border border-line bg-surface focus-within:border-line-strong transition"
    >
      <span className="flex items-center pl-3 text-ink-mute">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search SKU, material, vendor"
        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder-ink-mute font-mono min-w-0"
      />
      <button
        type="submit"
        className="px-4 text-[11px] font-mono uppercase tracking-wider text-ink-soft hover:text-ink hover:bg-surface-2"
      >
        Search
      </button>
    </form>
  );
}

function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-11 h-11 flex items-center justify-center text-ink-soft hover:text-ink relative"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-500" />
        )}
      </button>
      {open && (
        <div className="fixed sm:absolute right-0 sm:right-0 left-0 sm:left-auto top-12 sm:top-full sm:mt-0 mx-2 sm:mx-0 sm:w-96 bg-surface border border-line z-30">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Notifications · {unreadCount} unread
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="font-mono text-[10px] uppercase tracking-wider text-ink-soft hover:text-ink"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto divide-y divide-line">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-ink-mute text-sm">
                No notifications.
              </li>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 hover:bg-bg cursor-pointer ${
                    !n.read ? "border-l-2 border-brand-500" : ""
                  }`}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.link) {
                      setOpen(false);
                      navigate(n.link);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-ink">{n.title}</span>
                    <span className="font-mono text-[10px] text-ink-mute uppercase shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-ink-soft mt-1 leading-snug">
                    {n.body}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function CartButton() {
  const { cartCount } = useStore();
  return (
    <Link
      to="/cart"
      className="relative w-11 h-11 flex items-center justify-center text-ink-soft hover:text-ink"
      aria-label="Cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M3 4h2.5l2.7 12.4a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.5L22 8H6" />
      </svg>
      {cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center font-mono text-[10px] tabular bg-brand-500 text-bg">
          {cartCount}
        </span>
      )}
    </Link>
  );
}

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { role, setRole, user, businessById, signOut, watchlist } = useStore();
  const isBusiness = user.type === "business";

  if (!open) return null;

  const linkBase =
    "block px-5 py-3 text-sm font-mono uppercase tracking-widest border-b border-line";

  function go() {
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-bg border-l border-line-strong overflow-y-auto">
        <div className="px-5 py-4 border-b border-line-strong flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            Menu
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-ink-soft hover:text-ink"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>

        {/* Account block */}
        <div className="px-5 py-4 border-b border-line-strong">
          {user.type === "guest" ? (
            <Link
              to="/login"
              onClick={go}
              className="block w-full text-center h-11 leading-[44px] bg-ink text-bg font-mono text-xs uppercase tracking-widest hover:bg-brand-500"
            >
              Sign in
            </Link>
          ) : (
            <div>
              <div className="text-sm text-ink">
                {user.type === "business"
                  ? businessById(user.businessId)?.name
                  : user.name}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mt-0.5">
                {user.type === "business" ? "Business account" : "Individual"}
              </div>
              <button
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="mt-3 w-full h-10 border border-line-strong text-ink font-mono text-[11px] uppercase tracking-wider hover:bg-surface"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Role switch */}
        <div className="px-5 py-4 border-b border-line-strong">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-mute mb-2">
            Mode
          </div>
          <div className="grid grid-cols-2 border border-line">
            <button
              onClick={() => setRole("buyer")}
              className={`h-11 font-mono text-[11px] uppercase tracking-wider ${
                role === "buyer" ? "bg-ink text-bg" : "text-ink-soft"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setRole("seller")}
              className={`h-11 font-mono text-[11px] uppercase tracking-wider border-l border-line ${
                role === "seller" ? "bg-ink text-bg" : "text-ink-soft"
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav>
          {role === "buyer" ? (
            <>
              <NavLink to="/" end onClick={go} className={linkBase}>
                Catalog
              </NavLink>
              <NavLink to="/projects" onClick={go} className={linkBase}>
                Projects
              </NavLink>
              <NavLink to="/quotes" onClick={go} className={linkBase}>
                Quotes
              </NavLink>
              <NavLink to="/watchlist" onClick={go} className={linkBase}>
                Watchlist
                {watchlist.length > 0 && (
                  <span className="float-right text-brand-500">{watchlist.length}</span>
                )}
              </NavLink>
              {isBusiness && (
                <NavLink to="/approvals" onClick={go} className={linkBase}>
                  Approvals
                </NavLink>
              )}
              <NavLink to="/orders" onClick={go} className={linkBase}>
                Orders
              </NavLink>
              <NavLink to="/cart" onClick={go} className={linkBase}>
                Cart
              </NavLink>
              <NavLink to="/compare" onClick={go} className={linkBase}>
                Compare vendors
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/seller" end onClick={go} className={linkBase}>
                Catalog
              </NavLink>
              <NavLink to="/seller/analytics" onClick={go} className={linkBase}>
                Analytics
              </NavLink>
              <NavLink to="/seller/new" onClick={go} className={linkBase}>
                + New listing
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}

function PrimaryNav() {
  const { user, currentBusiness, watchlist } = useStore();
  const isBusiness = user.type === "business";
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition ${
      isActive ? "text-ink" : "text-ink-mute hover:text-ink-soft"
    }`;

  return (
    <div className="hidden lg:block border-b border-line bg-black/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-6 overflow-x-auto">
        <NavLink to="/" end className={linkClass}>
          Catalog
        </NavLink>
        <NavLink to="/projects" className={linkClass}>
          Projects
        </NavLink>
        <NavLink to="/quotes" className={linkClass}>
          Quotes
        </NavLink>
        <NavLink to="/watchlist" className={linkClass}>
          Watchlist
          {watchlist.length > 0 && (
            <span className="ml-1 text-brand-500">{watchlist.length}</span>
          )}
        </NavLink>
        {isBusiness && (
          <NavLink to="/approvals" className={linkClass}>
            Approvals
          </NavLink>
        )}
        <NavLink to="/orders" className={linkClass}>
          Orders
        </NavLink>
        <div className="ml-auto" />
        {currentBusiness && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
            <span className="text-hi">●</span> {currentBusiness.name} · Net {currentBusiness.netTerms}
          </span>
        )}
      </div>
    </div>
  );
}

function CategoryNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const active = params.get("category") || "All";
  return (
    <div className="border-b border-line bg-black/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-5 overflow-x-auto">
        {CATEGORY_NAV.map((c) => {
          const isActive = c === active || (c === "All" && !params.get("category"));
          return (
            <button
              key={c}
              onClick={() => {
                const p = new URLSearchParams();
                if (c !== "All") p.set("category", c);
                navigate(`/?${p.toString()}`);
              }}
              className={`text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition ${
                isActive ? "text-ink" : "text-ink-mute hover:text-ink-soft"
              }`}
            >
              {c}
              {isActive && <span className="ml-1.5 text-brand-500">●</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HamburgerButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden w-11 h-11 flex items-center justify-center text-ink"
      aria-label="Menu"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {open ? (
          <path d="m6 6 12 12M6 18 18 6" />
        ) : (
          <>
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </>
        )}
      </svg>
    </button>
  );
}

export default function Layout() {
  const { role } = useStore();
  const location = useLocation();
  const onCatalog = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  // close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-full flex flex-col bg-bg text-ink">
      <header className="sticky top-0 z-20 bg-black/95 backdrop-blur-sm border-b border-line-strong shadow-lg shadow-black/40">
        <div className="bg-black/60 border-b border-line text-[10px] font-mono uppercase tracking-widest text-ink-mute">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-7 flex items-center justify-between">
            <span className="truncate">
              <span className="text-hi">●</span> Live · 7 verified suppliers
              <span className="hidden sm:inline"> · Same-day quotes</span>
            </span>
            <span className="hidden md:inline">v0.2 · demo</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-3 h-3 bg-brand-500" />
            <span className="font-mono text-sm uppercase tracking-widest text-ink">
              IVAN&apos;S
            </span>
          </Link>

          <div className="hidden lg:flex flex-1 mx-4">
            {role === "buyer" && <SearchBar />}
          </div>

          <div className="ml-auto flex items-stretch lg:border-l lg:border-line">
            <div className="hidden lg:flex px-3 items-center">
              <RoleSwitcherInline />
            </div>
            {role === "buyer" && <CartButton />}
            <NotificationBell />
            <div className="hidden lg:flex">
              <AuthChip />
            </div>
            <HamburgerButton
              open={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            />
          </div>
        </div>

        {/* Mobile-only second row: search */}
        {role === "buyer" && (
          <div className="lg:hidden px-4 sm:px-6 pb-2 pt-1 bg-black/95 border-b border-line">
            <SearchBar />
          </div>
        )}

        {role === "buyer" ? (
          <>
            <PrimaryNav />
            {onCatalog && <CategoryNav />}
          </>
        ) : (
          <div className="hidden lg:block border-b border-line bg-black/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-6">
              <NavLink
                to="/seller"
                end
                className={({ isActive }) =>
                  `text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition ${
                    isActive ? "text-ink" : "text-ink-mute hover:text-ink-soft"
                  }`
                }
              >
                Catalog
              </NavLink>
              <NavLink
                to="/seller/analytics"
                className={({ isActive }) =>
                  `text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition ${
                    isActive ? "text-ink" : "text-ink-mute hover:text-ink-soft"
                  }`
                }
              >
                Analytics
              </NavLink>
              <NavLink
                to="/seller/new"
                className={({ isActive }) =>
                  `text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition ${
                    isActive ? "text-ink" : "text-ink-mute hover:text-ink-soft"
                  }`
                }
              >
                + New listing
              </NavLink>
            </div>
          </div>
        )}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-bg mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-ink-mute flex flex-col sm:flex-row sm:justify-between gap-1">
          <span>© 2026 Ivan&apos;s · demo build</span>
          <span>Stub data resets on reload</span>
        </div>
      </footer>
    </div>
  );
}

function RoleSwitcherInline() {
  const { role, setRole } = useStore();
  return (
    <div className="inline-flex border border-line text-[11px] font-mono uppercase tracking-wider">
      <button
        onClick={() => setRole("buyer")}
        className={`px-2.5 py-1 transition ${
          role === "buyer" ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
        }`}
      >
        Buy
      </button>
      <button
        onClick={() => setRole("seller")}
        className={`px-2.5 py-1 transition border-l border-line ${
          role === "seller" ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
        }`}
      >
        Sell
      </button>
    </div>
  );
}

function AuthChip() {
  const { user, businessById, signOut } = useStore();
  if (user.type === "guest") {
    return (
      <Link
        to="/login"
        className="px-3 flex items-center text-[11px] font-mono uppercase tracking-wider text-ink-soft hover:text-ink border-l border-line"
      >
        Sign in
      </Link>
    );
  }
  const label =
    user.type === "business"
      ? businessById(user.businessId)?.name ?? "Business"
      : user.name;
  const sub = user.type === "business" ? "BIZ" : "IND";
  return (
    <div className="flex items-stretch border-l border-line">
      <div className="hidden xl:flex flex-col justify-center px-3 leading-tight">
        <span className="text-xs text-ink truncate max-w-[180px]">{label}</span>
        <span className="text-[10px] font-mono text-ink-mute uppercase tracking-wider">
          {sub}
        </span>
      </div>
      <button
        onClick={signOut}
        className="px-3 flex items-center text-[11px] font-mono uppercase tracking-wider text-ink-mute hover:text-ink border-l border-line"
      >
        Sign out
      </button>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
