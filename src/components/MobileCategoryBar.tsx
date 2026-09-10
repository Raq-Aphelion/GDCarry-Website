import { useEffect, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router';
import useDragScroll from '@/hooks/useDragScroll';

interface Item {
  id: string;
  name: string;
}

/** Side-scroll positions by item set — the bar REMOUNTS on every service
    page ↔ game page switch, which would reset the chips to the left edge;
    this keeps the position across those navigations (tab-session lifetime). */
const scrollPositions = new Map<string, number>();

/**
 * Mobile category carousel, styled as a seamless continuation of the sticky
 * navbar (same translucent surface, single shared bottom border) — but only
 * once scrolled: at the very top of the page it stays transparent over the
 * hero art. Draggable via touch/mouse through useDragScroll; the side-scroll
 * position persists across page switches (the bar remounts per route). Items
 * render as Links when `gameId` is given, otherwise as buttons calling
 * `onSelect`.
 */
export default function MobileCategoryBar({
  items,
  activeId,
  gameId,
  onSelect,
  hidden: hiddenProp,
}: {
  items: Item[];
  activeId: string;
  gameId?: string;
  onSelect?: (id: string) => void;
  /** Controlled hide state (GamePage drives it from the label row's sticky
      choreography). Uncontrolled callers get the self-managed hide-on-scroll-
      down behavior below. Controlled also drops the bar's own background
      gradient — the label row's overlay is the single gradient there. */
  hidden?: boolean;
}) {
  const dragRef = useDragScroll();
  const controlled = hiddenProp !== undefined;

  // Uncontrolled fallback: hide on scroll down, reveal on scroll up. The
  // bar's own navy gradient only appears once it has scrolled away from the
  // very top — at scrollTop 0 it sits transparent over the hero art.
  const [hiddenSelf, setHiddenSelf] = useState(false);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (controlled) return;
    const scroller = document.getElementById('page-scroll');
    if (!scroller) return;
    let last = scroller.scrollTop;
    const onScroll = () => {
      const y = scroller.scrollTop;
      setStuck(y > 4);
      if (Math.abs(y - last) < 4) return; // ignore sub-pixel Lenis drift
      setHiddenSelf(y > last && y > 96);
      last = y;
    };
    onScroll(); // a restored scroll position counts as stuck from the start
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [controlled]);
  const hidden = controlled ? hiddenProp : hiddenSelf;

  // Fade-out gradients on the edges that have overflowing content
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Keyed by the item set: the same categories render on the game page and
  // its service pages, so the side scroll carries across those switches
  const persistKey = items.map((i) => i.id).join('|');

  const updateFades = () => {
    const el = dragRef.current;
    if (!el) return;
    scrollPositions.set(persistKey, el.scrollLeft);
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  // Restore the side scroll after the chips have rendered
  useLayoutEffect(() => {
    const el = dragRef.current;
    if (!el) return;
    const saved = scrollPositions.get(persistKey);
    if (saved) el.scrollLeft = saved;
    updateFades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistKey]);

  useEffect(() => {
    updateFades();
    window.addEventListener('resize', updateFades);
    return () => window.removeEventListener('resize', updateFades);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const chip = (id: string) =>
    `shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
      activeId === id
        ? 'border-cyan-600 bg-cyan-600 text-navy-900 glow'
        : 'border-navy-700/70 bg-navy-850/80 text-slate-300 hover:text-white'
    }`;

  // Chips themselves fade to transparent at overflowing edges (same mask as
  // the tags row on service pages)
  const mask =
    canLeft && canRight
      ? 'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)'
      : canLeft
        ? 'linear-gradient(to right, transparent, black 24px)'
        : canRight
          ? 'linear-gradient(to left, transparent, black 24px)'
          : undefined;

  return (
    <div
      id="mobile-category-bar"
      className={`sticky top-0 z-30 transition-[transform,opacity] duration-300 lg:hidden ${
        // Hidden: also inert — the translated bar would otherwise still catch
        // wheels/clicks over the content above its slot
        hidden ? 'pointer-events-none -translate-y-full opacity-0' : ''
      }`}
    >
      {/* Stuck backdrop — ALWAYS rendered, faded via opacity: the previous
          conditional class popped in/out instantly. Only the uncontrolled
          bar owns one — the game page's label-row overlay is the single
          gradient there (controlled) */}
      {!controlled && (
        <div
          aria-hidden
          className={`absolute inset-0 bg-gradient-to-b from-navy-900/90 via-navy-900/60 to-navy-900/0 transition-opacity duration-300 ${
            stuck ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      <div className="relative">
        <div
          ref={dragRef}
          onScroll={updateFades}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          className="no-scrollbar flex touch-pan-y gap-2 overflow-x-auto px-[25px] py-3"
        >
          {items.map((s) =>
            gameId ? (
              <Link
                key={s.id}
                to={`/boosting/${gameId}?cat=${s.id}`}
                // Land at the category grid under the hero (ScrollToTop)
                state={{ scrollToGrid: true }}
                className={chip(s.id)}
              >
                {s.name}
              </Link>
            ) : (
              <button key={s.id} onClick={() => onSelect?.(s.id)} className={chip(s.id)}>
                {s.name}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
