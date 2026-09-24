# I AM GAMER

A free, browser-based gaming toolkit built with Next.js 16.3, React 19, TypeScript, and Tailwind CSS 4. The redesigned site uses a shared responsive workspace, original animated SVG artwork, a local display font, and a graphite/violet visual system.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` followed by `npm start`. Camera and microphone access needs HTTPS in production (localhost is supported during development).

## Tools

| Training                                                           | Hardware                                                            | Setup                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Aim trainer: 3D range, 15/30/60-second rounds, optional fullscreen | Keyboard: physical key visualization, combinations, event log       | Sensitivity: eDPI and same-game DPI conversion                        |
| Reaction time: five rounds, early-click detection, averaged result | Mouse: buttons, pointer trail, scroll delta, browser event rate     | Crosshair studio: live controls, presets, transparent PNG export      |
| Click speed: five-second sprint, CPS score                         | Display: 12 guided visual checks, frame pacing, display report, PPI | Session timer: focus/break presets, pause/reset, saved focus sessions |
|                                                                    | Gamepad: live axes, buttons, trigger values                         |                                                                       |
|                                                                    | Microphone: waveform, RMS dBFS, peak input level                    |                                                                       |
|                                                                    | Webcam: preview, negotiated resolution/rate, snapshot download      |                                                                       |

The app also includes searchable tools (`Ctrl/Cmd + K`), category filters, favorites, personal bests, progress charts, CSV/JSON exports, three short guides, a mobile navigation drawer, reduced motion, and error/404 pages.

## Display lab

The display workspace now includes pixel colors, shadow/highlight detail, grayscale, gradients, brightness uniformity, backlight/glow inspection, image retention, local-dimming halos, motion tracking, text/fine detail, and a touch-coverage grid. Each check has original instructions, interpretation notes, and explicit measurement limits.

- The viewer supports a full-window fallback, optional browser fullscreen, arrow-key pattern changes, and hidden controls (H to restore). Motion is opt-in and stops when the page is hidden.
- Five-second frame sampling reports browser FPS, median, p95 and longest intervals, a timing chart, and intervals over 1.5 times the median. It does not certify hardware refresh rate or count physical dropped frames.
- Screen dimensions use CSS pixels; color depth, gamut and dynamic-range values are browser-reported capabilities. They do not establish native resolution, panel bit depth, gamut coverage, or HDR certification.
- Pixel density and flat-panel dimensions are calculated from manual native-resolution and diagonal inputs.
- Per-check findings and notes live only in the current page. Export inspection downloads JSON with those observations, current browser display information, and the last completed timing measurement. Findings are user observations, not automatic diagnoses.
- Touch coverage records sampled touch paths (including simultaneous contacts); mouse clicks do not mark cells. It does not certify complete sensor coverage or touch latency.

The user supplied [ScreenTester?s tools directory](https://screentester.io/tools/) as a reference for breadth and instructional detail; the patterns, copy, and visual design here are original. API references: [animation frame timing](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [CSS screen dimensions](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), [color gamut](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/color-gamut), [dynamic range](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/dynamic-range), and [fullscreen eligibility](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen).

## Storage and privacy

Favorites, preferences, and the latest 100 training/timer results are stored in `localStorage` under `iamgamer.v1`. The progress page shows the latest 30 records, with the complete retained history available through export. Optional Supabase accounts store private player profiles across devices. Practice results and favorites do not sync, and public leaderboards are not implemented. See [account setup](AUTH_SETUP.md) for database, email, and provider configuration. Exported JSON is for personal records; importing data is not implemented.

Media permission is requested only when a user starts the relevant tool. Streams never leave the browser and stop when the tool is stopped or unmounted. Microphone audio is visualized without recording or playback. Webcam snapshots are generated locally on request.

## Measurement boundaries

- Aim results record duration, input mode, shots, accuracy, acquisition times, and browser sensitivity. Charts compare only the selected mode and duration. Fullscreen needs browser permission; pointer lock adds first-person aiming. The round starts after a three-second countdown. Exiting either mode cancels unfinished rounds.
- Aim analysis does not infer ideal game sensitivity. Its calibration uses two real in-game cm/360 measurements and bracket bisection, which works with monotonic nonlinear sliders as well as linear scales. Midpoints are trial settings, not verified conversions. It covers VALORANT, CS2, Apex, PUBG PC, Overwatch 2, Fortnite, Rainbow Six Siege, Call of Duty / Warzone, and a custom game. ADS/scopes must be measured separately.
- Mouse side-button defaults are prevented while the tester is mounted; navigation works again on leaving. Mouse driver mappings that emit keyboard shortcuts rather than button events are outside browser control.
- Pointer event frequency is a browser event rate, not hardware polling rate.
- Reaction scores include display, input, and browser delays. They are useful for comparing personal attempts on a consistent setup.
- Frame-rate estimates measure animation callbacks, not certified monitor refresh rates.
- Pixel inspection is manual, not automatic fault detection or repair.
- Gamepad support and mappings depend on the browser and controller. Physical controller checks still need actual hardware.
- eDPI comparisons and DPI conversion are valid within the same game's sensitivity scale, not across games.
- Camera frame rate is the negotiated track setting, not a measured delivered-frame rate.
- Timed training cancels when the tab is hidden. The session timer continues while its page is open, including in a background tab; leaving or reloading the page resets it.

## Checks

```sh
npm run lint
npm run build
npm run test:e2e
npm run test:auth
npm run format:check
```

The Playwright suite uses the installed Microsoft Edge browser, starts a local server if needed, and tests scoring, persistence, search/filtering, keyboard/mouse input, exports, permissions, camera cleanup, mobile navigation, preferences, all tool/guide routes, redirects, and 404 handling. Camera tests use a simulated device; they do not certify physical devices. To use bundled Chromium instead, remove `channel: 'msedge'` from `playwright.config.ts` and install the Playwright browser.

Authentication integration tests start isolated localhost servers using a deliberately unsigned, dummy protocol fixture. They exercise the actual Supabase SDK, forms, profile saving/loading, sign-out, and OAuth request construction. They do not contact Supabase or test real provider consent, email delivery, JWT verification, or deployed RLS policies. Complete the live verification steps in AUTH_SETUP.md with your project.

Run `node scripts/capture-preview.mjs` with the development server running to capture desktop and mobile previews into the ignored `test-results` directory.

## Project map

- `app/`: pages, metadata, shared layout, favicon, and responsive styles in `gamer.css`.
- `lib/catalog.ts`: tool and guide content.
- `components/app-shell.tsx`: navigation, search dialog, mobile drawer, and footer.
- `components/gamer-provider.tsx`: browser-local results and preferences.
- `components/tools/`: training, hardware, media, and setup implementations.
- `tests/gamer.spec.ts`: browser regression coverage.

Original `/keyboard`, `/mouse`, `/display`, and `/gamepad` routes redirect to `/tools/<name>`. Tools are statically generated and their implementation bundles load on demand. Guest tools need no API keys. Accounts need the public Supabase configuration described in [AUTH_SETUP.md](AUTH_SETUP.md).
