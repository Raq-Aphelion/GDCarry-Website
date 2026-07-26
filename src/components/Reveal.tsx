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
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
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
