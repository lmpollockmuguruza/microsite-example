/*
 * Builds "The Off-Grid Gang" comic from content/comic.js:
 *
 *   assets/comic/chapter-1/*.svg          one file per page (the site and Figma)
 *   exports/comic/chapter-1/*.png         2x images (newsletter emails, printing)
 *   exports/figma/comic-chapter-1.svg     all pages side by side, to drop into Figma
 *   newsletter.html                       the Newsletter tab (Issues and Nudges)
 *
 * Run: npm run build:comic
 */
const fs = require('fs')
const path = require('path')
const Cm = require('../content/comic')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const mkdir = p => fs.mkdirSync(out(p), { recursive: true })
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const icon = n => `<svg class="smart-icon" aria-hidden="true"><use href="#i-${n}"></use></svg>`

const FONTS = [['Bangers', 'bangers-latin-400-normal', 400], ['Comic Neue', 'comic-neue-latin-700-normal', 700], ['Comic Neue', 'comic-neue-latin-400-normal', 400]]
const fontFaces = base => FONTS.map(([n, file, w]) => `@font-face{font-family:'${n}';font-weight:${w};src:url(${base(file)}) format('woff2')}`).join('')

// Months the newsletter goes out (frequency TBC: monthly assumed)
const MONTHS = ['November 2026', 'December 2026', 'January 2027', 'February 2027', 'March 2027', 'April 2027', 'May 2027', 'June 2027', 'July 2027', 'September 2027', 'October 2027', 'November 2027']

function pageSvg (pg, i, { standalone } = {}) {
  let svg = Cm.renderPage(pg)
  // Unique ids per page, so several pages can sit inline on one web page
  svg = svg.replace(/id="(p\d+|dots|dotsLight|bitGlow|bitGlowDim|skyDay|skySunset|skyNight)"/g, `id="c${i}-$1"`).replace(/url\(#(p\d+|dots|dotsLight|bitGlow|bitGlowDim|skyDay|skySunset|skyNight)\)/g, `url(#c${i}-$1)`)
  if (standalone) svg = svg.replace('<defs>', `<style>${fontFaces(f => `../../fonts/${f}.woff2`)}</style><defs>`)
  return svg
}

async function writePngs () {
  mkdir('exports/comic/chapter-1')
  let chromium
  try { chromium = require('playwright').chromium } catch (e) { chromium = require(path.join(process.env.PW || '', 'index.js')).chromium }
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: Cm.W, height: Cm.H }, deviceScaleFactor: 2 })
  const faces = fontFaces(f => `data:font/woff2;base64,${fs.readFileSync(out(`assets/fonts/${f}.woff2`)).toString('base64')}`)
  for (const [i, pg] of Cm.pages.entries()) {
    await page.setContent(`<html><head><style>${faces} body{margin:0}</style></head><body>${pageSvg(pg, i)}</body></html>`)
    await page.evaluate(() => document.fonts.ready)
    await (await page.$('svg')).screenshot({ path: out(`exports/comic/chapter-1/${String(i).padStart(2, '0')}-${pg.id}.png`) })
  }
  await browser.close()
}

function figmaBoard () {
  const gap = 80
  const n = Cm.pages.length
  const BW = n * Cm.W + (n + 1) * gap
  const BH = Cm.H + gap * 2 + 60
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${BH}" width="${BW}" height="${BH}"><rect width="${BW}" height="${BH}" fill="#EDEDF2"/>`
  s += `<text x="${gap}" y="${gap}" font-family="Bangers" font-size="44" fill="#1B1B22">THE OFF-GRID GANG · CHAPTER 1</text>`
  Cm.pages.forEach((pg, i) => {
    const inner = pageSvg(pg, i).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
    s += `<g transform="translate(${gap + i * (Cm.W + gap)} ${gap + 50})">${inner}</g>`
    s += `<text x="${gap + i * (Cm.W + gap)}" y="${gap + 50 + Cm.H + 34}" font-family="Comic Neue" font-weight="700" font-size="22" fill="#1B1B22">${esc(pg.title)}</text>`
  })
  return s + '</svg>\n'
}

function newsletterHtml () {
  const reader = Cm.pages.map((pg, i) => {
    const svg = pageSvg(pg, i).replace('<svg ', `<svg role="img" aria-labelledby="comic-${i}-title" `).replace('<defs>', `<title id="comic-${i}-title">The Off-Grid Gang, chapter 1, ${esc(pg.title)}</title><defs>`)
    return `
              <section class="smart-comic__page${i === 0 ? '' : ' smart-hide'}" data-comic-page="${i}" aria-label="${esc(pg.title)}">
                <div class="smart-comic__art">${svg}</div>
                <a class="govuk-link smart-comic__zoom" href="assets/comic/chapter-1/${String(i).padStart(2, '0')}-${pg.id}.svg" target="_blank" rel="noopener">Open this page full size<span class="govuk-visually-hidden"> (opens in a new tab)</span></a>
                <details class="govuk-details smart-comic__text">
                  <summary class="govuk-details__summary"><span class="govuk-details__summary-text">Read this page as text</span></summary>
                  <div class="govuk-details__text">${pg.text.map(t => `<p class="govuk-body">${esc(t)}</p>`).join('')}</div>
                </details>
              </section>`
  }).join('')
  const chapters = MONTHS.map((m, i) => i === 0
    ? `<li class="smart-chapter smart-chapter--open"><span class="smart-chapter__n">1</span><span><strong>Six... Seven?!</strong><br>Out now</span></li>`
    : `<li class="smart-chapter"><span class="smart-chapter__n">${icon('lock')}</span><span><strong>Chapter ${i + 1}</strong><br>Unlocks with the ${m} newsletter</span></li>`).join('')
  const issues = MONTHS.map((m, i) => i === 0
    ? `<li class="smart-issue smart-issue--open"><span class="smart-issue__icon">${icon('mail')}</span><div><a class="govuk-link smart-issue__title" href="#">Issue 1: Welcome to the study</a><p class="govuk-body-s govuk-!-margin-bottom-0">${m} · 4-minute read · includes comic chapter 1</p></div></li>`
    : `<li class="smart-issue"><span class="smart-issue__icon">${icon('lock')}</span><div><span class="smart-issue__title">Issue ${i + 1}</span><p class="govuk-body-s govuk-!-margin-bottom-0">Coming in ${m}</p></div></li>`).join('')

  return `<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <title>Newsletter – The SMART Study</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/site.css?v=4">
</head>
<!-- Generated by tools/build-comic.js. Edit content/comic.js and the template in that script, not this page. -->
<body class="govuk-template__body" data-access="member" data-page="newsletter">

  <div class="govuk-width-container">
    <main class="govuk-main-wrapper govuk-!-padding-top-0" id="main-content">
      <div class="smart-hero smart-hero--compact smart-hero--lilac">
        <div>
          <span class="smart-hero__eyebrow">${icon('mail')} Once a month [frequency TBC]</span>
          <h1 class="govuk-heading-xl">Newsletter</h1>
          <p class="govuk-body-l">A short update for you each month, plus a comic to read with your child.</p>
        </div>
        <img src="assets/images/illustrations/videos.svg" alt="">
      </div>

      <div class="govuk-tabs" data-module="govuk-tabs">
        <h2 class="govuk-tabs__title">Newsletter</h2>
        <ul class="govuk-tabs__list">
          <li class="govuk-tabs__list-item govuk-tabs__list-item--selected"><a class="govuk-tabs__tab" href="#nudges">Nudges</a></li>
          <li class="govuk-tabs__list-item"><a class="govuk-tabs__tab" href="#issues">Issues</a></li>
        </ul>

        <div class="govuk-tabs__panel" id="nudges">
          <div class="govuk-grid-row">
            <div class="govuk-grid-column-two-thirds">
              <h2 class="govuk-heading-l">The Off-Grid Gang</h2>
              <p class="govuk-body-l">A comic to read with your child, aged 8 to 12. The story runs for 12 months, and every newsletter unlocks the next 3 pages.</p>
            </div>
          </div>

          <aside class="smart-design-note" data-decision="N1 N2 N3">
            <p><strong>A story that keeps going.</strong> The comic is a gentle, monthly reason for the whole family to come back, and the characters show children living well with fewer apps, or without a phone at all (Priya). Pages open with each newsletter, not with each family's compliance (see N1). The "6-7" jokes are 2025 slang and may feel dated by April 2027; they're easy to swap (N2).</p>
            <p>Every page is also an SVG in <code>assets/comic/chapter-1/</code> and a Figma board in <code>exports/figma/comic-chapter-1.svg</code>. The lettering stays editable in Figma (Bangers and Comic Neue).</p>
          </aside>

          <div class="smart-comic" data-comic>
            <div class="smart-comic__bar">
              <button type="button" class="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" data-comic-prev disabled>${icon('arrow-right').replace('smart-icon', 'smart-icon smart-icon--flip')}<span>Previous</span></button>
              <p class="smart-comic__count" aria-live="polite"><span data-comic-count>Rules of the game</span></p>
              <button type="button" class="govuk-button smart-button--coral govuk-!-margin-bottom-0" data-comic-next><span>Next page</span>${icon('arrow-right')}</button>
            </div>
            <div class="smart-comic__dots" aria-hidden="true">${Cm.pages.map((p, i) => `<span${i === 0 ? ' class="is-on"' : ''}></span>`).join('')}</div>
            ${reader}
          </div>

          <div class="smart-callout govuk-!-margin-top-6">
            <span class="smart-callout__icon">${icon('sparkles')}</span>
            <div>
              <p class="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">Did you spot Bit's lost pixel?</p>
              <p class="govuk-body">There's a tiny pink square hiding on every page. Have a look together.</p>
            </div>
          </div>

          <h3 class="govuk-heading-m">All chapters</h3>
          <ol class="smart-chapters-list">${chapters}</ol>

          <h3 class="govuk-heading-s">Print chapter 1</h3>
          <ul class="govuk-list">${Cm.pages.map((pg, i) => `<li><a class="govuk-link" href="exports/comic/chapter-1/${String(i).padStart(2, '0')}-${pg.id}.png" download>${esc(pg.title)}</a> (PNG)</li>`).join('')}</ul>
        </div>
        <div class="govuk-tabs__panel govuk-tabs__panel--hidden" id="issues">
          <h2 class="govuk-heading-l">Issues</h2>
          <p class="govuk-body">Every issue we send by email is also saved here, so you can catch up any time.</p>
          <ul class="smart-issues">${issues}</ul>
          <aside class="smart-design-note" data-decision="N4">
            <p><strong>Newsletter archive</strong> (from the tech spec). Each emailed issue is also published here. Frequency and sender (IFF or PUBLIC) are still to be agreed.</p>
          </aside>
        </div>

      </div>
    </main>
  </div>

  <script src="assets/js/govuk-frontend.js?v=4"></script>
  <script src="assets/js/icons.js?v=4"></script>
  <script src="assets/js/site.js?v=4"></script>
  <script>
    (function () {
      var root = document.querySelector('[data-comic]')
      if (!root) return
      var pages = root.querySelectorAll('[data-comic-page]')
      var dots = root.querySelectorAll('.smart-comic__dots span')
      var prev = root.querySelector('[data-comic-prev]')
      var next = root.querySelector('[data-comic-next]')
      var count = root.querySelector('[data-comic-count]')
      var i = 0
      function show (n) {
        i = Math.max(0, Math.min(pages.length - 1, n))
        pages.forEach(function (p, k) { p.classList.toggle('smart-hide', k !== i) })
        dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i) })
        prev.disabled = i === 0
        next.disabled = i === pages.length - 1
        count.textContent = i === 0 ? 'Rules of the game' : 'Page ' + i + ' of ' + (pages.length - 1)
      }
      prev.addEventListener('click', function () { show(i - 1); root.scrollIntoView({ block: 'start' }) })
      next.addEventListener('click', function () { show(i + 1); root.scrollIntoView({ block: 'start' }) })
      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') show(i + 1)
        if (e.key === 'ArrowLeft') show(i - 1)
      })
    })()
  </script>
</body>
</html>
`
}

;(async () => {
  mkdir('assets/comic/chapter-1')
  Cm.pages.forEach((pg, i) => fs.writeFileSync(out(`assets/comic/chapter-1/${String(i).padStart(2, '0')}-${pg.id}.svg`), pageSvg(pg, i, { standalone: true }) + '\n'))
  mkdir('exports/figma')
  fs.writeFileSync(out('exports/figma/comic-chapter-1.svg'), figmaBoard())
  fs.writeFileSync(out('newsletter.html'), newsletterHtml())
  console.log(`${Cm.pages.length} comic pages, newsletter page written`)
  if (process.argv.includes('--no-export')) return
  await writePngs()
  console.log('PNGs written')
})().catch(e => { console.error(e); process.exit(1) })
