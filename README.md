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

- **Look and feel:** a study identity of its own, with the SMART logo (a sun, a parent and a child, and deliberately no phone), the Nunito typeface, a warm palette anchored on DfE blue (#003a69), Lucide icons and flat illustrations. Styles are in `src/scss/site.scss`.
- **Underneath:** [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) for forms, error messages, accordions and tabs, so they keep GOV.UK's accessibility testing. There's no GOV.UK crown or Transport font, as those are only for GOV.UK domains (decision B1).
- **Logos:** the partner logos (DfE, IFF, Cambridge, PUBLIC) are dashed placeholders until each organisation agrees (decision B5).
- **Illustrations and logo mark** are SVGs drawn by `tools/illustrations.py`. Change a colour or shape there and run `python3 tools/illustrations.py`.
- **Icons:** `assets/js/icons.js` adds an icon sprite. Use `<svg class="smart-icon" aria-hidden="true"><use href="#i-book-open"></use></svg>`.
- `assets/js/site.js` adds the shared header, navigation, footer, cookie banner and review tools, plus the drawn phone screens (`data-phone`), step progress and click-to-load Vimeo players (`data-vimeo`, with an optional `data-poster`).
- Content for a single group is marked `data-show-for="restrict"` or `data-show-for="delay"`.

To rebuild the CSS after editing the SCSS: `npm install && npm run build`.

## The set-up guides (one source, three outputs)

The restrictions guidance lives in **`content/guidance.js`**: the routes (A, B, C), the steps, the allowed-apps list, and a short description of every phone screen. Run `npm run build:guides` to generate:

| Output | Where | Use it for |
| --- | --- | --- |
| Guide pages | `guide-iphone-parent.html` (A), `guide-iphone-child.html` (B), `guide-android.html` (C) | The microsite. Don't edit these by hand. |
| Word document | `exports/SMART-restrictions-guidance.docx` | Review, sign-off, printing. Text is editable. Includes review notes at the end. |
| Figma boards | `exports/figma/route-a.svg`, `-b`, `-c` | Drag into Figma: one board per route, text stays editable (Inter). |
| Single screens | `assets/guides/screens/*.svg` (vector), `exports/png/*.png` (3x) | Reuse anywhere: Figma, slides, the printed pack. |

Screens are drawn by `tools/screens.js` from descriptions like:

```js
{ os: 'ios', bar: { back: 'Settings', title: 'Screen Time' },
  blocks: [{ type: 'group', header: 'Limit Usage', rows: [
    { label: 'App Limits', sub: 'Set time limits for apps', icon: 'hourglass', colour: '#FF9500', chevron: true, hl: 'Tap' }
  ] }] }
```

`hl` draws the coral "tap here" outline with a label; `avoid` draws a red dashed "don't" outline; `span` stretches either over several rows. After a software update, changing a label means changing a word and rebuilding.

The real build's platform and editing workflow are still open (decisions B2 and C1).

## The comic: "Where's Margot?" (Newsletter → Nudges)

A 12-issue comic for children aged 8 to 12, with 4 pages per monthly newsletter from May 2027 to April 2028. Five pupils chase Margot, the school dog, into the closed-off old wing of their school, and the adventure lasts "all year". The twist: it was one lunch break.

- **Story bible:** `content/comic-story-bible.md` (characters, issue-by-issue plot, tone and safety rules).
- **Character sheet (draft 3, for sign-off; design-first indie style, text in Atkinson Hyperlegible):** drawn by `tools/margot-kit.js` and `tools/build-character-sheet.js`. Run `npm run build:sheet` to produce:
  - `assets/comic/character-sheet.png` (the site) and `assets/comic/character-sheet.svg`
  - `exports/figma/wheres-margot-character-sheet.svg` (Figma; text in Fredoka and Atkinson Hyperlegible stays editable)
  - `exports/comic/wheres-margot-character-sheet.png` (to share)
- Chapter 1 will be drawn after the characters are approved.
