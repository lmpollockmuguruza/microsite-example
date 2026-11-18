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

The restrictions guidance lives in **`content/guidance.js`**: the two guides, their steps, the allowed-apps list, and a short description of every phone screen. Run `npm run build:guides` to generate:

| Output | Where | Use it for |
| --- | --- | --- |
| Guide pages | `guide-iphone.html`, `guide-android.html` | The microsite. Don't edit these by hand. |
| Figma boards | `exports/figma/guide-iphone.svg`, `guide-android.svg` | Drag into Figma: one board per guide. Text stays editable (Inter). |
| Word and PDF | `exports/SMART-setting-up-your-childs-phone.docx\|pdf` | The guidance for parents, built by `npm run build:docs`: see **The documents** below. |
| Single screens | `assets/guides/screens/*.svg` (vector), `exports/png/*.png` (3x) | Reuse anywhere: Figma, slides, the printed pack. The PNGs are numbered in the order the Word guidance places them (`01-ios-settings-account.png` onwards): the iPhone guide, then the Android guide. A screen used twice keeps the number of its first use. |

### How the guides work

There's one guide per child's phone; the parent's own phone doesn't matter. Each guide has two parts:

- **Part 1 connects the child's phone to the parent's.** On an iPhone it's optional: parents without an Apple device, or who'd rather go quicker, press **Skip to Step 3** and set everything up on the child's phone. The apps and websites are just as locked down; a table on the page sets out what they give up (changing settings from their own phone, requests coming to them, Apple's default protections for children's accounts, code recovery). On Android, Family Link is what locks the settings, so Part 1 is needed unless the family already uses it.
- **Part 2 is the study settings**, the same shape on both phones: set the code (iPhone), block apps, allow back the apps on the list, allow only the websites on the list, lock the settings, check it works.

Part 1 has a one-line link to the longer explanation, which sits at the end of the page so it doesn't stand between parents and Step 1. Every guide opens with **Start from what you already have**, a table that sends parents to the right step, and every step has an **Already done?** note saying how to check and what to keep. Skipped steps are marked as such and don't count against the parent's progress. There's no separate allow list to read: Step 5 ("Allow back the apps your child needs") names the apps in the instruction itself (iPhone: which to keep in Always Allowed and which to add; Android: which to set to Unlimited time), built from `allowlist` in the content file, with a note on using judgement for any extra app. Step 6 names the websites the same way. There's also a box asking parents to do this themselves rather than handing the phone to their child.

### Step 4, "Block apps"

We drafted four versions of this step and chose the original (Option A): parents tick ten app categories by name on an iPhone, and turn on all-day downtime on Android. Earlier versions are in the git history.

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
| Delay guide | `exports/SMART-delay-guide.docx\|pdf` (built by `npm run build:docs`) | Word and PDF, with a cover, to share and print. |
| E-posters | `exports/posters/SMART-poster-{both,delay,restrict}.{docx,pdf,png}`, `exports/figma/poster-*.svg` | Schools: Word to add their details, PDF to print, PNG for screens and newsletters; A4 frames for Figma. |
| School resources page | `schools.html` | The page school leaders see, listing the posters. |

There are three posters, each with one ask: one covering both situations (the one most schools need), one for waiting, one for setting up phones. Words in [square brackets] are for the school to fill in.

## The invitation to take part

The first thing school leaders and parents get from us, in **`content/resources.js`** (`invitations`), built by `npm run build:docs` in the house style with a cover (navy and yellow for schools, coral for parents) and one page:

| Output | Where | Use it for |
| --- | --- | --- |
| Word | `exports/invitations/SMART-invitation-{schools,parents}.docx` | Editing the wording and filling in the details. |
| PDF | `exports/invitations/SMART-invitation-{schools,parents}.pdf` | Printing and emailing. |
| PNG | `exports/invitations/SMART-invitation-{schools,parents}.png` | The invitation page as an image, for emails and newsletters. |

The page has a single ask (with room for a QR code), what taking part involves term by term, a plain note that schools are split into two groups by chance, and what everyone gets whichever group they're in. For schools: two short surveys (autumn 2027 and summer 2028) alongside the two assessments, and one thank-you payment when the study ends. Sign-up and contact details are to come from Navigator Insight. The parents' invitation is for school leaders to share before the school signs up, to see whether families are interested: it asks parents to register interest (it doesn't commit them), describes what taking part would involve, and says one group follows "a simple plan about children's phones" without saying what it is, so it works whichever group the school ends up in. It's on the school resources page. Words in [square brackets] are still to be confirmed.

## The documents: onboarding packs and the guidance for parents

These go out as Word and PDF, in one house style taken from the April 2027 packs and the design review: Nunito, body text at 10.5pt, one heading hierarchy, and a colour per audience (navy and yellow for schools, coral for parents). Words in [square brackets] are still to be confirmed and are highlighted in yellow.

Each document opens with a **cover** in its audience's colour, so a school leader can sort them at a glance: a band saying who it's for ("For school leaders", "For parents and carers"), then the kind of document, its title, one line on what's in it, an illustration, and the dates. The colours are set once in `ACCENT` in `tools/build-docs.js`: navy and yellow for schools, coral for parents, green for children, and dark navy with pale blue for the study team and partners. Each cover is drawn as a web page and placed as one image, so it looks the same in Word, Google Docs and the PDF (Google Docs doesn't keep fixed table heights, which broke a cover built from a table). Its words live with each document: `cover` in `content/onboarding.js`, and `GUIDE.cover` in `tools/build-docs.js`. Page numbers start after the cover. Each cover is also saved as an SVG for Figma, `exports/figma/covers/cover-*.svg`: shapes, the logo and illustration as vectors, and every line of text as editable Nunito text, in named layers.

So the Word files open everywhere, the build writes the package's own parts first, gives every picture its own id, has no folder entries, and stops if a file comes out empty or LibreOffice can't convert it.

`npm run build:docs` builds each one as Word, then makes the PDF from the Word file with LibreOffice, so the two always match:

| Document | Source | Files |
| --- | --- | --- |
| Welcome pack for schools | `content/onboarding.js` (`schools`) | `exports/SMART-onboarding-pack-schools.docx\|pdf` (cover and 4 pages) |
| Welcome pack for families | `content/onboarding.js` (`parents`) | `exports/SMART-onboarding-pack-parents.docx\|pdf` (cover and 4 pages) |
| Setting up your child's phone (the guidance for parents) | `content/guidance.js` | `exports/SMART-setting-up-your-childs-phone.docx\|pdf` (cover and about 23 pages) |
| Help desk guide and triage tool (for the study team and partners) | `content/helpdesk.js` | `exports/SMART-help-desk-guide.docx\|pdf` (cover and 4 pages) |
| Welcome pack for children | `content/onboarding.js` (`children`) | `exports/SMART-onboarding-pack-children.docx\|pdf` (cover and 2 pages) |
| Waiting for a first smartphone (the guide for families whose child has no phone yet) | `content/resources.js` (`delay`) | `exports/SMART-delay-guide.docx\|pdf` (cover and 2 pages) |

The packs are lists of blocks (the main ask, headings, paragraphs, stats, tables, lists, boxes, and lists drawn as icons). The children's pack uses bigger text (11.5pt body, `SIZES.children`), an icon badge by every heading, and the things children can still do drawn as icons. It says "parent or carer", not "grown-up". Icons are Lucide, the site's icon set, drawn as white line icons on a disc in the audience's colour. They're adapted to the current design: September 2027 to September 2028, Years 3 to 5, the two reading and maths assessments, one study website for every family, a screen time screenshot once a month, and the study video and how-to videos in place of webinars. Both say plainly that tablets, computers and borrowing a parent's phone are expected and built into the study.

The guidance reads top to bottom: what we're asking, which guide is yours (a link to each), what to have ready, then the iPhone guide and the Android guide. Each guide starts with **Start from what you already have**, whose rows link to the right step; "Skip to Step 3", "Go to Step 4" and the other step references are links too. The longer explanations (what changes if you skip Part 1 on an iPhone, why Android has no shortcut) are in **Good to know** at the end, linked from Part 1. Each step has a tick box for parents who print it.

It needs the screen PNGs from `npm run build:guides` and LibreOffice (`soffice`, or set `SOFFICE`). Nunito is embedded in the Word files and given to LibreOffice from `assets/fonts/ttf`, so it needn't be installed. `npm run build` runs the steps in the right order; build the docs before the resources, so the school resources page shows the packs' page counts.

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

## The family newsletter (Mailchimp)

`exports/newsletter/SMART-family-update-mailchimp.html` is the monthly newsletter for parents and carers, to paste into Mailchimp's code editor. It's written by hand, not built: the words change every issue, inside the `mc:edit` regions, and Mailchimp's merge tags (`*|UNSUB|*` and the rest) and the hosted logo stay as they are. `SMART-family-update-mailchimp-code.txt` is the same code as plain text, to open in any editor and copy: opening the .html in TextEdit or Word shows the page, not the code, so copying from there pastes text. Its `<head>` matches the original template exactly. It follows the house style: Nunito where the reader has it (otherwise Arial), the cream page, coral for parents on the header rule and footer, a navy hero with a yellow progress bar, cards tinted sky, lemon, peach and mint with coral number badges, and a rounded coral button. Cards stack on phones.

## The video guides (Google Vids)

`npm run build:video` builds a slide deck and a narration script for each phone, from `content/video.js` (what the video says) and `content/guidance.js` (the steps, Step 4 as Option A, and every screen):

| Output | Use it for |
| --- | --- |
| `exports/video/SMART-video-{iphone,android}.pptx` | Upload to Google Slides, then create the video from it in Google Vids. Each slide's speaker notes are its narration. |
| `exports/video/SMART-video-narration-{iphone,android}.txt` | The same narration as one script, slide by slide, with the chapters. |

Each deck: a title slide; how to use the video (pause after each step, do it, carry on; skip with the chapters); the chapter list; before you start; then each part and step, a step slide with its time, where to do it and a few key points, followed by every screen for that step, two or three to a slide, in order. The narration gives each step's essentials rather than every line of the guide (about 10 minutes a video). Chapter times say [0:00] until the video is made: put them on slide 3, in the script and in the video description.

