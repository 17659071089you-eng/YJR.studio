import { cn } from '../../lib/utils';

interface PixelGridOverlayProps {
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  totalSize?: number;
  showGradient?: boolean;
  opacity?: number;
  showSecondaryLayer?: boolean;
  showGlow?: boolean;
  animated?: boolean;
}

const toRgba = (color: number[], alpha: number) => `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;

export function PixelGridOverlay({
  colors = [
    [62, 49, 242],
    [120, 0, 255],
  ],
  containerClassName,
  dotSize = 6,
  totalSize = 28,
  showGradient = true,
  opacity = 0.32,
  showSecondaryLayer = true,
  showGlow = true,
  animated = true,
}: PixelGridOverlayProps) {
  const primary = colors[0] ?? [62, 49, 242];
  const secondary = colors[1] ?? primary;
  const tertiary = colors[2] ?? secondary;

  return (
    <div
      className={cn(
        'pixel-grid-overlay absolute inset-0 overflow-hidden',
        !animated && 'pixel-grid-overlay--static',
        containerClassName
      )}
    >
      <div
        className="pixel-grid-overlay__dots absolute inset-0"
        style={{
          opacity,
          backgroundImage: `radial-gradient(circle, ${toRgba(primary, 0.9)} 0 ${Math.max(dotSize / 3, 1.2)}px, transparent ${Math.max(dotSize / 3, 1.2) + 1}px)`,
          backgroundSize: `${totalSize}px ${totalSize}px`,
        }}
      />
      {showSecondaryLayer && (
        <div
          className="pixel-grid-overlay__dots pixel-grid-overlay__dots--offset absolute inset-0"
          style={{
            opacity: opacity * 0.7,
            backgroundImage: `radial-gradient(circle, ${toRgba(secondary, 0.7)} 0 ${Math.max(dotSize / 4, 1)}px, transparent ${Math.max(dotSize / 4, 1) + 1}px)`,
            backgroundSize: `${Math.max(totalSize * 0.72, 16)}px ${Math.max(totalSize * 0.72, 16)}px`,
          }}
        />
      )}
      {showGlow && (
        <div
          className="pixel-grid-overlay__glow absolute inset-[-12%]"
          style={{
            background: `radial-gradient(circle at 24% 28%, ${toRgba(primary, 0.22)}, transparent 34%), radial-gradient(circle at 72% 38%, ${toRgba(secondary, 0.18)}, transparent 32%), radial-gradient(circle at 50% 72%, ${toRgba(tertiary, 0.14)}, transparent 30%)`,
          }}
        />
      )}
      {showGradient && <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />}
    </div>
  );
}
