import React from "react";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { AbsoluteFill, Composition, interpolate, Sequence, useVideoConfig } from "remotion";
import {
  beatsToFrames,
  Caption,
  CLAMP,
  CountdownRing,
  EndCard,
  Kinetic,
  makeTheme,
  Phone,
  PHONE,
  ReelkitTheme,
  Ring,
  Scene,
  Screen,
  StepTracker,
  TextHook,
  Touch,
  useBeat,
  useTheme,
  Wordmark,
} from "../src";

// Fonts for the examples. reelkit itself never loads fonts: a theme names them, and the
// video loads whichever it uses.
const { fontFamily: inter } = loadInter("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin", "cyrillic"] });
const { fontFamily: lora } = loadLora("normal", { weights: ["500"], subsets: ["latin"] });

const neutral = makeTheme({ fonts: { sans: inter, serif: lora } });
/** The same components in another brand: only colours and fonts change. */
const ocean = makeTheme({
  colors: { paper: "#F2F7F7", ink: "#062A30", dark: "#062A30", accent: "#0EA5A4", accentSoft: "#7EE0D6" },
  fonts: { sans: inter, serif: lora },
});

const FPS = 60;
const W = 1080;
const H = 1920;
const SCREEN = "sample/app.svg";

// ---- One example per component ------------------------------------------------------------

const KineticDemo: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Scene exit={0}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Kinetic text="Five steps." size={130} />
        <Kinetic text="One minute." size={130} delay={10} color={colors.accent} />
      </AbsoluteFill>
    </Scene>
  );
};

/** Screenshot pixels of the "Check in" button on the sample screen. */
const BUTTON: [number, number, number, number] = [60, 1480, 1050, 150];

const PhoneDemo: React.FC = () => {
  const { colors } = useTheme();
  const beat = useBeat();
  const pressed = interpolate(beat, [40, 52], [0, 1], CLAMP);
  const shown = interpolate(beat, [30, 36, 60, 66], [0, 1, 1, 0], CLAMP);
  return (
    <Scene exit={0}>
      <Caption>
        <Kinetic text="Tap" size={96} />
        <Kinetic text="Check in" size={96} delay={5} color={colors.accent} />
      </Caption>
      <Phone>
        <Screen src={SCREEN} />
        <Ring box={BUTTON} delay={20} />
        <Touch
          x={(BUTTON[0] + BUTTON[2] / 2) * PHONE.scale}
          y={(BUTTON[1] + BUTTON[3] / 2) * PHONE.scale}
          pressed={pressed}
          shown={shown}
        />
      </Phone>
    </Scene>
  );
};

const STEPS = ["Sign up", "Profile", "Show ID", "Join", "Check in"];

const StepsDemo: React.FC = () => {
  const beat = useBeat();
  const current = Math.min(STEPS.length, Math.floor(beat / 24));
  return (
    <Scene exit={0}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Kinetic text={current >= STEPS.length ? "All set" : `Step ${current + 1}`} size={140} />
      </AbsoluteFill>
      <StepTracker steps={STEPS} current={current} since={current * 24} top={1500} />
    </Scene>
  );
};

const CountdownDemo: React.FC = () => (
  <Scene dark exit={0}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 60 }}>
      <Kinetic text="New code every" size={84} color="white" />
      <CountdownRing period={30} size={360} offset={22} />
    </AbsoluteFill>
  </Scene>
);

const HookDemo: React.FC = () => (
  <Scene background="#1b2a3a" exit={0}>
    <TextHook lines={["How do I get set up", "before my first class?"]} top={260} />
    <TextHook lines={["5 steps · 1 minute"]} top={900} variant="black" />
    <TextHook lines={["works muted too"]} top={1400} variant="plain" />
  </Scene>
);

const EndCardDemo: React.FC = () => (
  <EndCard lines={["Ready?", "Start today."]} cta="example.com" brand={<Wordmark name="ACME" tagline="LEARNING" />} />
);

// ---- The showcase: the parts working together, in two themes -----------------------------

const Showcase: React.FC = () => {
  const { fps } = useVideoConfig();
  const { colors } = useTheme();
  const f = (beats: number) => beatsToFrames(beats, fps);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={f(60)}>
        <Scene>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Kinetic text="reelkit" size={170} />
            <Kinetic text="for Remotion" size={90} delay={10} color={colors.accent} />
          </AbsoluteFill>
        </Scene>
      </Sequence>
      <Sequence from={f(60)} durationInFrames={f(90)}>
        <PhoneDemo />
      </Sequence>
      <Sequence from={f(150)} durationInFrames={f(130)}>
        <StepsDemo />
      </Sequence>
      <Sequence from={f(280)} durationInFrames={f(90)}>
        <EndCardDemo />
      </Sequence>
    </AbsoluteFill>
  );
};

const withTheme = (C: React.FC, theme = neutral): React.FC => () => (
  <ReelkitTheme theme={theme}>
    <C />
  </ReelkitTheme>
);

export const EXAMPLES: Array<{ id: string; component: React.FC; beats: number; still: number }> = [
  { id: "Kinetic", component: withTheme(KineticDemo), beats: 60, still: 50 },
  { id: "Phone-Ring-Touch", component: withTheme(PhoneDemo), beats: 90, still: 44 },
  { id: "StepTracker", component: withTheme(StepsDemo), beats: 130, still: 60 },
  { id: "CountdownRing", component: withTheme(CountdownDemo), beats: 90, still: 30 },
  { id: "TextHook", component: withTheme(HookDemo), beats: 30, still: 10 },
  { id: "EndCard", component: withTheme(EndCardDemo), beats: 90, still: 70 },
  { id: "Showcase", component: withTheme(Showcase), beats: 370, still: 200 },
  { id: "Showcase-Ocean", component: withTheme(Showcase, ocean), beats: 370, still: 200 },
];

export const Root: React.FC = () => (
  <>
    {EXAMPLES.map(({ id, component, beats }) => (
      <Composition
        key={id}
        id={id}
        component={component}
        durationInFrames={beatsToFrames(beats, FPS)}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
  </>
);
