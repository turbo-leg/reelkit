import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, useTheme } from "../theme";
import { BEATS_PER_SECOND, CLAMP, usePop } from "../time";
import { Kinetic, Scene } from "./text";

/**
 * The closing card: two bouncing lines on the dark background, a call-to-action pill (a
 * URL, a handle), and an optional brand slot underneath (a wordmark image or type).
 */
export const EndCard: React.FC<{
  lines: [string, string];
  cta?: string;
  brand?: React.ReactNode;
  size?: number;
}> = ({ lines, cta, brand, size = 150 }) => {
  const theme = useTheme();
  const pill = usePop(20, { damping: 13, stiffness: 140 });
  const mark = usePop(30, { damping: 20, stiffness: 140 });
  return (
    <Scene dark>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 70 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Kinetic text={lines[0]} color={theme.colors.onDark} size={size} />
          <Kinetic text={lines[1]} delay={8} color={theme.colors.accentSoft} size={size} />
        </div>
        {cta ? (
          <div
            style={{
              fontFamily: theme.fonts.sans,
              fontSize: 54,
              fontWeight: 700,
              color: theme.colors.dark,
              backgroundColor: theme.colors.onDark,
              borderRadius: 30,
              padding: "30px 50px",
              scale: interpolate(pill, [0, 1], [0.6, 1]),
              opacity: interpolate(pill, [0, 0.3], [0, 1], CLAMP),
            }}
          >
            {cta}
          </div>
        ) : null}
        {brand ? <div style={{ opacity: mark }}>{brand}</div> : null}
      </AbsoluteFill>
    </Scene>
  );
};

/** A spaced-out two-line wordmark in the serif face, for brands without a logo file. */
export const Wordmark: React.FC<{ name: string; tagline?: string; color?: string; size?: number }> = ({
  name,
  tagline,
  color,
  size = 72,
}) => {
  const theme = useTheme();
  return (
    <div style={{ fontFamily: theme.fonts.serif, color: color ?? theme.colors.onDark, textAlign: "center", lineHeight: 1 }}>
      <div style={{ fontSize: size, fontWeight: 500, letterSpacing: "0.34em", marginRight: "-0.34em" }}>{name}</div>
      {tagline ? (
        <div style={{ fontSize: size * 0.44, letterSpacing: "0.3em", marginRight: "-0.3em", marginTop: size * 0.28 }}>
          {tagline}
        </div>
      ) : null}
    </div>
  );
};

/**
 * A row of numbered steps that stays on screen through a tutorial. `current` is the step
 * in progress (0-based; -1 = none yet, steps.length = all done). Changing `current` springs
 * the highlight across; finished steps turn into checks.
 */
export const StepTracker: React.FC<{
  steps: string[];
  current: number;
  /** The beat the current step started at (for the highlight's spring). */
  since?: number;
  top?: number;
  dark?: boolean;
}> = ({ steps, current, since = 0, top = 1810, dark = false }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame - (since * fps) / BEATS_PER_SECOND, [0, (10 * fps) / BEATS_PER_SECOND], [0, 1], CLAMP);
  const text = dark ? theme.colors.onDark : theme.colors.ink;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        fontFamily: theme.fonts.sans,
      }}
    >
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const size = active ? 64 + 8 * p : 56;
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                fontWeight: 800,
                color: done || active ? theme.colors.onDark : alpha(text, 0.5),
                backgroundColor: done ? theme.colors.success : active ? theme.colors.accent : "transparent",
                border: done || active ? "none" : `3px solid ${alpha(text, 0.25)}`,
                boxShadow: active ? `0 0 0 ${10 * p}px ${alpha(theme.colors.accent, 0.18)}` : "none",
              }}
            >
              {done ? "✓" : i + 1}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: active ? 700 : 500,
                color: active ? text : alpha(text, 0.55),
                textAlign: "center",
                lineHeight: 1.15,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * A ring that empties over `period` seconds and starts again: for codes that rotate, or
 * any countdown. Draws the remaining seconds in the middle.
 */
export const CountdownRing: React.FC<{
  period?: number;
  size?: number;
  color?: string;
  /** Seconds already elapsed at frame 0. */
  offset?: number;
}> = ({ period = 30, size = 220, color, offset = 0 }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (offset + frame / fps) % period;
  const left = period - t;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const ink = color ?? theme.colors.accent;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={alpha(ink, 0.15)} strokeWidth={14} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ink}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - left / period)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.sans,
          fontWeight: 800,
          fontSize: size * 0.32,
          color: ink,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.ceil(left)}
      </div>
    </div>
  );
};
