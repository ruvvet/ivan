import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  questionsFor,
  reviewsFor,
  seedAddresses,
  seedBusinesses,
  seedListings,
  seedNotifications,
  seedProjects,
  seedSellers,
} from "./mockData";
import type {
  Business,
  CartItem,
  Listing,
  Notification,
  Order,
  OrderLineItem,
  PaymentMethod,
  Project,
  Question,
  Quote,
  QuoteLineItem,
  QuoteVendorRequest,
  Review,
  Role,
  SavedAddress,
  Seller,
  User,
  VendorOffer,
  WatchlistItem,
} from "./types";

const CURRENT_SELLER_ID = "s_you";
const TAX_RATE = 0.0725;
const SHIPPING_FLAT = 49.0;

type PlaceOrderInput = {
  paymentMethod: PaymentMethod;
  paymentRef: string;
  buyerLabel: string;
  buyerEmail: string;
  shippingAddress: string;
  netTerms?: number;
  projectId?: string;
  deliverySlot?: string;
  requireApproval?: boolean;
  approverName?: string;
  approverEmail?: string;
  approvalThreshold?: number;
};

type CreateQuoteInput = {
  items: QuoteLineItem[];
  vendorIds: string[];
  buyerLabel: string;
  buyerEmail: string;
  projectId?: string;
};

type StoreValue = {
  // role + listings
  role: Role;
  setRole: (r: Role) => void;
  listings: Listing[];
  sellers: Seller[];
  currentSellerId: string;
  myListings: Listing[];
  getListing: (id: string) => Listing | undefined;
  offersForSku: (sku: string) => Array<VendorOffer & { listingId: string }>;
  addListing: (l: Omit<Listing, "id" | "sellerId" | "priceHistory">) => string;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  sellerById: (id: string) => Seller | undefined;
  substitutesFor: (listingId: string) => Listing[];

  // auth
  user: User;
  businesses: Business[];
  businessById: (id: string) => Business | undefined;
  signInAsBusiness: (businessId: string) => void;
  signInAsIndividual: (name: string, email: string) => void;
  signOut: () => void;
  currentBusiness: Business | undefined;

  // cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (listingId: string, quantity: number) => void;
  setCartQty: (listingId: string, quantity: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  bulkAddToCart: (rows: Array<{ sku: string; quantity: number }>) => {
    added: number;
    notFound: string[];
  };

  // checkout
  taxRate: number;
  shippingFlat: number;
  placeOrder: (input: PlaceOrderInput) => Order;
  orders: Order[];
  getOrder: (id: string) => Order | undefined;
  ordersForProject: (projectId: string) => Order[];
  approveOrder: (id: string) => void;
  denyOrder: (id: string) => void;

  // projects
  projects: Project[];
  projectById: (id: string) => Project | undefined;
  addProject: (p: Omit<Project, "id" | "ownerLabel">) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  spendForProject: (projectId: string) => number;

  // addresses
  addresses: SavedAddress[];
  addAddress: (a: Omit<SavedAddress, "id">) => string;
  removeAddress: (id: string) => void;

  // watchlist
  watchlist: WatchlistItem[];
  toggleWatch: (listingId: string) => void;
  setWatchThreshold: (listingId: string, threshold: number | undefined) => void;
  isWatched: (listingId: string) => boolean;

  // recently viewed
  recent: string[];
  recordView: (listingId: string) => void;

  // quotes
  quotes: Quote[];
  quoteById: (id: string) => Quote | undefined;
  createQuote: (input: CreateQuoteInput) => string;
  acceptQuote: (quoteId: string, sellerId: string) => void;

  // reviews + Q&A
  reviewsFor: (listingId: string) => Review[];
  questionsFor: (listingId: string) => Question[];
  addReview: (
    listingId: string,
    review: Omit<Review, "id" | "listingId" | "createdAt" | "verified">,
  ) => void;
  addQuestion: (
    listingId: string,
    askerName: string,
    body: string,
  ) => void;

  // notifications
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function flatPriceHistory(price: number) {
  const months = [
    "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10",
    "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04",
  ];
  return months.map((date, i) => ({
    date,
    price: Math.round(price * (1 + (i - 11) * 0.005) * 100) / 100,
  }));
}

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("buyer");
  const [listings, setListings] = useState<Listing[]>(seedListings);
  const [sellers] = useState<Seller[]>(seedSellers);
  const [businesses, setBusinesses] = useState<Business[]>(seedBusinesses);
  const [user, setUser] = useState<User>({ type: "guest" });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [addresses, setAddresses] = useState<SavedAddress[]>(seedAddresses);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [reviewMap, setReviewMap] = useState<Record<string, Review[]>>({});
  const [questionMap, setQuestionMap] = useState<Record<string, Question[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);

  const myListings = useMemo(
    () => listings.filter((l) => l.sellerId === CURRENT_SELLER_ID),
    [listings],
  );

  const getListing = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  );

  const offersForSku = useCallback(
    (sku: string) =>
      listings
        .filter((l) => l.sku === sku)
        .map((l) => ({
          listingId: l.id,
          sellerId: l.sellerId,
          price: l.price,
          leadTimeDays: l.leadTimeDays,
          minOrderQty: 1,
          inStock: l.inStock,
        })),
    [listings],
  );

  const addListing = useCallback<StoreValue["addListing"]>((draft) => {
    const id = newId("l");
    const newListing: Listing = {
      ...draft,
      id,
      sellerId: CURRENT_SELLER_ID,
      priceHistory: flatPriceHistory(draft.price),
    };
    setListings((prev) => [newListing, ...prev]);
    return id;
  }, []);

  const updateListing = useCallback<StoreValue["updateListing"]>((id, patch) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  }, []);

  const deleteListing = useCallback((id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const sellerById = useCallback(
    (id: string) => sellers.find((s) => s.id === id),
    [sellers],
  );

  const businessById = useCallback(
    (id: string) => businesses.find((b) => b.id === id),
    [businesses],
  );

  const currentBusiness = useMemo(
    () => (user.type === "business" ? businessById(user.businessId) : undefined),
    [user, businessById],
  );

  const substitutesFor = useCallback(
    (listingId: string) => {
      const target = listings.find((l) => l.id === listingId);
      if (!target) return [];
      return listings
        .filter(
          (l) =>
            l.id !== target.id &&
            l.category === target.category &&
            l.inStock,
        )
        .slice(0, 4);
    },
    [listings],
  );

  const signInAsBusiness = useCallback((businessId: string) => {
    setUser({ type: "business", businessId });
  }, []);

  const signInAsIndividual = useCallback((name: string, email: string) => {
    setUser({ type: "individual", name, email });
  }, []);

  const signOut = useCallback(() => {
    setUser({ type: "guest" });
  }, []);

  const addToCart = useCallback((listingId: string, quantity: number) => {
    if (quantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.listingId === listingId);
      if (existing) {
        return prev.map((c) =>
          c.listingId === listingId
            ? { ...c, quantity: c.quantity + quantity }
            : c,
        );
      }
      return [...prev, { listingId, quantity }];
    });
  }, []);

  const setCartQty = useCallback((listingId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((c) => c.listingId !== listingId)
        : prev.map((c) =>
            c.listingId === listingId ? { ...c, quantity } : c,
          ),
    );
  }, []);

  const removeFromCart = useCallback((listingId: string) => {
    setCart((prev) => prev.filter((c) => c.listingId !== listingId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const bulkAddToCart = useCallback<StoreValue["bulkAddToCart"]>(
    (rows) => {
      let added = 0;
      const notFound: string[] = [];
      const updates: Record<string, number> = {};
      for (const row of rows) {
        const match = listings.find(
          (l) => l.sku.toUpperCase() === row.sku.toUpperCase(),
        );
        if (!match) {
          notFound.push(row.sku);
          continue;
        }
        updates[match.id] = (updates[match.id] || 0) + row.quantity;
        added += row.quantity;
      }
      setCart((prev) => {
        const next = [...prev];
        for (const [listingId, qty] of Object.entries(updates)) {
          const existing = next.find((c) => c.listingId === listingId);
          if (existing) existing.quantity += qty;
          else next.push({ listingId, quantity: qty });
        }
        return next;
      });
      return { added, notFound };
    },
    [listings],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity, 0),
    [cart],
  );

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, c) => {
      const l = listings.find((x) => x.id === c.listingId);
      return l ? sum + l.price * c.quantity : sum;
    }, 0);
  }, [cart, listings]);

  const pushNotification = useCallback<StoreValue["pushNotification"]>((n) => {
    setNotifications((prev) => [
      {
        ...n,
        id: newId("n"),
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const placeOrder = useCallback<StoreValue["placeOrder"]>(
    (input) => {
      const items: OrderLineItem[] = cart
        .map((c) => {
          const l = listings.find((x) => x.id === c.listingId);
          if (!l) return null;
          return {
            listingId: l.id,
            title: l.title,
            sellerId: l.sellerId,
            unit: l.unit,
            quantity: c.quantity,
            unitPrice: l.price,
            imageEmoji: l.imageEmoji,
          };
        })
        .filter((x): x is OrderLineItem => x !== null);

      const subtotal = items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0,
      );
      const shipping = items.length > 0 ? SHIPPING_FLAT : 0;
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = Math.round((subtotal + shipping + tax) * 100) / 100;

      const requireApproval = !!input.requireApproval;

      const order: Order = {
        id: `ord_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        placedAt: new Date().toISOString(),
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping,
        tax,
        total,
        paymentMethod: input.paymentMethod,
        paymentRef: input.paymentRef,
        buyerLabel: input.buyerLabel,
        buyerEmail: input.buyerEmail,
        shippingAddress: input.shippingAddress,
        netTerms: input.netTerms,
        projectId: input.projectId,
        deliverySlot: input.deliverySlot,
        status: requireApproval ? "pending_approval" : "placed",
        approval: requireApproval
          ? {
              approverName: input.approverName ?? "Approver",
              approverEmail: input.approverEmail ?? "",
              threshold: input.approvalThreshold ?? 0,
              status: "pending",
            }
          : undefined,
      };

      if (
        !requireApproval &&
        input.paymentMethod === "purchase_order" &&
        user.type === "business"
      ) {
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === user.businessId
              ? { ...b, creditUsed: b.creditUsed + total }
              : b,
          ),
        );
      }

      setOrders((prev) => [order, ...prev]);
      setCart([]);

      if (requireApproval) {
        pushNotification({
          type: "approval_requested",
          title: "Approval requested",
          body: `Order ${order.id} ($${total.toFixed(2)}) is awaiting approval from ${order.approval?.approverName}.`,
          link: `/approvals`,
        });
      }
      return order;
    },
    [cart, listings, user, pushNotification],
  );

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const ordersForProject = useCallback(
    (projectId: string) => orders.filter((o) => o.projectId === projectId),
    [orders],
  );

  const approveOrder = useCallback(
    (id: string) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          if (o.paymentMethod === "purchase_order" && user.type === "business") {
            setBusinesses((bp) =>
              bp.map((b) =>
                b.id === user.businessId
                  ? { ...b, creditUsed: b.creditUsed + o.total }
                  : b,
              ),
            );
          }
          return {
            ...o,
            status: "placed",
            approval: o.approval
              ? { ...o.approval, status: "approved", decidedAt: new Date().toISOString() }
              : undefined,
          };
        }),
      );
      pushNotification({
        type: "po_approved",
        title: "PO approved",
        body: `Order ${id} was approved.`,
        link: `/order/${id}`,
      });
    },
    [user, pushNotification],
  );

  const denyOrder = useCallback(
    (id: string) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                approval: o.approval
                  ? { ...o.approval, status: "denied", decidedAt: new Date().toISOString() }
                  : undefined,
              }
            : o,
        ),
      );
      pushNotification({
        type: "po_denied",
        title: "PO denied",
        body: `Order ${id} was denied.`,
      });
    },
    [pushNotification],
  );

  // Projects
  const projectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );
  const addProject = useCallback<StoreValue["addProject"]>((p) => {
    const id = newId("p");
    setProjects((prev) => [
      { ...p, id, ownerLabel: "All accounts" },
      ...prev,
    ]);
    return id;
  }, []);
  const updateProject = useCallback<StoreValue["updateProject"]>((id, patch) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);
  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);
  const spendForProject = useCallback(
    (projectId: string) =>
      orders
        .filter((o) => o.projectId === projectId && o.status !== "pending_approval")
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  // Addresses
  const addAddress = useCallback<StoreValue["addAddress"]>((a) => {
    const id = newId("a");
    setAddresses((prev) => [...prev, { ...a, id }]);
    return id;
  }, []);
  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Watchlist
  const isWatched = useCallback(
    (listingId: string) => watchlist.some((w) => w.listingId === listingId),
    [watchlist],
  );
  const toggleWatch = useCallback((listingId: string) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.listingId === listingId)) {
        return prev.filter((w) => w.listingId !== listingId);
      }
      return [
        ...prev,
        {
          listingId,
          notifyOnInStock: true,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);
  const setWatchThreshold = useCallback(
    (listingId: string, threshold: number | undefined) => {
      setWatchlist((prev) =>
        prev.map((w) =>
          w.listingId === listingId ? { ...w, threshold } : w,
        ),
      );
    },
    [],
  );

  // Recent
  const recordView = useCallback((listingId: string) => {
    setRecent((prev) => {
      const next = [listingId, ...prev.filter((id) => id !== listingId)];
      return next.slice(0, 12);
    });
  }, []);

  // Quotes
  const quoteById = useCallback(
    (id: string) => quotes.find((q) => q.id === id),
    [quotes],
  );

  const createQuote = useCallback<StoreValue["createQuote"]>(
    (input) => {
      const id = newId("q");
      const vendorRequests: QuoteVendorRequest[] = input.vendorIds.map((sid) => ({
        sellerId: sid,
        status: "sent",
      }));
      const quote: Quote = {
        id,
        createdAt: new Date().toISOString(),
        buyerLabel: input.buyerLabel,
        buyerEmail: input.buyerEmail,
        projectId: input.projectId,
        items: input.items,
        vendorRequests,
        status: "open",
      };
      setQuotes((prev) => [quote, ...prev]);

      // Simulate vendors responding over a short window
      input.vendorIds.forEach((sid, idx) => {
        const delay = 1500 + idx * 1500 + Math.random() * 1000;
        setTimeout(() => {
          const refSubtotal = input.items.reduce(
            (s, i) => s + i.referencePrice * i.quantity,
            0,
          );
          // Random discount/markup ±8%
          const factor = 0.92 + Math.random() * 0.16;
          const responsePrice = Math.round(refSubtotal * factor * 100) / 100;
          const responseLeadTime = 2 + Math.floor(Math.random() * 7);
          const declined = Math.random() < 0.15;

          setQuotes((prev) =>
            prev.map((q) =>
              q.id === id
                ? {
                    ...q,
                    vendorRequests: q.vendorRequests.map((vr) =>
                      vr.sellerId === sid
                        ? declined
                          ? {
                              ...vr,
                              status: "declined",
                              respondedAt: new Date().toISOString(),
                            }
                          : {
                              ...vr,
                              status: "responded",
                              responsePrice,
                              responseLeadTime,
                              responseNotes: "FOB origin · pallet pricing applied",
                              respondedAt: new Date().toISOString(),
                            }
                        : vr,
                    ),
                  }
                : q,
            ),
          );
          if (!declined) {
            const seller = sellers.find((s) => s.id === sid);
            pushNotification({
              type: "quote_response",
              title: "Quote response",
              body: `${seller?.name ?? "A vendor"} responded to RFQ ${id} with $${responsePrice.toFixed(2)}.`,
              link: `/quotes/${id}`,
            });
          }
        }, delay);
      });

      return id;
    },
    [sellers, pushNotification],
  );

  const acceptQuote = useCallback(
    (quoteId: string, sellerId: string) => {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId
            ? { ...q, status: "accepted", acceptedSellerId: sellerId }
            : q,
        ),
      );
    },
    [],
  );

  // Reviews + Q&A
  const reviewsForCb = useCallback(
    (listingId: string) =>
      reviewMap[listingId] ?? (reviewMap[listingId] = reviewsFor(listingId)),
    [reviewMap],
  );
  const questionsForCb = useCallback(
    (listingId: string) =>
      questionMap[listingId] ??
      (questionMap[listingId] = questionsFor(listingId)),
    [questionMap],
  );
  const addReview = useCallback<StoreValue["addReview"]>(
    (listingId, review) => {
      setReviewMap((prev) => {
        const existing = prev[listingId] ?? reviewsFor(listingId);
        const r: Review = {
          ...review,
          id: newId("r"),
          listingId,
          createdAt: new Date().toISOString(),
          verified: false,
        };
        return { ...prev, [listingId]: [r, ...existing] };
      });
    },
    [],
  );
  const addQuestion = useCallback<StoreValue["addQuestion"]>(
    (listingId, askerName, body) => {
      setQuestionMap((prev) => {
        const existing = prev[listingId] ?? questionsFor(listingId);
        const q: Question = {
          id: newId("q"),
          listingId,
          askerName,
          body,
          createdAt: new Date().toISOString(),
        };
        return { ...prev, [listingId]: [q, ...existing] };
      });
    },
    [],
  );

  // Notifications
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Auto-trigger price-drop / back-in-stock notifications based on watchlist (mock)
  useEffect(() => {
    if (watchlist.length === 0) return;
    const id = setTimeout(() => {
      // no-op safety; real app would diff prices
    }, 0);
    return () => clearTimeout(id);
  }, [watchlist]);

  const value: StoreValue = {
    role,
    setRole,
    listings,
    sellers,
    currentSellerId: CURRENT_SELLER_ID,
    myListings,
    getListing,
    offersForSku,
    addListing,
    updateListing,
    deleteListing,
    sellerById,
    substitutesFor,
    user,
    businesses,
    businessById,
    signInAsBusiness,
    signInAsIndividual,
    signOut,
    currentBusiness,
    cart,
    cartCount,
    cartSubtotal,
    addToCart,
    setCartQty,
    removeFromCart,
    clearCart,
    bulkAddToCart,
    taxRate: TAX_RATE,
    shippingFlat: SHIPPING_FLAT,
    placeOrder,
    orders,
    getOrder,
    ordersForProject,
    approveOrder,
    denyOrder,
    projects,
    projectById,
    addProject,
    updateProject,
    deleteProject,
    spendForProject,
    addresses,
    addAddress,
    removeAddress,
    watchlist,
    toggleWatch,
    setWatchThreshold,
    isWatched,
    recent,
    recordView,
    quotes,
    quoteById,
    createQuote,
    acceptQuote,
    reviewsFor: reviewsForCb,
    questionsFor: questionsForCb,
    addReview,
    addQuestion,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    pushNotification,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
