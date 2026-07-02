import { Routes, Route } from 'react-router-dom';
import { Header } from '@/shared/Header';
import { Footer } from '@/shared/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AboutPage } from '@/pages/AboutPage';
import { WholesalePage } from '@/pages/WholesalePage';
import { SalePointsPage } from '@/pages/SalePointsPage';
import { PartnersPage } from '@/pages/PartnersPage';

export const App = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1 pt-[112px] sm:pt-[116px]">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/wholesale" element={<WholesalePage />} />
        <Route path="/bases" element={<SalePointsPage />} />
        <Route path="/partners" element={<PartnersPage />} />
      </Routes>
    </main>
    <Footer />
  </div>
);
