# The SMART Study microsite: mock-up

A clickable mock-up of the microsite for the DfE SMART RCT, showing how the site will look. It is not a live service: the sign-in is fake and nothing is saved or sent.

The study runs from September 2027 to September 2028, with children in Years 3 to 5. Those dates live once, at the top of `content/resources.js`.

## View it

Open `index.html` in a browser, or run `npm run serve` and go to http://localhost:8000.

To see the signed-in pages, sign in with any password as:

- **SMART-F-4821**: a family
- **SMART-S-2041**: a school leader, who only sees the school resources page

Every family sees the same pages, because we won't know whether a child has a phone. The start page and the guides show "If your child doesn't have a smartphone yet" (wait until September 2028) first, then "If your child has a smartphone" (the set-up guides).

## What's in it

| Page | Who sees it |
| --- | --- |
| `index.html` | Everyone, including the control group. Deliberately minimal. |
| `sign-in.html`, `privacy.html`, `accessibility.html` | Everyone |
| `start.html` | Signed-in families. The two paths (no phone yet / has a phone) with their tasks, the study video, what's new. |
| `guides.html` | Signed-in. The guide to waiting, then the set-up guides, with two questions to choose the right one. |
| `guide-iphone.html`, `guide-android.html` | Signed-in. Step-by-step set-up guides with pictures, progress ticks, skip-ahead and video. |
| `guide-versions.html` | The study team. The versions of the "Block apps" step we're testing, side by side. Not linked from the site. Generated: see below. |
| `guide-delay.html` | Signed-in. The guide to waiting for a first smartphone. Generated: see below. |
| `schools.html` | School leaders only. Onboarding pack and e-posters. Generated: see below. |
| `videos.html` | Signed-in. Two kinds of video: the study video, a motivational video for children about why the study matters; and the how-to videos for setting up a phone. Vimeo, loaded on play. |
| `share-screen-time.html` | Signed-in, for families whose child has a phone. Screenshot upload with checks. |
| `help.html` | Signed-in. FAQs, request an app, report a problem with a guide. |

## How it's built

- **Look and feel:** a study identity of its own, with the SMART logo (a sun, a parent and a child, and deliberately no phone), the Nunito typeface, a warm palette anchored on DfE blue (#003a69), Lucide icons and flat illustrations. Styles are in `src/scss/site.scss`.
- **Underneath:** [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) for forms, error messages, accordions and tabs, so they keep GOV.UK's accessibility testing. There's no GOV.UK crown or Transport font, as those are only for GOV.UK domains.
- **Logos:** the partner logos (DfE, IFF, Cambridge, PUBLIC) are dashed placeholders until each organisation agrees.
- **Illustrations and logo mark** are SVGs drawn by `tools/illustrations.py`. Change a colour or shape there and run `python3 tools/illustrations.py`.
- **Icons:** `assets/js/icons.js` adds an icon sprite. Use `<svg class="smart-icon" aria-hidden="true"><use href="#i-book-open"></use></svg>`.
- `assets/js/site.js` adds the shared header, navigation, footer, cookie banner and mock-up banner, plus the drawn phone screens (`data-phone`), step progress and click-to-load Vimeo players (`data-vimeo`, with an optional `data-poster`).

To rebuild the CSS after editing the SCSS: `npm install && npm run build`.

## The set-up guides (one source, three outputs)

The restrictions guidance lives in **`content/guidance.js`**: the two guides, their steps, the versions of the "Block apps" step, the allowed-apps list, and a short description of every phone screen. Run `npm run build:guides` to generate:

| Output | Where | Use it for |
| --- | --- | --- |
| Guide pages | `guide-iphone.html`, `guide-android.html` | The microsite. Don't edit these by hand. |
| Versions page | `guide-versions.html` | The team: every version of the "Block apps" step, with what it changes, why to try it, what to watch for and how to tell them apart. |
| Word documents | `exports/SMART-restrictions-guidance.docx`, `exports/SMART-block-step-versions.docx` | Sharing and printing. Text is editable. |
| Figma boards | `exports/figma/guide-iphone.svg`, `guide-android.svg`, `block-step-versions.svg` | Drag into Figma: one board per guide, and one with every version. Text stays editable (Inter). |
| Single screens | `assets/guides/screens/*.svg` (vector), `exports/png/*.png` (3x) | Reuse anywhere: Figma, slides, the printed pack. The PNGs are numbered in the order the guidance Word document places them (`01-ios-settings-account.png` onwards): the iPhone guide, then the Android guide, then the screens only the other versions use. A screen used twice keeps the number of its first use. |

### How the guides work

There's one guide per child's phone; the parent's own phone doesn't matter. Each guide has two parts:

- **Part 1 connects the child's phone to the parent's.** On an iPhone it's optional: parents without an Apple device, or who'd rather go quicker, press **Skip to Step 3** and set everything up on the child's phone. The apps and websites are just as locked down; a table on the page sets out what they give up (changing settings from their own phone, requests coming to them, Apple's default protections for children's accounts, code recovery). On Android, Family Link is what locks the settings, so Part 1 is needed unless the family already uses it.
- **Part 2 is the study settings**, the same shape on both phones: set the code (iPhone), block apps, allow back the apps on the list, allow only the websites on the list, lock the settings, check it works.

Every guide opens with **Start from what you already have**, a table that sends parents to the right step, and every step has an **Already done?** note saying how to check and what to keep. Skipped steps are marked as such and don't count against the parent's progress. The apps on the list appear only in Step 5 ("Allow back the apps on the list"), with a note on using judgement for any single extra app; the websites appear in Step 6. There's also a box asking parents to do this themselves rather than handing the phone to their child.

### Testing the "Block apps" step

`blockVersions` in the content file holds four versions of Step 4, each with its own words and screens for iPhone and Android:

| Version | What it is |
| --- | --- |
| A | The previous guides' wording: ten categories listed one by one. |
| **B** | **In the guides now.** The same ten categories, as one rule ("every category except two"), with a number to check, a reason, "nothing is deleted", and a single-app exception. |
| C | Top three only: Social, Games and Entertainment (on Android, blocking those apps by hand). Lighter, so it's a trial decision as well as a wording one. |
| D | Top three first, then the rest: the same end result as B, asked in two stages. |

Add `?version=C` (or A, D) to a guide's address to see a version in context; a yellow tag marks the step. Change `shown` to change what families see.

The PNG and Word steps use Playwright's Chromium. To use a browser that's already installed, set `CHROMIUM` to its path, for example `CHROMIUM=/opt/pw-browsers/chromium npm run build:guides`. Screens removed from the content file are deleted from both folders on the next build, and PNGs are renumbered if the order changes.

Screens are drawn by `tools/screens.js` from descriptions like:

```js
{ os: 'ios', bar: { back: 'Settings', title: 'Screen Time' },
  blocks: [{ type: 'group', header: 'Limit Usage', rows: [
    { label: 'App Limits', sub: 'Set time limits for apps', icon: 'hourglass', colour: '#FF9500', chevron: true, hl: 'Tap' }
  ] }] }
```

`hl` draws the coral "tap here" outline with a label; `avoid` draws a red dashed "don't" outline; `span` stretches either over several rows. After a software update, changing a label means changing a word and rebuilding.

## The delay guide and the school e-posters

These live in **`content/resources.js`**. Run `npm run build:resources` to generate:

| Output | Where | Use it for |
| --- | --- | --- |
| Guide to waiting | `guide-delay.html` | The microsite, for families whose child has no phone yet. Don't edit by hand. |
| Delay guide, one page | `exports/SMART-delay-guide.docx`, `exports/figma/delay-guide.svg` | Word to share and print; an A4 frame for Figma. |
| E-posters | `exports/posters/SMART-poster-{both,delay,restrict}.{docx,pdf,png}`, `exports/figma/poster-*.svg` | Schools: Word to add their details, PDF to print, PNG for screens and newsletters; A4 frames for Figma. |
| School resources page | `schools.html` | The page school leaders see, listing the posters. |

There are three posters, each with one ask: one covering both situations (the one most schools need), one for waiting, one for setting up phones. Words in [square brackets] are for the school to fill in.

## The invitation to take part

The first thing school leaders and parents get from us, also in **`content/resources.js`** (`invitations`) and built by `npm run build:resources`:

| Output | Where | Use it for |
| --- | --- | --- |
| Word | `exports/invitations/SMART-invitation-{schools,parents}.docx` | Editing the wording and filling in the details. |
| PDF and PNG | `exports/invitations/SMART-invitation-{schools,parents}.{pdf,png}` | Printing, emailing, newsletters. |
| Figma | `exports/figma/invitation-{schools,parents}.svg` | An A4 frame each, text editable. |

Each is one page: a single ask (with a QR code), what taking part involves term by term (including the two reading and maths assessments in the PIRA/PUMA format), a plain note that schools are split into two groups by chance, and what everyone gets whichever group they're in. It goes out before schools are put into groups, so it describes both groups and promises both the same thanks. Words in [square brackets] (dates, web address, amounts, survey length) are still to be confirmed. The build warns if a page gets too full for A4.

## The onboarding pack for schools

The welcome pack for schools in the group trying the family plan lives in **`content/onboarding.js`**, as a list of blocks (headings, paragraphs, tables, lists, boxes). It's adapted from the April 2027 draft to the current design: September 2027 to September 2028, Years 3 to 5, the two reading and maths assessments, one study website for every family, and the study video and how-to videos in place of webinars. `npm run build:resources` builds:

| Output | Where | Use it for |
| --- | --- | --- |
| Word | `exports/SMART-onboarding-pack-schools.docx` | Editing. Word does its own page breaks (about 3 pages). |
| PDF | `exports/SMART-onboarding-pack-schools.pdf` | The download on the school resources page (4 pages). |
| Figma | `exports/figma/onboarding-pack-schools.svg` | Every A4 page side by side, one named group per page, text editable. |

Text can use **bold** and [links](https://example.com). In the PDF and Figma pages, a block that doesn't fit starts a new page, headings stay with what follows, and tables repeat their header row. The school resources page lists the pack's four asks and links to the PDF.


## The design system board

`npm run build:design-system` draws the whole look and feel as one Figma board, `exports/figma/design-system.svg`: colours (read from `src/scss/site.scss`), type styles, spacing, radii, shadows, every icon, the logo, the illustrations and the main components with their states. Drag it into Figma, or copy it and paste onto the canvas. Each swatch, style and component is a named layer ("Colours / Accents / sun", "Components / Button / Primary"), so reviewers can comment on each piece. Text stays editable in Nunito.

## The slide template

`npm run build:deck` builds a slide template in the study's style from `tools/build-deck.js`, where each layout is described once:

| Output | Use it for |
| --- | --- |
| `exports/SMART-deck-template.pptx` | Google Slides: upload it to Drive and open it with Google Slides, or in an existing deck use Slide > Change theme > Import theme. PowerPoint opens it directly. Eight layouts (title, section, title and body, text and picture, title only, big number, quote, closing) and a nine-slide example. |
| `exports/figma/deck-template.svg` | Figma: every layout and example slide as a named 1920 × 1080 group, text editable. |
| `exports/png/deck/*.png` | The logo, icons and illustrations the deck uses, as PNGs (Google Slides can't place SVG). |

Text is Nunito, which Google Slides has built in; PowerPoint users need it installed from Google Fonts. Titles use Nunito Bold, as slide tools can't pick the website's Black weight reliably.
