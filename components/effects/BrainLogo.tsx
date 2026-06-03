"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

export default function BrainLogo({ className = "", ariaLabel = "Walnut logo" }: { className?: string; ariaLabel?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const gradientId = `${id}-brainGradient`;
  const filterId = `${id}-brainGlow`;

  return (
    <motion.svg
      viewBox="0 0 256 256"
      className={className}
      role="img"
      aria-label={ariaLabel}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 1.5, ease: "easeOut" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--neural-soft)" />
          <stop offset="52%" stopColor="var(--neural)" />
          <stop offset="100%" stopColor="var(--soul)" />
        </linearGradient>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Brain outline - filled with gradient */}
      <motion.path
        d="M128 46C95 41 63 65 62 101C43 110 40 143 62 157C60 189 90 211 124 203C151 215 188 201 193 166C215 154 216 119 195 105C195 69 162 41 128 46Z"
        fill={`url(#${gradientId})`}
        fillOpacity="0.12"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
        initial={shouldReduceMotion ? false : { pathLength: 0, fillOpacity: 0 }}
        animate={{ pathLength: 1, fillOpacity: 0.12 }}
        transition={{ duration: shouldReduceMotion ? 0 : 2.5, ease: "easeInOut" }}
      />

      {/* S-shaped fold (Walnut S) */}
      <motion.path
        d="M126 61C109 76 110 96 128 108C149 122 150 145 128 160C112 171 112 188 128 198"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 2, ease: "easeInOut", delay: shouldReduceMotion ? 0 : 0.5 }}
      />

      {/* Brain gyri lines */}
      <motion.path
        d="M95 86C85 100 88 119 105 127"
        fill="none"
        stroke="rgba(200, 192, 255, 0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.5, delay: shouldReduceMotion ? 0 : 0.8 }}
      />
      <motion.path
        d="M163 83C174 97 170 119 153 127"
        fill="none"
        stroke="rgba(200, 192, 255, 0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.5, delay: shouldReduceMotion ? 0 : 1.0 }}
      />
      <motion.path
        d="M94 155C105 148 114 149 122 158"
        fill="none"
        stroke="rgba(200, 192, 255, 0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.5, delay: shouldReduceMotion ? 0 : 1.2 }}
      />
      <motion.path
        d="M162 154C150 148 140 150 132 160"
        fill="none"
        stroke="rgba(200, 192, 255, 0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.5, delay: shouldReduceMotion ? 0 : 1.4 }}
      />
    </motion.svg>
  );
}
