import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Time in reelkit is written in **beats**: 1/30 of a second, whatever frame rate the video
 * renders at. A 60 fps render and a 96 fps "smooth slow" render share the same timing;
 * only smoothness changes.
 */
export const BEATS_PER_SECOND = 30;

/** Frames for a number of beats at a frame rate. Always a whole number of frames. */
export const beatsToFrames = (beats: number, fps: number) => Math.round((beats * fps) / BEATS_PER_SECOND);

/** Seconds for a number of beats. */
export const beatsToSeconds = (beats: number) => beats / BEATS_PER_SECOND;

/** The current time in beats, inside the nearest <Sequence>. */
export function useBeat(): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * BEATS_PER_SECOND) / fps;
}

/**
 * Reading pauses: `[beat, length]` pairs during which the picture stands still (for example
 * just before a button press, so a viewer can read the screen). `warpBeat` turns clock time
 * into the video's own timeline; `holdsLength` is how much longer the video becomes.
 */
export type Holds = ReadonlyArray<readonly [beat: number, length: number]>;

export function warpBeat(beat: number, holds: Holds): number {
  let shift = 0;
  for (const [at, length] of holds) {
    if (beat < at + shift) break;
    if (beat < at + shift + length) return at;
    shift += length;
  }
  return beat - shift;
}

export const holdsLength = (holds: Holds) => holds.reduce((sum, [, length]) => sum + length, 0);

/** useBeat, with reading pauses applied. */
export function useHeldBeat(holds: Holds): number {
  return warpBeat(useBeat(), holds);
}

export type SpringConfig = { damping?: number; stiffness?: number; mass?: number };

/** A hair of overshoot: buttons, cards, phones. */
export const UI_SPRING: SpringConfig = { damping: 18, stiffness: 200 };
/** No overshoot: type that should settle calmly. */
export const TYPE_SPRING: SpringConfig = { damping: 26, stiffness: 170 };
/** The bouncy pop most reelkit entrances use. */
export const POP_SPRING: SpringConfig = { damping: 12, stiffness: 140, mass: 0.6 };

/** 0 → 1 with a little bounce, starting `delay` beats into the current sequence. */
export function usePop(delay = 0, config: SpringConfig = POP_SPRING): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - (delay * fps) / BEATS_PER_SECOND, fps, config: { mass: 0.6, ...config } });
}

/**
 * Stacked springs: a value that changes target several times gets one spring per change,
 * each starting at its own beat, summed. Motion stays smooth through retargets, and any
 * frame can still be drawn on its own (no state).
 * `keys` are `[beat, value]` pairs in ascending beat order.
 */
export function track(
  frame: number,
  fps: number,
  keys: ReadonlyArray<readonly [beat: number, value: number]>,
  config: SpringConfig = UI_SPRING,
): number {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const startFrame = (keys[i][0] * fps) / BEATS_PER_SECOND;
    v += (keys[i][1] - keys[i - 1][1]) * spring({ frame: frame - startFrame, fps, config });
  }
  return v;
}

/** Deterministic 0..1 noise from an integer. Renders must never use Math.random(). */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** interpolate() options that hold the end values instead of running past them. */
export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
