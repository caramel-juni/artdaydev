# How the retro draggable windows work

A Windows 95 window is just **four things**: a frame with a 3D bevel, a title bar, a body, and some JavaScript that moves the frame. Nothing here needs a library.

## 1. HTML: the anatomy

```html
<div class="desk">                    <!-- the "screen": a positioned container -->
  <section class="win">               <!-- one window -->
    <div class="tb">                  <!-- title bar -->
      <span>My Photos</span>
      <div><button>_</button><button>□</button><button>×</button></div>
    </div>
    <div class="wb">…content…</div>   <!-- window body -->
  </section>
  <div class="bar"><button>⊞ Start</button></div>   <!-- taskbar -->
</div>
```
**Why:** `.desk` is the boundary windows live in. `.win` is the thing you drag. `.tb` is the *handle* (only the title bar drags, as in real Windows). In this site, `win()` in `js/windows.js` builds this structure for you.

## 2. CSS: the look

**Use variables for the palette and bevels** (top of `style.css`):
```css
:root{
 --face:#c0c0c0;                       /* the classic Win95 grey */
 --out:inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf,
       inset -2px -2px #808080, inset 2px 2px #fff;   /* raised */
 --in: inset -1px -1px #fff, inset 1px 1px #808080,
       inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a; /* sunken */
 --f-ui:"Pixelated MS Sans Serif","MS Sans Serif",Tahoma,sans-serif;
 --ui-size:11px;                       /* the font was drawn for 11px */
}
```
**The bevel trick:** Win95's 3D edges are two layered 1px lines on each side: light top-left, dark bottom-right. `box-shadow: inset …` draws exactly that, and swapping the light/dark order (`--in`) makes it look pressed. Browser `border: outset` is only an approximation, so avoid it.

**The screen:**
```css
.desk{position:relative;height:75vh;overflow:hidden;background:#008080;
 box-shadow:var(--in);font:var(--ui-size)/1.3 var(--f-ui);-webkit-font-smoothing:none}
```
`position:relative` makes it the reference point for absolutely positioned windows; `overflow:hidden` stops windows escaping it. Turning off font smoothing keeps the pixel font crisp.

**The window:**
```css
.win{position:absolute;max-width:100%;padding:3px;background:var(--face);
 box-shadow:var(--out),3px 3px 0 #0006}   /* bevel + hard drop shadow */
.tb{display:flex;justify-content:space-between;align-items:center;padding:2px 4px;
 background:linear-gradient(90deg,#000080,#1084d0);color:#fff;font-weight:bold;
 cursor:move;touch-action:none}           /* touch-action: stops the page scrolling while dragging on phones */
.wb{padding:.5rem;overflow:auto;max-height:100%}
```
For a strictly Win95 title bar, use a solid `background:#000080` (the gradient arrived with Win98).

**Buttons** (raise on rest, sink on press):
```css
.desk button{font:inherit;background:var(--face);color:#000;border:0;box-shadow:var(--out);padding:3px 10px}
.desk button:active{box-shadow:var(--in)}
.tb button{width:1.5rem;padding:0}
```
**Text fields** are just `box-shadow:var(--in)` with a white background.
**Taskbar:** `.bar{position:absolute;left:0;right:0;bottom:0;display:flex;gap:4px;padding:3px;background:var(--face);z-index:99999}`
**Maximised:** `.win.max{left:0!important;top:0!important;width:100%!important;height:calc(100% - 2.3rem)}`. `!important` is needed because dragging sets `left/top` inline, and inline styles beat classes.

## 3. JavaScript: dragging and window controls

### Drag with pointer events
```js
title.onpointerdown = e => {
  if (e.target.tagName == 'BUTTON') return;              // don't drag from the buttons
  const dx = e.clientX - win.offsetLeft,                 // where in the window you grabbed
        dy = e.clientY - win.offsetTop;
  title.setPointerCapture(e.pointerId);                  // keep receiving moves even if the cursor outruns the bar
  title.onpointermove = m => {
    win.style.left = Math.max(0, m.clientX - dx) + 'px';
    win.style.top  = Math.max(0, m.clientY - dy) + 'px';
  };
  title.onpointerup = () => title.onpointermove = null;  // let go
};
```
**Why pointer events:** one API for mouse, touch and pen. **Why record the offset (`dx`, `dy`):** otherwise the window's corner jumps to your cursor. **Why `setPointerCapture`:** without it, a fast drag leaves the title bar and the window stops following. Note `Math.max(0,…)` stops windows being dragged off the top/left. (`style.left` is set with JS, which a strict CSP allows; inline `style=""` attributes in HTML would be blocked.)

### Focus (click to bring to front)
```js
let z = 1;
win.up = () => { win.hidden = false; win.style.zIndex = ++z; };
win.onpointerdown = win.up;
```
A counter that only goes up means the last-clicked window always has the highest `z-index`.

### Minimise, maximise, close
```js
min   = () => win.hidden = true;                  // the taskbar button calls win.up() to restore
max   = () => win.classList.toggle('max');        // CSS does the resizing
close = () => { win.remove(); taskbarButton.remove(); };
```
Each window also adds a button to `.bar`; clicking it calls `win.up()`, so one function both restores and focuses.

## 4. Minimal standalone example (copy this to learn)

```html
<div class="desk" style="height:300px"><section class="win" style="left:20px;top:20px;width:200px">
 <div class="tb"><span>Hello</span></div><div class="wb">Drag my title bar.</div></section></div>
<script>
const w=document.querySelector('.win'),t=w.querySelector('.tb');
t.onpointerdown=e=>{const dx=e.clientX-w.offsetLeft,dy=e.clientY-w.offsetTop;t.setPointerCapture(e.pointerId);
 t.onpointermove=m=>{w.style.left=m.clientX-dx+'px';w.style.top=m.clientY-dy+'px'};t.onpointerup=()=>t.onpointermove=null};
</script>
```
(Inline `style`/`<script>` are fine for experimenting locally. On the real site they're blocked by the Content Security Policy, which is why the real version moves everything to `style.css` and `js/windows.js`.)

## 5. Making your own window
```js
win(desk, 'Title', [el('p','','Hello')], {x:60, y:40, w:300});
```
`body` can be one node or an array; `x`, `y`, `w` set the starting position and width. Look at the archive (photo viewer) and contact (email form) pages in `js/sections.js` for real examples.

## 6. Accessibility notes
Window controls are real `<button>`s with `aria-label`s, so they work with keyboard and screen readers. Desktop icons are buttons too (single click, not double, so they work on touch). Dragging is a mouse/touch extra only; everything is reachable without it.

## 7. Dragging inside a zoomed page
The desktop view uses CSS `zoom` (130%, set by `--z`). Mouse coordinates are in screen pixels but `style.left/top` are in the zoomed element's own units, so the real `js/windows.js` divides by a zoom factor `k = visual width / layout width` of the desk. Without it, windows drift away from the cursor. Heights that use `vh` are divided by `--z` for the same reason.
