import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/AdminLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProductsPage, ProductFormPage } from "@/pages/ProductsPage";
import { CategoriesPage, CategoryFormPage } from "@/pages/CategoriesPage";
import { SalePointsPage, SalePointFormPage } from "@/pages/SalePointsPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ServicesPage, ServiceFormPage } from "@/pages/ServicesPage";
import { WholesalePricesPage } from "@/pages/WholesalePricesPage";
import { DeliveryZonesPage, DeliveryZoneFormPage } from "@/pages/DeliveryZonesPage";
import { BannersPage, BannerFormPage } from "@/pages/BannersPage";
import { PartnerApplicationsPage } from "@/pages/PartnerApplicationsPage";
import { CpRequestsPage } from "@/pages/CpRequestsPage";
import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { FeedbackPage } from "@/pages/FeedbackPage";
import { ReviewsPage, ReviewFormPage } from "@/pages/ReviewsPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/new" element={<CategoryFormPage />} />
        <Route path="categories/:id" element={<CategoryFormPage />} />
        <Route path="sale-points" element={<SalePointsPage />} />
        <Route path="sale-points/new" element={<SalePointFormPage />} />
        <Route path="sale-points/:id" element={<SalePointFormPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/new" element={<ServiceFormPage />} />
        <Route path="services/:id" element={<ServiceFormPage />} />
        <Route path="wholesale" element={<WholesalePricesPage />} />
        <Route path="delivery-zones" element={<DeliveryZonesPage />} />
        <Route path="delivery-zones/new" element={<DeliveryZoneFormPage />} />
        <Route path="delivery-zones/:id" element={<DeliveryZoneFormPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="banners/new" element={<BannerFormPage />} />
        <Route path="banners/:id" element={<BannerFormPage />} />
        <Route path="partner-applications" element={<PartnerApplicationsPage />} />
        <Route path="cp-requests" element={<CpRequestsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reviews/new" element={<ReviewFormPage />} />
        <Route path="reviews/:id" element={<ReviewFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
