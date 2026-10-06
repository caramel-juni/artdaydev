// Tiny DOM helpers. Text always goes in via textContent (never innerHTML), so content can't inject code.
export const $ = (selector) => document.querySelector(selector);

/** el('p', 'scrap', 'hello') -> <p class="scrap">hello</p> */
export const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export const img = (src, alt) => Object.assign(el('img'), { src, alt, loading: 'lazy' });
export const rand = (min, max) => min + Math.random() * (max - min);
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
