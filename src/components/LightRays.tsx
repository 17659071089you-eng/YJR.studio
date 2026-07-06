import React, { useRef, useState, useEffect } from 'react';
import { Renderer, Geometry, Program, Mesh } from 'ogl';

interface LightRaysProps {
  raysOrigin?: 'top-left' | 'top-center' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [1, 1, 1];
};

const getOriginConfig = (origin: string, width: number, height: number) => {
  switch (origin) {
    case 'top-left':
      return { anchor: [0, -0.2 * height], dir: [0, 1] };
    case 'top-right':
      return { anchor: [width, -0.2 * height], dir: [0, 1] };
    case 'left':
      return { anchor: [-0.2 * width, 0.5 * height], dir: [1, 0] };
    case 'right':
      return { anchor: [(1 + 0.2) * width, 0.5 * height], dir: [-1, 0] };
    case 'bottom-left':
      return { anchor: [0, (1 + 0.2) * height], dir: [0, -1] };
    case 'bottom-center':
      return { anchor: [0.5 * width, (1 + 0.2) * height], dir: [0, -1] };
    case 'bottom-right':
      return { anchor: [width, (1 + 0.2) * height], dir: [0, -1] };
    case 'top-center':
    default:
      return { anchor: [0.5 * width, -0.2 * height], dir: [0, 1] };
  }
};

export default function LightRays({
  raysOrigin = 'top-center',
  raysColor = '#ffffff',
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  className = '',
}: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<any>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const targetMouse = useRef({ x: 0.5, y: 0.5 });
  const currentMouse = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          setIsVisible(entries[0].isIntersecting);
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(containerRef.current);
    }
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    let isMounted = true;

    const init = async () => {
      if (!containerRef.current) return;
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (!isMounted || !containerRef.current) return;

      let isMobileViewport = window.innerWidth < 768;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, isMobileViewport ? 1 : 2),
        alpha: true,
      });
      rendererRef.current = renderer;
      const gl = renderer.gl;

      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      const vertex = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fragment = `
        precision highp float;

        uniform float iTime;
        uniform vec2  iResolution;

        uniform vec2  rayPos;
        uniform vec2  rayDir;
        uniform vec3  raysColor;
        uniform float raysSpeed;
        uniform float lightSpread;
        uniform float rayLength;
        uniform float pulsating;
        uniform float fadeDistance;
        uniform float saturation;
        uniform vec2  mousePos;
        uniform float mouseInfluence;
        uniform float noiseAmount;
        uniform float distortion;

        varying vec2 vUv;

        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                          float seedA, float seedB, float speed) {
          vec2 sourceToCoord = coord - raySource;
          vec2 dirNorm = normalize(sourceToCoord);
          float cosAngle = dot(dirNorm, rayRefDirection);

          float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
          
          float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

          float distance = length(sourceToCoord);
          float maxDistance = iResolution.x * rayLength;
          float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
          
          float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
          float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

          float baseStrength = clamp(
            (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
            (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
            0.0, 1.0
          );

          return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
          
          vec2 finalRayDir = rayDir;
          if (mouseInfluence > 0.0) {
            vec2 mouseScreenPos = mousePos * iResolution.xy;
            vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
            finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
          }

          vec4 rays1 = vec4(1.0) *
                       rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                                   1.5 * raysSpeed);
          vec4 rays2 = vec4(1.0) *
                       rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                                   1.1 * raysSpeed);

          fragColor = rays1 * 0.5 + rays2 * 0.4;

          if (noiseAmount > 0.0) {
            float n = noise(coord * 0.01 + iTime * 0.1);
            fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
          }

          float brightness = 1.0 - (coord.y / iResolution.y);
          fragColor.x *= 0.1 + brightness * 0.8;
          fragColor.y *= 0.3 + brightness * 0.6;
          fragColor.z *= 0.5 + brightness * 0.5;

          if (saturation != 1.0) {
            float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
            fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
          }

          fragColor.rgb *= raysColor;
        }

        void main() {
          vec4 color;
          mainImage(color, gl_FragCoord.xy);
          gl_FragColor  = color;
        }
      `;

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1 : 0 },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
      };
      uniformsRef.current = uniforms;

      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      });

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms,
      });

      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const handleResize = () => {
        if (!containerRef.current || !renderer) return;
        isMobileViewport = window.innerWidth < 768;
        renderer.dpr = Math.min(window.devicePixelRatio, isMobileViewport ? 1 : 2);
        const { clientWidth, clientHeight } = containerRef.current;
        renderer.setSize(clientWidth, clientHeight);
        
        const dpr = renderer.dpr;
        const width = clientWidth * dpr;
        const height = clientHeight * dpr;
        uniforms.iResolution.value = [width, height];
        
        const { anchor, dir } = getOriginConfig(raysOrigin, width, height);
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      let lastRenderTime = 0;
      const update = (t: number) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return;
        
        // Pause animation if a modal is open
        if (document.body.style.overflow === 'hidden' || document.body.classList.contains('modal-open')) {
          rafRef.current = requestAnimationFrame(update);
          return;
        }
        if (isMobileViewport && t - lastRenderTime < 32) {
          rafRef.current = requestAnimationFrame(update);
          return;
        }
        
        uniforms.iTime.value = t * 0.001;
        
        if (followMouse && mouseInfluence > 0) {
          currentMouse.current.x = currentMouse.current.x * 0.92 + targetMouse.current.x * 0.08;
          currentMouse.current.y = currentMouse.current.y * 0.92 + targetMouse.current.y * 0.08;
          uniforms.mousePos.value = [currentMouse.current.x, currentMouse.current.y];
        }

        try {
          renderer.render({ scene: mesh });
          lastRenderTime = t;
          rafRef.current = requestAnimationFrame(update);
        } catch (err) {
          console.warn('WebGL rendering error:', err);
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();
      rafRef.current = requestAnimationFrame(update);

      cleanupRef.current = () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        window.removeEventListener('resize', handleResize);
        if (renderer) {
          try {
            const canvas = renderer.gl.canvas;
            const ext = renderer.gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
            if (canvas && canvas.parentNode) {
              canvas.parentNode.removeChild(canvas);
            }
          } catch (e) {
            console.warn('Error during WebGL cleanup:', e);
          }
        }
        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
      };
    };

    init();

    return () => {
      isMounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [
    isVisible,
    raysOrigin,
    raysColor,
    raysSpeed,
    lightSpread,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    followMouse,
    mouseInfluence,
    noiseAmount,
    distortion,
  ]);

  useEffect(() => {
    if (!uniformsRef.current || !containerRef.current || !rendererRef.current) return;
    const uniforms = uniformsRef.current;
    const renderer = rendererRef.current;

    uniforms.raysColor.value = hexToRgb(raysColor);
    uniforms.raysSpeed.value = raysSpeed;
    uniforms.lightSpread.value = lightSpread;
    uniforms.rayLength.value = rayLength;
    uniforms.pulsating.value = pulsating ? 1 : 0;
    uniforms.fadeDistance.value = fadeDistance;
    uniforms.saturation.value = saturation;
    uniforms.mouseInfluence.value = mouseInfluence;
    uniforms.noiseAmount.value = noiseAmount;
    uniforms.distortion.value = distortion;

    const { clientWidth, clientHeight } = containerRef.current;
    const dpr = renderer.dpr;
    const { anchor, dir } = getOriginConfig(raysOrigin, clientWidth * dpr, clientHeight * dpr);
    uniforms.rayPos.value = anchor;
    uniforms.rayDir.value = dir;
  }, [
    raysColor,
    raysSpeed,
    lightSpread,
    raysOrigin,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    mouseInfluence,
    noiseAmount,
    distortion,
  ]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Avoid getBoundingClientRect on every mouse move to prevent reflows
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      const x = e.clientX / width;
      const y = e.clientY / height;
      targetMouse.current = { x, y };
    };

    if (followMouse) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [followMouse]);

  return <div ref={containerRef} className={`light-rays-container ${className}`} />;
}
