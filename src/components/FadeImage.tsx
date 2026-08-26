import { useState } from 'react';

interface FadeImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Optional placeholder art shown until the real image loads, crossfading
      into it. Falls back to the shimmer when omitted. */
  placeholder?: string;
}

/** Image that fades in once loaded, over a shimmer — or over `placeholder`
    art when given, crossfading between the two. */
export default function FadeImage({ src, alt, className = '', imgClassName = '', placeholder }: FadeImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-navy-800 ${className}`}>
      {placeholder ? (
        /* Stays mounted so it can crossfade out; also covers load failure.
           The fade-out is a keyframe animation (see .img-fade-out) so cached
           images can't skip it by loading before the first paint */
        <img
          src={placeholder}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded && !failed ? 'img-fade-out opacity-0' : 'opacity-100'
          }`}
        />
      ) : (
        (!loaded || failed) && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-navy-800 via-navy-700/60 to-navy-800" />
        )
      )}
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          /* The reveal is a keyframe animation (see .img-reveal), not a
             class-flip transition — a transition never runs when onLoad
             fires before the first paint (cached images), which used to make
             cards pop in instead of fading */
          className={`h-full w-full object-cover transition-all duration-700 ${
            loaded ? 'img-reveal scale-100 opacity-100' : 'scale-105 opacity-0'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
