# Nexus QA TV Test Game

A page game where users tap hotspots on a mock TV app screenshot to find 10 mistakes within a time limit and/or tap limit.

## Run
Just open `index.html` in a browser (no build needed). On macOS you can run a quick local server:

```bash
python3 -m http.server -d "." 5173
```

Then open `http://localhost:5173/index.html`.

## Hotspots
Hotspots are defined in `hotspots.js` as an array of rectangles in percentage coordinates relative to the image container:

```js
{ id: 1, x: 11.2, y: 12.5, w: 10.5, h: 6.5 }
```

- `x`, `y`: top-left corner percent of width/height
- `w`, `h`: size in percent
- Ensure you have 10 items with unique `id` values.
- Set `window.NEXUS_DEBUG = true` in `hotspots.js` to visualize hotspots during authoring.

## Game Rules (current implementation)
- 60 second countdown
- 11 total taps allowed
- 10 hotspots to find
- Summary screen shows your score and success message when all 10 are found

## Notes
- The screenshot is `FigmaRef.png` and must sit next to `index.html`.
- The layout uses an aspect-ratio container so the overlay should align to any size.
