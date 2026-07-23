import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import LiveChatWidget from '@/components/LiveChatWidget';
import Scrollbar from '@/components/Scrollbar';
import Home from '@/pages/Home';
import CheckoutPage from '@/pages/CheckoutPage';
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
    document.getElementById('page-scroll')?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <PricingProvider>
        <CurrencyProvider>
          <CartProvider>
          <div className="flex h-[100svh] flex-col overflow-hidden">
            <ScrollToTop />
            <LiveChatWidget />
            <Navbar />
            {/* The page scrolls inside this container, not the viewport — so the
                scrollbar physically starts below the navbar and is fully
                stylable (transparent track, content-colored) in every browser. */}
            <div id="page-scroll" className="flex flex-1 flex-col overflow-y-auto overflow-x-clip">
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/boosting/:gameId" element={<GamePage />} />
                  <Route path="/boosting/:gameId/:serviceId" element={<ServicePage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/legal/:docId" element={<LegalPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <CartDrawer />
            <Scrollbar />
          </div>
          </CartProvider>
        </CurrencyProvider>
      </PricingProvider>
    </ToastProvider>
  );
}
