// Decorative extras. Each is independent: delete a call in main.js to remove that effect.
import { $, el, rand, reducedMotion } from './dom.js';
import { CONFIG } from './config.js';

/** Ransom-note title: every letter becomes its own cut-out scrap (styled by `h1 span` in style.css). */
export function ransomTitle() {
  const h1 = $('h1');
  const text = h1.textContent;
  h1.setAttribute('aria-label', text); // screen readers read the real words
  h1.replaceChildren(...[...text].map((c) => (c === ' ' ? ' ' : el('span', '', c))));
}

/** Soft pixelation for every element with class "ico" (emoji/icons).
 *  Pixel size = the --pixel number in style.css. Builds an SVG filter once, which CSS applies via filter:url(#pixelate). */
export function pixelFilter() {
  const px = Math.max(1, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pixel')) || 2);
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs, ...kids) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    n.append(...kids);
    return n;
  };
  const dot = Math.max(1, Math.round(px / 5)); // size of the sampled dot inside each pixel cell
  const filter = make('filter', { id: 'pixelate', 'color-interpolation-filters': 'sRGB' },
    make('feFlood', { x: Math.floor((px - dot) / 2), y: Math.floor((px - dot) / 2), width: dot, height: dot }), // 1. one sample dot...
    make('feComposite', { width: px, height: px }),                                  // 2. ...in a px-by-px cell
    make('feTile', { result: 'grid' }),                                               // 3. repeat the cell everywhere
    make('feComposite', { in: 'SourceGraphic', in2: 'grid', operator: 'in' }),        // 4. keep the icon only at the dots
    make('feMorphology', { operator: 'dilate', radius: px / 2 }));                    // 5. grow each dot back into a square
  const svg = make('svg', { class: 'defs', 'aria-hidden': 'true' }, filter);
  document.body.append(svg);
}

/** Every so often a leaf drifts across the screen (the animation itself is @keyframes leaf in style.css). */
export function leaves() {
  if (reducedMotion) return;
  const spawn = () => {
    const leaf = el('span', 'leaf ico', CONFIG.leafEmoji[Math.floor(Math.random() * CONFIG.leafEmoji.length)]);
    leaf.style.top = rand(0, 80) + 'vh';
    leaf.style.setProperty('--d', rand(...CONFIG.leafSeconds) + 's');
    leaf.setAttribute('aria-hidden', 'true');
    leaf.onanimationend = () => leaf.remove();
    document.body.append(leaf);
    setTimeout(spawn, rand(...CONFIG.leafGapMs));
  };
  setTimeout(spawn, 3000);
}

/** Sound toggle. Plays audio/sky.mp3; if that file is missing, falls back to synthesised soft wind. */
export function ambience() {
  const button = el('button', 'snd ico', '🔇');
  button.type = 'button';
  button.title = 'Sky ambience on/off';
  button.setAttribute('aria-label', 'Sky ambience');
  button.setAttribute('aria-pressed', 'false');
  let audio, synth, on = false;

  const softWind = () => { // low-passed brown noise with a slow wobble in the filter
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; data[i] = last * 3.5; }
    const src = ctx.createBufferSource(), lowpass = ctx.createBiquadFilter(), gain = ctx.createGain();
    const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    src.buffer = buf; src.loop = true; lowpass.type = 'lowpass'; lowpass.frequency.value = 500; gain.gain.value = 0.25;
    lfo.frequency.value = 0.1; lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(lowpass.frequency);
    src.connect(lowpass).connect(gain).connect(ctx.destination);
    src.start(); lfo.start();
    return ctx;
  };

  button.onclick = () => {
    on = !on;
    button.textContent = on ? '🔊' : '🔇';
    button.setAttribute('aria-pressed', String(on));
    if (!on) { audio?.pause(); synth?.suspend(); return; }
    audio ??= Object.assign(new Audio(CONFIG.ambienceFile), { loop: true, volume: CONFIG.ambienceVolume });
    audio.play().catch(() => { synth ? synth.resume() : (synth = softWind()); });
  };
  document.body.append(button);
}

/** Early-internet visitor counter (counts this browser's visits; the footer markup is in each page). */
export function visitorCounter() {
  const out = $('#count');
  if (!out) return;
  let n = 1;
  try { n = Number(localStorage.visits || 0) + 1; localStorage.visits = n; } catch (e) { /* storage blocked: fine */ }
  out.textContent = String(41 + n).padStart(6, '0');
}

/** Easter egg: up up down down left right left right b a. */
export function konami() {
  const code = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';
  let keys = [];
  addEventListener('keydown', (e) => {
    keys = [...keys, e.key].slice(-10);
    if (keys.join() === code) document.body.classList.toggle('party');
  });
  console.log('%c Hello, curious one! Try the Konami code. ', 'background:#f2c14e;font-size:16px');
}
