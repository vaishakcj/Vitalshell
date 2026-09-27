import React, { useEffect, useRef } from 'react';

interface DotsRotationDialProps {
  color?: string; // primary color e.g. '#10b981'
  glowColor?: string; // glow rgba e.g. 'rgba(16, 185, 129, 0.6)'
  secondaryColor?: string; // tail color e.g. '#059669'
  speed?: number; // rotation speed multiplier, default 1
  size?: number; // diameter in px (default 230)
  className?: string;
}

export const DotsRotationDial: React.FC<DotsRotationDialProps> = ({
  color = '#10b981',
  glowColor = 'rgba(16, 185, 129, 0.55)',
  secondaryColor = '#059669',
  speed = 1,
  size = 230,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;
    let lastTime = performance.now();

    // Concentric ring definitions matching dots rotation.webm
    // 6 concentric rings with increasing radii and dot counts
    const rings = [
      { radiusRatio: 0.54, count: 34, dotScale: 0.85, phaseOffset: 0.0 },
      { radiusRatio: 0.62, count: 40, dotScale: 0.90, phaseOffset: 0.16 },
      { radiusRatio: 0.70, count: 46, dotScale: 0.95, phaseOffset: 0.32 },
      { radiusRatio: 0.78, count: 52, dotScale: 1.00, phaseOffset: 0.48 },
      { radiusRatio: 0.86, count: 58, dotScale: 1.05, phaseOffset: 0.64 },
      { radiusRatio: 0.94, count: 64, dotScale: 1.10, phaseOffset: 0.80 },
    ];

    const render = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Rotation speed ~ 1 full revolution every ~3.2s
      const rotationSpeed = ((Math.PI * 2) / 3.2) * speed;
      rotation = (rotation + rotationSpeed * delta) % (Math.PI * 2);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = (width / 2) * 0.98;

      ctx.clearRect(0, 0, width, height);

      // Render each concentric dotted ring
      for (let rIdx = 0; rIdx < rings.length; rIdx++) {
        const ring = rings[rIdx];
        const ringRadius = maxRadius * ring.radiusRatio;
        const count = ring.count;
        // Spiral sweep offset across rings (outer rings trail slightly)
        const ringRotation = rotation - ring.phaseOffset;

        for (let i = 0; i < count; i++) {
          // normDist: 0 is the bright leading head, 1 is the end of the tail
          const normDist = i / count;

          // Clockwise rotation: the head (i=0) leads, subsequent dots trail behind
          const currentAngle = ringRotation - normDist * Math.PI * 2;

          // Size and opacity mapping from dots rotation.webm:
          // Leading edge has larger, brighter, glowing dots
          // Followed by smooth falloff along the circumference
          let opacity: number;
          let dotRadius: number;

          if (normDist < 0.26) {
            // Bright leading head
            const t = normDist / 0.26;
            opacity = 1.0 - t * 0.12; // 1.0 down to 0.88
            dotRadius = (2.9 - t * 0.7) * ring.dotScale * dpr;
          } else if (normDist < 0.68) {
            // Body trail
            const t = (normDist - 0.26) / (0.68 - 0.26);
            opacity = 0.88 - t * 0.45; // 0.88 down to 0.43
            dotRadius = (2.2 - t * 0.9) * ring.dotScale * dpr;
          } else if (normDist < 0.90) {
            // Faint tail
            const t = (normDist - 0.68) / (0.90 - 0.68);
            opacity = 0.43 - t * 0.25; // 0.43 down to 0.18
            dotRadius = (1.3 - t * 0.5) * ring.dotScale * dpr;
          } else {
            // Terminal gap before the next cycle's head
            const t = (normDist - 0.90) / (1.0 - 0.90);
            opacity = 0.18 - t * 0.10;
            dotRadius = 0.8 * ring.dotScale * dpr;
          }

          // Calculate Cartesian coordinates
          const x = cx + Math.cos(currentAngle) * ringRadius;
          const y = cy + Math.sin(currentAngle) * ringRadius;

          // Draw the dot
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, Math.max(dotRadius, 0.75 * dpr), 0, Math.PI * 2);

          // Give the leading dots extra glow
          if (normDist < 0.32) {
            ctx.shadowBlur = 9 * dpr * (1 - normDist / 0.32);
            ctx.shadowColor = glowColor;
            ctx.fillStyle = color;
          } else {
            ctx.shadowBlur = 2 * dpr;
            ctx.shadowColor = glowColor;
            ctx.fillStyle = secondaryColor;
          }

          ctx.globalAlpha = Math.max(0.08, opacity);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Set canvas dimensions with DPR
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };

    updateCanvasSize();
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, glowColor, secondaryColor, speed, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
};
