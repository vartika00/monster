import React, { useEffect, useRef } from 'react';

const ConfettiBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Minimal blue shades palette
    const colors = [
      '#1e3a8a', // dark blue
      '#2563eb', // blue
      '#3b82f6', // lighter blue
      '#60a5fa', // sky blue
      '#93c5fd', // light blue
      '#dbeafe', // very light blue
    ];

    const confetti = [];
    const confettiCount = 150;

    class Confetto {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.w = 2 + Math.random() * 4;
        this.h = 6 + Math.random() * 10;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.velocity = 0.5 + Math.random() * 1;
        this.swing = Math.random() * 0.5;
        this.swingOffset = Math.random() * Math.PI * 2;
      }

      update() {
        this.y += this.velocity;
        this.rotation += this.rotationSpeed;
        this.swingOffset += 0.01;
        this.x += Math.sin(this.swingOffset) * this.swing;

        if (this.y > canvas.height + 10) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
      }
    }

    for (let i = 0; i < confettiCount; i++) {
      confetti.push(new Confetto());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach(c => {
        c.update();
        c.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ConfettiBackground;
