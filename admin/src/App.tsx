import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AdminLayout } from "./components/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductFormPage } from "./pages/ProductFormPage";
import { SalePointsPage } from "./pages/SalePointsPage";
import { SalePointFormPage } from "./pages/SalePointFormPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ServiceFormPage } from "./pages/ServiceFormPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { ReviewFormPage } from "./pages/ReviewFormPage";

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
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="sale-points" element={<SalePointsPage />} />
        <Route path="sale-points/new" element={<SalePointFormPage />} />
        <Route path="sale-points/:id" element={<SalePointFormPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/new" element={<ServiceFormPage />} />
        <Route path="services/:id" element={<ServiceFormPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="reviews/new" element={<ReviewFormPage />} />
        <Route path="reviews/:id" element={<ReviewFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
