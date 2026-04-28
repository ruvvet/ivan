import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Approvals from "./pages/Approvals";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CompareVendors from "./pages/CompareVendors";
import ListingForm from "./pages/ListingForm";
import Login from "./pages/Login";
import Marketplace from "./pages/Marketplace";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";
import QuoteDetail from "./pages/QuoteDetail";
import Quotes from "./pages/Quotes";
import SellerAnalytics from "./pages/SellerAnalytics";
import SellerDashboard from "./pages/SellerDashboard";
import Watchlist from "./pages/Watchlist";
import { StoreProvider } from "./store";

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Marketplace />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="compare" element={<CompareVendors />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order/:id" element={<OrderConfirmation />} />
            <Route path="orders" element={<Orders />} />
            <Route path="login" element={<Login />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="quotes/:id" element={<QuoteDetail />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="seller" element={<SellerDashboard />} />
            <Route path="seller/analytics" element={<SellerAnalytics />} />
            <Route path="seller/new" element={<ListingForm />} />
            <Route path="seller/edit/:id" element={<ListingForm />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
