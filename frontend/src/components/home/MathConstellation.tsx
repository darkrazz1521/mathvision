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
}

const MATH_SYMBOLS = [
  '∫', '∑', '√', 'π', '∞', '∇', '∂', 'θ', '±', 'α',
  'λ', 'σ', 'f(x)', 'e^x', 'dx', 'lim', '≈', '≠', '≤', '≥',
  'ℝ', '∈', '∩', '∪', 'Δ', 'μ', 'ω', 'φ', 'C', 'L',
];

const COLORS = [
  '#8B7CFF', // Primary accent (violet)
  '#38BDF8', // Secondary accent (cyan)
  '#34D399', // Success/Verification (emerald)
  '#94A3B8', // Secondary text
];

export const MathConstellation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Responsive particle count based on screen width
    const particleCount = width < 768 ? 22 : 42;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        symbol: MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)],
        size: Math.floor(Math.random() * 8) + 12,
        opacity: Math.random() * 0.35 + 0.12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    // Interactive mouse coordinates
    const mouse = { x: -1000, y: -1000, radius: 120 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with subtle gradient lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 124, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and render each mathematical particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Slight gentle repulsion from mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Draw mathematical glyph
        ctx.font = `italic ${p.size}px "KaTeX_Math", "Times New Roman", serif`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, p.x, p.y);
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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
      aria-hidden="true"
    />
  );
};
