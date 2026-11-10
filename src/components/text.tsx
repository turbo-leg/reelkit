import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";
import { BEATS_PER_SECOND, CLAMP } from "../time";

/** A line of text whose letters jump into place one after another. */
export const Kinetic: React.FC<{
  text: string;
  /** Beats before the first letter moves. */
  delay?: number;
  /** Beats between one letter and the next. */
  stagger?: number;
  color?: string;
  size?: number;
  weight?: number;
  font?: string;
}> = ({ text, delay = 0, stagger = 1.4, color, size = 118, weight = 800, font }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  return (
    <div
      style={{
        fontFamily: font ?? theme.fonts.sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
        color: color ?? theme.colors.ink,
        whiteSpace: "nowrap",
      }}
    >
      {Array.from(text).map((letter, index) => {
        const p = spring({
          frame: frame - ((delay + index * stagger) * fps) / BEATS_PER_SECOND,
          fps,
          config: { damping: 11, mass: 0.5, stiffness: 170 },
        });
        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: interpolate(p, [0, 0.4], [0, 1], CLAMP),
              translate: `0px ${interpolate(p, [0, 1], [70, 0])}px`,
              rotate: `${interpolate(p, [0, 1], [14, 0])}deg`,
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};

/**
 * A whole scene. Over its last few beats it lifts away, so the next scene never cuts in
 * cold. Put one inside each <Sequence>.
 */
export const Scene: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  /** Beats the exit takes; 0 for a hard cut. */
  exit?: number;
  background?: string;
}> = ({ children, dark, exit = 7, background }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const theme = useTheme();
  const exitFrames = (exit * fps) / BEATS_PER_SECOND;
  const out = exit > 0 ? interpolate(frame, [durationInFrames - exitFrames, durationInFrames], [0, 1], CLAMP) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: background ?? (dark ? theme.colors.dark : theme.colors.paper) }}>
      <AbsoluteFill style={{ opacity: 1 - out, translate: `0px ${-50 * out}px` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A centred caption block near the top of a vertical frame (above a phone, never on it). */
export const Caption: React.FC<{ children: React.ReactNode; top?: number; side?: number }> = ({
  children,
  top = 118,
  side = 96,
}) => (
  <div
    style={{
      position: "absolute",
      left: side,
      right: side,
      top,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 6,
    }}
  >
    {children}
  </div>
);
