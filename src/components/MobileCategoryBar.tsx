import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import useDragScroll from '@/hooks/useDragScroll';

interface Item {
  id: string;
  name: string;
}

/**
 * Mobile category carousel, styled as a seamless continuation of the sticky
 * navbar (same translucent surface, single shared bottom border). Draggable
 * via touch/mouse through useDragScroll. Items render as Links when `gameId`
 * is given, otherwise as buttons calling `onSelect`.
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

  // Uncontrolled fallback: hide on scroll down, reveal on scroll up
  const [hiddenSelf, setHiddenSelf] = useState(false);
  useEffect(() => {
    if (controlled) return;
    const scroller = document.getElementById('page-scroll');
    if (!scroller) return;
    let last = scroller.scrollTop;
    const onScroll = () => {
      const y = scroller.scrollTop;
      if (Math.abs(y - last) < 4) return; // ignore sub-pixel Lenis drift
      setHiddenSelf(y > last && y > 96);
      last = y;
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [controlled]);
  const hidden = controlled ? hiddenProp : hiddenSelf;

  // Fade-out gradients on the edges that have overflowing content
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateFades = () => {
    const el = dragRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

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
        controlled ? '' : 'bg-gradient-to-b from-navy-900/90 via-navy-900/60 to-navy-900/0'
        // Hidden: also inert — the translated bar would otherwise still catch
        // wheels/clicks over the content above its slot
      } ${hidden ? 'pointer-events-none -translate-y-full opacity-0' : ''}`}
    >
      <div className="relative">
        <div
          ref={dragRef}
          onScroll={updateFades}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          className="no-scrollbar flex touch-pan-y gap-2 overflow-x-auto px-[25px] py-3"
        >
          {items.map((s) =>
            gameId ? (
              <Link key={s.id} to={`/boosting/${gameId}?cat=${s.id}`} className={chip(s.id)}>
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
