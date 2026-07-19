import React, { useEffect, useRef } from 'react';

interface InteractiveParticleBackgroundProps {
  color?: string; // Default RGB triplet string
}

export const InteractiveParticleBackground: React.FC<InteractiveParticleBackgroundProps> = ({
  color = '6, 182, 212', // Matches our tailwind cyan-400 color triplet
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler using ResizeObserver to ensure absolute responsiveness in frames & layouts
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: entryWidth, height: entryHeight } = entry.contentRect;
        width = canvas.width = entryWidth;
        height = canvas.height = entryHeight;
        initParticles();
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Interactive Particle Class definition
    class Particle {
      x: number = 0;
      y: number = 0;
      vx: number = 0;
      vy: number = 0;
      size: number = 0;
      alpha: number = 0;
      baseAlpha: number = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Subtle slow organic drifting velocities
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.size = Math.random() * 2.2 + 1.2;
        this.baseAlpha = Math.random() * 0.28 + 0.12;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Elegant wrapping boundary behaviors
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Continuous mouse repulsion with custom proximity trigger
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const dist = Math.hypot(dx, dy);
        const proximityThreshold = 140;

        if (dist < proximityThreshold) {
          const normalizedForce = (proximityThreshold - dist) / proximityThreshold;
          const pushAngle = Math.atan2(dy, dx);
          
          // Gently repel nodes from current cursor path
          this.x += Math.cos(pushAngle) * normalizedForce * 1.6;
          this.y += Math.sin(pushAngle) * normalizedForce * 1.6;
          
          // Elevate alpha slightly when close to highlight the hover zone
          this.alpha = Math.min(0.75, this.baseAlpha + normalizedForce * 0.35);
        } else {
          // Smoothly decay back to standard ambient opacity
          this.alpha += (this.baseAlpha - this.alpha) * 0.08;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(${color}, ${this.alpha})`;
        c.fill();
      }
    }

    let particles: Particle[] = [];
    const initParticles = () => {
      const area = width * height;
      // Dynamically balance particle counts to remain light on mobile and rich on widescreen
      const densityCount = Math.min(110, Math.floor(area / 16500));
      particles = Array.from({ length: densityCount }, () => new Particle());
    };

    initParticles();

    // Event listener functions
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -2000;
      mouseRef.current.targetY = -2000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      // Premium easing interpolation to prevent cursor-jumping spikes
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.12;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // Render updated node values
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      // Construct interactive dynamic wireframe linkages
      ctx.lineWidth = 0.75;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Link node-to-node constellations
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          const maxLinkDist = 100;

          if (dist < maxLinkDist) {
            const alpha = (1 - dist / maxLinkDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.stroke();
          }
        }

        // Connect magnetic linkages directly from cursor to surrounding nodes
        const mdx = p1.x - mouseRef.current.x;
        const mdy = p1.y - mouseRef.current.y;
        const mdist = Math.hypot(mdx, mdy);
        const maxMouseLinkDist = 130;

        if (mdist < maxMouseLinkDist) {
          const mAlpha = (1 - mdist / maxMouseLinkDist) * 0.22;
          ctx.beginPath();
          ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(${color}, ${mAlpha})`;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      id="quantum-interactive-particles"
      className="absolute inset-0 w-full h-full pointer-events-none z-[1] select-none"
    />
  );
};
