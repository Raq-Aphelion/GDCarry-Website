import { useState } from 'react';

interface FadeImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** Optional placeholder art shown until the real image loads, crossfading
      into it. Falls back to the shimmer when omitted. */
  placeholder?: string;
  /** Service cards only: the placeholder and the loaded image share ONE zoom
      (a wrapper scales both while their opacities crossfade) instead of the
      incoming image zooming against the static placeholder — the swap used to
      read as two separate movements */
  sharedZoom?: boolean;
}

/** Image that fades in once loaded, over a shimmer — or over `placeholder`
    art when given, crossfading between the two. */
export default function FadeImage({ src, alt, className = '', imgClassName = '', placeholder, sharedZoom = false }: FadeImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const placeholderImg = placeholder ? (
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
  ) : null;

  return (
    <div className={`relative overflow-hidden bg-navy-800 ${className}`}>
      {sharedZoom ? (
        /* Sits at scale-105 while the real image loads (invisible on blank
           placeholder art); on load the wrapper zooms out once with both
           versions inside */
        <div className={`absolute inset-0 ${loaded && !failed ? 'img-zoom' : 'scale-105'}`}>
          {placeholderImg}
          {!failed && (
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              /* Keyframe animation (see .img-fade-in), not a class-flip
                 transition — a transition never runs when onLoad fires before
                 the first paint (cached images) */
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                loaded ? 'img-fade-in opacity-100' : 'opacity-0'
              } ${imgClassName}`}
            />
          )}
        </div>
      ) : (
        <>
          {placeholderImg ??
            ((!loaded || failed) && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-navy-800 via-navy-700/60 to-navy-800" />
            ))}
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
                 fires before the first paint (cached images), which used to
                 make cards pop in instead of fading */
              className={`h-full w-full object-cover transition-all duration-700 ${
                loaded ? 'img-reveal scale-100 opacity-100' : 'scale-105 opacity-0'
              } ${imgClassName}`}
            />
          )}
        </>
      )}
    </div>
  );
}
