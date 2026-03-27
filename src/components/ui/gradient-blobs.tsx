"use client";

import { useEffect, useRef } from "react";

interface Blob {
  x: number;
  y: number;
  radius: number;
  color: [number, number, number];
  vx: number;
  vy: number;
  phase: number;
}

const COLORS: [number, number, number][] = [
  [200, 180, 255], // lavender
  [180, 220, 255], // sky blue
  [255, 200, 180], // peach
  [180, 255, 220], // mint
  [255, 220, 180], // warm gold
];

function randomBlobs(w: number, h: number): Blob[] {
  return COLORS.map((color, i) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.15 + Math.random() * 0.1;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.min(w, h) * (0.25 + Math.random() * 0.15),
      color,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      phase: (i / COLORS.length) * Math.PI * 2,
    };
  });
}

export function GradientBlobs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let blobs: Blob[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      blobs = randomBlobs(canvas.width, canvas.height);
    }

    function draw(time: number) {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      for (const blob of blobs) {
        // Gentle oscillation on top of drift
        const ox = Math.sin(time * 0.0003 + blob.phase) * 30;
        const oy = Math.cos(time * 0.0004 + blob.phase) * 20;

        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce off edges softly
        if (blob.x < -blob.radius * 0.5) blob.vx = Math.abs(blob.vx);
        if (blob.x > w + blob.radius * 0.5) blob.vx = -Math.abs(blob.vx);
        if (blob.y < -blob.radius * 0.5) blob.vy = Math.abs(blob.vy);
        if (blob.y > h + blob.radius * 0.5) blob.vy = -Math.abs(blob.vy);

        const drawX = blob.x + ox;
        const drawY = blob.y + oy;
        const [r, g, b] = blob.color;

        const gradient = ctx.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, blob.radius
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.2)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.arc(drawX, drawY, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

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
      className="pointer-events-none fixed inset-0 z-0 block dark:hidden"
      aria-hidden="true"
    />
  );
}
