import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Lenis smooth scrolling for an inner scroller (cart drawer, checkout order
 * box, search results dropdown) — same lerp as the page scroller, so nested
 * lists feel identical to the main page. The scroller must have exactly ONE
 * child element: Lenis measures that content node to size the scroll range.
 * Scroll inside #page-scroll? Then the scroller also needs data-lenis-prevent
 * so the page Lenis leaves its wheel events alone.
 */
export function useSmoothScroller(scroller: HTMLElement | null) {
  useEffect(() => {
    const content = scroller?.firstElementChild;
    if (!scroller || !(content instanceof HTMLElement)) return;
    const lenis = new Lenis({ wrapper: scroller, content, autoRaf: true, lerp: 0.14 });
    return () => lenis.destroy();
  }, [scroller]);
}
