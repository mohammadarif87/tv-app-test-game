// Hotspot configuration for the game screen.
// Each hotspot is defined in percentages relative to the image container
// so it scales responsively. Coordinates are { x, y, w, h } where each
// value is 0..100 representing percentage of width/height.
// Update these to match the 10 mistakes you want players to find.

window.NEXUS_HOTSPOTS = [
  // Updated coordinates based on FigmaRef Hotspots.png red highlighted areas
  { "id": 1, "x": 25.9, "y": 10.5, "w": 7.8, "h": 5.6 },  // "HOMEE" typo
  { "id": 2, "x": 41.5, "y": 10.5, "w": 13.9, "h": 5.1 }, // duplicate "MOVIES"
  { "id": 3, "x": 69.9, "y": 10.6, "w": 5.6, "h": 5.0 },  // "MYL" abbreviation
  { "id": 4, "x": 44.3, "y": 17.2, "w": 29.7, "h": 40.0 },// incorrect image alignment
  { "id": 5, "x": 9.4, "y": 35.0, "w": 22.0, "h": 7.3 }, // "THE MATRX" typo
  { "id": 6, "x": 10.0, "y": 48.0, "w": 26.5, "h": 5.0 },  // garbled text in description
  { "id": 7, "x": 9.5, "y": 53.5, "w": 6.0, "h": 5.0 },  // "PLAY" button text glitch
  { "id": 8, "x": 9.5, "y": 64.5, "w": 14.0, "h": 4.0 },  // "NEW & TRENDING" cut off
  { "id": 9, "x": 42.0, "y": 72.0, "w": 16.5, "h": 17.5 },  // gap in rail
  { "id": 10, "x": 90.5, "y": 72.0, "w": 8.0, "h": 18.5 }   // empty thumbnail slot
];

// Whether to show debugging rectangles around the hotspots
window.NEXUS_DEBUG = false; // set true to visualize hotspots


