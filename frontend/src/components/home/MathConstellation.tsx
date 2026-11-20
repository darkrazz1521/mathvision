import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  opacity: number;
  color: string;
  layer: number; // 0: background (slow), 1: midground, 2: foreground (responsive)
  phase: number;
}

const MATH_SYMBOLS = [
  '∫', '∑', '√', 'π', '∞', '∇', '∂', 'θ', '±', 'α',
  'λ', 'σ', 'f(x)', 'e^x', 'dx', 'lim', '≈', '≠', '≤', '≥',
  'ℝ', '∈', '∩', '∪', 'Δ', 'μ', 'ω', 'φ', 'ħ', 'Ψ',
  'dy/dx', '∇²', '∏', '⊕', '⊗', '≡', '∝', '∫∫', 'cos θ', 'sin φ'
];

const COLORS = [
  '#8B7CFF', // Violet accent
  '#38BDF8', // Cyan accent
  '#34D399', // Emerald success
  '#A78BFA', // Light purple
  '#94A3B8', // Slate neutral
];

export const MathConstellation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive particle count
    const particleCount = width < 768 ? 26 : 52;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const layer = Math.random() < 0.4 ? 0 : Math.random() < 0.75 ? 1 : 2;
      const speedMult = layer === 0 ? 0.2 : layer === 1 ? 0.4 : 0.65;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speedMult,
        vy: (Math.random() - 0.5) * speedMult,
        symbol: MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)],
        size: layer === 0 ? 11 : layer === 1 ? 14 : 18,
        opacity: layer === 0 ? 0.12 : layer === 1 ? 0.22 : 0.38,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        layer,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Interactive mouse coordinates
    const mouse = { x: -1000, y: -1000, radius: 140, active: false };
    let scrollY = window.scrollY;
    let scrollDelta = 0;
    let lastScrollY = window.scrollY;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      scrollDelta = (scrollY - lastScrollY) * 0.15;
      lastScrollY = scrollY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    let t = 0;

    const render = () => {
      t += 0.01;
      // Damping scroll velocity
      scrollDelta *= 0.92;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background geometric coordinate grids and orbital rings
      const centerX = width * 0.5;
      const centerY = height * 0.45;
      const orbitalRadius = Math.min(width, height) * 0.35;

      ctx.save();
      ctx.strokeStyle = 'rgba(139, 124, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitalRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.03)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitalRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 2. Connect nearby particles with subtle gradient filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];

          // Only connect particles in same or adjacent layers
          if (Math.abs(pi.layer - pj.layer) > 1) continue;

          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = pi.layer === 2 ? 140 : 100;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (pi.layer === 2 ? 0.16 : 0.08);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 124, 255, ${alpha})`;
            ctx.lineWidth = pi.layer === 2 ? 0.8 : 0.5;
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }

      // 3. Update and render mathematical symbols
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cursor attraction / gentle displacement
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (mouse.radius - dist) / mouse.radius;
            const pushFactor = p.layer === 2 ? 2.0 : 1.0;
            p.x += (dx / dist) * force * pushFactor;
            p.y += (dy / dist) * force * pushFactor;
          }
        }

        // Parallax scroll reaction
        const layerParallax = (p.layer + 1) * 0.06;
        p.y -= scrollDelta * layerParallax;

        // Position progression
        p.x += p.vx;
        p.y += p.vy;

        // Organic harmonic bobbing
        const oscillation = Math.sin(t + p.phase) * (p.layer === 2 ? 0.2 : 0.1);
        p.y += oscillation;

        // Viewport wrapping
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        // Pulsing glow for foreground nodes
        const dynamicAlpha = p.opacity * (0.8 + 0.2 * Math.sin(t * 1.5 + p.phase));

        // Render symbol
        ctx.font = `italic ${p.size}px "KaTeX_Math", "Times New Roman", serif`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = dynamicAlpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, p.x, p.y);

        // Subtle glowing dot at anchor
        if (p.layer === 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y + p.size * 0.45, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#8B7CFF';
          ctx.globalAlpha = dynamicAlpha * 0.6;
          ctx.fill();
        }

        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
