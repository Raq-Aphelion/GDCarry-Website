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
    `shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
      activeId === id
        ? 'bg-gold-500 text-navy-900 gold-glow'
        : 'border border-navy-700/70 bg-navy-850/80 text-slate-300 hover:text-white'
    }`;

  return (
    <div className="sticky top-0 z-30 border-b border-navy-700/60 bg-navy-900/85 backdrop-blur-xl lg:hidden">
      <div className="relative">
        <div ref={dragRef} onScroll={updateFades} className="no-scrollbar flex touch-pan-y gap-2 overflow-x-auto px-[21px] py-3">
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
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-navy-900 to-transparent transition-opacity duration-300 ${
            canLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-navy-900 to-transparent transition-opacity duration-300 ${
            canRight ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  );
}
