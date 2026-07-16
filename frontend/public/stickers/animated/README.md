# LiquidNetwork Animated Stickers

Cute looping bunny-blob stickers for the Night Amber Social landing page.

## Character (consistent)

- White round blob body, small bunny ears, amber bow & tail
- Simple black line face, soft blush, chibi proportions
- Flat, clean sticker style on light/white backdrop

## Pack (10 loops)

| # | File | Emotion | Motion notes |
|---|------|---------|--------------|
| 01 | `01-so-que.mp4` | Sợ quê / Embarrassed | Covers face, ears fold, sweat drops, tremble |
| 02 | `02-waiting-queue.mp4` | Waiting (anxious) | Phone, eye darts, foot tap, blink |
| 03 | `03-timeout.mp4` | Timeout / sad | Droop ears, tear, deflate, soft breathing |
| 04 | `04-invite-accepted.mp4` | Accepted (happy) | Jump, sparkle eyes, amber confetti |
| 05 | `05-drunk-happy.mp4` | Drunk happy | Sway, beer glass, rosy cheeks |
| 06 | `06-chien-than.mp4` | Chiến thần (confident) | Proud pose, amber aura pulse |
| 07 | `07-safe-ride.mp4` | Safe Ride (relieved) | Phone to ear, eyes closed, sigh |
| 08 | `08-idle-float.mp4` | Idle / floating | Gentle bob, ear sway, slow blink |
| 09 | `09-excited-peek.mp4` | Excited peek | Peeks up, ears perk, playful bob |
| 10 | `10-group-celebration.mp4` | Group celebration | 2–3 blobs jump + confetti |

## Overview

- `sheet-10-animated-stickers.jpg` — static product sheet of the set
- `keyframes/` — still keyframes for idle, peek, group (others reuse `public/stickers/01–07-*.jpg`)

## Specs

- Format: MP4 (H.264), ~6s loops (tool minimum; play with `loop muted autoplay playsInline`)
- Resolution: 720p square-friendly framing
- Style: soft, bouncy, readable at small sizes; not chaotic

## Web usage

```html
<video
  src="/stickers/animated/01-so-que.mp4"
  autoplay
  muted
  loop
  playsinline
  width="96"
  height="96"
></video>
```

On dark UI (`#0B0F19`), keep soft amber glow / rounded mask so light sticker plates sit premium.
