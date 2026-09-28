# The SMART Study microsite: mock-up

A clickable mock-up of the microsite for the DfE SMART RCT. It is for review and co-design, not a live service. The sign-in is fake and nothing is saved or sent.

## View it

Open `index.html` in a browser, or run `npm run serve` and go to http://localhost:8000.

To see the signed-in pages, sign in with any password as:

- **SMART-R-4821**: a restrict family (their child has a phone)
- **SMART-D-1093**: a delay family (their child has no phone yet)

The **Review tools** box (bottom right) turns the purple design notes on and off, and switches between the two groups.

## What's in it

| Page | Who sees it |
| --- | --- |
| `index.html` | Everyone, including the control group. Deliberately minimal. |
| `sign-in.html`, `privacy.html`, `accessibility.html` | Everyone |
| `start.html` | Signed-in families. Task list, what's new. |
| `guides.html` | Signed-in. Two questions choose the right guide. |
| `guide-iphone-parent.html`, `guide-iphone-child.html`, `guide-android.html` | Restrict group. Step-by-step guides with pictures, progress ticks and video. |
| `guide-delay.html` | Delay group |
| `videos.html` | Signed-in. Webinar recording (Vimeo) with chapters, children's video. |
| `share-screen-time.html` | Restrict group. Screenshot upload with checks. |
| `help.html` | Signed-in. FAQs, request an app, report a problem with a guide. |
| `decisions.html` | Mock-up only. The register of open decisions that every design note links to. |

## How it's built

- [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) components, compiled with Arial and DfE blue (`src/scss/site.scss`). It has no GOV.UK crown or Transport font, because those are only allowed on GOV.UK domains (see decision B1).
- `assets/js/site.js` adds the shared header, navigation, footer, cookie banner and review tools, plus the phone-screen drawings (`data-phone`), step progress and click-to-load Vimeo players (`data-vimeo`).
- Content for a single group is marked `data-show-for="restrict"` or `data-show-for="delay"`.

To rebuild the CSS after editing the SCSS: `npm install && npm run build`.

The real build's platform and editing workflow are still open (decisions B2 and C1).
