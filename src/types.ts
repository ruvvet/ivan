export type Role = "buyer" | "seller";

export type PricePoint = {
  date: string;
  price: number;
};

export type VendorOffer = {
  sellerId: string;
  price: number;
  leadTimeDays: number;
  minOrderQty: number;
  inStock: boolean;
};

export type Listing = {
  id: string;
  sellerId: string;
  title: string;
  category: string;
  description: string;
  unit: string;
  price: number;
  leadTimeDays: number;
  inStock: boolean;
  imageEmoji: string;
  specSheetUrl: string;
  specs: Record<string, string>;
  priceHistory: PricePoint[];
  sku: string;
};

export type Seller = {
  id: string;
  name: string;
  rating: number;
  location: string;
};

export type CartItem = {
  listingId: string;
  quantity: number;
};

export type Business = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  netTerms: number;
  creditLimit: number;
  creditUsed: number;
  taxId: string;
  approvalThreshold: number;
  approverName: string;
  approverEmail: string;
};

export type User =
  | { type: "guest" }
  | { type: "individual"; name: string; email: string }
  | { type: "business"; businessId: string };

export type PaymentMethod = "credit_card" | "purchase_order";

export type OrderLineItem = {
  listingId: string;
  title: string;
  sellerId: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  imageEmoji: string;
};

export type OrderStatus = "pending_approval" | "placed" | "shipped" | "delivered";

export type Order = {
  id: string;
  placedAt: string;
  items: OrderLineItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentRef: string;
  buyerLabel: string;
  buyerEmail: string;
  shippingAddress: string;
  netTerms?: number;
  projectId?: string;
  status: OrderStatus;
  deliverySlot?: string;
  approval?: {
    approverName: string;
    approverEmail: string;
    threshold: number;
    status: "pending" | "approved" | "denied";
    decidedAt?: string;
  };
};

export type Project = {
  id: string;
  name: string;
  status: "active" | "complete" | "on-hold";
  budget: number;
  startDate: string;
  endDate?: string;
  description?: string;
  ownerLabel: string;
};

export type SavedAddress = {
  id: string;
  label: string;
  contactName: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  projectId?: string;
};

export type WatchlistItem = {
  listingId: string;
  threshold?: number;
  notifyOnInStock: boolean;
  addedAt: string;
};

export type QuoteVendorRequest = {
  sellerId: string;
  status: "sent" | "responded" | "declined";
  responsePrice?: number;
  responseLeadTime?: number;
  responseNotes?: string;
  respondedAt?: string;
};

export type QuoteLineItem = {
  listingId: string;
  sku: string;
  title: string;
  imageEmoji: string;
  quantity: number;
  referencePrice: number;
};

export type Quote = {
  id: string;
  createdAt: string;
  buyerLabel: string;
  buyerEmail: string;
  projectId?: string;
  items: QuoteLineItem[];
  vendorRequests: QuoteVendorRequest[];
  status: "open" | "accepted" | "expired";
  acceptedSellerId?: string;
};

export type Review = {
  id: string;
  listingId: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
  verified: boolean;
};

export type Question = {
  id: string;
  listingId: string;
  askerName: string;
  body: string;
  answer?: { authorName: string; body: string; createdAt: string };
  createdAt: string;
};

export type Notification = {
  id: string;
  type:
    | "po_approved"
    | "po_denied"
    | "approval_requested"
    | "back_in_stock"
    | "price_drop"
    | "quote_response"
    | "order_shipped"
    | "system";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
};
