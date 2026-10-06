import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Spline 3D scene container.
 *
 * The scene is driven by the VITE_SPLINE_SCENE_URL build-time environment
 * variable. When it is set to a published Spline scene URL (a `.splinecode`
 * asset served from `https://prod.spline.design/...`), the scene loads lazily
 * through the official runtime. When it is empty — the default — a simple
 * engineering placeholder is shown instead. The rest of the dashboard never
 * depends on Spline being available.
 */

const splineUrl = (import.meta.env.VITE_SPLINE_SCENE_URL as string | undefined) ?? '';

const SplineRuntime = lazy(() =>
  import('@splinetool/react-spline').then((m) => ({ default: m.default })),
);

class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Placeholder() {
  return (
    <div className="spline-placeholder" aria-label="3D engine model placeholder">
      <svg width="120" height="120" viewBox="0 0 120 120" className="spline-placeholder-svg" aria-hidden="true">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(120,150,200,0.4)" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="38" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="1" />
        <path d="M 60 60 L 88 60" stroke="rgba(91,157,255,0.7)" strokeWidth="1.5" />
        <path d="M 60 60 L 60 24" stroke="rgba(91,157,255,0.7)" strokeWidth="1.5" />
        <path d="M 60 60 L 32 60" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" />
        <path d="M 60 60 L 60 96" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="4" fill="rgba(34,211,238,0.8)" />
        <g stroke="rgba(120,150,200,0.12)" strokeWidth="0.5">
          <line x1="20" y1="0" x2="20" y2="120" />
          <line x1="40" y1="0" x2="40" y2="120" />
          <line x1="80" y1="0" x2="80" y2="120" />
          <line x1="100" y1="0" x2="100" y2="120" />
          <line x1="0" y1="20" x2="120" y2="20" />
          <line x1="0" y1="40" x2="120" y2="40" />
          <line x1="0" y1="80" x2="120" y2="80" />
          <line x1="0" y1="100" x2="120" y2="100" />
        </g>
      </svg>
      <div className="spline-placeholder-title">3D ENGINE MODEL</div>
      <div className="spline-placeholder-sub">
        Interactive visualization
        {!splineUrl && (
          <span className="spline-placeholder-hint">
            Set VITE_SPLINE_SCENE_URL to enable a live 3D scene.
          </span>
        )}
      </div>
    </div>
  );
}

export default function SplineScene({ interactive = true }: { interactive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return;
    const handleMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPointer({
        x: Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1)),
        y: Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1)),
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [interactive]);

  const tilt = {
    transform: `perspective(900px) rotateX(${(-pointer.y * 2).toFixed(2)}deg) rotateY(${(pointer.x * 2).toFixed(2)}deg)`,
  };

  return (
    <div ref={containerRef} className="spline-container">
      {splineUrl ? (
        <SceneErrorBoundary fallback={<Placeholder />}>
          <Suspense fallback={<Placeholder />}>
            <SplineRuntime scene={splineUrl} />
            <div className="spline-mouse-hint" role="status">
              pointer {((pointer.x + 1) * 50).toFixed(0)}% ·{' '}
              {((pointer.y + 1) * 50).toFixed(0)}%
            </div>
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <div className="spline-placeholder-wrap" style={tilt}>
          <Placeholder />
        </div>
      )}
    </div>
  );
}