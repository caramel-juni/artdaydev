// Retro desktop windows: draggable, minimise, maximise, close. Explained step by step in WINDOWS.md.
import { el } from './dom.js';

let topZ = 1; // always-increasing counter: the last window clicked gets the highest z-index

/** Build a window on `desk`. body = a node or an array of nodes. opts = { x, y, w } in px. */
export function win(desk, title, body, opts = {}) {
  const frame = el('section', 'win');
  const titleBar = el('div', 'tb');
  const controls = el('div');
  const content = el('div', 'wb');
  const taskButton = el('button', '', title); // its twin on the taskbar

  const button = (glyph, label, onclick) => {
    const b = el('button', '', glyph);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.onclick = onclick;
    return b;
  };

  // Show + focus. Used by clicks, the taskbar button, and "restore from minimised".
  frame.up = () => { frame.hidden = false; frame.style.zIndex = ++topZ; };
  taskButton.onclick = frame.up;
  desk.querySelector('.bar').append(taskButton);

  controls.append(
    button('_', 'Minimise', () => { frame.hidden = true; }),
    button('□', 'Maximise', () => frame.classList.toggle('max')),
    button('×', 'Close', () => { frame.remove(); taskButton.remove(); }),
  );
  titleBar.append(el('span', '', title), controls);
  enableDrag(frame, titleBar);

  frame.onpointerdown = frame.up;
  frame.style.left = (opts.x ?? 30) + 'px';
  frame.style.top = (opts.y ?? 20) + 'px';
  frame.style.width = (opts.w ?? 340) + 'px';
  content.append(...[].concat(body));
  frame.append(titleBar, content);
  desk.append(frame);
  frame.up();
  return frame;
}

// Drag by the title bar. The zoom factor `k` keeps this correct when the page uses CSS zoom.
function enableDrag(frame, handle) {
  handle.onpointerdown = (e) => {
    if (e.target.tagName === 'BUTTON' || frame.classList.contains('max')) return;
    const parent = frame.offsetParent.getBoundingClientRect();
    const k = parent.width / frame.offsetParent.offsetWidth || 1;
    const rect = frame.getBoundingClientRect();
    const grabX = e.clientX - rect.left, grabY = e.clientY - rect.top;
    handle.setPointerCapture(e.pointerId); // keep receiving moves even if the cursor outruns the bar
    handle.onpointermove = (m) => {
      frame.style.left = Math.max(0, (m.clientX - grabX - parent.left) / k) + 'px';
      frame.style.top = Math.max(0, (m.clientY - grabY - parent.top) / k) + 'px';
    };
    handle.onpointerup = () => { handle.onpointermove = null; };
  };
}

/** Fill #desk with an icon area + taskbar (with a Start button). Returns { desk, icons }. */
export function makeDesk(desk) {
  const icons = el('div', 'icons');
  const bar = el('div', 'bar');
  const start = el('button', '', '⊞ Start');
  start.onclick = () => {
    const restart = el('button', '', 'Restart');
    restart.onclick = () => location.reload();
    win(desk, 'Shut Down Windows', [el('p', '', 'It is now safe to turn off your computer.'), restart], { x: 140, y: 80, w: 260 });
  };
  bar.append(start);
  desk.append(icons, bar);
  return { desk, icons };
}

export function deskIcon(icons, glyph, label, onclick) {
  const b = el('button', 'icon');
  b.append(el('b', 'ico', glyph), el('span', '', label));
  b.onclick = onclick;
  icons.append(b);
}
