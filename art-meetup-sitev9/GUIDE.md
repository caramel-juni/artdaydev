# Building your community art site: a short guide

## 1. The stack: HTML + CSS + ~30 lines of JS
No framework, no build step, no database, no server code. Open `index.html` through any static host and it works.
**Why:** every dependency is code you must update and trust. A site with none has almost nothing to attack, and will still work in ten years. This is the smolweb idea.

## 2. File map
| File | Job |
|---|---|
| `index/ethos/archive/artists/notices/contact.html` | One page per section. Tiny: a title and an empty container (`<div id=pins>`). |
| `data.json` | **All your content.** Edit this monthly, never the HTML. |
| `script.js` | Injects the nav, reads `data.json`, builds the pins, polaroids and artist cards. |
| `style.css` | All the looks. |
| `img/` | Posters and photos. |
| `_headers` | Security headers (Netlify / Cloudflare Pages format). |

**Why split content from code?** You change one JSON file each month and nothing can break the layout. Volunteers can help without touching code.

## 3. Monthly routine
1. Drop the new poster into `img/`.
2. In `data.json`, update `event` (title, date, place, details, poster path).
3. Add new objects to `pins`, `artists` or `archive`. Copy an existing one; mind the commas.
4. Upload. Done.

## 4. How the mixed-media look works (style.css)
- **Nav stickers:** the six links in `.pinnav` each get a different material via `:nth-child`: washi-tape stripes (gradient), a rubber stamp (double border + round), a polaroid (white + extra bottom padding), a torn ticket (`clip-path`), a scrap (angled `clip-path`), an envelope. Reorder or restyle them there.
- **Slight rotations + hard offset shadows** (`box-shadow:3px 4px 0`) make flat boxes read as paper on a surface.
- **Pins:** `.pin::before` is a red circle. Expanding is the native `<details>` element, so no JS and keyboard-accessible for free.
- **Each page has its own vibe** via `body[data-p=...]`: cork (notices), lined paper (ethos), dark contact sheet (archive), dotted gallery wall (artists), kraft paper (contact). Add a new vibe by writing one `[data-p=yourpage]` rule.
- **Fonts** are system fonts. No external requests, faster, more private. To add your own, put a `.woff2` in the folder and use `@font-face`.

## 5. Security: what and why
- **No server code or forms** means no SQL injection, no spam bots, no logins to steal. Artists email you; you add the pin. That's your moderation too.
- **Content Security Policy** (meta tag in each page + `_headers`): the browser only runs scripts/styles/images from your own site. Even if someone sneaked in bad code, it wouldn't run. That's why there is no inline `<script>` or `style=""` anywhere.
- **`textContent`, never `innerHTML`:** in `script.js` all text from `data.json` is inserted as plain text, so `<script>` typed into a pin is displayed, not executed.
- **Headers** (`_headers`): block framing (clickjacking), MIME sniffing and referrer leaks. Meta tags can't set all of these, so use a host that reads `_headers`.
- **Hosting:** Cloudflare Pages, Netlify or GitHub Pages (free, HTTPS automatic). Turn on two-factor login for that account, as it is your real attack surface. Keep the site in a Git repo so every change is reviewable and reversible.
- **Images:** resize to ~1200px and compress before uploading; strip location metadata from photos.

## 6. Test locally
`python3 -m http.server` inside the folder, then visit `localhost:8000`. (`fetch` doesn't work from `file://`.)

## 7. Build on it
- Real contact form: add a form service later (e.g. Formspree) and widen `form-action` and `connect-src` in the CSP for that one host only.
- RSS feed for announcements (a hand-written `feed.xml`): very indieweb.
- A `webring` link or `/now` page for IndieWeb credibility.
- Archive `note` field in `data.json` isn't displayed yet: good first exercise in `script.js`.
- Replace the placeholder names, `hello@example.org`, and sample art.

## 8. Round 2 additions (see WINDOWS.md for the retro windows in depth)
- **Fonts:** `fonts/` holds Gaegu, Indie Flower, Special Elite and a Win95-style pixel font (`.woff2` files; the first three are OFL, the pixel font comes from the MIT-licensed 98.css project, but is a recreation of a Microsoft font, so check you are comfortable with that. Fonts are named once as CSS variables (`--f-hand`, `--f-head`, `--f-type`, `--f-ui` at the top of style.css), loaded with `@font-face`. Self-hosting means no Google request, and the CSP only needed `font-src 'self'`.
- **Scanned/scrapbook look:** `img/grain.svg` (an SVG noise filter) is laid over the page with `mix-blend-mode:multiply`; images get a sepia/contrast filter; `clip-path` tears paper edges; `h1` letters are split into cut-out scraps in `script.js`.
- **Sky and pinboard frame:** `html` has a sky-blue gradient; `body::before` is a fixed layer of CSS-drawn clouds whose background-position animates. `main` is the framed cork board (width capped, auto side margins and a wood `border`), so the sky shows around the edges, more on wide screens. Per-page vibes now style `[data-p=x] main`. Reduced-motion turns the clouds off.
- **Retro windows:** `win()` in `script.js` builds a window (drag = pointer events on the title bar; minimise = `hidden`; maximise = a CSS class). `archive` and `contact` pages just call it. Photos per event live in `data.json` under `photos`.
- **Contact "email":** no server. Send builds a `mailto:` link opening the visitor's own email app.
- **Neko:** `oneko.js` + `oneko.gif` (adryd325/oneko.js, MIT). It's third-party code, so it's self-hosted rather than loaded from a CDN, and you can read all of it.
- **Easter eggs:** Konami code (up up down down left right left right b a), hit counter, marquee, 88x31 badges, blinking NEW!, Start button > Shut Down, console message. Add your own!

## 9. Round 4 additions
- **Sky ambience (freesound.org):** I can't download from Freesound for you (it needs a login, and hotlinking is blocked by the site's CSP anyway). Pick a clip yourself: search "soft wind ambience", filter by licence (CC0 is easiest), download, save as `audio/sky.mp3`. If it's CC-BY, add the credit to the footer. Until the file exists the 🔊 button plays a synthesised soft wind instead. Browsers only allow audio after a click, so it starts off, and visitors must toggle it on every page.
- **Leaves:** `script.js` spawns a 🍃/🍂/🍁 every 6 to 20s; a CSS keyframe drifts it across the screen, then it removes itself. Skipped for reduced motion.
- **Sticky notes:** pins and artist cards are `<button>`s that call `note()`, which builds a native `<dialog>` (80vw x 80vh, post-it colours) and opens it with `showModal()`, so Esc, focus trapping and the dimmed backdrop come free. Text goes in with `textContent`, so it stays safe.
- **Data not showing?** `fetch` is blocked on `file://`. Serve the folder with `python3 -m http.server`; the page now says so if loading fails. (The artist wall also had a missing function in an earlier build, now fixed.)

## 10. Round 5: structure changes
**`script.js` no longer exists.** It's split into small ES modules in `js/` (browsers load them natively, so there's still no build step; they need a server, like `data.json` already did):

| File | Job |
|---|---|
| `js/main.js` | Entry point. Calls the effects and, for pages with data, loads `data.json` and runs that page's function. Start here. |
| `js/config.js` | Every tweakable setting: menu items, footer text, leaf timing, sound file, scroll speed. |
| `js/includes.js` | Imports `partials/header.html` and `partials/footer.html` into each page. |
| `js/sections.js` | One function per page: `home`, `notices`, `artists`, `archive`, `contact`. |
| `js/windows.js` | The retro draggable windows (see `WINDOWS.md`). |
| `js/notes.js` | The big post-it popup. |
| `js/effects.js` | Ransom title, pixel filter, leaves, sound, visitor counter, Konami. Delete a call in `main.js` to remove an effect. |
| `js/dom.js` | Tiny helpers (`el`, `$`, `img`). |

**Header, nav and footer are imported from one place.** `partials/header.html` (the nav bar) and `partials/footer.html` are fetched into every page by `js/includes.js`, wherever a page has `<div data-include="header"></div>` or `<div data-include="footer"></div>`. Edit a partial once and every page changes. The current page's link is highlighted automatically from `<body data-p="...">`. (This replaced `js/layout.js` and the nav/footer lists in `config.js`.) Trade-offs: the menu needs JavaScript (each page has a `<noscript>` link home, and a small `min-height` reserves the space so nothing jumps), and, like `data.json`, it needs a server rather than a double-clicked file. The no-runtime alternative is a build step that pastes the partials into the HTML; say if you want that.

**Adding a page:** copy `_template.html`, set `data-p`, the `<title>` and the content, then add one `<a>` line to `partials/header.html` (and a matching look in `style.css` if you want a new sticker style). If the page needs data, add it to the `pages` list in `js/main.js`. For its own vibe, add a `[data-p=yourpage] main{...}` rule.

**Pixelated icons.** Any element with class `ico` is pixelated. To change the size, edit `--pixel` at the top of `style.css` (1 barely, 2 very fine, 4 chunky). `effects.js` reads that number and builds an SVG filter (a sample dot per cell, tiled, grown back into squares); `.ico{filter:url(#pixelate)}` applies it. Give new icons the class `ico`. Some browsers (notably Safari) are patchy with SVG filters on HTML, in which case icons simply stay smooth.

**Guestbook (guestbooks.meadow.cafe).** I can't create the guestbook for you (it needs your account), so:
1. Sign in at guestbooks.meadow.cafe, create a guestbook, and use "Get embed code" for the **iframe** version.
2. Paste its URL into the `src` of the `<iframe class="gb">` in `guestbook.html`.
3. The CSP allows frames from that one host only, and only that page's iframe is sandboxed. It's third-party content with its own cookies, so it's the one place the site is no longer fully self-contained. Moderation, theming and spam settings are in their dashboard; if you'd rather have zero third parties, the service is open source and can be self-hosted.

## 11. Styling the guestbook
The guestbook is an iframe from another website, so your `style.css` can't touch what's inside it. Instead, `guestbook.css` is pasted into the custom CSS box of your guestbook in the Guestbooks dashboard (choose the custom style rather than a built-in theme). It reuses the same ideas as the main site: font and colour variables at the top, ruled paper (`repeating-linear-gradient`), torn edge (`clip-path`), stamps and sticky-note buttons, and every message as a pinned scrap.
- **Fonts:** the iframe can only load fonts by `https` URL, so they're fetched from your live site (`https://artdayadl.com/fonts/...`). Change the domain in the `@font-face` lines if yours differs. `_headers` allows that cross-site font request; GitHub Pages already does. Until the site is live, it falls back to system handwriting fonts.
- **Specificity:** every rule begins `html body ...` so it wins over the guestbook's own styles. If something doesn't change, look at the element in your browser's dev tools and copy its id/class into the CSS.
- **Limits:** the service may reject unsafe CSS (no `@import`, no non-https `url()`), so the file has none. The message markup isn't something I could see, so messages are styled generically (`#guestbooks___guestbook-messages-container > *`); adjust once a few exist.
- **Our side:** `.gbwrap`/`.gb` in `style.css` add the tape and sit the frame on the same kraft colour as the iframe's background so the paper looks like it's resting on the page.

### Troubleshooting: "downloadable font: rejected by sanitizer"
That's the browser saying the file it received at that URL isn't a valid font. The files in `fonts/` are valid (checked), so what your server sends is different from what's in the zip. Test it, replacing the filename for each font:
1. Open `https://artdayadl.com/fonts/gaegu.woff2` in a browser. It should *download* a file of **17,288 bytes** (indie-flower 19,508; special-elite 53,296). If you see a web page or error, the file is missing or a rewrite rule is serving `index.html` instead.
2. Terminal check: `curl -s https://artdayadl.com/fonts/gaegu.woff2 | head -c4` must print `wOF2`. If it prints `<!do`, you're being sent HTML.
3. Compare checksums: `curl -s URL | sha256sum` must match:
```
1964c6ff2196903d2b44f48f71a7a0ab593012bae9216c96f377b90ff9b0435f  gaegu.woff2
cb57752edc96294323252e8d84fa25f975943b2ef3e87b2c984b15ca935d7657  indie-flower.woff2
770493d84cbb753cd0573d0f014550583138f40469d137e310d239593a1949d8  special-elite.woff2
```
A different size or checksum means the upload corrupted the binary (text-mode FTP, or git converting line endings: the zip now includes a `.gitattributes` that prevents this). Re-upload the `fonts/` folder in binary mode.
4. If the checks pass when you open the URL directly but fail only inside the guestbook, something on your host (e.g. a Cloudflare bot/hotlink rule, or a redirect from `artdayadl.com` to `www.`) treats the cross-site request differently. Use the exact final URL in `guestbook.css`, and allow `/fonts/*` in that rule.
Until it works, the guestbook falls back to system handwriting fonts (`Segoe Print`, `Bradley Hand`, `Comic Sans MS`) so nothing breaks.
