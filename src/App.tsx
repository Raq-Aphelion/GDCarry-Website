import { Suspense, lazy, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import NeedHelpCard from '@/components/NeedHelpCard';
import LiveChatWidget from '@/components/LiveChatWidget';
import Scrollbar from '@/components/Scrollbar';
import SmoothScroll from '@/components/SmoothScroll';
import TruncationTooltip from '@/components/TruncationTooltip';
import Home from '@/pages/Home';

// Route-level code splitting: every page except Home loads as its own chunk,
// so first paint only downloads the landing page. Vite re-splits automatically
// on every build — no per-build step needed. The prerender script waits 4s
// after domcontentloaded, so lazy chunks are fully loaded in snapshots.
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
// Game/service pages: one wrapper per game (src/pages/games/) around the
// shared GamePageCore/ServicePageCore — each wrapper is a lazy chunk that
// pins its gameId, so game-specific overrides can live in the wrapper and
// the shared core stays single-source. Unknown game ids fall through to the
// generic :gameId route, which redirects home.
const GamePageFFXIV = lazy(() => import('@/pages/games/GamePageFFXIV'));
const GamePageWoW = lazy(() => import('@/pages/games/GamePageWoW'));
const GamePageLostArk = lazy(() => import('@/pages/games/GamePageLostArk'));
const GamePageWarframe = lazy(() => import('@/pages/games/GamePageWarframe'));
const GamePageRuneScape = lazy(() => import('@/pages/games/GamePageRuneScape'));
const ServicePageFFXIV = lazy(() => import('@/pages/games/ServicePageFFXIV'));
const ServicePageWoW = lazy(() => import('@/pages/games/ServicePageWoW'));
const ServicePageLostArk = lazy(() => import('@/pages/games/ServicePageLostArk'));
const ServicePageWarframe = lazy(() => import('@/pages/games/ServicePageWarframe'));
const ServicePageRuneScape = lazy(() => import('@/pages/games/ServicePageRuneScape'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const AccountSafetyPage = lazy(() => import('@/pages/AccountSafetyPage'));
const GuidesPage = lazy(() => import('@/pages/GuidesPage'));
const WorkWithUsPage = lazy(() => import('@/pages/WorkWithUsPage'));
import { ToastProvider } from '@/context/ToastContext';
import { lenisRef, CATEGORY_JUMP_EVENT, categoryGridLandingTop } from '@/lib/lenis';
import { PricingProvider } from '@/context/PricingContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';

function ScrollToTop() {
  const { pathname, state } = useLocation();
  // Only path changes scroll. Same-path navigations (category ?cat= switches,
  // ?q= searches) are owned by the page's own scroll logic — setSearchParams
  // drops location.state, so reacting to `state` would re-fire a top-scroll
  // on the first category switch after a scrollToGrid arrival.
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    // Category jump (service subpage sidebar / mobile chips): land at the
    // exact snap point the game page's own category switching uses
    // (categoryGridLandingTop) — desktop pins the sidebar on its sticky slot,
    // mobile puts the grid right under the chips bar, so the switch is
    // seamless either way. The game page is a lazy chunk, so retry briefly
    // while it mounts.
    if ((state as { scrollToGrid?: boolean } | null)?.scrollToGrid) {
      let tries = 0;
      const jump = () => {
        const el = document.getElementById('category-grid');
        const scroller = document.getElementById('page-scroll');
        if (el && scroller) {
          const top = categoryGridLandingTop(el, scroller);
          const lenis = lenisRef.current;
          if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
          else scroller.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
          // Tell the game page to pin the landed state — the jump may produce
          // no usable scroll event for its direction heuristic. Fire again
          // deferred: on the very commit the page mounts, its passive effects
          // (the listener) can flush AFTER the grid is already in the DOM, so
          // the immediate dispatch can arrive too early.
          const fire = () => window.dispatchEvent(new Event(CATEGORY_JUMP_EVENT));
          fire();
          setTimeout(fire, 50);
        } else if (tries++ < 20) {
          setTimeout(jump, 50);
        }
      };
      jump();
      return;
    }
    // Go through Lenis when it's running: a native scrollTo mid-animation is
    // overwritten by Lenis's next frame, leaving subpages at the old position.
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else
      document.getElementById('page-scroll')?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, state]);
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
                  {/* fallback=null keeps navbar/footer visible while a page
                      chunk loads; the chunk fetch is fast on repeat visits. */}
                  <Suspense fallback={null}>
                    <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/boosting/ffxiv" element={<GamePageFFXIV />} />
                    <Route path="/boosting/wow" element={<GamePageWoW />} />
                    <Route path="/boosting/lost-ark" element={<GamePageLostArk />} />
                    <Route path="/boosting/warframe" element={<GamePageWarframe />} />
                    <Route path="/boosting/runescape" element={<GamePageRuneScape />} />
                    {/* Unknown game id — redirect home (old generic route) */}
                    <Route path="/boosting/:gameId" element={<Navigate to="/" replace />} />
                    <Route path="/boosting/ffxiv/:serviceId" element={<ServicePageFFXIV />} />
                    <Route path="/boosting/wow/:serviceId" element={<ServicePageWoW />} />
                    <Route path="/boosting/lost-ark/:serviceId" element={<ServicePageLostArk />} />
                    <Route path="/boosting/warframe/:serviceId" element={<ServicePageWarframe />} />
                    <Route path="/boosting/runescape/:serviceId" element={<ServicePageRuneScape />} />
                    {/* Unknown game/service id — redirect home */}
                    <Route path="/boosting/:gameId/:serviceId" element={<Navigate to="/" replace />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/legal/:docId" element={<LegalPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/account-safety" element={<AccountSafetyPage />} />
                    <Route path="/work-with-us" element={<WorkWithUsPage />} />
                    <Route path="/guides" element={<GuidesPage />} />
                    <Route path="/guides/:guideId" element={<GuidesPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </div>
            <CartDrawer />
            <NeedHelpCard />
            <Scrollbar />
            <SmoothScroll />
            <TruncationTooltip />
          </div>
          </CartProvider>
        </CurrencyProvider>
      </PricingProvider>
    </ToastProvider>
  );
}
