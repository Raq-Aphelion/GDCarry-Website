import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { lenisRef } from '@/lib/lenis';

/**
 * Lenis smooth scrolling for the main page scroller (#page-scroll).
 *
 * The site scrolls inside a container below the navbar rather than the
 * viewport, so Lenis is bound to that element via `wrapper`/`content`
 * instead of running on `window`. It animates the container's real
 * scrollTop (no transforms), so the overlay Scrollbar, ScrollToTop, and
 * sticky positioning keep working untouched. Inner scrollers (category
 * sidebar, dropdowns, order summary) opt out via `data-lenis-prevent`.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const wrapper = document.getElementById('page-scroll');
    const content = wrapper?.firstElementChild;
    if (!wrapper || !(content instanceof HTMLElement)) return;

    const lenis = new Lenis({
      wrapper,
      content,
      autoRaf: true,
      lerp: 0.14,
    });
    lenisRef.current = lenis;
    // Debug handle for scroll diagnostics (harmless in prod)
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    return () => {
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  return null;
}
