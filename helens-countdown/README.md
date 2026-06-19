# helen's personal fl countdown ✨🌴🔥

A single-file static countdown to **June 30, 2026 · 6:51 PM US Eastern (Florida time)**.
Quirky gen-z sticker design + the two photos + confetti when it hits zero.

## Files
- `index.html` — the whole page (HTML + CSS + JS inline)
- `helen-1.png`, `helen-2.png` — the photos

No build step. No dependencies. Open `index.html` locally to preview.

## Deploy to Vercel (≈60 seconds)

Easiest path — import this repo:

1. Go to **https://vercel.com/new** and log in with GitHub.
2. **Import** the `reallycantcode3/theta-farm` repo.
3. In project settings:
   - **Root Directory** → `helens-countdown`
   - **Framework Preset** → `Other` (it's plain static HTML)
   - Build/Output settings → leave empty (no build command needed)
4. Click **Deploy**. You'll get a shareable URL like
   `https://helens-fl-countdown.vercel.app` 🎉

Optionally rename the project under **Settings → General** to get a cleaner URL.

### Alternative: Vercel CLI
```bash
cd helens-countdown
npx vercel --prod
```
(Will prompt you to log in the first time, then deploys this folder as a static site.)

## Change the date/time
Edit the one line in `index.html`:
```js
const TARGET = new Date("2026-06-30T18:51:00-04:00").getTime();
```
The `-04:00` is US Eastern Daylight Time, so the countdown is correct for everyone no matter where they view it from.
