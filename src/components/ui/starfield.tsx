"use client";

import { useEffect, useRef } from "react";

// Background stars — static, twinkling
interface BgStar {
  x: number;
  y: number;
  r: number;
  opacity: number;
  phase: number;
}

// Shooting stars — streak across the sky
interface ShootingStar {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
  r: number;
}

function createBgStars(count: number, w: number, h: number): BgStar[] {
  const stars: BgStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

function createShootingStar(w: number, h: number): ShootingStar {
  // Angle: roughly upper-left to lower-right, with some variation
  const angle = Math.PI * 0.2 + (Math.random() - 0.5) * 0.4;
  const speed = 4 + Math.random() * 6;
  const maxLife = 60 + Math.random() * 80;
  return {
    x: Math.random() * w * 0.8,
    y: Math.random() * h * 0.4,
    len: 30 + Math.random() * 60,
    speed,
    angle,
    opacity: 0.7 + Math.random() * 0.3,
    life: 0,
    maxLife,
    r: 0.8 + Math.random() * 0.8,
  };
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let bgStars: BgStar[] = [];
    let shootingStars: ShootingStar[] = [];
    let nextShootAt = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bgStars = createBgStars(200, canvas.width, canvas.height);
    }

    function draw(time: number) {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // — Background stars (twinkle in place) —
      for (const s of bgStars) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.002 + s.phase);
        const alpha = s.opacity * (0.3 + 0.7 * twinkle);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }

      // — Spawn shooting stars periodically —
      if (time > nextShootAt) {
        shootingStars.push(createShootingStar(w, h));
        // Random interval: 1~4 seconds
        nextShootAt = time + 1000 + Math.random() * 3000;
      }

      // — Draw & update shooting stars —
      const alive: ShootingStar[] = [];
      for (const ss of shootingStars) {
        ss.life++;
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        // Fade in then out
        const progress = ss.life / ss.maxLife;
        let alpha: number;
        if (progress < 0.1) {
          alpha = ss.opacity * (progress / 0.1);
        } else if (progress > 0.6) {
          alpha = ss.opacity * (1 - (progress - 0.6) / 0.4);
        } else {
          alpha = ss.opacity;
        }

        // Tail
        const tailX = ss.x - Math.cos(ss.angle) * ss.len;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len;

        const gradient = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = ss.r;
        ctx.lineCap = "round";
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        if (ss.life < ss.maxLife && ss.x < w + 100 && ss.y < h + 100) {
          alive.push(ss);
        }
      }
      shootingStars = alive;

      animationId = requestAnimationFrame(draw);
    }

    resize();
    animationId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
      aria-hidden="true"
    />
  );
}
