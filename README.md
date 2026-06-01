# rallyio — marketing website

A minimal, static landing page for rallyio (light blue / white theme).

## Files
- `index.html` — single-page site
- `styles.css` — theme + layout
- `script.js` — mobile nav toggle + footer year

No build step, no dependencies (Inter font loaded from Google Fonts).

## Preview locally
```bash
cd website
python3 -m http.server 8123
# open http://localhost:8123
```

## Coupon flow (current)
Coupon codes are **issued on request by email** to `rallyioai@gmail.com`.
The site intentionally does not describe how codes are generated.

A "Pay online — coming soon" slot is already in the markup (the disabled
**Buy a code** button in the `#coupon` section) for when instant,
payment-based code generation goes live.

## Hosting
Static — deploy to any static host (e.g. GitHub Pages, Netlify, Vercel,
Cloudflare Pages, Render). Point the host at this `website/` folder.
