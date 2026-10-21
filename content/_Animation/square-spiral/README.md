# Jardi · Square Spiral Demo

A standalone square-spiral animation, separate from the route demo.

## Setup
Place your four PNG files inside `images/`:
- `plain.png` — background
- `pin.png` — anchored at the map center by its bottom-center tip
- `footprint.png` — repeated along the spiral
- `avatar.png` — moving avatar

Open `index.html` in a browser, or embed its markup and include `style.css` and `script.js` in your website.

## Behavior
- Automatically plays once from center to the first map edge.
- Square spiral: right, down, left, up, with leg lengths 1, 1, 2, 2, 3, 3 ...
- Speed is 1–20 (integer), default 15, live adjustable.
- Start is enabled only when stopped/finished. Pause toggles to Continue. Stop retains the avatar and trail. Reset restores speed 15 and immediately restarts.
- The footprint gap scales with map size and stays approximately uniform.
- The path is computed from the displayed map dimensions, keeping the spiral square in pixels rather than stretching with the 3:2 aspect ratio.

## Customize
- `STEP_RATIO` in `script.js`: gap between spiral arms relative to the map height (default `.115`).
- `BASE_PX_PER_SECOND`: avatar movement speed when speed=10 (default `235`).
- `.jardi-map` aspect ratio in CSS (default `3/2`).

The boundary is defined by the rectangular map box; avatar center stops at the edge. PNGs are not bundled.
