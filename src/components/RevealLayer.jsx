"use client";

import React, { useEffect, useRef } from "react";

export const SPOTLIGHT_R = 260;

export function RevealLayer({ image, cursorX, cursorY }) {
  const canvasRef = useRef(null);
  const revealDivRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const revealDiv = revealDivRef.current;
    if (!canvas || !revealDiv) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width || window.innerWidth;
    const height = canvas.height || window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R
    );

    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.4, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.6, "rgba(255, 255, 255, 0.75)");
    grad.addColorStop(0.75, "rgba(255, 255, 255, 0.4)");
    grad.addColorStop(0.88, "rgba(255, 255, 255, 0.12)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    const maskValue = `url(${dataUrl})`;

    revealDiv.style.maskImage = maskValue;
    revealDiv.style.webkitMaskImage = maskValue;
    revealDiv.style.maskSize = "100% 100%";
    revealDiv.style.webkitMaskSize = "100% 100%";
    revealDiv.style.maskRepeat = "no-repeat";
    revealDiv.style.webkitMaskRepeat = "no-repeat";
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: "none" }}
      />
      <div
        ref={revealDivRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
    </>
  );
}
