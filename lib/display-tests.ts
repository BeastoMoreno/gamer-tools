export const displayTests = [
  {
    id: 'pixels',
    name: 'Dead & stuck pixels',
    group: 'Panel',
    short: 'Inspect every color channel.',
    preview: 'pixels',
    variants: ['White', 'Black', 'Red', 'Green', 'Blue', 'Gray', 'Cyan', 'Magenta', 'Yellow'],
    how: [
      'Clean the screen gently so dust is not mistaken for a bad pixel. Use your normal viewing brightness.',
      'Open the test, hide the controls, and inspect the whole panel on every color. Use the arrow keys to change colors.',
      'Look for a point that stays bright, dark, or the wrong color in the same location across several backgrounds.',
    ],
    look: 'A fixed pinpoint may indicate a stuck subpixel or dead pixel. Check it again at the panel’s native resolution.',
    limit:
      'Visual inspection only. This page cannot locate faulty pixels automatically or repair them.',
  },
  {
    id: 'black',
    name: 'Shadow detail',
    group: 'Color',
    short: 'Find detail near black.',
    preview: 'black',
    variants: ['Near-black steps', 'Black field'],
    how: [
      'Use your usual monitor preset and sit directly in front of the screen. Disable night-light color filters for comparisons.',
      'Each patch contains an RGB gray value from 0 to 32. Look for progressively brighter patches against black.',
      'Compare presets without changing room lighting. Record which patches merge into the background.',
    ],
    look: 'Abruptly merged dark patches can reveal crushed shadow detail in this viewing setup. The darkest steps may be very difficult to see.',
    limit:
      'The labels are digital RGB values, not measured brightness. Room reflections, tone mapping, and your eyes affect visibility.',
  },
  {
    id: 'white',
    name: 'Highlight detail',
    group: 'Color',
    short: 'Check separation near white.',
    preview: 'white',
    variants: ['Near-white steps', 'White field'],
    how: [
      'Keep your normal brightness; there is no need to maximize it.',
      'Compare patches from RGB 223 through 255 against the white background.',
      'Look for several bright steps merging into the same shade, then compare another monitor preset if needed.',
    ],
    look: 'Look for gradual separation in bright tones. Your display’s contrast setting and processing can change the result.',
    limit:
      'This is an SDR white-level pattern. It does not measure peak nits, contrast ratio, or HDR clipping.',
  },
  {
    id: 'grayscale',
    name: 'Grayscale & neutrality',
    group: 'Color',
    short: 'Explore tonal steps and color casts.',
    preview: 'grayscale',
    variants: ['16 steps', '32 steps', '8 steps'],
    how: [
      'View straight on with the screen at its native resolution.',
      'Scan from black to white and check that brightness increases smoothly across the steps.',
      'Look for a tint in neutral grays and compare the top, center, and bottom of the screen.',
    ],
    look: 'Notice uneven jumps or a visible color tint. Try another preset while keeping the lighting consistent.',
    limit:
      'Your eyes adapt to color casts. Accurate white-point and gamma calibration needs a measurement instrument.',
  },
  {
    id: 'gradients',
    name: 'Gradients & banding',
    group: 'Color',
    short: 'Inspect smooth tonal transitions.',
    preview: 'gradients',
    variants: ['Grayscale', 'Dark gray', 'Red', 'Green', 'Blue', 'Spectrum'],
    how: [
      'Use native resolution and reset browser zoom to 100%.',
      'Check the gray ramp first, then compare the dark and individual color ramps.',
      'Look for obvious bands, abrupt steps, or an unexpected tint rather than a smooth transition.',
    ],
    look: 'Banding can come from the panel, graphics output, browser rendering, or image processing. Compare the same pattern after changing only one setting.',
    limit:
      'A gradient cannot identify the panel’s true bit depth or prove whether temporal dithering is present.',
  },
  {
    id: 'uniformity',
    name: 'Brightness uniformity',
    group: 'Panel',
    short: 'Compare all nine screen regions.',
    preview: 'uniformity',
    variants: ['50% gray', '25% gray', '75% gray', 'White'],
    how: [
      'Sit centered at your usual viewing distance. Open fullscreen and hide the controls.',
      'Compare the center with the edges and corners on each gray level.',
      'Move your head slightly and check whether an apparent patch changes with viewing angle.',
    ],
    look: 'Look for cloudy patches, a tinted edge, or a consistently darker region. Use the same brightness and room lighting when comparing.',
    limit:
      'The page sends an equal color to every region; it cannot measure luminance variation or assign a uniformity score.',
  },
  {
    id: 'bleed',
    name: 'Backlight & glow',
    group: 'Panel',
    short: 'Inspect a clean black field.',
    preview: 'bleed',
    variants: ['Black', '5% gray', '10% gray'],
    how: [
      'Dim the room and use the brightness you normally play at.',
      'Open fullscreen and hide all controls. Let your eyes settle before examining the edges.',
      'Check again from a different angle. Record whether a bright patch stays fixed or changes with your position.',
    ],
    look: 'Edge leakage and angle-dependent glow can look similar. Judge the effect in your actual games as well as on a black field.',
    limit:
      'A camera’s exposure can exaggerate glow. This does not diagnose a panel fault or determine a warranty outcome.',
  },
  {
    id: 'retention',
    name: 'Image retention',
    group: 'Panel',
    short: 'Look for persistent interface outlines.',
    preview: 'retention',
    variants: ['10% gray', '25% gray', '50% gray', 'Red', 'Green', 'Blue'],
    how: [
      'Use short checks at a comfortable brightness. Display a neutral field rather than leaving a static logo on screen.',
      'Look for an outline of a HUD, taskbar, or other familiar fixed content.',
      'Compare several backgrounds and revisit later after ordinary varied content.',
    ],
    look: 'An outline that appears in the same place across backgrounds is worth recording and following up.',
    limit:
      'One check cannot distinguish temporary retention from permanent burn-in. This tool does not run a flashing repair routine.',
  },
  {
    id: 'blooming',
    name: 'Local dimming halos',
    group: 'Panel',
    short: 'Watch bright objects on black.',
    preview: 'blooming',
    variants: ['Square', 'Circle', 'Subtitle'],
    how: [
      'Use your normal local-dimming setting and view straight on.',
      'Move the object with your pointer or tap to place it. Compare the dark area around it.',
      'Try the subtitle pattern and compare local-dimming presets with the same brightness.',
    ],
    look: 'A halo around the bright object may reveal the effect of local dimming zones. Reflections and viewing angle can also affect it.',
    limit:
      'This SDR pattern cannot count dimming zones, measure HDR performance, or separate every cause of a visible halo.',
  },
  {
    id: 'motion',
    name: 'Motion & ghosting',
    group: 'Motion',
    short: 'Compare trails at three backgrounds.',
    preview: 'motion',
    variants: ['Tracking blocks', 'Moving text'],
    how: [
      'Start motion and follow a moving marker with your eyes. Choose a speed that is comfortable to track.',
      'Compare the same speed across your monitor’s overdrive presets. Look at bright and dark backgrounds.',
      'Pause the pattern to separate motion artifacts from the static design.',
    ],
    look: 'Look for a trailing smear or an inverse bright/dark outline. Keep refresh settings, speed, and browser conditions the same when comparing.',
    limit:
      'This is a visual motion aid, not a millisecond response-time, input-lag, tearing, or G-Sync/FreeSync certification test.',
  },
  {
    id: 'sharpness',
    name: 'Text & fine detail',
    group: 'Color',
    short: 'Check scaling and edge processing.',
    preview: 'sharpness',
    variants: ['Text & lines', 'Checkerboard'],
    how: [
      'Select the monitor’s native resolution and reset browser zoom to 100%.',
      'Inspect small text, fine lines, and alternating squares from your usual distance.',
      'Compare monitor sharpness settings and check whether extra halos appear around edges.',
    ],
    look: 'Look for missing lines, uneven thickness, colored fringes, or excessive edge halos.',
    limit:
      'Patterns use CSS pixels. Operating-system scaling, device-pixel ratio, browser zoom, and font rendering affect their physical size.',
  },
  {
    id: 'touch',
    name: 'Touch coverage',
    group: 'Input',
    short: 'Trace the panel and check contact.',
    preview: 'touch',
    variants: ['Coverage grid'],
    how: [
      'Use a touch-enabled screen. Drag one finger across each row, including the edges.',
      'Test more than one finger to see simultaneous active contacts. Green cells mark sampled touch paths.',
      'Use Reset coverage to retry areas that seem to miss contact.',
    ],
    look: 'An unmarked cell means no touch path was recorded there during this attempt. Check it again deliberately.',
    limit:
      'Mouse input does not count toward touch coverage. A visited cell does not certify its entire area, latency, or pressure accuracy.',
  },
] as const;
export type DisplayTestId = (typeof displayTests)[number]['id'];
export type DisplayCheck = (typeof displayTests)[number];
export type Inspection = { finding: 'unreviewed' | 'clear' | 'check-again'; notes: string };
export const solidColors = [
  '#ffffff',
  '#000000',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#808080',
  '#00ffff',
  '#ff00ff',
  '#ffff00',
];
export function gray(value: number) {
  return `rgb(${value}, ${value}, ${value})`;
}
export function fieldColor(id: DisplayTestId, variant: number) {
  if (id === 'pixels') return solidColors[variant % solidColors.length];
  if (id === 'bleed') return ['#000000', '#0d0d0d', '#1a1a1a'][variant];
  if (id === 'retention')
    return ['#1a1a1a', '#404040', '#808080', '#ff0000', '#00ff00', '#0000ff'][variant];
  if (id === 'uniformity') return ['#808080', '#404040', '#bfbfbf', '#ffffff'][variant];
  return id === 'white' ? '#ffffff' : '#000000';
}
export function frameSummary(intervals: number[]) {
  if (!intervals.length || intervals.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return {
    fps: Math.round((intervals.length * 1000) / intervals.reduce((a, b) => a + b, 0)),
    medianMs: Number(median.toFixed(2)),
    p95Ms: Number(
      sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)].toFixed(2),
    ),
    longestMs: Number(sorted[sorted.length - 1].toFixed(2)),
    longIntervals: intervals.filter((n) => n > median * 1.5).length,
    samples: intervals.length,
  };
}
export function panelDimensions(width: number, height: number, diagonal: number) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 100000 ||
    height > 100000 ||
    !Number.isFinite(diagonal) ||
    diagonal < 1 ||
    diagonal > 300
  )
    return null;
  const hypotenuse = Math.hypot(width, height);
  return {
    ppi: hypotenuse / diagonal,
    widthCm: ((diagonal * width) / hypotenuse) * 2.54,
    heightCm: ((diagonal * height) / hypotenuse) * 2.54,
  };
}
