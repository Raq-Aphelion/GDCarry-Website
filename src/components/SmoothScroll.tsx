import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { lenisRef, SCROLL_LERP } from '@/lib/lenis';

/**
 * Lenis smooth scrolling for the main page scroller (#page-scroll).
 *
 * The site scrolls inside a container below the navbar rather than the
 * viewport, so Lenis is bound to that element via `wrapper`/`content`
 * instead of running on `window`. It animates the container's real
 * scrollTop (no transforms), so the overlay Scrollbar, ScrollToTop, and
 * sticky positioning keep working untouched. Native inner scrollers (the
 * purchase-box select dropdowns) opt out via `data-lenis-prevent`; inner
 * scrollers with their own Lenis instance (category sidebar, order summary,
 * cart) nest via lenisStopPropagation instead — see useSmoothScroller.
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
      lerp: SCROLL_LERP,
    });
    lenisRef.current = lenis;
    // Debug handle for scroll diagnostics (harmless in prod)
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;

    // Wheel over a data-lenis-prevent element is skipped by Lenis and scrolls
    // natively. When that element can't scroll further in the wheel direction,
    // the browser chains the delta to #page-scroll natively — but Lenis only
    // re-syncs from native scrolls while idle, so an in-flight animation would
    // overwrite the chained scroll on its next frame and the page would feel
    // locked (e.g. hovering the category sidebar right after a page scroll).
    // Snapping the animation target to the live scroll position (the public
    // equivalent of reset()) stops the animation and hands control to the
    // native scroll. Inner scrollers with their own Lenis consume wheel events
    // themselves, so this guard only ever fires for native prevented scrollers.
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0 || !(e.target instanceof Element)) return;
      const prevented = e.target.closest('[data-lenis-prevent]');
      if (!(prevented instanceof HTMLElement)) return;
      const atTop = prevented.scrollTop <= 0;
      const atBottom = prevented.scrollTop >= prevented.scrollHeight - prevented.clientHeight - 1;
      const cantScroll = prevented.scrollHeight <= prevented.clientHeight + 1;
      if (cantScroll || (e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        lenis.scrollTo(lenis.actualScroll, { immediate: true });
      }
    };
    // Capture phase: runs before any inner Lenis sees the event.
    wrapper.addEventListener('wheel', onWheel, { capture: true, passive: true });

    return () => {
      wrapper.removeEventListener('wheel', onWheel, { capture: true });
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  return null;
}
