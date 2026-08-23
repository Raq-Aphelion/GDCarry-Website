import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms */
  delay?: number;
  className?: string;
  /** Skip the reveal-on-scroll animation and render visible immediately */
  instant?: boolean;
  /** Skip the viewport check but still play the slide-in once on mount */
  immediate?: boolean;
}

/** Fades + slides children in the first time they enter the viewport. */
export default function Reveal({ children, delay = 0, className = '', instant = false, immediate = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(instant && !immediate);

  useEffect(() => {
    if (instant && !immediate) return;
    if (immediate) {
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        // Check EVERY entry, not just the first: when a layout shift (e.g. an
        // ancestor's max-height transition) moves the element into view in the
        // same frame batch as the initial observation, the callback gets both
        // the stale not-intersecting entry AND the intersecting one — reading
        // only [0] would miss the reveal and leave the section hidden forever.
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      // Fires the moment the element's very top touches the viewport — the
      // +150px bottom margin actually starts the 700ms animation slightly
      // BEFORE entry, so cards are already fading in as they scroll into
      // view instead of leaving a visible empty row behind fast scrolls
      { threshold: 0, rootMargin: '0px 0px 150px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [instant, immediate]);

  return (
    <div
      ref={ref}
      className={`${visible ? 'reveal-visible' : 'reveal-hidden'} transition-all duration-700 ease-out ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
