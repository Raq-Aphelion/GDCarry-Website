import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import LiveChatWidget from '@/components/LiveChatWidget';
import Scrollbar from '@/components/Scrollbar';
import SmoothScroll from '@/components/SmoothScroll';
import Home from '@/pages/Home';
import CheckoutPage from '@/pages/CheckoutPage';
import GamePage from '@/pages/GamePage';
import ServicePage from '@/pages/ServicePage';
import LegalPage from '@/pages/LegalPage';
import FaqPage from '@/pages/FaqPage';
import AccountSafetyPage from '@/pages/AccountSafetyPage';
import GuidesPage from '@/pages/GuidesPage';
import WorkWithUsPage from '@/pages/WorkWithUsPage';
import { ToastProvider } from '@/context/ToastContext';
import { lenisRef } from '@/lib/lenis';
import { PricingProvider } from '@/context/PricingContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Go through Lenis when it's running: a native scrollTo mid-animation is
    // overwritten by Lenis's next frame, leaving subpages at the old position.
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else
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
            <div id="page-scroll" className="flex-1 overflow-y-auto overflow-x-clip">
              {/* Single content child: Lenis (SmoothScroll) re-measures scroll
                  height via a ResizeObserver on this element, so its height must
                  track the content — do NOT make it a flex item of #page-scroll
                  (flex-1/min-h-full there pins its box to the viewport height and
                  the observer never fires, leaving Lenis with stale dimensions).
                  min-h-full keeps the footer pinned to the bottom on short pages. */}
              <div className="flex min-h-full flex-col">
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/boosting/:gameId" element={<GamePage />} />
                    <Route path="/boosting/:gameId/:serviceId" element={<ServicePage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/legal/:docId" element={<LegalPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/account-safety" element={<AccountSafetyPage />} />
                    <Route path="/work-with-us" element={<WorkWithUsPage />} />
                    <Route path="/guides" element={<GuidesPage />} />
                    <Route path="/guides/:guideId" element={<GuidesPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </div>
            <CartDrawer />
            <Scrollbar />
            <SmoothScroll />
          </div>
          </CartProvider>
        </CurrencyProvider>
      </PricingProvider>
    </ToastProvider>
  );
}
