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
}: {
  items: Item[];
  activeId: string;
  gameId?: string;
  onSelect?: (id: string) => void;
}) {
  const dragRef = useDragScroll();

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
    <div id="mobile-category-bar" className="sticky top-0 z-30 bg-gradient-to-b from-navy-900/90 via-navy-900/60 to-navy-900/0 lg:hidden">
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
