import { useEffect } from 'react';
import Lenis from 'lenis';
import { SCROLL_LERP } from '@/lib/lenis';

/**
 * Lenis smooth scrolling for an inner scroller (cart drawer, checkout order
 * box, category sidebar, search results dropdown) — same lerp as the page
 * scroller, so nested lists feel identical to the main page. The scroller
 * must have exactly ONE child element: Lenis measures that content node to
 * size the scroll range.
 *
 * Nested inside another Lenis scroller (e.g. #page-scroll)? Do NOT add
 * data-lenis-prevent — that attribute makes the parent ignore the bubbled
 * wheel event entirely, freezing the parent at this scroller's edges.
 * Lenis nests correctly without it: while this scroller can move it marks
 * the event (lenisStopPropagation) so the parent skips it, and at its
 * edges the wheel bubbles on and the parent smooth-scrolls — proper
 * chaining. data-lenis-prevent is only for NATIVE scrollers inside a Lenis
 * wrapper (e.g. the purchase-box select dropdowns).
 */
export function useSmoothScroller(scroller: HTMLElement | null) {
  useEffect(() => {
    const content = scroller?.firstElementChild;
    if (!scroller || !(content instanceof HTMLElement)) return;
    const lenis = new Lenis({ wrapper: scroller, content, autoRaf: true, lerp: SCROLL_LERP });
    return () => lenis.destroy();
  }, [scroller]);
}
