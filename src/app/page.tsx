"use client"
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  radius: number;
  baseRadius: number;
  opacity: number;
  speed: number;
  connections: number[];
  floatOffsetX: number;
  floatOffsetY: number;
  floatOffsetZ: number;
}

const HelixWebVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const particlesPerHelix = 200;
    const helixes: Particle[][] = [[], []];
    let rotationAngle = 0;

    for (let h = 0; h < 2; h++) {
      for (let i = 0; i < particlesPerHelix; i++) {
        const angle = (i / particlesPerHelix) * Math.PI * 6;
        const radius = 100;
        const baseX = Math.cos(angle) * radius * (h === 0 ? 1 : -1);
        const baseY = i * 2 - particlesPerHelix;
        const baseZ = Math.sin(angle) * radius;
        helixes[h].push({
          x: baseX,
          y: baseY,
          z: baseZ,
          baseX,
          baseY,
          baseZ,
          radius: 1.5,
          baseRadius: 1.5,
          opacity: 0.7,
          speed: 0.1 + (Math.abs(baseY) / 200) * 0.8,
          connections: [],
          floatOffsetX: (Math.random() - 0.5) * 5,
          floatOffsetY: (Math.random() - 0.5) * 5,
          floatOffsetZ: (Math.random() - 0.5) * 5,
        });
      }
    }

    const animate = () => {
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      rotationAngle += 0.005; // Continuous smooth rotation

      const particles: Particle[] = [...helixes[0], ...helixes[1]];
      particles.forEach((particle) => {
        const baseAngle = Math.atan2(particle.baseZ, particle.baseX);
        const newAngle = baseAngle + rotationAngle;
        const distance = Math.sqrt(particle.baseX * particle.baseX + particle.baseZ * particle.baseZ);
        particle.x = Math.cos(newAngle) * distance + particle.floatOffsetX;
        particle.y = particle.baseY + particle.floatOffsetY;
        particle.z = Math.sin(newAngle) * distance + particle.floatOffsetZ;
      });

      particles.forEach((particle) => {
        particle.connections = [];
      });

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = 0; j < particles.length; j++) {
          if (i !== j && connections < 3) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dz = particles[i].z - particles[j].z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distance >= 80 && distance <= 120 && Math.random() > 0.5) {
              particles[i].connections.push(j);
              connections++;
            }
          }
        }
      }

      particles.forEach((particle, i) => {
        particle.connections.forEach((j) => {
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 + particle.x, canvas.height / 2 + particle.y);
          ctx.lineTo(canvas.width / 2 + particles[j].x, canvas.height / 2 + particles[j].y);
          ctx.stroke();
        });
      });

      particles.forEach((particle) => {
        const perspective = 1000 / (1000 + particle.z);
        const screenX = canvas.width / 2 + particle.x * perspective;
        const screenY = canvas.height / 2 + particle.y * perspective;
        ctx.fillStyle = `rgba(255, 225, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, particle.radius * perspective, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ background: 'rgb(0, 0, 0)' }} />;
};

export default HelixWebVisualization;