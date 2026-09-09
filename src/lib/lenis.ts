import type Lenis from 'lenis';

/**
 * Shared handle to the Lenis instance driving the #page-scroll scroller.
 * Set by SmoothScroll on mount; used by ScrollToTop / in-page scroll
 * targets so programmatic scrolls go through Lenis instead of fighting it
 * (a native scrollTo mid-animation gets overwritten by Lenis's next frame).
 */
export const lenisRef: { current: Lenis | null } = { current: null };

/**
 * Fired by ScrollToTop after a category-jump landing (service subpage → game
 * category). GamePageCore listens to pin the landed state (chips bar shown,
 * label state read from real geometry) and lock its scroll-direction
 * heuristic briefly — the jump's own scroll events would otherwise read as a
 * deliberate scroll and could hide the chips bar right after landing (an
 * upward jump from a deep-scrolled service page, or a downward one from a
 * near-top one).
 */
export const CATEGORY_JUMP_EVENT = 'gd:category-jump';

/**
 * The scroll target (in #page-scroll content coordinates) where a game
 * page's category grid sits in its "seamless" position — the same point the
 * game page itself snaps to on category switches while the hero is out of
 * view:
 * - desktop: the sidebar lands exactly at its sticky offset (top-8 = 32px),
 *   so switching between a service subpage and the game page never moves it;
 * - mobile: the grid's top edge sits right below the sticky category chips
 *   bar.
 * Shared by ScrollToTop (service subpage → game category jumps) and
 * GamePageCore's category-change effect so every navigation path lands
 * pixel-identical.
 */
export function categoryGridLandingTop(el: HTMLElement, scroller: HTMLElement): number {
  const isMobile = window.matchMedia('(max-width: 1023px)').matches;
  const bar = document.getElementById('mobile-category-bar');
  const top =
    el.getBoundingClientRect().top + scroller.scrollTop - scroller.getBoundingClientRect().top;
  if (isMobile && bar) return top - bar.getBoundingClientRect().height;
  // Desktop: the aside is the grid's first child, so its natural top = grid
  // top + the grid's padding-top — pulling that to 32px lands it exactly on
  // its sticky slot
  return top + parseFloat(getComputedStyle(el).paddingTop) - 32;
}

/**
 * Wheel lerp shared by the page scroller (SmoothScroll) and every inner
 * scroller (useSmoothScroller) — keep them identical so nested lists feel
 * exactly like the page. 0.15 is a middle ground: snappier than Lenis's 0.1
 * default, with a short but noticeable inertia tail. Lower values feel
 * heavier; raise toward 1 for near-native response.
 */
export const SCROLL_LERP = 0.15;
