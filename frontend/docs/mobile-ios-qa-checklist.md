# Mobile iOS QA Checklist

## Device Matrix

- iPhone 13/14/15 (iOS 17+)
- Safari browser mode
- PWA mode (`Add to Home Screen`)

## Gesture Validation

- Home: pull-to-refresh from top only.
- Gallery: pinch in/out changes grid density without accidental open.
- Notifications: bottom sheet drags from handle and closes after threshold.
- Detail memory: top action buttons remain tappable with one hand.
- Long press menus do not trigger while vertical scrolling.

## Layout & Safe Area

- Header content is not clipped by notch (`safe-area-inset-top`).
- Bottom tab bar does not overlap page CTA/buttons.
- Home indicator space is respected in portrait and landscape.
- No forced body scroll lock that blocks native momentum scroll.

## Accessibility

- Tap targets are at least `44x44`.
- Text remains zoomable (no global `user-scalable=no` lock).
- Inputs do not break layout when keyboard opens.
- Color contrast is acceptable in light and dark mode.

## Regression Checks

- Route switching from tab bar works on all mobile pages.
- Upload flow (`MEMORY`, `IMAGE`, `IDEA`) still submits correctly.
- Gallery image detail open/close unchanged.
- Notification read/delete actions still update counters.

## Build Verification

- `npm run build` passes.
- Manual smoke in Safari + PWA before release.
