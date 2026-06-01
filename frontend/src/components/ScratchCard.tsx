import React, { useRef, useEffect, useState } from "react";
import { audio } from "../utils/audio";
import styles from "./ScratchCard.module.css";
import { useBalance } from "../context/BalanceContext";

interface ScratchCardProps {
  cartCost: number;
  width: number;
  height: number;
  theme: "classic" | "gold" | "extreme";
  isRevealed: boolean;
  onComplete: () => void;
  onBought: (isBought: boolean) => void;
  children: React.ReactNode;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  cartCost,
  width,
  height,
  theme,
  isRevealed,
  onComplete,
  onBought,
  children,
}) => {
  const { tryToChangeBalance } = useBalance();
  const [isBought, setIsBought] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [fullyRevealed, setFullyRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    initScratchCanvas();
    initParticleEngine();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      audio.stopScratch();
    };
  }, [theme, width, height]);

  useEffect(() => {
    if (isRevealed && !fullyRevealed) {
      revealCardFully();
    }
  }, [isRevealed]);

  const initScratchCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setFullyRevealed(false);
    setScratchPercent(0);
    audio.stopScratch();

    canvas.width = width;
    canvas.height = height;

    let grad = ctx.createLinearGradient(0, 0, width, height);
    if (theme === "classic") {
      grad.addColorStop(0, "#084024");
      grad.addColorStop(0.4, "#198754");
      grad.addColorStop(0.7, "#146c43");
      grad.addColorStop(1, "#084024");
    } else if (theme === "gold") {
      grad.addColorStop(0, "#6e470b");
      grad.addColorStop(0.2, "#d4af37");
      grad.addColorStop(0.5, "#f7e7a6");
      grad.addColorStop(0.8, "#c59b27");
      grad.addColorStop(1, "#6e470b");
    } else {
      grad.addColorStop(0, "#120224");
      grad.addColorStop(0.4, "#8a2be2");
      grad.addColorStop(0.7, "#ff007f");
      grad.addColorStop(1, "#4b0082");
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let i = 0; i < 300; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }

    ctx.strokeStyle =
      theme === "gold"
        ? "rgba(255, 255, 255, 0.7)"
        : theme === "classic"
          ? "rgba(143, 255, 143, 0.6)"
          : "rgba(255, 79, 240, 0.6)";
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, width - 10, height - 10);

    ctx.strokeStyle =
      theme === "gold"
        ? "rgba(212, 175, 55, 0.5)"
        : theme === "classic"
          ? "rgba(25, 135, 84, 0.5)"
          : "rgba(138, 43, 226, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 20px 'Poppins', sans-serif";
    const headerText =
      theme === "gold"
        ? "★ ZŁOTY SKARBIEC ★"
        : theme === "classic"
          ? "🍀 SZCZĘŚLIWA KONICZYNA 🍀"
          : "⚡ NEONOWY JACKPOT ⚡";
    ctx.fillText(headerText, width / 2, height / 2 - 25);

    ctx.font = "bold 12px 'Open Sans', sans-serif";
    ctx.fillStyle =
      theme === "gold"
        ? "#FFECA1"
        : theme === "classic"
          ? "#B6FFD4"
          : "#FFA9FF";
    ctx.fillText("ZDRAP TUTAJ MYSZKĄ LUB PALCEM", width / 2, height / 2 + 15);

    ctx.font = "normal 10px 'Open Sans', sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("Odkryj min. 60% aby zaliczyć wygraną", width / 2, height / 2 + 35);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  const initParticleEngine = () => {
    const pCanvas = particleCanvasRef.current;
    if (!pCanvas) return;
    pCanvas.width = width;
    pCanvas.height = height;

    const render = () => {
      const ctx = pCanvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 1;
        p.alpha = Math.max(0, p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(render);
  };

  const spawnParticles = (x: number, y: number) => {
    const count = 3;
    const colors =
      theme === "gold"
        ? ["#ffe875", "#c59b27", "#85581a", "#ffffff"]
        : theme === "classic"
          ? ["#8fff8f", "#198754", "#0a4b27", "#ffffff"]
          : ["#ff7be9", "#8a2be2", "#e0115f", "#ffffff"];

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.7) * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        alpha: 1,
      });
    }
  };

  const getMouseCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    isMouseEnter = false
  ) => {
    if (isMouseEnter && "buttons" in e && e.buttons !== 1) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Musisz być zalogowany, aby kupić zdrapkę!");
      return;
    }

    if (!isBought) {
      if (!tryToChangeBalance(-cartCost)) return;
      setIsBought(true);
      onBought(true);
      audio.playCoinSound();
    }
    if (fullyRevealed) return;
    const coords = getMouseCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    lastPosRef.current = coords;
    audio.startScratch();
  };

  const handleMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (fullyRevealed || !isDrawing || !lastPosRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getMouseCoords(e);
    if (!coords) return;

    const { x, y } = coords;
    const { x: lx, y: ly } = lastPosRef.current;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.globalAlpha = 1.0;

    const dx = x - lx;
    const dy = y - ly;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const radius = 25;
    for (let i = 0; i < distance; i += 2) {
      const cx = lx + Math.cos(angle) * i;
      const cy = ly + Math.sin(angle) * i;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    spawnParticles(x, y);

    const speed = Math.sqrt(dx * dx + dy * dy);
    audio.updateScratch(speed * 2);

    lastPosRef.current = { x, y };
    checkScratchPercentage();
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
    audio.stopScratch();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    const totalPixels = pixels.length / 4;
    for (let i = 3; i < pixels.length; i += 8) {
      if (pixels[i] === 0) {
        transparentCount += 2;
      }
    }

    const percent = Math.min((transparentCount / totalPixels) * 100, 100);
    setScratchPercent(Math.round(percent));

    if (percent >= 60) {
      revealCardFully();
    }
  };

  const revealCardFully = () => {
    if (fullyRevealed) return;
    setFullyRevealed(true);
    setIsDrawing(false);
    audio.stopScratch();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let alpha = 1;
    const fadeOut = () => {
      alpha -= 0.15;
      if (alpha <= 0) {
        ctx.clearRect(0, 0, width, height);
        onComplete();
      } else {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.globalAlpha = alpha;

        let grad = ctx.createLinearGradient(0, 0, width, height);
        if (theme === "classic") {
          grad.addColorStop(0, "#084024");
          grad.addColorStop(1, "#198754");
        } else if (theme === "gold") {
          grad.addColorStop(0, "#6e470b");
          grad.addColorStop(1, "#c59b27");
        } else {
          grad.addColorStop(0, "#120224");
          grad.addColorStop(1, "#ff007f");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        requestAnimationFrame(fadeOut);
      }
    };
    fadeOut();
    setIsBought(false);
    onBought(false);
  };

  const themeClass =
    theme === "classic"
      ? styles.classicCard
      : theme === "gold"
        ? styles.goldCard
        : styles.extremeCard;

  return (
    <div
      ref={containerRef}
      className={`${styles.scratchCard} ${themeClass}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className={styles.childrenContainer}>{children}</div>

      <canvas
        ref={canvasRef}
        onMouseDown={(e) => handleStart(e, false)}
        onMouseEnter={(e) => handleStart(e, true)}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className={`${styles.scratchCanvas} ${
          fullyRevealed ? styles.scratchCanvasComplete : styles.scratchCanvasActive
        }`}
      />

      <canvas ref={particleCanvasRef} className={styles.particleCanvas} />

      {!fullyRevealed && scratchPercent > 0 && (
        <div className={styles.progressOverlay}>Zdrapano: {scratchPercent}%</div>
      )}
    </div>
  );
}; 