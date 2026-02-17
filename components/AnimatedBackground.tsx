"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let frameCount = 0;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 15 : 40;
    let connectionDistance = isMobile ? 100 : 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const nowMobile = window.innerWidth < 768;
      const newCount = nowMobile ? 15 : 40;
      // Reinitialize particles if count changed due to crossing mobile/desktop threshold
      if (particles.length !== newCount) {
        particles.length = 0;
        for (let i = 0; i < newCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.3 + 0.1,
          });
        }
        connectionDistance = nowMobile ? 100 : 150;
      }
    };

    const init = () => {
      resize();
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      }));
    };

    const draw = () => {
      frameCount++;
      // Skip every other frame (effectively ~30fps)
      if (frameCount % 2 !== 0) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections (optimized — no array allocation)
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.05 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", resize, { passive: true });

    // Pause animation when tab is hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        frameCount = 0;
        draw();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <>
      {/* Large floating gradient orbs behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity: 0.4 }} aria-hidden="true">
        {/* Purple orb - top left */}
        <div
          className="absolute rounded-full orb-float-1"
          style={{
            top: '10%',
            left: '10%',
            width: 'clamp(250px, 40vw, 500px)',
            height: 'clamp(250px, 40vw, 500px)',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Pink orb - bottom right */}
        <div
          className="absolute rounded-full orb-float-2"
          style={{
            bottom: '15%',
            right: '10%',
            width: 'clamp(200px, 35vw, 450px)',
            height: 'clamp(200px, 35vw, 450px)',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(236, 72, 153, 0.04) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Indigo orb - center */}
        <div
          className="absolute rounded-full orb-float-3"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(200px, 30vw, 400px)',
            height: 'clamp(200px, 30vw, 400px)',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.10) 0%, rgba(99, 102, 241, 0.03) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Particle canvas - on top of orbs */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.5 }}
        aria-hidden="true"
      />
    </>
  );
}
