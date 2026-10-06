/*
 * Builds the set-up guides from content/guidance.js:
 *
 *   assets/guides/screens/*.svg   one vector file per phone screen
 *   guide-*.html                  the three route pages on the microsite
 *   exports/png/*.png             sharp (3x) images of each screen, for Word
 *   exports/SMART-restrictions-guidance.docx   the editable Word version
 *   exports/figma/*.svg           one board per route, to drop into Figma
 *
 * Run: npm run build:guides
 */
const fs = require('fs')
const path = require('path')
const { render } = require('./screens')
const G = require('../content/guidance')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const mkdir = p => fs.mkdirSync(out(p), { recursive: true })

// ------------------------------------------------------------------ helpers
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
function md (s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a class="govuk-link" href="mailto:$1">$1</a>')
}
const plain = s => String(s).replace(/\*\*/g, '')
const icon = n => `<svg class="smart-icon" aria-hidden="true"><use href="#i-${n}"></use></svg>`

// Expand a route's steps, inlining the shared settings for its platform
function stepsFor (route) {
  return route.steps.map(st => st.shared ? { ...G.shared[route.os].find(x => x.key === st.shared), shared: true } : st)
}

function allScreens () {
  const m = new Map()
  const add = sc => { if (!m.has(sc.id)) m.set(sc.id, sc) }
  Object.values(G.shared).flat().forEach(st => st.screens.forEach(add))
  G.routes.forEach(r => r.steps.forEach(st => (st.screens || []).forEach(add)))
  return m
}

// ------------------------------------------------------------------ 1. SVG files
// Remove screens that are no longer in the content file
function prune (dir, ext, screens) {
  for (const f of fs.readdirSync(out(dir))) if (f.endsWith(ext) && !screens.has(f.slice(0, -ext.length))) fs.unlinkSync(out(`${dir}/${f}`))
}

function writeSvgs (screens) {
  mkdir('assets/guides/screens')
  prune('assets/guides/screens', '.svg', screens)
  for (const [id, sc] of screens) fs.writeFileSync(out(`assets/guides/screens/${id}.svg`), render(sc) + '\n')
}

// ------------------------------------------------------------------ 2. microsite pages
function screenFigure (sc, n) {
  const svg = render(sc).replace('<svg ', `<svg aria-labelledby="${sc.id}-cap" `).replace(/<title>.*?<\/title>/, '')
  return `<figure class="smart-screen">${svg}<figcaption id="${sc.id}-cap"><span class="smart-screen__n">${n}</span><span><strong>${esc(sc.device)}.</strong> ${esc(sc.alt || '')}${sc.draft ? ' <span class="smart-screen__draft">Draft: check on a device</span>' : ''}</span></figcaption></figure>`
}

function stepHtml (st, i, route) {
  const items = st.items.map(it => typeof it === 'string'
    ? `<li>${md(it)}</li>`
    : `<li>${md(it.text)}<ul class="govuk-list govuk-list--bullet">${it.sub.map(x => `<li>${md(x)}</li>`).join('')}</ul></li>`).join('')
  const screens = (st.screens || []).map((sc, j) => screenFigure(sc, j + 1)).join('')
  return `
            <li class="smart-step" id="step-${i + 1}">
              <h3 class="govuk-heading-m">${esc(st.title)}</h3>
              <ul class="smart-step__meta">
                <li>${icon('clock')} ${esc(st.time)}</li>
                <li>${icon('smartphone')} On ${esc(st.device)}</li>
              </ul>
              ${st.intro ? `<p class="govuk-body">${md(st.intro)}</p>` : ''}
              <ol class="govuk-list govuk-list--number smart-step__list">${items}</ol>
              ${(st.after || []).map(a => `<p class="govuk-body">${md(a)}</p>`).join('')}
              ${st.warn ? `<div class="govuk-inset-text smart-inset-warn">${md(st.warn)}</div>` : ''}
              ${st.check ? `<div class="smart-check">${icon('circle-check')}<p class="govuk-body govuk-!-margin-bottom-0">${md(st.check)}</p></div>` : ''}
              ${screens ? `<div class="smart-screens" role="list" aria-label="What you'll see on the phone">${screens.replace(/<figure /g, '<figure role="listitem" ')}</div>` : ''}
              <div class="govuk-checkboxes govuk-checkboxes--small smart-step__done smart-no-print"><div class="govuk-checkboxes__item"><input class="govuk-checkboxes__input" id="done-${i + 1}" type="checkbox"><label class="govuk-label govuk-checkboxes__label" for="done-${i + 1}">I've done this step</label></div></div>
            </li>`
}

function pageHtml (route) {
  const steps = stepsFor(route)
  const others = G.routes.filter(r => r !== route)
  const chips = G.allowlist.apps.map(a => `<li class="smart-chip${a.tbc ? ' smart-chip--tbc' : ''}">${icon(a.icon)}${esc(a.name)}<span class="smart-chip__for">${esc(a.for)}</span></li>`).join('')
  const video = route.id === 'A' ? '1084537' : route.id === 'B' ? '22439234' : '347119375'
  return `<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <title>Route ${route.id}: ${esc(route.short)} – The SMART Study</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/site.css?v=3">
</head>
<!-- Generated by tools/build-guides.js from content/guidance.js. Edit the content file, not this page. -->
<body class="govuk-template__body" data-access="member" data-page="guides" data-only-for="restrict" data-guide="${route.slug}">

  <div class="govuk-width-container">
    <nav class="govuk-breadcrumbs smart-no-print" aria-label="Breadcrumb">
      <ol class="govuk-breadcrumbs__list">
        <li class="govuk-breadcrumbs__list-item"><a class="govuk-breadcrumbs__link" href="start.html">Start here</a></li>
        <li class="govuk-breadcrumbs__list-item"><a class="govuk-breadcrumbs__link" href="guides.html">Guides</a></li>
      </ol>
    </nav>
    <main class="govuk-main-wrapper govuk-!-padding-top-0" id="main-content">
      <div class="smart-hero smart-hero--compact ${route.hero}">
        <div>
          <span class="smart-hero__eyebrow">${icon('book-open')} Set-up guide · Route ${route.id}</span>
          <h1 class="govuk-heading-xl">${esc(route.title)}</h1>
          <p class="govuk-body-l">${md(route.lead)}</p>
        </div>
        <img src="assets/images/illustrations/${route.illus}" alt="">
      </div>

      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          <ul class="smart-guide-meta">
            <li>${icon('clock')} ${esc(route.time)}</li>
            <li class="smart-fresh">${icon('circle-check')} ${route.os === 'ios' ? 'Drawn from iOS 18 and 26 screens' : 'Draft: check on a device'}</li>
            <li>Version 0.2 (draft)</li>
          </ul>

          <div class="govuk-button-group smart-no-print">
            <a href="#" class="govuk-button govuk-button--secondary" data-print>${icon('printer')} Print or save as PDF</a>
            <a href="#video" class="govuk-link">Prefer to watch? Jump to the video</a>
          </div>

          <aside class="smart-design-note" data-decision="C1 C2 C12">
            <p><strong>Generated from one source.</strong> This page, the Word document and the Figma boards are all built from <code>content/guidance.js</code>. The phone screens are drawn, not screenshots. They follow your iOS screenshots, so they stay sharp at any size and can be updated by changing a word.</p>
            <p>Every screen is also a separate SVG in <code>assets/guides/screens/</code>. Drop one into Figma and its text stays editable.</p>
          </aside>

          <p class="govuk-body">${md(G.intro.lead)}</p>
          ${G.intro.text.map(t => `<p class="govuk-body">${md(t)}</p>`).join('\n          ')}

          <h2 class="govuk-heading-l" id="before">Before you start: four things to have ready</h2>
          <ul class="govuk-list govuk-list--bullet govuk-list--spaced">${G.intro.before.map(b => `<li>${md(b)}</li>`).join('')}</ul>
          <div class="govuk-warning-text">
            <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span>${md(G.intro.beforeWarn).replace(/<\/?strong>/g, '')}</strong>
          </div>
          <p class="govuk-body">${md(G.intro.moreDevices)}</p>
          ${route.os === 'android' ? `<div class="govuk-inset-text">${md(G.intro.androidNote)}</div>` : ''}
          <p class="govuk-body">Not your phones? ${others.map(r => `<a class="govuk-link" href="${r.slug}.html">Route ${r.id}: ${esc(r.short)}</a>`).join(' or ')}.</p>

          <h2 class="govuk-heading-l" id="list">${esc(G.sharedIntro.title)}</h2>
          <p class="govuk-body">${md(G.sharedIntro.text[0])}</p>
          <h3 class="govuk-heading-s">The apps on the list</h3>
          <p class="govuk-body-s">${esc(G.allowlist.placeholder)}</p>
          <ul class="smart-chips smart-chips--list">${chips}</ul>
          <h3 class="govuk-heading-s">The websites on the list</h3>
          <p class="govuk-body">${esc(G.allowlist.websites)}</p>
          ${G.sharedIntro.text.slice(1).map(t => `<p class="govuk-body">${md(t)}</p>`).join('\n          ')}

          <h2 class="govuk-heading-l" id="steps">Steps</h2>
          <ol class="smart-steps">${steps.map((st, i) => stepHtml(st, i, route)).join('')}
          </ol>

          <div class="govuk-panel govuk-panel--confirmation smart-no-print">
            <h2 class="govuk-panel__title govuk-!-font-size-36">${icon('party-popper')} That's it. Thank you!</h2>
            <div class="govuk-panel__body govuk-!-font-size-24">In about a week, we'll ask you to <a href="share-screen-time.html" style="color:#fff">share a screenshot</a> of your child's screen time.</div>
          </div>

          <h2 class="govuk-heading-m">${esc(G.intro.optional.title)}</h2>
          ${G.intro.optional.text.map(t => `<p class="govuk-body">${md(t)}</p>`).join('\n          ')}

          <h2 class="govuk-heading-l" id="video">Watch the whole guide</h2>
          <div id="guide-video" data-vimeo="${video}" data-poster="assets/images/illustrations/${route.illus}" data-title="Set-up guide video, route ${route.id}"></div>
          <p class="smart-video-meta">Subtitles available (press CC) · Placeholder video</p>

          <h2 class="govuk-heading-m govuk-!-margin-top-6">Something look different on your phone?</h2>
          <p class="govuk-body">Phones change after updates. If a step doesn't match what you see, <a class="govuk-link" href="help.html?guide=${route.slug}#report">tell us which step</a> and we'll help, and fix the guide for everyone.</p>
        </div>

        <div class="govuk-grid-column-one-third smart-no-print">
          <div class="smart-contents">
            <h2 class="govuk-heading-s govuk-!-margin-bottom-1">Your progress</h2>
            <div class="smart-progress" aria-hidden="true"><span></span></div>
            <p class="govuk-body-s" data-progress-text aria-live="polite"></p>
            <h2 class="govuk-heading-s">Contents</h2>
            <ol>
              ${steps.map((st, i) => `<li><a class="govuk-link" href="#step-${i + 1}">${esc(st.title)}</a></li>`).join('\n              ')}
            </ol>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="assets/js/govuk-frontend.js?v=3"></script>
  <script src="assets/js/icons.js?v=3"></script>
  <script src="assets/js/site.js?v=3"></script>
</body>
</html>
`
}

// ------------------------------------------------------------------ 3. PNGs (for Word)
async function writePngs (screens) {
  mkdir('exports/png')
  prune('exports/png', '.png', screens)
  let chromium
  try { chromium = require('playwright').chromium } catch (e) { chromium = require(path.join(process.env.PW || '', 'index.js')).chromium }
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
  const page = await browser.newPage({ deviceScaleFactor: 3 })
  const faces = [400, 500, 600, 700].map(w => `@font-face{font-family:Inter;font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(out(`assets/fonts/inter-latin-${w}-normal.woff2`)).toString('base64')}) format('woff2')}`).join('')
  for (const [id, sc] of screens) {
    await page.setContent(`<html><head><style>${faces} body{margin:0;background:transparent}</style></head><body>${render(sc, { title: false })}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const el = await page.$('svg')
    await el.screenshot({ path: out(`exports/png/${id}.png`), omitBackground: true })
  }
  await browser.close()
}

// ------------------------------------------------------------------ 4. Word
function pngSize (file) {
  const b = fs.readFileSync(file)
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), data: b }
}

function buildDocx () {
  const d = require('docx')
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, AlignmentType, ShadingType, LevelFormat, PageBreak, Footer, PageNumber } = d
  const NAVY = '003A69'
  const CORAL = 'C4412A'
  const FONT = 'Arial'

  const runs = (s, o = {}) => String(s).split(/(\*\*.+?\*\*)/).filter(Boolean).map(part => {
    const b = /^\*\*.+\*\*$/.test(part)
    return new TextRun({ text: b ? part.slice(2, -2) : part, bold: b || o.bold, color: o.color, size: o.size, italics: o.italics, font: FONT })
  })
  const P = (s, o = {}) => new Paragraph({ children: runs(s, o), spacing: { after: o.after ?? 120 }, ...(o.p || {}) })
  const H = (s, level) => new Paragraph({ heading: level, children: [new TextRun({ text: s, font: FONT })], spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 } })
  const bullet = (s, level = 0) => new Paragraph({ children: runs(s), numbering: { reference: 'bullets', level }, spacing: { after: 80 } })
  let listId = 0
  const numbered = items => {
    const ref = 'steps' + (++listId)
    numberingConfigs.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 320 } } } }] })
    const ps = []
    items.forEach(it => {
      if (typeof it === 'string') ps.push(new Paragraph({ children: runs(it), numbering: { reference: ref, level: 0 }, spacing: { after: 80 } }))
      else {
        ps.push(new Paragraph({ children: runs(it.text), numbering: { reference: ref, level: 0 }, spacing: { after: 80 } }))
        it.sub.forEach(x => ps.push(bullet(x, 1)))
      }
    })
    return ps
  }
  const callout = (s, fill, border) => new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9026, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill },
      borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 24, color: border } },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [P(s, { after: 0 })]
    })] })]
  })
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none }
  const screensTable = screens => {
    const cols = 3
    const colW = 3008
    const rows = []
    for (let i = 0; i < screens.length; i += cols) {
      const cells = []
      for (let j = 0; j < cols; j++) {
        const sc = screens[i + j]
        const children = []
        if (sc) {
          const img = pngSize(out(`exports/png/${sc.id}.png`))
          const wPx = 170
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: img.data, transformation: { width: wPx, height: Math.round(wPx * img.h / img.w) }, altText: { title: sc.id, description: sc.alt || sc.id, name: sc.id } })] }))
          children.push(new Paragraph({ spacing: { before: 60, after: 160 }, children: [
            new TextRun({ text: `${i + j + 1}. ${sc.device}. `, bold: true, size: 16, font: FONT, color: NAVY }),
            new TextRun({ text: sc.alt || '', size: 16, font: FONT, color: '444444' }),
            ...(sc.draft ? [new TextRun({ text: ' Draft: check on a device.', size: 16, font: FONT, color: CORAL, bold: true })] : [])
          ] }))
        } else children.push(new Paragraph({ children: [] }))
        cells.push(new TableCell({ width: { size: colW, type: WidthType.DXA }, borders: noBorders, verticalAlign: 'top', margins: { left: 60, right: 60 }, children }))
      }
      rows.push(new TableRow({ cantSplit: true, children: cells }))
    }
    return new Table({ width: { size: colW * cols, type: WidthType.DXA }, columnWidths: [colW, colW, colW], borders: noBorders, rows })
  }
  const stepBlock = (st, label) => {
    const ch = [H(`${label}: ${st.title}`, HeadingLevel.HEADING_3), P(`${st.time} · on ${st.device}`, { color: '555555', italics: true })]
    if (st.intro) ch.push(P(st.intro))
    ch.push(...numbered(st.items))
    ;(st.after || []).forEach(a => ch.push(P(a)))
    if (st.warn) ch.push(callout(st.warn, 'FFF1C9', 'E0A800'), P('', { after: 60 }))
    if (st.check) ch.push(callout(st.check, 'E6F7F1', '0B7A67'), P('', { after: 60 }))
    if (st.screens && st.screens.length) ch.push(screensTable(st.screens))
    return ch
  }

  const numberingConfigs = [{ reference: 'bullets', levels: [
    { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 280 } } } },
    { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 920, hanging: 280 } } } }
  ] }]

  const body = []
  // Title page
  body.push(new Paragraph({ children: [new TextRun({ text: 'The SMART Study', bold: true, color: CORAL, size: 28, font: FONT })], spacing: { after: 80 } }))
  body.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: G.intro.title, font: FONT })], spacing: { after: 200 } }))
  body.push(callout('**Editable draft, generated from the microsite content file.** Edit the words here freely. The phone pictures are images; the editable versions are the SVG files in assets/guides/screens (drag them into Figma, where the text stays editable).', 'EEF6FD', NAVY), P('', { after: 60 }))
  body.push(P(G.intro.lead))
  G.intro.text.forEach(t => body.push(P(t)))

  body.push(H('Before you start: four things to have ready', HeadingLevel.HEADING_2))
  G.intro.before.forEach(b => body.push(bullet(b)))
  body.push(callout(G.intro.beforeWarn, 'FDE7D3', CORAL), P('', { after: 60 }))

  body.push(H('Which route is yours?', HeadingLevel.HEADING_2))
  body.push(P('Find the row that matches the two phones in your household.'))
  const cw = [2600, 2600, 3826]
  const cell = (s, i, head) => new TableCell({ width: { size: cw[i], type: WidthType.DXA }, shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: NAVY } : undefined, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [P(s, { after: 0, color: head ? 'FFFFFF' : undefined, bold: head })] })
  const routeRows = [['iPhone', 'iPhone or iPad', '**Route A**: set up once, manage from your own phone'], ['iPhone', 'Android', '**Route B**: set up on your child\'s phone, locked with your code'], ['Android', 'Android or iPhone', '**Route C**: set up once, manage from your own phone']]
  body.push(new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: cw, rows: [
    new TableRow({ tableHeader: true, children: ['Your child\'s phone', 'Your phone', 'Your route'].map((s, i) => cell(s, i, true)) }),
    ...routeRows.map(r => new TableRow({ children: r.map((s, i) => cell(s, i)) }))
  ] }))
  body.push(P('', { after: 60 }))
  body.push(P(G.intro.moreDevices))
  body.push(P(G.intro.androidNote))

  // Routes
  G.routes.forEach(route => {
    body.push(new Paragraph({ children: [new PageBreak()] }))
    body.push(H(`Route ${route.id}: ${route.title}`, HeadingLevel.HEADING_1))
    body.push(P(route.lead))
    let n = 0
    route.steps.forEach(st => {
      n++
      if (st.shared) {
        const s = G.shared[route.os].find(x => x.key === st.shared)
        body.push(H(`Step ${n}: ${s.title}`, HeadingLevel.HEADING_3))
        body.push(P(`Go to **The settings we're asking you to apply → ${route.os === 'ios' ? 'iPhone' : 'Android with Family Link'}: ${s.title}**, below. Come back here when you're done.`))
      } else body.push(...stepBlock(st, `Step ${n}`))
    })
  })

  // Shared settings
  body.push(new Paragraph({ children: [new PageBreak()] }))
  body.push(H(G.sharedIntro.title, HeadingLevel.HEADING_1))
  body.push(P(G.sharedIntro.text[0]))
  body.push(H('The apps on the list', HeadingLevel.HEADING_2))
  body.push(P(G.allowlist.placeholder, { bold: true, color: CORAL }))
  const aw = [3000, 6026]
  body.push(new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: aw, rows: [
    new TableRow({ tableHeader: true, children: ['App', 'For'].map((s, i) => new TableCell({ width: { size: aw[i], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: NAVY }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [P(s, { after: 0, bold: true, color: 'FFFFFF' })] })) }),
    ...G.allowlist.apps.map(a => new TableRow({ children: [a.tbc ? `[${a.name}]` : a.name, a.for].map((s, i) => new TableCell({ width: { size: aw[i], type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [P(s, { after: 0 })] })) }))
  ] }))
  body.push(P('', { after: 60 }))
  body.push(H('The websites on the list', HeadingLevel.HEADING_2))
  body.push(P(G.allowlist.websites, { bold: true, color: CORAL }))
  G.sharedIntro.text.slice(1).forEach(t => body.push(P(t)))
  ;[['ios', 'iPhone'], ['android', 'Android with Family Link']].forEach(([os, name]) => {
    body.push(H(name, HeadingLevel.HEADING_2))
    G.shared[os].forEach(st => body.push(...stepBlock(st, name)))
  })
  body.push(H(G.intro.optional.title, HeadingLevel.HEADING_2))
  G.intro.optional.text.forEach(t => body.push(P(t)))

  // Review notes
  body.push(new Paragraph({ children: [new PageBreak()] }))
  body.push(H('Review notes for the team (delete before sending)', HeadingLevel.HEADING_1))
  body.push(P('Points found while checking the steps against the screenshots. Test each one on a real device before the pilot.'))
  const rw = [2400, 6626]
  body.push(new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: rw, rows: [
    new TableRow({ tableHeader: true, children: ['Area', 'Note'].map((s, i) => new TableCell({ width: { size: rw[i], type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: NAVY }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [P(s, { after: 0, bold: true, color: 'FFFFFF' })] })) }),
    ...G.review.map(r => new TableRow({ children: [r.area, r.note].map((s, i) => new TableCell({ width: { size: rw[i], type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [P(s, { after: 0, bold: i === 0 })] })) }))
  ] }))

  const doc = new Document({
    creator: 'PUBLIC',
    title: 'SMART Study: restrictions guidance',
    styles: {
      default: { document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { line: 276 } } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 48, bold: true, color: NAVY, font: FONT } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 34, bold: true, color: NAVY, font: FONT }, paragraph: { outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, color: NAVY, font: FONT }, paragraph: { outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: CORAL, font: FONT }, paragraph: { outlineLevel: 2, keepNext: true } }
      ]
    },
    numbering: { config: numberingConfigs },
    sections: [{
      properties: { page: { margin: { top: 1134, bottom: 1134, left: 1440, right: 1440 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'SMART Study · restrictions guidance · draft · page ', size: 16, color: '777777', font: FONT }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '777777', font: FONT })] })] }) },
      children: body
    }]
  })
  return Packer.toBuffer(doc)
}

// ------------------------------------------------------------------ 5. Figma boards
function figmaBoard (route) {
  const steps = stepsFor(route)
  const BW = 1800
  const scale = 0.62
  let y = 150
  let s = ''
  const t = (x, yy, str, size, weight, fill, anchor) => `<text x="${x}" y="${yy}" font-family="Inter" font-size="${size}" font-weight="${weight || 400}" fill="${fill || '#12263F'}"${anchor ? ` text-anchor="${anchor}"` : ''}>${esc(str)}</text>`
  const wrapLines = (str, size, maxW) => {
    const words = plain(str).split(/\s+/)
    const lines = []
    let line = ''
    for (const w of words) { const test = line ? line + ' ' + w : w; if (test.length * size * 0.52 > maxW && line) { lines.push(line); line = w } else line = test }
    if (line) lines.push(line)
    return lines
  }
  s += t(60, 70, 'The SMART Study · set-up guide', 20, 700, '#C4412A') + t(60, 118, `Route ${route.id}: ${route.title}`, 40, 800, '#003A69')
  steps.forEach((st, i) => {
    const top = y
    let ty = y + 40
    let text = `<circle cx="84" cy="${ty - 10}" r="22" fill="#FFC845"/>` + t(84, ty - 2, String(i + 1), 22, 800, '#003A69', 'middle')
    wrapLines(st.title, 26, 400).forEach(l => { text += t(120, ty, l, 26, 800, '#003A69'); ty += 32 })
    text += t(120, ty, `${st.time} · on ${st.device}`, 15, 400, '#4A5B70'); ty += 34
    const items = st.items.flatMap(it => typeof it === 'string' ? [it] : [it.text, ...it.sub.map(x => '– ' + x)])
    items.forEach((it, k) => {
      const lines = wrapLines(it, 16, 440)
      lines.forEach((l, li) => { text += t(li === 0 ? 60 : 84, ty, (li === 0 ? `${k + 1}. ` : '') + l, 16, 400); ty += 22 })
      ty += 8
    })
    ;[st.warn, st.check].filter(Boolean).forEach(c => {
      const lines = wrapLines(c, 14, 430)
      text += `<rect x="60" y="${ty - 8}" width="470" height="${lines.length * 20 + 20}" rx="12" fill="#FFF1C9"/>`
      lines.forEach(l => { ty += 20; text += t(76, ty, l, 14, 400) })
      ty += 30
    })
    let sx = 580
    let sh = 0
    ;(st.screens || []).forEach(sc => {
      const svg = render(sc, { title: false })
      const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/)
      const w = +m[1] * scale
      const h = +m[2] * scale
      if (sx + w > BW - 40) { sx = 580; y += sh + 30; sh = 0 }
      const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
      text += `<g transform="translate(${sx} ${y + 20}) scale(${scale})">${inner}</g>`
      sx += w + 24
      sh = Math.max(sh, h)
    })
    y = Math.max(ty, y + sh + 40) + 40
    s += `<rect x="30" y="${top}" width="${BW - 60}" height="${y - top - 30}" rx="24" fill="#FFFFFF"/>` + text
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${y}" width="${BW}" height="${y}"><rect width="${BW}" height="${y}" fill="#FFFAF3"/>${s}</svg>\n`
}

// ------------------------------------------------------------------ run
;(async () => {
  const screens = allScreens()
  writeSvgs(screens)
  G.routes.forEach(r => fs.writeFileSync(out(`${r.slug}.html`), pageHtml(r)))
  console.log(`${screens.size} screens, ${G.routes.length} pages`)
  mkdir('exports/figma')
  G.routes.forEach(r => fs.writeFileSync(out(`exports/figma/route-${r.id.toLowerCase()}.svg`), figmaBoard(r)))
  if (process.argv.includes('--no-export')) return
  await writePngs(screens)
  fs.writeFileSync(out('exports/SMART-restrictions-guidance.docx'), await buildDocx())
  console.log('Word document and PNGs written')
})().catch(e => { console.error(e); process.exit(1) })
