import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Home from '@/pages/Home';
import GamePage from '@/pages/GamePage';
import ServicePage from '@/pages/ServicePage';
import LegalPage from '@/pages/LegalPage';
import { ToastProvider } from '@/context/ToastContext';
import { PricingProvider } from '@/context/PricingContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <PricingProvider>
        <CurrencyProvider>
          <CartProvider>
          <div className="flex min-h-screen flex-col">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/boosting/:gameId" element={<GamePage />} />
                <Route path="/boosting/:gameId/:serviceId" element={<ServicePage />} />
                <Route path="/legal/:docId" element={<LegalPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </div>
          </CartProvider>
        </CurrencyProvider>
      </PricingProvider>
    </ToastProvider>
  );
}
