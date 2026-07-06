import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    // Map to -1 to 1 for height and adjust width proportionally
    float u_x = (2.0 * gl_FragCoord.x - u_resolution.x) / u_resolution.y;
    float u_y = (2.0 * gl_FragCoord.y - u_resolution.y) / u_resolution.y;

    float a = 0.0;
    float d = 0.0;
    float time = u_time * 0.0004;

    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      a += cos(fi - d + time * 0.5 - a * u_x);
      d += sin(fi * u_y + a);
    }

    float wave = (sin(a) + cos(d)) * 0.5;
    float intensity = max(0.0, wave * 1.5 - 0.2);
    
    float baseVal = max(0.0, 0.15 * cos(u_x + u_y + time * 0.3));
    float purpleAccent = max(0.0, 0.3 * sin(a * 1.5 + time * 0.2));
    float blueAccent = max(0.0, 0.4 * cos(d * 2.0 + time * 0.1));

    float r = clamp(baseVal * 0.5 + purpleAccent * 1.0, 0.0, 1.0) * intensity;
    float g = 0.0;
    float b = clamp(baseVal * 1.2 + purpleAccent * 1.2 + blueAccent * 2.0, 0.0, 1.0) * intensity;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

const DynamicWaveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize WebGL
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return;

    // Compile Shader
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Setup Geometry
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1, -1,
       1,  1,
      -1,  1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    let isMobileViewport = window.innerWidth < 768;

    const handleResize = () => {
      isMobileViewport = window.innerWidth < 768;
      const divisor = isMobileViewport ? 3.2 : 2;
      const width = Math.max(320, Math.round(window.innerWidth / divisor));
      const height = Math.max(480, Math.round(window.innerHeight / divisor));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionLocation, width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const startTime = Date.now();
    let animationFrameId: number;
    let lastRenderTime = 0;

    const render = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (document.body.style.overflow === 'hidden' || document.body.classList.contains('modal-open')) return;
      if (isMobileViewport && timestamp - lastRenderTime < 32) return;
      
      const currentTime = Date.now() - startTime;
      gl.uniform1f(timeLocation, currentTime);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      lastRenderTime = timestamp;
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full z-[15] pointer-events-none opacity-30 mix-blend-screen" 
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, black 70%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 30%, black 70%, black 100%)'
      }}
    />
  );
};

export default DynamicWaveBackground;
