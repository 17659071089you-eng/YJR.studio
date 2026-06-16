import { useEffect, useRef } from 'react';

interface LightRaysProps {
  raysOrigin?: 'bottom-center' | 'center' | 'top-center';
  raysSpeed?: number;
  lightSpread?: number;
  fadeDistance?: number;
  saturation?: number;
  mouseInfluence?: number;
  noiseAmount?: number;
  raysColor?: string;
  className?: string;
}

export function LightRays({
  raysOrigin = 'bottom-center',
  raysSpeed = 1.1,
  lightSpread = 0.8,
  fadeDistance = 0.8,
  saturation = 1.6,
  mouseInfluence = 0.2,
  noiseAmount = 0.17,
  raysColor = '#ff00d0',
  className = ''
}: LightRaysProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Parse color
    const hex = raysColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 255;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 208;

    const numRays = 60;
    const rays = Array.from({ length: numRays }).map(() => ({
      angleOffset: (Math.random() - 0.5) * Math.PI * lightSpread,
      speed: (Math.random() * 0.02 + 0.005) * raysSpeed,
      width: Math.random() * 0.15 + 0.02,
      length: Math.random() * 0.5 + 0.8,
      phase: Math.random() * Math.PI * 2,
      alphaMult: Math.random() * 0.8 + 0.2
    }));

    const draw = () => {
      // Pause animation if a modal is open
      if (document.body.style.overflow === 'hidden' || document.body.classList.contains('modal-open')) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Smooth mouse movement
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      let originX = canvas.width / 2;
      let originY = canvas.height;
      
      if (raysOrigin === 'center') {
        originY = canvas.height / 2;
      } else if (raysOrigin === 'top-center') {
        originY = 0;
      }

      // Apply mouse influence
      const dx = (mouseX - canvas.width / 2) * mouseInfluence;
      const dy = (mouseY - canvas.height / 2) * mouseInfluence;
      originX += dx;
      originY += dy;

      time += 0.01 * raysSpeed;

      ctx.globalCompositeOperation = 'screen';

      rays.forEach(ray => {
        // Oscillate angle
        const currentAngle = -Math.PI/2 + ray.angleOffset + Math.sin(time * ray.speed + ray.phase) * 0.2;
        
        // Oscillate alpha
        const currentAlpha = (Math.sin(time * ray.speed * 2 + ray.phase) * 0.5 + 0.5) * ray.alphaMult * saturation;

        const rayLength = Math.max(canvas.width, canvas.height) * ray.length;
        
        const endX = originX + Math.cos(currentAngle) * rayLength;
        const endY = originY + Math.sin(currentAngle) * rayLength;

        const gradient = ctx.createLinearGradient(originX, originY, endX, endY);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha})`);
        gradient.addColorStop(fadeDistance, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        
        const halfWidth = ray.width;
        
        ctx.lineTo(
          originX + Math.cos(currentAngle - halfWidth) * rayLength,
          originY + Math.sin(currentAngle - halfWidth) * rayLength
        );
        ctx.lineTo(
          originX + Math.cos(currentAngle + halfWidth) * rayLength,
          originY + Math.sin(currentAngle + halfWidth) * rayLength
        );
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [raysOrigin, raysSpeed, lightSpread, fadeDistance, saturation, mouseInfluence, raysColor]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {noiseAmount > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: noiseAmount,
            mixBlendMode: 'overlay'
          }}
        />
      )}
    </div>
  );
}
