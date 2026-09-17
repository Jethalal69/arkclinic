import { Suspense, lazy, FC, useEffect, useRef } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineSceneProps {
  scene: string;
  className?: string;
  onLoad?: (app: any) => void;
  disableZoom?: boolean;
}

export const SplineScene: FC<SplineSceneProps> = ({
  scene,
  className,
  onLoad,
  disableZoom = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!disableZoom) return;

    const el = containerRef.current;
    if (!el) return;

    // Intercept wheel events in the capture phase before Spline's runtime listener,
    // stopping camera zoom while allowing the browser's native smooth page scroll.
    const handleWheel = (e: WheelEvent) => {
      e.stopImmediatePropagation();
    };

    el.addEventListener('wheel', handleWheel, { capture: true, passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [disableZoom]);

  return (
    <div ref={containerRef} className="spline-wrapper-container" style={{ width: '100%', height: '100%' }}>
      <Suspense
        fallback={
          <div className="spline-loader-container">
            <div className="spline-loader-spinner" />
          </div>
        }
      >
        <Spline scene={scene} className={className} onLoad={onLoad} />
      </Suspense>
    </div>
  );
};
