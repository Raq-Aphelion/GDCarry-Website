import type Lenis from 'lenis';

/**
 * Shared handle to the Lenis instance driving the #page-scroll scroller.
 * Set by SmoothScroll on mount; used by ScrollToTop / in-page scroll
 * targets so programmatic scrolls go through Lenis instead of fighting it
 * (a native scrollTo mid-animation gets overwritten by Lenis's next frame).
 */
export const lenisRef: { current: Lenis | null } = { current: null };
