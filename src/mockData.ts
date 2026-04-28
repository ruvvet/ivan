import type {
  Business,
  Listing,
  Notification,
  Project,
  Question,
  Review,
  SavedAddress,
  Seller,
} from "./types";

const months = [
  "2025-05",
  "2025-06",
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
];

function priceCurve(start: number, drift: number, volatility = 0.04) {
  let p = start;
  return months.map((m, i) => {
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * volatility;
    p = p * (1 + drift + noise);
    return { date: m, price: Math.round(p * 100) / 100 };
  });
}

export const seedBusinesses: Business[] = [
  {
    id: "b_apex",
    name: "Apex Construction Co.",
    contactName: "Dana Reyes",
    email: "ap@apexconstruction.com",
    netTerms: 30,
    creditLimit: 50000,
    creditUsed: 8420.5,
    taxId: "47-1234567",
    approvalThreshold: 1000,
    approverName: "Marcus Reyes",
    approverEmail: "marcus@apexconstruction.com",
  },
  {
    id: "b_bluestone",
    name: "Bluestone Builders LLC",
    contactName: "Marcus Chen",
    email: "purchasing@bluestonebuilders.com",
    netTerms: 60,
    creditLimit: 100000,
    creditUsed: 22150.0,
    taxId: "82-9876543",
    approvalThreshold: 5000,
    approverName: "Tia Bluestone",
    approverEmail: "tia@bluestonebuilders.com",
  },
  {
    id: "b_redoak",
    name: "Red Oak Renovations",
    contactName: "Priya Patel",
    email: "po@redoakreno.com",
    netTerms: 30,
    creditLimit: 25000,
    creditUsed: 0,
    taxId: "13-5550199",
    approvalThreshold: 500,
    approverName: "Anil Patel",
    approverEmail: "anil@redoakreno.com",
  },
];

export const seedSellers: Seller[] = [
  { id: "s_acme", name: "Acme Building Supply", rating: 4.6, location: "Dallas, TX" },
  { id: "s_ironside", name: "Ironside Materials Co", rating: 4.4, location: "Pittsburgh, PA" },
  { id: "s_pacific", name: "Pacific Lumber Yard", rating: 4.8, location: "Portland, OR" },
  { id: "s_granite", name: "Granite State Concrete", rating: 4.3, location: "Manchester, NH" },
  { id: "s_you", name: "Ivan's Hardware (You)", rating: 5.0, location: "Madison, WI" },
];

export const seedListings: Listing[] = [
  {
    id: "l_rebar_acme",
    sellerId: "s_acme",
    sku: "REBAR-#5-20FT",
    title: "#5 Rebar — 20ft Grade 60",
    category: "Steel & Rebar",
    description:
      "ASTM A615 Grade 60 deformed steel reinforcing bar. Standard 20ft lengths, bundled 50/pallet.",
    unit: "per bar",
    price: 18.4,
    leadTimeDays: 4,
    inStock: true,
    imageEmoji: "🪵",
    specSheetUrl: "#",
    specs: {
      Diameter: "5/8 in (15.875 mm)",
      "Weight per ft": "1.043 lb",
      Length: "20 ft",
      Grade: "60 (ASTM A615)",
      Coating: "Black (uncoated)",
    },
    priceHistory: priceCurve(16.5, 0.012),
  },
  {
    id: "l_rebar_ironside",
    sellerId: "s_ironside",
    sku: "REBAR-#5-20FT",
    title: "#5 Rebar — 20ft Grade 60",
    category: "Steel & Rebar",
    description:
      "Domestic mill-direct #5 rebar. Same ASTM A615 spec, ships from PA.",
    unit: "per bar",
    price: 17.95,
    leadTimeDays: 7,
    inStock: true,
    imageEmoji: "🪵",
    specSheetUrl: "#",
    specs: {
      Diameter: "5/8 in (15.875 mm)",
      "Weight per ft": "1.043 lb",
      Length: "20 ft",
      Grade: "60 (ASTM A615)",
      Coating: "Black (uncoated)",
    },
    priceHistory: priceCurve(16.0, 0.014),
  },
  {
    id: "l_rebar_granite",
    sellerId: "s_granite",
    sku: "REBAR-#5-20FT",
    title: "#5 Rebar — 20ft Grade 60",
    category: "Steel & Rebar",
    description:
      "New England regional supplier. Slightly higher price, fastest lead time on the East Coast.",
    unit: "per bar",
    price: 19.25,
    leadTimeDays: 2,
    inStock: false,
    imageEmoji: "🪵",
    specSheetUrl: "#",
    specs: {
      Diameter: "5/8 in (15.875 mm)",
      "Weight per ft": "1.043 lb",
      Length: "20 ft",
      Grade: "60 (ASTM A615)",
      Coating: "Black (uncoated)",
    },
    priceHistory: priceCurve(17.0, 0.011),
  },
  {
    id: "l_2x4_pacific",
    sellerId: "s_pacific",
    sku: "LMB-2X4-8-SPF",
    title: "2x4x8 SPF Stud Lumber",
    category: "Lumber",
    description:
      "Kiln-dried Spruce-Pine-Fir framing studs. PEFC certified, sold by the unit (294/bundle).",
    unit: "per stud",
    price: 3.42,
    leadTimeDays: 3,
    inStock: true,
    imageEmoji: "🌲",
    specSheetUrl: "#",
    specs: {
      Species: "Spruce-Pine-Fir (SPF)",
      Grade: "Stud",
      Dimensions: "1.5 × 3.5 × 96 in",
      Moisture: "≤19% (KD-HT)",
      Certification: "PEFC",
    },
    priceHistory: priceCurve(3.2, 0.006),
  },
  {
    id: "l_2x4_acme",
    sellerId: "s_acme",
    sku: "LMB-2X4-8-SPF",
    title: "2x4x8 SPF Stud Lumber",
    category: "Lumber",
    description: "Same SPF stud spec, sourced from southern mills.",
    unit: "per stud",
    price: 3.65,
    leadTimeDays: 5,
    inStock: true,
    imageEmoji: "🌲",
    specSheetUrl: "#",
    specs: {
      Species: "Spruce-Pine-Fir (SPF)",
      Grade: "Stud",
      Dimensions: "1.5 × 3.5 × 96 in",
      Moisture: "≤19% (KD-HT)",
      Certification: "PEFC",
    },
    priceHistory: priceCurve(3.4, 0.008),
  },
  {
    id: "l_concrete_granite",
    sellerId: "s_granite",
    sku: "CONC-94LB-T1",
    title: "Portland Cement Type I — 94lb bag",
    category: "Concrete & Masonry",
    description:
      "ASTM C150 Type I Portland cement. 94lb bags, 40 bags/pallet, shrink-wrapped.",
    unit: "per bag",
    price: 14.8,
    leadTimeDays: 5,
    inStock: true,
    imageEmoji: "🪨",
    specSheetUrl: "#",
    specs: {
      Type: "Type I (ASTM C150)",
      "Bag weight": "94 lb (42.6 kg)",
      "Pallet qty": "40 bags",
      Color: "Gray",
    },
    priceHistory: priceCurve(13.5, 0.009),
  },
  {
    id: "l_drywall_acme",
    sellerId: "s_acme",
    sku: "DRY-1/2-4X8",
    title: '1/2" Drywall Panel — 4x8',
    category: "Drywall",
    description: "Standard gypsum board, tapered edge. 50 panels/pallet.",
    unit: "per panel",
    price: 12.5,
    leadTimeDays: 4,
    inStock: false,
    imageEmoji: "⬜",
    specSheetUrl: "#",
    specs: {
      Thickness: "1/2 in",
      Size: "4 × 8 ft",
      Edge: "Tapered",
      Standard: "ASTM C1396",
    },
    priceHistory: priceCurve(11.5, 0.005),
  },
];

export const seedProjects: Project[] = [
  {
    id: "p_main_st",
    name: "Main St Renovation",
    status: "active",
    budget: 45000,
    startDate: "2026-03-15",
    endDate: "2026-07-30",
    description: "Full structural renovation, framing through finish.",
    ownerLabel: "All accounts",
  },
  {
    id: "p_bldg4",
    name: "Building 4 Frame-Up",
    status: "active",
    budget: 120000,
    startDate: "2026-04-01",
    description: "New construction, frame phase.",
    ownerLabel: "All accounts",
  },
  {
    id: "p_warehouse",
    name: "Warehouse Slab Repair",
    status: "on-hold",
    budget: 8000,
    startDate: "2026-02-10",
    description: "Concrete slab patch and re-pour, sections C-E.",
    ownerLabel: "All accounts",
  },
];

export const seedAddresses: SavedAddress[] = [
  {
    id: "a_main_st",
    label: "Main St — site office",
    contactName: "Jamal Carter",
    line1: "412 Main St",
    city: "Madison",
    state: "WI",
    zip: "53703",
    projectId: "p_main_st",
  },
  {
    id: "a_bldg4",
    label: "Building 4 — gate B",
    contactName: "Sue Lin",
    line1: "8800 Industry Pkwy, Bldg 4",
    city: "Madison",
    state: "WI",
    zip: "53711",
    projectId: "p_bldg4",
  },
  {
    id: "a_office",
    label: "Office HQ",
    contactName: "Reception",
    line1: "200 W Washington Ave",
    city: "Madison",
    state: "WI",
    zip: "53703",
  },
];

const REVIEW_AUTHORS = [
  "M. Torres",
  "J. Patel",
  "K. Nguyen",
  "S. Bauer",
  "L. Okafor",
  "D. Rivera",
  "T. Holloway",
  "R. Kowalski",
];

const REVIEW_BODIES = [
  "Solid quality, exactly as spec'd. Will order again.",
  "Lead time was a day faster than quoted — appreciated.",
  "Bundle had a few damaged pieces but support replaced them no questions asked.",
  "Used these on a 4-story frame-up. Zero issues. Mill-direct quality.",
  "Pricing is competitive vs the big-box stores once you factor in delivery.",
  "Specs match the cut sheet. Inspector had no complaints.",
  "Packaging could be tighter but the product itself is fine.",
  "Reliable. We've reordered three times this quarter.",
];

const QUESTION_BODIES = [
  "Can you confirm this meets ASTM A615 epoxy-coated requirements?",
  "What's the typical bundle weight for shipping calculations?",
  "Do you offer cut-to-length service?",
  "Is there a discount on full pallet quantities?",
];

const ANSWER_BODIES: Record<number, string> = {
  0: "Yes — the listed grade meets ASTM A615; this SKU is uncoated. Epoxy-coated is a separate SKU available on request.",
  1: "A 50-piece bundle weighs approximately 1,043 lb. We bundle to forklift-friendly specs.",
  2: "Yes, cut-to-length is available on orders of 100+ bars. Adds 1–2 days to lead time.",
  3: "Yes — pallet pricing is 6% off list. Pricing tier is automatic at checkout.",
};

// deterministic per-listing reviews/questions
function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function reviewsFor(listingId: string): Review[] {
  const seed = hashStr(listingId);
  const count = 3 + (seed % 3);
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const a = (seed + i * 7) % REVIEW_AUTHORS.length;
    const b = (seed + i * 13) % REVIEW_BODIES.length;
    const r = 4 + ((seed + i) % 11) * 0.1; // 4.0..5.0
    out.push({
      id: `${listingId}_r${i}`,
      listingId,
      authorName: REVIEW_AUTHORS[a],
      rating: Math.min(5, Math.round(r * 10) / 10),
      body: REVIEW_BODIES[b],
      createdAt: `2026-0${1 + (i % 4)}-${String(5 + i * 3).padStart(2, "0")}`,
      verified: i % 2 === 0,
    });
  }
  return out;
}

export function questionsFor(listingId: string): Question[] {
  const seed = hashStr(listingId);
  const count = 1 + (seed % 3);
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const q = (seed + i * 11) % QUESTION_BODIES.length;
    const a = (seed + i * 5) % REVIEW_AUTHORS.length;
    out.push({
      id: `${listingId}_q${i}`,
      listingId,
      askerName: REVIEW_AUTHORS[a],
      body: QUESTION_BODIES[q],
      answer:
        i % 2 === 0
          ? {
              authorName: "Vendor support",
              body: ANSWER_BODIES[q],
              createdAt: `2026-03-${String(10 + i).padStart(2, "0")}`,
            }
          : undefined,
      createdAt: `2026-03-${String(5 + i * 2).padStart(2, "0")}`,
    });
  }
  return out;
}

export const seedNotifications: Notification[] = [
  {
    id: "n_1",
    type: "back_in_stock",
    title: "Back in stock",
    body: "REBAR-#5-20FT from Granite State Concrete is back in stock at $19.25.",
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    read: false,
    link: "/product/l_rebar_granite",
  },
  {
    id: "n_2",
    type: "price_drop",
    title: "Price drop",
    body: "DRY-1/2-4X8 dropped to $12.50 (–4%).",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    link: "/product/l_drywall_acme",
  },
  {
    id: "n_3",
    type: "system",
    title: "Welcome to Ivan's",
    body: "Try the bulk-add tool on the cart page or send your first RFQ from a multi-vendor SKU.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
];
