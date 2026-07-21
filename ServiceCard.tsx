import { useState } from 'react';

interface FadeImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

/** Image with a shimmering placeholder that fades in once loaded. */
export default function FadeImage({ src, alt, className = '', imgClassName = '' }: FadeImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-navy-800 ${className}`}>
      {(!loaded || failed) && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-navy-800 via-navy-700/60 to-navy-800" />
      )}
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-all duration-700 ${
            loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
