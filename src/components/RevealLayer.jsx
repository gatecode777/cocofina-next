"use client";

import React, { useRef, forwardRef, useImperativeHandle } from "react";

export const SPOTLIGHT_R = 260;

export const RevealLayer = forwardRef(function RevealLayer({ image }, ref) {
  const revealDivRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updatePosition: (x, y) => {
      const revealDiv = revealDivRef.current;
      if (!revealDiv) return;
      const maskValue = `radial-gradient(circle ${SPOTLIGHT_R}px at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%)`;
      revealDiv.style.maskImage = maskValue;
      revealDiv.style.webkitMaskImage = maskValue;
    }
  }));

  return (
    <div
      ref={revealDivRef}
      className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none transition-none"
      style={{
        backgroundImage: `url(${image})`,
      }}
    />
  );
});
