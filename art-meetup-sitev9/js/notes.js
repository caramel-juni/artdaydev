// The big post-it popup. A native <dialog> gives us Esc-to-close, focus trapping and a dimmed backdrop for free.
import { el } from './dom.js';

/** note('Title', [node, node], 'callout' | 'showcase' | 'artist')  (the class picks the post-it colour) */
export function note(title, body, kind = '') {
  const dialog = el('dialog', 'note ' + kind);
  const close = el('button', 'x', '✕ Close');
  close.type = 'button';
  close.onclick = () => dialog.close();
  dialog.onclick = (e) => { // click on the dimmed backdrop = outside the note's rectangle
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  };
  dialog.onclose = () => dialog.remove();
  dialog.append(close, el('h2', '', title), ...body);
  document.body.append(dialog);
  dialog.showModal();
}
