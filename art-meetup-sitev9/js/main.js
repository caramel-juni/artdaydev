// Entry point. Loaded by every page with <script type="module" src="js/main.js">.
import { $, el } from './dom.js';
import { CONFIG } from './config.js';
import { includes } from './includes.js';
import { ransomTitle, pixelFilter, leaves, ambience, visitorCounter, konami } from './effects.js';
import { home, notices, artists, archive, contact } from './sections.js';

// Which pages need data.json, and which function fills them. (ethos + guestbook are pure HTML.)
const pages = { index: home, notices, artists, archive, contact };
const page = document.body.dataset.p;

async function start() {
  try { await includes(); } catch (err) { console.error('Could not load partials/', err); } // first: effects below use the nav/footer
  ransomTitle();
  pixelFilter();
  leaves();
  ambience();
  konami();
  visitorCounter();

  if (!pages[page]) return;
  try {
    pages[page](await (await fetch(CONFIG.dataFile)).json());
  } catch (err) {
    console.error(err);
    $('main').append(el('p', 'scrap', 'Could not load data.json. Serve the folder (python3 -m http.server) rather than opening the file directly.'));
  }
}
start();
