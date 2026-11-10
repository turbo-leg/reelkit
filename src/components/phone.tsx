import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { alpha, useTheme } from "../theme";
import { CLAMP, usePop } from "../time";

/**
 * A drawn iPhone for real app screenshots. Geometry is in video pixels for a 1080×1920
 * frame. Screenshots are expected at `SCREENSHOT_WIDTH` px wide (a 390-pt viewport at 3×);
 * `PHONE.scale` turns screenshot pixels into video pixels, which is how <Ring> and <Crop>
 * can be positioned with coordinates read straight off the screenshot.
 */
export const SCREENSHOT_WIDTH = 1170;

const BODY = { left: 196, top: 500, width: 688, height: 1300, radius: 104 };
const BEZEL = 18;
const STATUS = 92;
const GLASS = { width: BODY.width - BEZEL * 2, height: BODY.height - BEZEL * 2 };

export const PHONE = {
  body: BODY,
  bezel: BEZEL,
  statusBar: STATUS,
  glass: GLASS,
  /** Height of the page area under the status bar. */
  pageHeight: GLASS.height - STATUS,
  /** Screenshot pixels → video pixels. */
  scale: GLASS.width / SCREENSHOT_WIDTH,
} as const;

/** Resolve a source: URLs and data URIs pass through; anything else is a path in public/. */
export const src = (path: string) => (/^(https?:|data:|blob:|\/)/.test(path) ? path : staticFile(path));

const SideButton: React.FC<{ side: "left" | "right"; top: number; height: number }> = ({ side, top, height }) => (
  <div
    style={{
      position: "absolute",
      [side]: -7,
      top,
      width: 8,
      height,
      borderRadius: 4,
      background: "linear-gradient(90deg, #3a3d44, #1c1e22)",
    }}
  />
);

export const StatusBar: React.FC<{ time?: string; background?: string; color?: string }> = ({
  time = "9:41",
  background = "#FBFCFE",
  color = "#0A0A0A",
}) => {
  const theme = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: STATUS,
        backgroundColor: background,
        fontFamily: theme.fonts.sans,
        fontWeight: 600,
        fontSize: 30,
        color,
      }}
    >
      <div style={{ position: "absolute", left: 62, top: 34, letterSpacing: "-0.01em" }}>{time}</div>
      {/* The Dynamic Island, with the camera's faint lens. */}
      <div
        style={{
          position: "absolute",
          left: GLASS.width / 2 - 98,
          top: 22,
          width: 196,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#000",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 22,
            top: 20,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: "radial-gradient(circle at 35% 35%, #2b3350, #0a0c14 70%)",
          }}
        />
      </div>
      <svg width="124" height="30" viewBox="0 0 124 30" style={{ position: "absolute", right: 46, top: 36 }}>
        <rect x="0" y="17" width="6" height="8" rx="1.5" fill={color} />
        <rect x="9" y="13" width="6" height="12" rx="1.5" fill={color} />
        <rect x="18" y="8" width="6" height="17" rx="1.5" fill={color} />
        <rect x="27" y="3" width="6" height="22" rx="1.5" fill={color} />
        <path d="M44 11a16 16 0 0 1 24 0" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M48.5 16.5a10 10 0 0 1 15 0" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="56" cy="22.5" r="2.8" fill={color} />
        <rect x="80" y="5" width="36" height="19" rx="6" fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="2" />
        <rect x="83" y="8" width="30" height="13" rx="3.5" fill={color} />
        <rect x="118" y="11" width="3" height="7" rx="1.5" fill={color} fillOpacity="0.45" />
      </svg>
    </div>
  );
};

/**
 * Where a phone sits: moved by x and y (video pixels), scaled about its own centre, and
 * turned in space (degrees about the horizontal axis, the vertical axis, and the screen).
 */
export type Place = { x?: number; y?: number; scale?: number; tilt?: [number, number, number] };

export const Phone: React.FC<{
  /** Beats before it slides in. */
  delay?: number;
  from?: "bottom" | "right" | "left" | "none";
  place?: Place;
  children: React.ReactNode;
}> = ({ delay = 0, from = "bottom", place = {}, children }) => {
  const theme = useTheme();
  const p = usePop(delay, { damping: 15, stiffness: 140 });
  const shift = from === "none" ? 0 : interpolate(p, [0, 1], [1000, 0]);
  const lean = from === "none" ? 0 : interpolate(p, [0, 1], [from === "bottom" ? -5 : 5, 0]);
  const { x = 0, y = 0, scale = 1, tilt = [0, 0, 0] } = place;
  return (
    <div
      style={{
        position: "absolute",
        left: BODY.left,
        top: BODY.top,
        width: BODY.width,
        height: BODY.height,
        transform: `translate(${x}px, ${y}px) perspective(2600px) rotateX(${tilt[0]}deg) rotateY(${tilt[1]}deg) rotateZ(${tilt[2]}deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          translate: from === "bottom" ? `0px ${shift}px` : `${from === "left" ? -shift : shift}px 0px`,
          rotate: `${lean}deg`,
        }}
      >
        <SideButton side="left" top={210} height={50} />
        <SideButton side="left" top={300} height={96} />
        <SideButton side="left" top={416} height={96} />
        <SideButton side="right" top={340} height={150} />
        {/* The titanium frame, then the black edge, then the glass. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: BODY.radius,
            background: "linear-gradient(135deg, #5b5f68 0%, #2a2c31 28%, #17181b 55%, #3d4047 100%)",
            boxShadow: `0 50px 110px ${alpha(theme.colors.dark, 0.34)}, 0 12px 28px ${alpha(theme.colors.dark, 0.2)}`,
          }}
        />
        <div style={{ position: "absolute", inset: 5, borderRadius: BODY.radius - 5, backgroundColor: "#050506" }} />
        <div
          style={{
            position: "absolute",
            left: BEZEL,
            top: BEZEL,
            width: GLASS.width,
            height: GLASS.height,
            borderRadius: BODY.radius - BEZEL,
            overflow: "hidden",
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: STATUS,
              width: GLASS.width,
              height: PHONE.pageHeight,
              overflow: "hidden",
            }}
          >
            {children}
          </div>
          <StatusBar />
          {/* The home indicator. */}
          <div
            style={{
              position: "absolute",
              left: GLASS.width / 2 - 110,
              bottom: 14,
              width: 220,
              height: 9,
              borderRadius: 5,
              backgroundColor: "rgba(10, 10, 10, 0.82)",
            }}
          />
          {/* A soft reflection across the glass. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(118deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * One page inside the phone. `slide` moves it by that many page-heights (1 = just below
 * the glass, -1 = just above): that is how a page scrolls away and the next one arrives.
 * `scroll` moves a tall (full-page) screenshot up by that many screenshot pixels.
 */
export const Screen: React.FC<{ src: string; slide?: number; scroll?: number; opacity?: number }> = ({
  src: path,
  slide = 0,
  scroll = 0,
  opacity = 1,
}) => (
  <Img
    src={src(path)}
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: GLASS.width,
      opacity,
      translate: `0px ${slide * PHONE.pageHeight - scroll * PHONE.scale}px`,
    }}
  />
);

/** A rectangle cut out of a screenshot (its own pixels), shown `width` video pixels wide. */
export const Crop: React.FC<{
  src: string;
  box: [x: number, y: number, w: number, h: number];
  width: number;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ src: path, box: [x, y, w, h], width, radius = 28, style }) => {
  const k = width / w;
  return (
    <div
      style={{
        position: "relative",
        width,
        height: h * k,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: "white",
        ...style,
      }}
    >
      <Img
        src={src(path)}
        style={{ position: "absolute", left: -x * k, top: -y * k, width: SCREENSHOT_WIDTH * k, maxWidth: "none" }}
      />
    </div>
  );
};

/** A ring around part of a page inside a <Phone>, given in the screenshot's own pixels. */
export const Ring: React.FC<{
  box: [x: number, y: number, w: number, h: number];
  /** Beats before it pops in. */
  delay: number;
  color?: string;
}> = ({ box: [x, y, w, h], delay, color }) => {
  const theme = useTheme();
  const c = color ?? theme.colors.accent;
  const p = usePop(delay, { damping: 13, stiffness: 140 });
  return (
    <div
      style={{
        position: "absolute",
        left: x * PHONE.scale - 14,
        top: y * PHONE.scale - 14,
        width: w * PHONE.scale + 28,
        height: h * PHONE.scale + 28,
        borderRadius: 22,
        border: `6px solid ${c}`,
        boxShadow: `0 0 0 8px ${alpha(c, 0.16)}`,
        opacity: interpolate(p, [0, 0.3], [0, 1], CLAMP),
        scale: interpolate(p, [0, 1], [1.25, 1]),
      }}
    />
  );
};

/**
 * A fingertip on the glass: a soft dot that presses down and sends out a ripple.
 * `pressed` runs 0→1 over the press; `shown` is its opacity. Position in video pixels
 * relative to the page area (screenshot px × PHONE.scale).
 */
export const Touch: React.FC<{ x: number; y: number; pressed: number; shown: number; color?: string }> = ({
  x,
  y,
  pressed,
  shown,
  color,
}) => {
  const theme = useTheme();
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: shown }}>
      <div
        style={{
          position: "absolute",
          left: -60,
          top: -60,
          width: 120,
          height: 120,
          borderRadius: 60,
          border: `4px solid ${color ?? theme.colors.accent}`,
          scale: 0.5 + pressed * 0.9,
          opacity: pressed > 0 ? 1 - pressed : 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -32,
          top: -32,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: alpha(theme.colors.dark, 0.32),
          border: "3px solid rgba(255, 255, 255, 0.9)",
          boxShadow: `0 6px 18px ${alpha(theme.colors.dark, 0.3)}`,
          scale: 1 - 0.22 * Math.sin(Math.min(pressed, 1) * Math.PI),
        }}
      />
    </div>
  );
};
