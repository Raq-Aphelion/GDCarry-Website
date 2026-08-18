import type Lenis from 'lenis';

/**
 * Shared handle to the Lenis instance driving the #page-scroll scroller.
 * Set by SmoothScroll on mount; used by ScrollToTop / in-page scroll
 * targets so programmatic scrolls go through Lenis instead of fighting it
 * (a native scrollTo mid-animation gets overwritten by Lenis's next frame).
 */
export const lenisRef: { current: Lenis | null } = { current: null };

/**
 * Wheel lerp shared by the page scroller (SmoothScroll) and every inner
 * scroller (useSmoothScroller) — keep them identical so nested lists feel
 * exactly like the page. 0.15 is a middle ground: snappier than Lenis's 0.1
 * default, with a short but noticeable inertia tail. Lower values feel
 * heavier; raise toward 1 for near-native response.
 */
export const SCROLL_LERP = 0.15;
