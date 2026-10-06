// Shared page parts. Any <div data-include="NAME"></div> is replaced by the contents of partials/NAME.html,
// so the header/nav and footer are edited in ONE place. The slot div disappears (replaceWith), so it adds no wrapper.
export async function includes() {
  const slots = [...document.querySelectorAll('[data-include]')];
  await Promise.all(slots.map(async (slot) => {
    const res = await fetch(`partials/${slot.dataset.include}.html`);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html'); // parsed, not executed
    slot.replaceWith(...doc.body.childNodes);
  }));
  // Highlight this page's link in the nav: <body data-p="artists"> matches href="artists.html"
  document.querySelector(`.pinnav a[href="${document.body.dataset.p}.html"]`)?.setAttribute('aria-current', 'page');
}
