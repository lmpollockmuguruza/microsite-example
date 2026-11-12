/*
 * Builds the set-up guides from content/guidance.js:
 *
 *   assets/guides/screens/*.svg   one vector file per phone screen
 *   guide-iphone.html, guide-android.html
 *                                 the two guides on the microsite
 *   guide-versions.html           the versions of the "Block apps" step side by
 *                                 side, for the study team (not linked from the site)
 *   exports/png/*.png             sharp (3x) images of each screen, for Word,
 *                                 numbered in the order the Word documents
 *                                 place them (01-ios-settings-account.png)
 *   exports/SMART-restrictions-guidance.docx   the editable Word version
 *   exports/SMART-block-step-versions.docx     the versions, for the team
 *   exports/figma/*.svg           one board per guide and one of the versions
 *
 * Run: npm run build:guides   (add --no-export to skip the PNGs and Word)
 */
const fs = require('fs')
const path = require('path')
const { render } = require('./screens')
const G = require('../content/guidance')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const mkdir = p => fs.mkdirSync(out(p), { recursive: true })
const V = G.blockVersions

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

// A guide's steps, with one version of the "Block apps" step filled in
function stepsFor (guide, versionId = V.shown) {
  const v = V.versions.find(x => x.id === versionId)
  return guide.steps.map(st => {
    if (st.variants) return { ...st, ...v[guide.os], version: v }
    if (st.key === 'allow' && v[guide.os + 'Allow']) return { ...st, ...v[guide.os + 'Allow'], version: v }
    return st
  })
}

function allScreens () {
  const m = new Map()
  pngOrder().forEach(sc => { if (!m.has(sc.id)) m.set(sc.id, sc) })
  return m
}

// Screens in the order the Word documents place them: each guide as shown,
// then the screens only the other versions use.
function pngOrder () {
  const list = []
  G.guides.forEach(g => stepsFor(g).forEach(st => list.push(...(st.screens || []))))
  V.versions.forEach(v => G.guides.forEach(g => stepsFor(g, v.id).forEach(st => list.push(...(st.screens || [])))))
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

// ------------------------------------------------------------------ 2. microsite pages
function screenFigure (sc, n, prefix) {
  const cap = `${prefix}${sc.id}-cap`
  const svg = render(sc).replace('<svg ', `<svg aria-labelledby="${cap}" `).replace(/<title>.*?<\/title>/, '')
  return `<figure class="smart-screen" role="listitem">${svg}<figcaption id="${cap}"><span class="smart-screen__n">${n}</span><span><strong>${esc(sc.device)}.</strong> ${esc(sc.alt || '')}</span></figcaption></figure>`
}

function appChips () {
  return G.allowlist.apps.map(a => `<li class="smart-chip${a.tbc ? ' smart-chip--tbc' : ''}">${icon(a.icon)}${esc(a.name)}<span class="smart-chip__for">${esc(a.for)}</span></li>`).join('')
}

// What a step says, below its title: everything that can change between versions
function stepBody (st, nums, prefix) {
  const items = (st.items || []).map(it => typeof it === 'string'
    ? `<li>${md(it, nums)}</li>`
    : `<li>${md(it.text, nums)}${it.sub && it.sub.length ? `<ul class="govuk-list govuk-list--bullet">${it.sub.map(x => `<li>${md(x, nums)}</li>`).join('')}</ul>` : ''}</li>`).join('')
  const screens = (st.screens || []).map((sc, j) => screenFigure(sc, j + 1, prefix)).join('')
  const d = G.allowlist.discretion
  return `
              ${st.intro ? `<p class="govuk-body">${md(st.intro, nums)}</p>` : ''}
              ${st.list ? `<div class="smart-list">
                <h4 class="govuk-heading-s">The apps on the list</h4>
                <p class="govuk-body-s smart-list__tbc">${esc(G.allowlist.placeholder)}</p>
                <ul class="smart-chips smart-chips--list">${appChips()}</ul>
              </div>` : ''}
              ${st.sites ? `<div class="smart-list">
                <h4 class="govuk-heading-s">The websites on the list</h4>
                <p class="govuk-body govuk-!-margin-bottom-0">${esc(G.allowlist.websites)}</p>
              </div>` : ''}
              <ol class="govuk-list govuk-list--number smart-step__list">${items}</ol>
              ${(st.after || []).map(a => `<p class="govuk-body">${md(a, nums)}</p>`).join('')}
              ${st.list ? `<div class="smart-note smart-note--sky">
                <h4 class="govuk-heading-s">${icon('hand')} ${esc(d.title)}</h4>
                ${d.text.map(t => `<p class="govuk-body">${md(t, nums)}</p>`).join('')}
              </div>` : ''}
              ${st.warn ? `<div class="govuk-inset-text smart-inset-warn">${md(st.warn, nums)}</div>` : ''}
              ${st.check ? `<div class="smart-check">${icon('circle-check')}<p class="govuk-body govuk-!-margin-bottom-0">${md(st.check, nums)}</p></div>` : ''}
              ${screens ? `<div class="smart-screens" role="list" aria-label="What you'll see on the phone">${screens}</div>` : ''}`
}

// One step. On a guide page, a step that differs between versions holds every
// version, with all but the one shown hidden (site.js swaps them for ?version=).
function stepHtml (guide, i, opts = {}) {
  const nums = numbers(guide)
  const shown = opts.version || V.shown
  const st = stepsFor(guide, shown)[i]
  const n = i + 1
  let body = stepBody(st, nums, `s${n}-`)
  if (!opts.version) {
    const bodies = V.versions.map(v => ({ v, html: stepBody(stepsFor(guide, v.id)[i], nums, `s${n}-`) }))
    if (bodies.some(b => b.html !== body)) {
      body = V.versions.map(v => `
              <div class="smart-version" data-version="${v.id}"${v.id === shown ? '' : ' hidden'}>
                <p class="smart-version__tag">${icon('flask-conical')} Testing version ${v.id}: ${esc(v.name)}</p>${stepBody(stepsFor(guide, v.id)[i], nums, `s${n}-${v.id}-`)}
              </div>`).join('')
    }
  }
  const skip = st.skip && !opts.version ? `<div class="smart-skip smart-no-print">
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
              ${opts.version ? '' : `<p class="smart-step__skipped smart-no-print" hidden>Skipped, because it's already done or not needed. <button type="button" class="smart-link-button" data-unskip>Undo</button></p>
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
            <tbody class="govuk-table__body">${rows.map(r => `<tr class="govuk-table__row">${r.map((c, i) => i === 0 && opts.rowHeads ? `<th scope="row" class="govuk-table__header">${c}</th>` : `<td class="govuk-table__cell">${c}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>`
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

          <h2 class="govuk-heading-l" id="how">${esc(G.howItWorks.title)}</h2>
          ${G.howItWorks.text.map(t => `<p class="govuk-body">${md(t)}</p>`).join('\n          ')}

          ${guide.compare ? `<h2 class="govuk-heading-l" id="compare">${esc(guide.compare.title)}</h2>
          <p class="govuk-body">${md(guide.compare.text, nums)}</p>
          <div class="smart-table-wrap">${table(guide.compare.cols.map(c => esc(c)), guide.compare.rows.map(r => r.map(c => md(c, nums))), { rowHeads: true, cls: 'smart-table--compare', caption: guide.compare.title })}</div>
          <p class="govuk-body">${md(guide.compare.after, nums)}</p>` : ''}
          ${guide.shortcut ? `<h2 class="govuk-heading-l" id="compare">${esc(guide.shortcut.title)}</h2>
          ${guide.shortcut.text.map(t => `<p class="govuk-body">${md(t, nums)}</p>`).join('\n          ')}` : ''}

          ${stepsByPart.map(({ p, idx }) => `<h2 class="govuk-heading-l smart-part" id="part-${p}">${esc(guide.parts[p].title)}</h2>
          <p class="govuk-body-l">${md(guide.parts[p].text, nums)}</p>
          <ol class="smart-steps" style="counter-reset: step ${idx[0]}">${idx.map(i => stepHtml(guide, i)).join('')}
          </ol>`).join('\n\n          ')}

          <div class="govuk-panel govuk-panel--confirmation smart-no-print">
            <h2 class="govuk-panel__title govuk-!-font-size-36">${icon('party-popper')} That's it. Thank you!</h2>
            <div class="govuk-panel__body govuk-!-font-size-24">In about a week, we'll ask you to <a href="share-screen-time.html" style="color:#fff">share a screenshot</a> of your child's screen time.</div>
          </div>

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

// The team's page: every version of the "Block apps" step, side by side
function versionsHtml () {
  const sections = V.versions.map(v => {
    const blocks = G.guides.map(g => {
      const idx = g.steps.findIndex(s => s.key === V.step)
      const more = g.steps.findIndex(s => s.key === 'allow')
      const list = [idx]
      if (v[g.os + 'Allow']) list.push(more)
      return `<h3 class="govuk-heading-m">${esc(g.short)} <a class="govuk-link govuk-body-s" href="${g.slug}.html?version=${v.id}#step-${idx + 1}">Open it in the ${esc(g.short)} guide</a></h3>
          ${list.map(i => `<ol class="smart-steps" style="counter-reset: step ${i}">${stepHtml(g, i, { version: v.id })}</ol>`).join('\n          ')}`
    }).join('\n          ')
    return `<section class="smart-version-section" id="version-${v.id}" aria-labelledby="version-${v.id}-title">
          <h2 class="govuk-heading-l" id="version-${v.id}-title"><span class="smart-version-letter">${v.id}</span> ${esc(v.name)}${v.id === V.shown ? ' <strong class="govuk-tag govuk-tag--green">In the guides now</strong>' : ` <strong class="govuk-tag govuk-tag--grey">${esc(v.tag)}</strong>`}</h2>
          <dl class="govuk-summary-list">
            <div class="govuk-summary-list__row"><dt class="govuk-summary-list__key">What changes</dt><dd class="govuk-summary-list__value">${md(v.what)}</dd></div>
            <div class="govuk-summary-list__row"><dt class="govuk-summary-list__key">Ends with</dt><dd class="govuk-summary-list__value">${md(v.endState)}</dd></div>
            <div class="govuk-summary-list__row"><dt class="govuk-summary-list__key">Why try it</dt><dd class="govuk-summary-list__value">${md(v.why)}</dd></div>
            <div class="govuk-summary-list__row"><dt class="govuk-summary-list__key">Watch for</dt><dd class="govuk-summary-list__value">${md(v.watch)}</dd></div>
          </dl>
          ${blocks}
        </section>`
  }).join('\n\n        ')

  return head(V.title.replace(/"/g, '')) + `
  <div class="govuk-width-container">
${breadcrumbs}
    <main class="govuk-main-wrapper govuk-!-padding-top-0" id="main-content">
      <div class="smart-hero smart-hero--compact smart-hero--lemon">
        <div>
          <span class="smart-hero__eyebrow">${icon('flask-conical')} For the study team · not linked from the site</span>
          <h1 class="govuk-heading-xl">${esc(V.title)}</h1>
          <p class="govuk-body-l">${md(V.lead)}</p>
        </div>
      </div>
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-full">
          <p class="govuk-body">The guides show <strong>version ${V.shown}</strong>. To see another in context, add <code>?version=</code> and the letter to a guide's address, or use the links below. Everything else in the guides stays the same.</p>
          <div class="smart-table-wrap">${table(['Version', 'What changes', 'Ends with', 'Why try it', 'Watch for'], V.versions.map(v => [`<a class="govuk-link" href="#version-${v.id}"><strong>${v.id}</strong>: ${esc(v.name)}</a>`, md(v.what), md(v.endState), md(v.why), md(v.watch)]), { rowHeads: true, cls: 'smart-table--versions', caption: 'The versions' })}</div>
          <h2 class="govuk-heading-m">How we'd tell them apart</h2>
          <ul class="govuk-list govuk-list--bullet govuk-list--spaced">${V.measure.map(m => `<li>${md(m)}</li>`).join('')}</ul>
          <p class="govuk-body">Download: <a class="govuk-link" href="exports/SMART-block-step-versions.docx">all versions as a Word document</a> · <a class="govuk-link" href="exports/figma/block-step-versions.svg">Figma board</a></p>
        </div>
      </div>
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
        ${sections}
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

// ------------------------------------------------------------------ 4. Word
function pngSize (file) {
  const b = fs.readFileSync(file)
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), data: b }
}

// The building blocks both Word documents use
function docxKit () {
  const d = require('docx')
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, AlignmentType, ShadingType, LevelFormat, PageBreak, Footer, PageNumber } = d
  const NAVY = '003A69'
  const CORAL = 'C4412A'
  const FONT = 'Arial'
  const numberingConfigs = [{ reference: 'bullets', levels: [
    { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 280 } } } },
    { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 920, hanging: 280 } } } }
  ] }]

  const k = {}
  k.HeadingLevel = HeadingLevel
  k.NAVY = NAVY
  k.CORAL = CORAL
  k.runs = (s, o = {}) => resolve(s, o.nums).split(/(\*\*.+?\*\*)/).filter(Boolean).map(part => {
    const b = /^\*\*.+\*\*$/.test(part)
    return new TextRun({ text: b ? part.slice(2, -2) : part, bold: b || o.bold, color: o.color, size: o.size, italics: o.italics, font: FONT })
  })
  k.P = (s, o = {}) => new Paragraph({ children: k.runs(s, o), spacing: { after: o.after ?? 120 }, ...(o.p || {}) })
  k.H = (s, level) => new Paragraph({ heading: level, children: [new TextRun({ text: plain(s), font: FONT })], spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 } })
  k.space = () => k.P('', { after: 60 })
  k.pageBreak = () => new Paragraph({ children: [new PageBreak()] })
  k.bullet = (s, level = 0, nums) => new Paragraph({ children: k.runs(s, { nums }), numbering: { reference: 'bullets', level }, spacing: { after: 80 } })
  let listId = 0
  k.numbered = (items, nums) => {
    const ref = 'steps' + (++listId)
    numberingConfigs.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 320 } } } }] })
    const ps = []
    items.forEach(it => {
      const text = typeof it === 'string' ? it : it.text
      ps.push(new Paragraph({ children: k.runs(text, { nums }), numbering: { reference: ref, level: 0 }, spacing: { after: 80 } }))
      if (typeof it !== 'string') (it.sub || []).forEach(x => ps.push(k.bullet(x, 1, nums)))
    })
    return ps
  }
  // A shaded box with a coloured bar on the left. `s` is a string or a list of paragraphs' text.
  k.callout = (s, fill, border, nums) => new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9026, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill },
      borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 24, color: border } },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [].concat(s).map((x, i, a) => k.P(x, { after: i === a.length - 1 ? 0 : 100, nums }))
    })] })]
  })
  k.table = (cols, rows, widths, nums) => {
    const cell = (s, i, headCell) => new TableCell({ width: { size: widths[i], type: WidthType.DXA }, shading: headCell ? { type: ShadingType.CLEAR, color: 'auto', fill: NAVY } : undefined, margins: { top: 70, bottom: 70, left: 110, right: 110 }, children: [k.P(s, { after: 0, color: headCell ? 'FFFFFF' : undefined, bold: headCell, size: 20, nums })] })
    return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows: [
      new TableRow({ tableHeader: true, children: cols.map((s, i) => cell(s, i, true)) }),
      ...rows.map(r => new TableRow({ cantSplit: true, children: r.map((s, i) => cell(s, i)) }))
    ] })
  }
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none }
  k.screensTable = screens => {
    const cols = 3
    const colW = 3008
    const rows = []
    for (let i = 0; i < screens.length; i += cols) {
      const cells = []
      for (let j = 0; j < cols; j++) {
        const sc = screens[i + j]
        const children = []
        if (sc) {
          const img = pngSize(out(pngFile(sc.id)))
          const wPx = 170
          children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: img.data, transformation: { width: wPx, height: Math.round(wPx * img.h / img.w) }, altText: { title: sc.id, description: sc.alt || sc.id, name: sc.id } })] }))
          children.push(new Paragraph({ spacing: { before: 60, after: 160 }, children: [
            new TextRun({ text: `${i + j + 1}. ${sc.device}. `, bold: true, size: 16, font: FONT, color: NAVY }),
            new TextRun({ text: sc.alt || '', size: 16, font: FONT, color: '444444' })
          ] }))
        } else children.push(new Paragraph({ children: [] }))
        cells.push(new TableCell({ width: { size: colW, type: WidthType.DXA }, borders: noBorders, verticalAlign: 'top', margins: { left: 60, right: 60 }, children }))
      }
      rows.push(new TableRow({ cantSplit: true, children: cells }))
    }
    return new Table({ width: { size: colW * cols, type: WidthType.DXA }, columnWidths: [colW, colW, colW], borders: noBorders, rows })
  }
  k.appsTable = () => k.table(['App', 'For'], G.allowlist.apps.map(a => [a.tbc ? `[${a.name}]` : a.name, a.for]), [3000, 6026])
  k.stepBlock = (st, label, nums) => {
    const ch = [k.H(`${label}: ${st.title}`, HeadingLevel.HEADING_3), k.P(`${st.time} · on ${st.device}`, { color: '555555', italics: true })]
    if (st.skip) ch.push(k.callout(st.skip.text, 'EEF6FD', '1A5C9E', nums), k.space())
    if (st.already) ch.push(k.callout(st.already, 'E6F7F1', '0B7A67', nums), k.space())
    if (st.intro) ch.push(k.P(st.intro, { nums }))
    if (st.list) {
      ch.push(k.P('**The apps on the list**'), k.P(G.allowlist.placeholder, { bold: true, color: CORAL }), k.appsTable(), k.space())
    }
    if (st.sites) ch.push(k.P('**The websites on the list**'), k.P(G.allowlist.websites, { bold: true, color: CORAL }))
    ch.push(...k.numbered(st.items || [], nums))
    ;(st.after || []).forEach(a => ch.push(k.P(a, { nums })))
    if (st.list) {
      const d = G.allowlist.discretion
      ch.push(k.callout([`**${d.title}**`, ...d.text], 'EEF6FD', '1A5C9E', nums), k.space())
    }
    if (st.warn) ch.push(k.callout(st.warn, 'FFF1C9', 'E0A800', nums), k.space())
    if (st.check) ch.push(k.callout(st.check, 'E6F7F1', '0B7A67', nums), k.space())
    if (st.screens && st.screens.length) ch.push(k.screensTable(st.screens))
    return ch
  }
  k.pack = (title, footer, body) => Packer.toBuffer(new Document({
    creator: 'PUBLIC',
    title,
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
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${footer} · page `, size: 16, color: '777777', font: FONT }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '777777', font: FONT })] })] }) },
      children: body
    }]
  }))
  k.titleBlock = title => [
    new Paragraph({ children: [new TextRun({ text: 'The SMART Study', bold: true, color: CORAL, size: 28, font: FONT })], spacing: { after: 80 } }),
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title, font: FONT })], spacing: { after: 200 } })
  ]
  return k
}

function buildGuidanceDocx () {
  const k = docxKit()
  const { HeadingLevel } = k
  const body = [...k.titleBlock(G.intro.title)]
  body.push(k.P(G.intro.lead))
  G.intro.text.forEach(t => body.push(k.P(t)))

  body.push(k.H('Which guide is yours?', HeadingLevel.HEADING_2))
  body.push(k.P('It depends only on your child\'s phone. Your own phone can be anything.'))
  body.push(k.table(['Your child\'s phone', 'Your guide'], G.guides.map(g => [g.short, `**${g.title}**. ${g.time}.`]), [3000, 6026]))
  body.push(k.space())

  body.push(k.H(G.yourself.title, HeadingLevel.HEADING_2))
  body.push(k.callout(G.yourself.text, 'FDE7D3', k.CORAL), k.space())

  body.push(k.H('Before you start: four things to have ready', HeadingLevel.HEADING_2))
  G.intro.before.forEach(b => body.push(k.bullet(b)))
  body.push(k.callout(G.intro.beforeWarn, 'FDE7D3', k.CORAL), k.space())
  body.push(k.P(G.intro.moreDevices))

  body.push(k.H(G.howItWorks.title, HeadingLevel.HEADING_2))
  G.howItWorks.text.forEach(t => body.push(k.P(t)))

  G.guides.forEach(guide => {
    const nums = numbers(guide)
    const steps = stepsFor(guide)
    body.push(k.pageBreak())
    body.push(k.H(guide.title, HeadingLevel.HEADING_1))
    body.push(k.P(guide.lead, { nums }))
    body.push(k.P(`${guide.time}.`, { italics: true, color: '555555' }))
    if (guide.os === 'android') body.push(k.P(G.intro.androidNote))

    const sf = guide.startFrom
    body.push(k.H(sf.title, HeadingLevel.HEADING_2))
    body.push(k.P(sf.text))
    body.push(k.table(['Where you are', 'Start at'], sf.rows.map(r => [r.have, `**Step ${nums.get(r.go)}**: ${guide.steps[nums.get(r.go) - 1].title}`]), [5400, 3626], nums))
    body.push(k.space(), k.P(sf.after, { nums }))

    if (guide.compare) {
      const c = guide.compare
      body.push(k.H(c.title, HeadingLevel.HEADING_2))
      body.push(k.P(c.text, { nums }))
      body.push(k.table(c.cols, c.rows, [2600, 3213, 3213], nums))
      body.push(k.space(), k.P(c.after, { nums }))
    }
    if (guide.shortcut) {
      body.push(k.H(guide.shortcut.title, HeadingLevel.HEADING_2))
      guide.shortcut.text.forEach(t => body.push(k.P(t, { nums })))
    }

    partKeys(guide).forEach(p => {
      body.push(k.H(guide.parts[p].title, HeadingLevel.HEADING_2))
      body.push(k.P(guide.parts[p].text, { italics: true }))
      steps.forEach((st, i) => { if (st.part === p) body.push(...k.stepBlock(st, `Step ${i + 1}`, nums)) })
    })
  })

  body.push(k.H(G.intro.optional.title, HeadingLevel.HEADING_2))
  G.intro.optional.text.forEach(t => body.push(k.P(t)))
  return k.pack('SMART Study: setting up your child\'s phone', 'SMART Study · setting up your child\'s phone', body)
}

function buildVersionsDocx () {
  const k = docxKit()
  const { HeadingLevel } = k
  const body = [...k.titleBlock(V.title)]
  body.push(k.P(V.lead))
  body.push(k.P(`The guides on the website show **version ${V.shown}**. To see another in context, add ?version= and the letter to a guide's address, for example guide-iphone.html?version=C.`))
  body.push(k.table(['Version', 'What changes', 'Ends with', 'Why try it', 'Watch for'], V.versions.map(v => [`**${v.id}**: ${v.name}`, v.what, v.endState, v.why, v.watch]), [1500, 2200, 1300, 2000, 2026]))
  body.push(k.space())
  body.push(k.H('How we\'d tell them apart', HeadingLevel.HEADING_2))
  V.measure.forEach(m => body.push(k.bullet(m)))
  V.versions.forEach(v => {
    body.push(k.pageBreak())
    body.push(k.H(`Version ${v.id}: ${v.name}${v.id === V.shown ? ' (in the guides now)' : ''}`, HeadingLevel.HEADING_1))
    body.push(k.P(`**What changes.** ${v.what}`), k.P(`**Ends with.** ${v.endState}`), k.P(`**Why try it.** ${v.why}`), k.P(`**Watch for.** ${v.watch}`))
    G.guides.forEach(g => {
      const nums = numbers(g)
      body.push(k.H(g.short, HeadingLevel.HEADING_2))
      stepsFor(g, v.id).forEach((st, i) => { if (st.version) body.push(...k.stepBlock(st, `Step ${i + 1}`, nums)) })
    })
  })
  return k.pack('SMART Study: versions of the Block apps step', 'SMART Study · versions of the "Block apps" step (for the team)', body)
}

// ------------------------------------------------------------------ 5. Figma boards
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
    if (st.list) callout('Apps on the list: ' + G.allowlist.apps.map(a => a.name).join(', '), '#FFFAF3')
    const items = (st.items || []).flatMap(it => typeof it === 'string' ? [it] : [it.text, ...(it.sub || []).map(x => '– ' + x)])
    items.forEach((it, k) => {
      const lines = wrapLines(p(it), 16, 440)
      lines.forEach((l, li) => { text += t(li === 0 ? 60 : 84, ty, (li === 0 ? `${k + 1}. ` : '') + l, 16, 400); ty += 22 })
      ty += 8
    })
    ;(st.after || []).forEach(a => { wrapLines(p(a), 15, 470).forEach(l => { text += t(60, ty, l, 15, 400, '#4A5B70'); ty += 21 }); ty += 8 })
    ;[st.warn, st.check].filter(Boolean).forEach(c => callout(c, '#FFF1C9'))
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

function guideBoard (guide) {
  const nums = numbers(guide)
  return figmaBoard(guide.title, stepsFor(guide).map((st, i) => ({ label: `Step ${i + 1}`, step: st, nums })))
}
function versionsBoard () {
  const blocks = []
  V.versions.forEach(v => G.guides.forEach(g => {
    const nums = numbers(g)
    stepsFor(g, v.id).forEach((st, i) => { if (st.version) blocks.push({ label: `Version ${v.id} · ${g.short} · Step ${i + 1}`, step: st, nums }) })
  }))
  return figmaBoard(V.title, blocks)
}

// ------------------------------------------------------------------ run
;(async () => {
  const screens = allScreens()
  writeSvgs(screens)
  G.guides.forEach(g => fs.writeFileSync(out(`${g.slug}.html`), pageHtml(g)))
  fs.writeFileSync(out('guide-versions.html'), versionsHtml())
  console.log(`${screens.size} screens, ${G.guides.length} guides, ${V.versions.length} versions of the "Block apps" step`)
  mkdir('exports/figma')
  G.guides.forEach(g => fs.writeFileSync(out(`exports/figma/${g.slug}.svg`), guideBoard(g)))
  fs.writeFileSync(out('exports/figma/block-step-versions.svg'), versionsBoard())
  if (process.argv.includes('--no-export')) return
  await writePngs(screens)
  fs.writeFileSync(out('exports/SMART-restrictions-guidance.docx'), await buildGuidanceDocx())
  fs.writeFileSync(out('exports/SMART-block-step-versions.docx'), await buildVersionsDocx())
  console.log('Word documents and PNGs written')
})().catch(e => { console.error(e); process.exit(1) })
