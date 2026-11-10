import React from "react";
import { useTheme } from "../theme";

/**
 * On-screen text hooks in the style of Instagram's native text: semibold type, tight corners,
 * and ONE outline traced round all the lines, so where a line is narrower or wider than the
 * one above, the inside corner flares outward instead of pinching in.
 *
 *   variant "white" (default)  dark text on a white outline
 *   variant "black"            white text on a black outline
 *   variant "plain"            white text with a black stroke, no background
 *
 * `widths` is each line's box width (text + 2 × HOOK_PAD_X) in video pixels. Measure them
 * from a render, or use `estimateWidths` for a first pass.
 */
export type HookVariant = "white" | "black" | "plain";

export const HOOK_FONT_SIZE = 78;
export const HOOK_LINE_H = 105;
export const HOOK_PAD_X = 22;
const RADIUS = 12;

/** A rough width per line (0.56 em per character + padding). Good enough to preview with. */
export const estimateWidths = (lines: string[], fontSize = HOOK_FONT_SIZE) =>
  lines.map((t) => Math.round(Array.from(t).length * fontSize * 0.56 + 2 * HOOK_PAD_X));

/**
 * Stacked, centred line boxes as one SVG path with every vertex rounded. A vertex where the
 * outline turns inward rounds as a normal corner; one where it turns outward becomes a
 * fillet that flares out.
 */
export const hookPath = (widths: number[], cx: number, top: number, lh = HOOK_LINE_H, r = RADIUS) => {
  // Lines within a corner's width of each other read as one straight edge: snap them to the
  // wider so the outline has no hairline notch.
  const ws = widths.map((w, i) => {
    const near = widths.filter((v, j) => Math.abs(j - i) === 1 && Math.abs(v - w) < 4 * r);
    return Math.max(w, ...near);
  });
  const right: [number, number][] = [];
  ws.forEach((w, i) => {
    const y0 = top + i * lh;
    right.push([cx + w / 2, y0], [cx + w / 2, y0 + lh]);
  });
  const pts: [number, number][] = [];
  for (const p of right) {
    const last = pts[pts.length - 1];
    if (last && last[0] === p[0] && last[1] === p[1]) continue;
    pts.push(p);
  }
  // Drop the step points between two lines of the same width.
  const clean = pts.filter((p, i) => {
    const a = pts[i - 1];
    const b = pts[i + 1];
    return !(a && b && a[0] === p[0] && b[0] === p[0]);
  });
  const left = clean.map(([x, y]) => [2 * cx - x, y] as [number, number]).reverse();
  const poly = [...clean, ...left];
  const n = poly.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const p = poly[i];
    const a = poly[(i - 1 + n) % n];
    const b = poly[(i + 1) % n];
    const la = Math.hypot(p[0] - a[0], p[1] - a[1]);
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const rr = Math.min(r, la / 2, lb / 2);
    const ix = p[0] + ((a[0] - p[0]) / la) * rr;
    const iy = p[1] + ((a[1] - p[1]) / la) * rr;
    const ox = p[0] + ((b[0] - p[0]) / lb) * rr;
    const oy = p[1] + ((b[1] - p[1]) / lb) * rr;
    d += `${i === 0 ? "M" : "L"}${ix},${iy} Q${p[0]},${p[1]} ${ox},${oy} `;
  }
  return d + "Z";
};

export const TextHook: React.FC<{
  lines: string[];
  widths?: number[];
  top: number;
  variant?: HookVariant;
  cx?: number;
  frameWidth?: number;
  frameHeight?: number;
}> = ({ lines, widths, top, variant = "white", cx = 540, frameWidth = 1080, frameHeight = 1920 }) => {
  const theme = useTheme();
  const font = theme.fonts.sans;
  const ws = widths ?? estimateWidths(lines);
  const fill = variant === "white" ? "#fff" : variant === "black" ? "#000" : null;
  const ink = variant === "white" ? "#000" : "#fff";
  if (variant === "plain") {
    return (
      <svg width={frameWidth} height={frameHeight} style={{ position: "absolute", inset: 0 }}>
        {lines.map((t, i) => (
          <text
            key={t}
            x={cx}
            y={top + i * HOOK_LINE_H + 78}
            textAnchor="middle"
            fontFamily={font}
            fontWeight={600}
            fontSize={HOOK_FONT_SIZE}
            letterSpacing={-1}
            fill="#fff"
            stroke="#000"
            strokeWidth={10}
            strokeLinejoin="round"
            style={{ paintOrder: "stroke" }}
          >
            {t}
          </text>
        ))}
      </svg>
    );
  }
  return (
    <>
      {fill ? (
        <svg width={frameWidth} height={frameHeight} style={{ position: "absolute", inset: 0 }}>
          <path d={hookPath(ws, cx, top)} fill={fill} />
        </svg>
      ) : null}
      {lines.map((t, i) => (
        <div
          key={t}
          style={{
            position: "absolute",
            top: top + i * HOOK_LINE_H,
            left: cx - frameWidth / 2,
            width: frameWidth,
            height: HOOK_LINE_H,
            paddingTop: 6,
            boxSizing: "border-box",
            textAlign: "center",
            color: ink,
            fontFamily: font,
            fontWeight: 600,
            fontSize: HOOK_FONT_SIZE,
            lineHeight: 1.15,
            letterSpacing: -1,
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </div>
      ))}
    </>
  );
};
