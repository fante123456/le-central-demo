# Le Central – restaurant website demo

Live demo: **https://le-central.calynevo.com**

A demo website I designed and built for Le Central, a bistrot and bar in Saint-Lô, Normandy. It shows how a local restaurant could present its menu, its events and its table booking online.

> This is a demonstration. Some photos come from image libraries, prices may not be current, and the forms do not send anything.

## Features

- 9 pages in French and 9 in English (`/en/`), plus a 404 page
- Lunch / evening switch that changes the content of the home page
- Menu with photos, and a printable table menu with a QR code
- Step-by-step booking flow: day, service, time, guests and details
- Light and dark mode, opening animation that runs once per visit
- Mobile-first layout, accessible markup and good Lighthouse scores
- SEO: page titles and descriptions, `hreflang`, `sitemap.xml`, restaurant data for Google (JSON-LD)

## Built with

HTML · CSS · JavaScript, no framework. Images in WebP, self-hosted fonts.

## Structure

```
index.html, carte.html, reserver.html, ...   French pages
en/                                          English pages
assets/                                      CSS, JavaScript, images and fonts
.htaccess                                    Redirects, caching and security headers
```

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000.

---

Design and code by Ammar Rajabi · https://ammar-rajabi.com
