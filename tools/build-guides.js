/*
 * Builds the set-up guides from content/guidance.js:
 *
 *   assets/guides/screens/*.svg   one vector file per phone screen
 *   guide-iphone.html, guide-android.html
 *                                 the two guides on the microsite
 *   exports/png/*.png             sharp (3x) images of each screen, for the Word
 *                                 guidance (tools/build-docs.js), numbered in the
 *                                 order it places them (01-ios-settings-account.png)
 *   exports/figma/*.svg           one board per guide
 *
 * Run: npm run build:guides   (add --no-export to skip the PNGs)
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

// Step numbers by key, for [[step:key]]
const numbers = guide => new Map(guide.steps.map((st, i) => [st.key, i + 1]))

// Website text: **bold**, [links](#somewhere), emails, and [[step:key]] as a link to the step
function md (s, nums) {
  return esc(s)
    .replace(/\[\[step:(\w+)\]\]/g, (m, k) => nums && nums.has(k) ? `<a class="govuk-link" href="#step-${nums.get(k)}">Step ${nums.get(k)}</a>` : m)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a class="govuk-link" href="$2">$1</a>')
    .replace(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g, '<a class="govuk-link" href="mailto:$1">$1</a>')
}
// The same text for Word and Figma: [[step:key]] becomes "Step 3", links lose their address
const resolve = (s, nums) => String(s)
  .replace(/\[\[step:(\w+)\]\]/g, (m, k) => nums && nums.has(k) ? `Step ${nums.get(k)}` : m)
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
const plain = (s, nums) => resolve(s, nums).replace(/\*\*/g, '')
const icon = n => `<svg class="smart-icon" aria-hidden="true"><use href="#i-${n}"></use></svg>`

const stepsFor = guide => guide.steps

function allScreens () {
  const m = new Map()
  pngOrder().forEach(sc => { if (!m.has(sc.id)) m.set(sc.id, sc) })
  return m
}

// Screens in the order the Word guidance places them: the iPhone guide, then Android
function pngOrder () {
  const list = []
  G.guides.forEach(g => stepsFor(g).forEach(st => list.push(...(st.screens || []))))
  return list
}
function pngNames () {
  const ids = []
  pngOrder().forEach(sc => { if (!ids.includes(sc.id)) ids.push(sc.id) })
  const width = Math.max(2, String(ids.length).length)
  return new Map(ids.map((id, i) => [id, `${String(i + 1).padStart(width, '0')}-${id}`]))
}
const PNG = pngNames()
const pngFile = id => `exports/png/${PNG.get(id)}.png`

// ------------------------------------------------------------------ 1. SVG files
// Remove files whose names are no longer in the set (screens dropped from the content file, or renumbered)
function prune (dir, ext, names) {
  for (const f of fs.readdirSync(out(dir))) if (f.endsWith(ext) && !names.has(f.slice(0, -ext.length))) fs.unlinkSync(out(`${dir}/${f}`))
}

function writeSvgs (screens) {
  mkdir('assets/guides/screens')
  prune('assets/guides/screens', '.svg', screens)
  for (const [id, sc] of screens) fs.writeFileSync(out(`assets/guides/screens/${id}.svg`), render(sc) + '\n')
}

// A screen's SVG with its internal ids (clip paths, fades) made unique, so the same
// screen can appear more than once on a page or board. With shared ids, browsers
// and Figma use the first copy's clip, which can cut off another copy's edges.
let copies = 0
function screenSvg (sc, opts) {
  const k = `c${++copies}-`
  return render(sc, opts).replace(/id="([^"]+)"/g, `id="${k}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${k}$1)`)
}

// ------------------------------------------------------------------ 2. microsite pages
function screenFigure (sc, n, prefix) {
  const cap = `${prefix}${sc.id}-cap`
  const svg = screenSvg(sc).replace('<svg ', `<svg aria-labelledby="${cap}" `).replace(/<title>.*?<\/title>/, '')
  return `<figure class="smart-screen" role="listitem">${svg}<figcaption id="${cap}"><span class="smart-screen__n">${n}</span><span><strong>${esc(sc.device)}.</strong> ${esc(sc.alt || '')}</span></figcaption></figure>`
}

// What a step says, below its title
function stepBody (st, nums, prefix) {
  const items = (st.items || []).map(it => typeof it === 'string'
    ? `<li>${md(it, nums)}</li>`
    : `<li>${md(it.text, nums)}${it.sub && it.sub.length ? `<ul class="govuk-list govuk-list--bullet">${it.sub.map(x => `<li>${md(x, nums)}</li>`).join('')}</ul>` : ''}</li>`).join('')
  const screens = (st.screens || []).map((sc, j) => screenFigure(sc, j + 1, prefix)).join('')
  const d = G.allowlist.discretion
  return `
              ${st.intro ? `<p class="govuk-body">${md(st.intro, nums)}</p>` : ''}
              <ol class="govuk-list govuk-list--number smart-step__list">${items}</ol>
              ${(st.after || []).map(a => `<p class="govuk-body">${md(a, nums)}</p>`).join('')}
              ${st.list ? `<div class="smart-note smart-note--sky">
                <h4 class="govuk-heading-s">${icon('hand')} ${esc(d.title)}</h4>
                ${d.text.map(t => `<p class="govuk-body">${md(t, nums)}</p>`).join('')}
              </div>` : ''}
              ${st.warn ? `<div class="govuk-inset-text smart-inset-warn">${md(st.warn, nums)}</div>` : ''}
              ${st.check ? `<div class="smart-check">${icon('circle-check')}<p class="govuk-body govuk-!-margin-bottom-0">${md(st.check, nums)}</p></div>` : ''}
              ${screens ? `<p class="smart-screens__hint smart-no-print" aria-hidden="true">Swipe to see all ${st.screens.length} screens ${icon('arrow-right')}</p><div class="smart-screens" role="list" aria-label="What you'll see on the phone">${screens}</div>` : ''}`
}

// One step
function stepHtml (guide, i) {
  const nums = numbers(guide)
  const st = guide.steps[i]
  const n = i + 1
  const body = stepBody(st, nums, `s${n}-`)
  const skip = st.skip ? `<div class="smart-skip smart-no-print">
                <p class="govuk-body">${md(st.skip.text, nums)}</p>
                <a class="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" href="#step-${nums.get(st.skip.to)}" data-skip-to="step-${nums.get(st.skip.to)}">${icon('skip-forward')} ${esc(st.skip.button)}</a>
              </div>` : ''
  const already = st.already ? `<div class="smart-already">${icon('list-checks')}<p class="govuk-body govuk-!-margin-bottom-0">${md(st.already, nums)}</p></div>` : ''
  return `
            <li class="smart-step" id="step-${n}">
              <h3 class="govuk-heading-m">${esc(st.title)}</h3>
              <ul class="smart-step__meta">
                <li>${icon('clock')} ${esc(st.time)}</li>
                <li>${icon('smartphone')} On ${esc(st.device)}</li>
              </ul>
              ${skip}
              ${already}${body}
              ${`<p class="smart-step__skipped smart-no-print" hidden>Skipped, because it's already done or not needed. <button type="button" class="smart-link-button" data-unskip>Undo</button></p>
              <div class="govuk-checkboxes govuk-checkboxes--small smart-step__done smart-no-print"><div class="govuk-checkboxes__item"><input class="govuk-checkboxes__input" id="done-${n}" type="checkbox"><label class="govuk-label govuk-checkboxes__label" for="done-${n}">I've done this step</label></div></div>`}
            </li>`
}

const partKeys = guide => [...new Set(guide.steps.map(s => s.part))]

const head = (title, extra = '') => `<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <title>${esc(title)} – The SMART Study</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/site.css?v=5">
</head>
<!-- Generated by tools/build-guides.js from content/guidance.js. Edit the content file, not this page. -->
<body class="govuk-template__body" data-access="member" data-page="guides"${extra}>
`
const foot = `
  <script src="assets/js/govuk-frontend.js?v=4"></script>
  <script src="assets/js/icons.js?v=5"></script>
  <script src="assets/js/site.js?v=5"></script>
</body>
</html>
`
const breadcrumbs = `    <nav class="govuk-breadcrumbs smart-no-print" aria-label="Breadcrumb">
      <ol class="govuk-breadcrumbs__list">
        <li class="govuk-breadcrumbs__list-item"><a class="govuk-breadcrumbs__link" href="start.html">Start here</a></li>
        <li class="govuk-breadcrumbs__list-item"><a class="govuk-breadcrumbs__link" href="guides.html#set-up">Guides</a></li>
      </ol>
    </nav>`

function table (cols, rows, opts = {}) {
  return `<table class="govuk-table smart-table${opts.cls ? ' ' + opts.cls : ''}">
            ${opts.caption ? `<caption class="govuk-table__caption govuk-visually-hidden">${esc(opts.caption)}</caption>` : ''}
            <thead class="govuk-table__head"><tr class="govuk-table__row">${cols.map(c => `<th scope="col" class="govuk-table__header">${c}</th>`).join('')}</tr></thead>
            <tbody class="govuk-table__body">${rows.map(r => `<tr class="govuk-table__row">${r.map((c, i) => i === 0 && opts.rowHeads ? `<th scope="row" class="govuk-table__header">${c}</th>` : `<td class="govuk-table__cell" data-label="${esc(cols[i].replace(/<[^>]+>/g, ''))}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>`
}

// Under Part 1: one line, with a link to the longer explanation at the end of the page
function partOneNote (guide, nums) {
  const more = guide.compare || guide.shortcut
  return more ? `<p class="govuk-body"><a class="govuk-link" href="#compare">${esc(guide.partOneLink)}</a></p>` : ''
}

// At the end of the page: on iPhone, what changes if you skip Part 1; on Android, why you can't
function compareSection (guide, nums) {
  if (guide.compare) {
    const c = guide.compare
    return `<h2 class="govuk-heading-l" id="compare">${esc(c.title)}</h2>
          <p class="govuk-body">${md(c.text, nums)}</p>
          <div class="smart-table-wrap">${table(c.cols.map(x => esc(x)), c.rows.map(r => r.map(x => md(x, nums))), { rowHeads: true, cls: 'smart-table--compare', caption: c.title })}</div>
          <p class="govuk-body"><a class="govuk-link" href="#part-connect">Back to Part 1</a></p>`
  }
  if (guide.shortcut) {
    return `<h2 class="govuk-heading-l" id="compare">${esc(guide.shortcut.title)}</h2>
          ${guide.shortcut.text.map(t => `<p class="govuk-body">${md(t, nums)}</p>`).join('\n          ')}
          <p class="govuk-body"><a class="govuk-link" href="#part-connect">Back to Part 1</a></p>`
  }
  return ''
}

function pageHtml (guide) {
  const nums = numbers(guide)
  const other = G.guides.find(g => g !== guide)
  const sf = guide.startFrom
  const parts = partKeys(guide)
  const stepsByPart = parts.map(p => ({ p, idx: guide.steps.map((s, i) => s.part === p ? i : -1).filter(i => i >= 0) }))

  return head(`${guide.short} set-up guide`, ` data-guide="${guide.slug}"`) + `
  <div class="govuk-width-container">
${breadcrumbs}
    <main class="govuk-main-wrapper govuk-!-padding-top-0" id="main-content">
      <div class="smart-hero smart-hero--compact ${guide.hero}">
        <div>
          <span class="smart-hero__eyebrow">${icon('book-open')} Set-up guide</span>
          <h1 class="govuk-heading-xl">${esc(guide.title)}</h1>
          <p class="govuk-body-l">${md(guide.lead, nums)}</p>
        </div>
        <img src="assets/images/illustrations/${guide.illus}" alt="">
      </div>

      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          <ul class="smart-guide-meta">
            <li>${icon('clock')} ${esc(guide.time)}</li>
            <li class="smart-fresh">${icon('circle-check')} ${esc(guide.checked)}</li>
          </ul>

          <div class="govuk-button-group smart-no-print">
            <a href="#" class="govuk-button govuk-button--secondary" data-print>${icon('printer')} Print or save as PDF</a>
            <a href="#video" class="govuk-link">Prefer to watch? Jump to the video</a>
          </div>

          <p class="govuk-body">${md(G.intro.lead)}</p>
          ${G.intro.text.map(t => `<p class="govuk-body">${md(t)}</p>`).join('\n          ')}
          <p class="govuk-body smart-no-print">${md(G.intro.webOnly)}</p>
          <p class="govuk-body">Not an ${guide.os === 'ios' ? 'iPhone' : 'Android phone'}? <a class="govuk-link" href="${other.slug}.html">Go to the ${esc(other.short)} guide</a>.</p>

          <h2 class="govuk-heading-l" id="start-from">${esc(sf.title)}</h2>
          <p class="govuk-body">${md(sf.text, nums)}</p>
          ${table(['Where you are', 'Start at'], sf.rows.map(r => [md(r.have, nums), `<a class="govuk-link" href="#step-${nums.get(r.go)}"${nums.get(r.go) > 1 ? ` data-skip-to="step-${nums.get(r.go)}"` : ''}>Step ${nums.get(r.go)}: ${esc(guide.steps[nums.get(r.go) - 1].title)}</a>`]), { caption: sf.title })}
          <p class="govuk-body">${md(sf.after, nums)}</p>

          <div class="smart-note smart-note--peach" id="yourself">
            <h2 class="govuk-heading-m">${icon('hand')} ${esc(G.yourself.title)}</h2>
            ${G.yourself.text.map(t => `<p class="govuk-body">${md(t)}</p>`).join('\n            ')}
          </div>

          <h2 class="govuk-heading-l" id="before">Before you start: four things to have ready</h2>
          <ul class="govuk-list govuk-list--bullet govuk-list--spaced">${G.intro.before.map(b => `<li>${md(b)}</li>`).join('')}</ul>
          <div class="govuk-warning-text">
            <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong class="govuk-warning-text__text"><span class="govuk-visually-hidden">Warning</span>${md(G.intro.beforeWarn).replace(/<\/?strong>/g, '')}</strong>
          </div>
          <p class="govuk-body">${md(G.intro.moreDevices)}</p>
          ${guide.os === 'android' ? `<div class="govuk-inset-text">${md(G.intro.androidNote)}</div>` : ''}

          ${stepsByPart.map(({ p, idx }) => `<h2 class="govuk-heading-l smart-part" id="part-${p}">${esc(guide.parts[p].title)}</h2>
          <p class="govuk-body-l">${md(guide.parts[p].text, nums)}</p>
          ${p === 'connect' ? partOneNote(guide, nums) : ''}
          <ol class="smart-steps" style="counter-reset: step ${idx[0]}">${idx.map(i => stepHtml(guide, i)).join('')}
          </ol>`).join('\n\n          ')}

          <div class="govuk-panel govuk-panel--confirmation smart-no-print">
            <h2 class="govuk-panel__title govuk-!-font-size-36">${icon('party-popper')} That's it. Thank you!</h2>
            <div class="govuk-panel__body govuk-!-font-size-24">In about a week, we'll ask you to <a href="share-screen-time.html" style="color:#fff">share a screenshot</a> of your child's screen time.</div>
          </div>

          ${compareSection(guide, nums)}

          <h2 class="govuk-heading-m">${esc(G.intro.optional.title)}</h2>
          ${G.intro.optional.text.map(t => `<p class="govuk-body">${md(t)}</p>`).join('\n          ')}

          <h2 class="govuk-heading-l" id="video">Watch the whole guide</h2>
          <div id="guide-video" data-vimeo="${guide.video}" data-poster="assets/images/illustrations/${guide.illus}" data-title="Set-up guide video: ${esc(guide.short)}"></div>
          <p class="smart-video-meta">Subtitles available (press CC) · Placeholder video</p>

          <h2 class="govuk-heading-m govuk-!-margin-top-6">Something look different on your phone?</h2>
          <p class="govuk-body">Phones change after updates. If a step doesn't match what you see, <a class="govuk-link" href="help.html?guide=${guide.id}#report">tell us which step</a> and we'll help, and fix the guide for everyone.</p>
        </div>

        <div class="govuk-grid-column-one-third smart-no-print">
          <div class="smart-contents">
            <h2 class="govuk-heading-s govuk-!-margin-bottom-1">Your progress</h2>
            <div class="smart-progress" aria-hidden="true"><span></span></div>
            <p class="govuk-body-s" data-progress-text aria-live="polite"></p>
            <h2 class="govuk-heading-s">Contents</h2>
            <p class="govuk-body-s govuk-!-margin-bottom-2"><a class="govuk-link" href="#start-from">${esc(sf.title)}</a></p>
            ${stepsByPart.map(({ p, idx }) => `<p class="smart-contents__part">${esc(guide.parts[p].title.split(':')[0])}</p>
            <ol start="${idx[0] + 1}">
              ${idx.map(i => `<li><a class="govuk-link" href="#step-${i + 1}">${esc(guide.steps[i].title)}</a></li>`).join('\n              ')}
            </ol>`).join('\n            ')}
          </div>
        </div>
      </div>
    </main>
  </div>
` + foot
}

// ------------------------------------------------------------------ 3. PNGs (for Word)
async function writePngs (screens) {
  mkdir('exports/png')
  prune('exports/png', '.png', new Set(PNG.values()))
  let chromium
  try { chromium = require('playwright').chromium } catch (e) { chromium = require(path.join(process.env.PW || '', 'index.js')).chromium }
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
  const page = await browser.newPage({ deviceScaleFactor: 3 })
  const faces = [400, 500, 600, 700].map(w => `@font-face{font-family:Inter;font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(out(`assets/fonts/inter-latin-${w}-normal.woff2`)).toString('base64')}) format('woff2')}`).join('')
  for (const [id, sc] of screens) {
    await page.setContent(`<html><head><style>${faces} body{margin:0;background:transparent}</style></head><body>${render(sc, { title: false })}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const el = await page.$('svg')
    await el.screenshot({ path: out(pngFile(id)), omitBackground: true })
  }
  await browser.close()
}

// ------------------------------------------------------------------ 4. Figma boards
// `blocks` is a list of { label, step, nums }: one white card each
function figmaBoard (title, blocks) {
  const BW = 1800
  const scale = 0.62
  let y = 150
  let s = ''
  const t = (x, yy, str, size, weight, fill, anchor) => `<text x="${x}" y="${yy}" font-family="Inter" font-size="${size}" font-weight="${weight || 400}" fill="${fill || '#12263F'}"${anchor ? ` text-anchor="${anchor}"` : ''}>${esc(str)}</text>`
  const wrapLines = (str, size, maxW) => {
    const words = String(str).split(/\s+/)
    const lines = []
    let line = ''
    for (const w of words) { const test = line ? line + ' ' + w : w; if (test.length * size * 0.52 > maxW && line) { lines.push(line); line = w } else line = test }
    if (line) lines.push(line)
    return lines
  }
  s += t(60, 70, 'The SMART Study · set-up guide', 20, 700, '#C4412A') + t(60, 118, title, 40, 800, '#003A69')
  blocks.forEach(({ label, step: st, nums }) => {
    const p = x => plain(x, nums)
    const top = y
    let ty = y + 40
    let text = `<rect x="56" y="${ty - 34}" width="${Math.max(48, label.length * 13 + 24)}" height="44" rx="14" fill="#FFC845"/>` + t(68, ty - 4, label, 22, 800, '#003A69')
    ty += 22
    wrapLines(st.title, 26, 440).forEach(l => { text += t(60, ty + 18, l, 26, 800, '#003A69'); ty += 32 })
    ty += 14
    text += t(60, ty, `${st.time} · on ${st.device}`, 15, 400, '#4A5B70'); ty += 34
    const callout = (c, fill) => {
      const lines = wrapLines(p(c), 14, 430)
      text += `<rect x="60" y="${ty - 8}" width="470" height="${lines.length * 20 + 20}" rx="12" fill="${fill}"/>`
      lines.forEach(l => { ty += 20; text += t(76, ty, l, 14, 400) })
      ty += 30
    }
    if (st.skip) callout(st.skip.text, '#EEF6FD')
    if (st.already) callout(st.already, '#E6F7F1')
    if (st.intro) { wrapLines(p(st.intro), 16, 470).forEach(l => { text += t(60, ty, l, 16, 400); ty += 22 }); ty += 10 }
    ;(st.items || []).forEach((it, k) => {
      const main = typeof it === 'string' ? it : it.text
      wrapLines(p(main), 16, 440).forEach((l, li) => { text += t(li === 0 ? 60 : 84, ty, (li === 0 ? `${k + 1}. ` : '') + l, 16, 400); ty += 22 })
      ;((typeof it === 'string' ? [] : it.sub) || []).forEach(x => {
        ty += 4
        wrapLines(p(x), 15, 410).forEach((l, li) => { text += t(li === 0 ? 84 : 100, ty, (li === 0 ? '– ' : '') + l, 15, 400, '#33475F'); ty += 21 })
      })
      ty += 8
    })
    if (st.list) callout([G.allowlist.discretion.title + '.', ...G.allowlist.discretion.text].join(' '), '#EEF6FD')
    ;(st.after || []).forEach(a => { wrapLines(p(a), 15, 470).forEach(l => { text += t(60, ty, l, 15, 400, '#4A5B70'); ty += 21 }); ty += 8 })
    ;[st.warn, st.check].filter(Boolean).forEach(c => callout(c, '#FFF1C9'))
    let sx = 580
    let sh = 0
    ;(st.screens || []).forEach(sc => {
      const svg = screenSvg(sc, { title: false })
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

function guideBoard (guide) {
  const nums = numbers(guide)
  return figmaBoard(guide.title, stepsFor(guide).map((st, i) => ({ label: `Step ${i + 1}`, step: st, nums })))
}
// ------------------------------------------------------------------ run
;(async () => {
  const screens = allScreens()
  writeSvgs(screens)
  G.guides.forEach(g => fs.writeFileSync(out(`${g.slug}.html`), pageHtml(g)))
  console.log(`${screens.size} screens, ${G.guides.length} guides`)
  mkdir('exports/figma')
  G.guides.forEach(g => fs.writeFileSync(out(`exports/figma/${g.slug}.svg`), guideBoard(g)))
  if (process.argv.includes('--no-export')) return
  await writePngs(screens)
  console.log('PNGs written')
})().catch(e => { console.error(e); process.exit(1) })
