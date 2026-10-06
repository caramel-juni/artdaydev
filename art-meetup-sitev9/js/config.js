// Behaviour settings in one place. (Colours, sizes and the icon pixel size live in style.css.)
export const CONFIG = {
  dataFile: 'data.json',
  homePins: 4,                       // pins shown on the home page
  wallScrollPx: 1,                   // artist wall auto-scroll: pixels per tick...
  wallTickMs: 30,                    // ...every this many milliseconds
  leafGapMs: [6000, 20000],          // random wait between drifting leaves [min, max]
  leafSeconds: [14, 24],             // how long a leaf takes to cross the screen
  leafEmoji: ['🍃', '🍂', '🍁'],
  ambienceFile: 'audio/sky.mp3',     // your freesound clip (falls back to synthesised wind)
  ambienceVolume: 0.35,
};
