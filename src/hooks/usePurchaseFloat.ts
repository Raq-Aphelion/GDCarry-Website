import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

/** Shared floating-price-block + sticky-box behavior used by PurchaseBox and
    GilPurchaseBox. The price block floats to the screen bottom when its
    natural spot is below the fold, pins like the category sidebar when
    scrolled past, and the whole box sticks (by top when it fits, by its
    bottom edge when overflowing). `watchKey` re-runs the frame-by-frame
    update loop when it changes (pass a value that tracks layout-affecting
    state, e.g. the selected method). */
export function usePurchaseFloat(watchKey?: unknown) {
  // Box stickiness (desktop): 'fit' pins the whole box by its top like the
  // categories panel; 'overflow' pins it by its bottom edge above the screen
  // bottom once fully extended. Set by the measuring effect below.
  const stickRef = useRef<'fit' | 'overflow' | null>(null);

  // Floating price block: while its natural spot sits fully inside the
  // viewport (below the navbar, above the screen edge) it stays in flow.
  // Otherwise it detaches: pinned to the top like the category sidebar when
  // scrolled past (dropping to the screen bottom only if it would overflow),
  // pinned to the screen bottom when its spot is still below the fold, and
  // always clamped so it stops before the "request a custom order" segment.
  // When the whole box is sticky, only the below-fold float stays active —
  // the sticky box handles everything else, including the CTA hand-off.
  const wrapRef = useRef<HTMLDivElement>(null);
  const blockH = useRef(0);
  // Render-side copy of blockH (refs must not be read during render)
  const [blockHpx, setBlockHpx] = useState(0);
  const [fixedStyle, setFixedStyle] = useState<CSSProperties | null>(null);
  // Last applied fixedStyle as a comparable key — lets `update` skip state
  // writes when the computed pin hasn't moved (see below)
  const lastFixedKey = useRef('');

  const update = useCallback(() => {
    const w = wrapRef.current;
    if (!w) return;
    const r = w.getBoundingClientRect();
    const child = w.firstElementChild as HTMLElement | null;
    const h = (child ? child.getBoundingClientRect().height : r.height) || blockH.current;
    if (h > 0) {
      blockH.current = h;
      setBlockHpx(h); // React bails out when unchanged — no re-render churn
    }
    const vh = window.innerHeight;
    let next: CSSProperties | null = null;
    if (stickRef.current && window.innerWidth >= 1024) {
      // Sticky box: keep the price block reachable before the box pins, then
      // let it ride with the box (never detach near the CTA).
      if (r.bottom > vh + 1) {
        next = { position: 'fixed', top: vh - h, left: r.left, width: r.width, zIndex: 20 };
      }
    } else if (r.top < 96 || r.bottom > vh + 1) {
      let top: number;
      if (r.top < 96) top = Math.min(96, vh - h); // scrolled past: pin like categories, sink only if overflowing
      else top = vh - h; // below the fold: touch the bottom of the screen
      const aside = w.closest('aside');
      if (aside) {
        const cb = aside.getBoundingClientRect().bottom;
        if (top + h > cb) top = cb - h; // stop before the custom-order CTA
      }
      next = { position: 'fixed', top, left: r.left, width: r.width, zIndex: 20 };
    }
    // Runs on every scroll frame. The computed pin is usually stable while
    // scrolling, so compare before writing state — a fresh object each frame
    // would re-render the whole purchase box 60x/s and hitch smooth scrolling.
    const key = next ? `${next.top}|${next.left}|${next.width}` : '';
    if (key !== lastFixedKey.current) {
      lastFixedKey.current = key;
      setFixedStyle(next);
    }
  }, []);

  useEffect(() => {
    // Measuring the DOM and syncing it to state on mount is exactly what
    // effects are for — the block must be positioned before first paint.
    update();
    const scroller = document.getElementById('page-scroll');
    scroller?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  // The ResizeObserver runs before paint, so the block is re-pinned before
  // any transitional frame can be shown; the rAF loop is a backstop.
  useEffect(() => {
    const col = wrapRef.current?.parentElement;
    if (!col || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => update());
    ro.observe(col);
    return () => ro.disconnect();
  }, [update]);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      update();
      if (now - start < 550) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Also re-runs whenever watchKey changes: layout-affecting state switches
    // (method, options) can shift the box height — without this the price
    // block can keep a stale pin/unpin from the transient layout
  }, [watchKey, update]);

  // Whole-box stickiness, re-measured on every content/viewport resize:
  // - fits the screen -> 'fit': top pinned at 96px like the categories panel
  // - overflowing   -> 'overflow': sticky with top = vh - gap - contentH, so
  //   the box scrolls normally until the moment it is fully extended, then
  //   pins with its bottom edge `gap` px above the bottom of the screen —
  //   where `gap` mirrors the vertical rhythm between the sidebar's "Need
  //   something else?" block and the "Can't find your boost?" CTA below.
  const rootRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState<'fit' | 'overflow' | null>(null);
  const [overflowTop, setOverflowTop] = useState(0);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      // Measure the content (card + price block), not the root box — when not
      // sticky the root is flex-stretched to the full row height.
      const kids = el.children;
      if (kids.length === 0) return;
      const contentH =
        kids[kids.length - 1].getBoundingClientRect().bottom - kids[0].getBoundingClientRect().top;
      const vh = window.innerHeight;
      if (contentH <= vh - 96 - 16) {
        stickRef.current = 'fit';
        setStick('fit');
      } else {
        stickRef.current = 'overflow';
        setStick('overflow');
        // Bottom clearance = the gap between the bottom of the sidebar's
        // "Need something else?" block and the top of the "Can't find your
        // boost?" CTA. The sidebar releases exactly at the aside's bottom
        // edge, and both the aside and the CTA are in normal flow — so the
        // rect difference is a scroll-invariant layout constant (~65px).
        let gap = 80;
        const aside = document.getElementById('category-sidebar');
        const cta = document.getElementById('custom-order-section');
        if (aside && cta) {
          const g = cta.getBoundingClientRect().top - aside.getBoundingClientRect().bottom;
          if (g > 0) gap = Math.round(g);
        }
        // CSS sticky top is measured from the scroller's top edge, which sits
        // 64px below the viewport top (navbar height) — hence the extra -64.
        setOverflowTop(Math.round(vh - gap - contentH - 64));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Accordions in the main column move the CTA and thus change the gap.
    const main = el.closest('main') ?? document.querySelector('main');
    if (main) ro.observe(main);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return { rootRef, wrapRef, stick, overflowTop, fixedStyle, blockHpx };
}
