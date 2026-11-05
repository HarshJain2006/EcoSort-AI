import { useRef, useEffect } from 'react';

interface FadingVideoProps {
  src: string | string[];
  className?: string;
  style?: React.CSSProperties;
}

export default function FadingVideo({ src, className = '', style }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const indexRef = useRef(0);
  const fadingRef = useRef(false);

  const sources = Array.isArray(src) ? src : [src];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.style.opacity = '0';

    const fadeIn = () => {
      fadingRef.current = false;
      let start: number | null = null;
      const duration = 500;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        video.style.opacity = String(p);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const fadeOut = (onDone?: () => void) => {
      if (fadingRef.current) return;
      fadingRef.current = true;
      let start: number | null = null;
      const duration = 550;
      const fromOpacity = parseFloat(video.style.opacity) || 1;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        video.style.opacity = String(fromOpacity * (1 - p));
        if (p < 1) requestAnimationFrame(step);
        else if (onDone) onDone();
      };
      requestAnimationFrame(step);
    };

    const handleLoaded = () => fadeIn();

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && !fadingRef.current) {
        fadeOut();
      }
    };

    const handleEnded = () => {
      fadingRef.current = false;
      if (sources.length > 1) {
        indexRef.current = (indexRef.current + 1) % sources.length;
        video.src = sources[indexRef.current];
        video.load();
      } else {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
      video.style.opacity = '0';
      setTimeout(() => fadeIn(), 100);
    };

    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [sources]);

  return (
    <video
      ref={videoRef}
      src={sources[0]}
      className={className}
      style={style}
      autoPlay
      muted
      playsInline
      preload="auto"
    />
  );
}
