import { Routes, Route } from 'react-router-dom';
import { Header } from '@/shared/Header';
import { Footer } from '@/shared/Footer';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { CartPage } from '@/pages/CartPage';

const App = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
