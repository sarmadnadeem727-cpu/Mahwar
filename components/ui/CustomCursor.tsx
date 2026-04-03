"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth lerping for the outer ring
  const springConfig = { damping: 28, stiffness: 180, mass: 0.1 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("cursor-pointer")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] hidden lg:block">
      {/* Inner Dot */}
      <motion.div
        className="fixed w-2 h-2 bg-[var(--gold)] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{
          left: mouseX,
          top: mouseY,
        }}
      />
      
      {/* Outer Ring */}
      <motion.div
        className="fixed w-9 h-9 border border-[var(--gold)] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{
          left: ringX,
          top: ringY,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
};

export default CustomCursor;
