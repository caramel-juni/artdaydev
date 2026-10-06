// One function per page that needs data.json. Each receives the parsed data.
import { $, el, img } from './dom.js';
import { CONFIG } from './config.js';
import { win, makeDesk, deskIcon } from './windows.js';
import { note } from './notes.js';

// ---- pins (home + notices) -------------------------------------------------
const pin = (p) => {
  const b = el('button', 'pin ' + p.type);
  b.type = 'button';
  b.append(el('span', 't', p.title), el('span', '', p.body.slice(0, 70) + '…'), el('small', '', 'from ' + p.by));
  b.onclick = () => note(p.title, [el('p', '', p.body), el('small', '', 'from ' + p.by)], p.type);
  return b;
};
const showPins = (pins) => pins.forEach((p) => $('#pins').append(pin(p)));

export function home(data) {
  const e = data.event;
  $('#poster').src = e.poster;
  $('#info').append(el('h2', '', e.title), el('p', '', e.date), el('p', '', e.place), el('p', '', e.details));
  showPins(data.pins.slice(0, CONFIG.homePins));
}

export const notices = (data) => showPins(data.pins);

// ---- artist wall -----------------------------------------------------------
export function artists(data) {
  const wall = $('#wall');
  const oldestFirst = (a, b) => (a.added < b.added ? -1 : 1);
  let list = [...data.artists].sort(oldestFirst);

  const card = (a) => {
    const c = el('button', 'card');
    c.type = 'button';
    if (a.img) c.append(img(a.img, a.name));
    c.append(el('b', '', a.name), el('small', '', a.medium), el('span', '', a.blurb));
    c.onclick = () => note(a.name, [el('small', '', a.medium), ...(a.img ? [img(a.img, a.name)] : []), el('p', '', a.blurb)], 'artist');
    return c;
  };
  const draw = () => wall.replaceChildren(...list.map(card));

  $('#shuffle').onclick = () => { list.sort(() => Math.random() - 0.5); draw(); };
  $('#order').onclick = () => { list.sort(oldestFirst); draw(); };
  draw();
  autoScroll(wall);
}

// Slowly scroll the wall; pause on hover; loop at the end; skip if the visitor prefers reduced motion.
function autoScroll(wall) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let hovering = false;
  wall.onmouseenter = () => { hovering = true; };
  wall.onmouseleave = () => { hovering = false; };
  setInterval(() => {
    if (hovering) return;
    wall.scrollLeft += CONFIG.wallScrollPx;
    if (wall.scrollLeft + wall.clientWidth >= wall.scrollWidth - 1) wall.scrollLeft = 0;
  }, CONFIG.wallTickMs);
}

// ---- photo archive: each past event is a folder icon that opens a photo-viewer window -----
export function archive(data) {
  const { desk, icons } = makeDesk($('#desk'));
  const open = {}; // one window per event

  const viewer = (event, x) => {
    if (open[event.title]?.isConnected) return open[event.title].up();
    const strip = el('div', 'strip');
    event.photos.forEach((src, i) => {
      const fig = el('figure');
      fig.append(img(src, `${event.title} photo ${i + 1}`), el('figcaption', '', `${i + 1} / ${event.photos.length}`));
      strip.append(fig);
    });
    const scroll = (dir) => () => strip.scrollBy({ left: dir * strip.clientWidth, behavior: 'smooth' });
    const prev = el('button', '', '◀ Prev'), next = el('button', '', 'Next ▶');
    prev.onclick = scroll(-1); next.onclick = scroll(1);
    const nav = el('div', 'navb'); nav.append(prev, next);
    open[event.title] = win(desk, `${event.title} - ${event.date}`, [el('p', '', event.note), strip, nav], { x, y: 20, w: 420 });
  };

  data.archive.forEach((ev) => deskIcon(icons, '📁', ev.title, () => viewer(ev, 160 + Math.random() * 80)));
  viewer(data.archive[0], 140); // open the newest event on arrival
}

// ---- contact: an "email" window. No server: Send opens the visitor's own mail app via mailto: ----
export function contact(data) {
  const { desk, icons } = makeDesk($('#desk'));
  const to = el('input'), subject = el('input'), message = el('textarea'), send = el('button', '', 'Send');
  to.value = data.contact; to.readOnly = true;
  subject.maxLength = 120; message.maxLength = 2000; send.type = 'button';

  const row = (label, field) => { const r = el('label', 'row'); r.append(el('span', '', label), field); return r; };
  send.onclick = () => {
    const bar = el('div', 'prog'); bar.append(el('i'));
    win(desk, 'Sending...', [el('p', '', 'Sending message...'), bar], { x: 100, y: 150, w: 260 });
    setTimeout(() => {
      location.href = `mailto:${data.contact}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(message.value)}`;
    }, 1300);
  };

  let mailWindow;
  const openMail = () => mailWindow?.isConnected ? mailWindow.up()
    : (mailWindow = win(desk, 'New Message', [row('To:', to), row('Subject:', subject), message, el('p', '', 'Opens in your own email app.'), send], { x: 40, y: 20, w: 420 }));
  deskIcon(icons, '📧', 'New Message', openMail);
  openMail();
}
