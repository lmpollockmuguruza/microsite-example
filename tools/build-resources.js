/*
 * Builds the delay guide, the school e-posters and the schools page from
 * content/resources.js:
 *
 *   guide-delay.html                          the delay group's guide
 *   schools.html                              the school leaders' page
 *   exports/SMART-delay-guide.docx            one-page Word guide
 *   exports/figma/delay-guide.svg             A4 frame for Figma
 *   exports/posters/SMART-poster-*.docx|pdf|png   each e-poster
 *   exports/figma/poster-*.svg                each e-poster as an A4 frame
 *
 * Run: npm run build:resources
 */
const fs = require('fs')
const path = require('path')
const R = require('../content/resources')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const mkdir = p => fs.mkdirSync(out(p), { recursive: true })

const C = { navy: '#003A69', ink: '#12263F', grey: '#4A5B70', coral: '#C4412A', sun: '#FFC845', lemon: '#FFF1C9', mint: '#E6F7F1', mintDark: '#0B7A67', sky: '#EEF6FD', cream: '#FFFAF3', line: '#DFE5EC' }
const TINT = { lemon: C.lemon, mint: C.mint }

// ------------------------------------------------------------------ helpers
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const plain = s => String(s).replace(/\*\*/g, '')
function md (s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g, '<a class="govuk-link" href="mailto:$1">$1</a>')
}
const icon = n => `<svg class="smart-icon" aria-hidden="true"><use href="#i-${n}"></use></svg>`
const logoSvg = fs.readFileSync(out('assets/images/logo-mark.svg'), 'utf8')

// ------------------------------------------------------------------ SVG text layout (A4 frames for Figma)
// Widths are estimated, so lines are wrapped a little early to be safe.
function charW (ch, bold) {
  const k = bold ? 0.57 : 0.52
  if (/[ il.,:;'|!]/.test(ch)) return 0.55 * k
  if (/[mwMW@]/.test(ch)) return 1.45 * k
  if (/[A-Z0-9]/.test(ch)) return 1.18 * k
  return k
}
const textW = (s, size, bold) => [...String(s)].reduce((a, ch) => a + charW(ch, bold), 0) * size

// Lay out text with **bold** runs, wrapped to maxW. Returns { svg, h }.
function rich (x, y, s, o) {
  const size = o.size || 11
  const lh = o.lh || size * 1.4
  const font = o.font || 'Inter'
  const k = font === 'Nunito' ? 1.04 : 1
  // words; a word that follows a bold run with no space between (like "2028**.") is glued on
  const words = []
  let spaceBefore = true
  String(s).split(/(\*\*.+?\*\*)/).filter(Boolean).forEach(part => {
    const b = /^\*\*.+\*\*$/.test(part)
    const txt = b ? part.slice(2, -2) : part
    txt.split(/\s+/).filter(Boolean).forEach((w, i) => words.push({ w, b: b || !!o.bold, glue: i === 0 && !spaceBefore && !/^\s/.test(txt) }))
    spaceBefore = /\s$/.test(txt)
  })
  const lines = [[]]
  let lineW = 0
  const space = textW(' ', size, false) * k
  for (const wd of words) {
    const w = textW(wd.w, size, wd.b) * k
    const cur = lines[lines.length - 1]
    const gap = cur.length && !wd.glue ? space : 0
    if (cur.length && !wd.glue && lineW + gap + w > o.maxW) { lines.push([wd]); lineW = w; continue }
    lineW += gap + w
    cur.push(wd)
  }
  const anchor = o.anchor ? ` text-anchor="${o.anchor}"` : ''
  const weight = o.weight || 400
  let svg = ''
  lines.forEach((line, i) => {
    const spans = []
    line.forEach((wd, j) => {
      const last = spans[spans.length - 1]
      const t = (j && !wd.glue ? ' ' : '') + wd.w
      if (last && last.b === wd.b) last.t += t
      else spans.push({ b: wd.b, t })
    })
    svg += `<text x="${x}" y="${(y + size + i * lh).toFixed(1)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${o.fill || C.ink}"${o.italic ? ' font-style="italic"' : ''}${anchor} xml:space="preserve">` +
      spans.map(sp => sp.b && weight < 700 ? `<tspan font-weight="700">${esc(sp.t)}</tspan>` : esc(sp.t)).join('') + '</text>'
  })
  return { svg, h: lines.length * lh }
}

const rect = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y.toFixed(1)}" width="${w}" height="${h.toFixed(1)}" rx="${r}" fill="${fill}"${extra}/>`
const logoAt = (x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 48})">${logoSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</g>`
const svgDoc = (w, h, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${rect(0, 0, w, h, 0, bg)}${body}</svg>\n`

const A4 = { w: 595, h: 842 }

// The delay guide as an A4 frame
function delaySvg () {
  const d = R.delay
  const M = 44
  const W = A4.w - M * 2
  let y = 40
  let s = logoAt(M, y - 4, 26) + `<text x="${M + 34}" y="${y + 14}" font-family="Inter" font-size="10" font-weight="700" fill="${C.coral}" letter-spacing=".6">${esc(d.eyebrow.toUpperCase())}</text>`
  y += 38
  let t = rich(M, y, d.title, { size: 26, font: 'Nunito', weight: 900, fill: C.navy, maxW: W, lh: 30 }); s += t.svg; y += t.h + 6
  t = rich(M, y, d.lead, { size: 11.5, maxW: W, fill: C.grey }); s += t.svg; y += t.h + 14

  // the ask
  const askTop = y
  let inner = ''
  let iy = y + 16
  t = rich(M + 18, iy, d.ask.title, { size: 13, font: 'Nunito', weight: 800, fill: C.navy, maxW: W - 36 }); inner += t.svg; iy += t.h + 4
  t = rich(M + 18, iy, d.ask.text, { size: 13, maxW: W - 36 }); inner += t.svg; iy += t.h + 6
  t = rich(M + 18, iy, d.ask.still, { size: 10.5, maxW: W - 36, fill: C.grey }); inner += t.svg; iy += t.h + 6
  let cx = M + 18
  d.ask.chips.forEach(ch => {
    const cw = textW(ch.text, 9.5, false) + 22
    inner += rect(cx, iy, cw, 20, 10, '#FFFFFF') + `<text x="${cx + 11}" y="${iy + 13.5}" font-family="Inter" font-size="9.5" fill="${C.ink}">${esc(ch.text)}</text>`
    cx += cw + 6
  })
  iy += 20 + 16
  s += rect(M, askTop, W, iy - askTop, 14, C.lemon) + inner
  y = iy + 16

  t = rich(M, y, d.why.title, { size: 13, font: 'Nunito', weight: 800, fill: C.navy, maxW: W }); s += t.svg; y += t.h + 2
  t = rich(M, y, d.why.text, { size: 10, maxW: W }); s += t.svg; y += t.h + 12

  t = rich(M, y, d.tips.title, { size: 13, font: 'Nunito', weight: 800, fill: C.navy, maxW: W }); s += t.svg; y += t.h + 4
  d.tips.items.forEach((it, i) => {
    s += `<circle cx="${M + 9}" cy="${y + 9}" r="9" fill="${C.sun}"/><text x="${M + 9}" y="${y + 12.5}" font-family="Nunito" font-size="10" font-weight="900" fill="${C.navy}" text-anchor="middle">${i + 1}</text>`
    t = rich(M + 26, y, `**${it.title}** ${it.text}`, { size: 10, maxW: W - 26 }); s += t.svg; y += t.h + 4
    if (it.quote) {
      const q = rich(M + 38, y + 6, `"${it.quote}"`, { size: 9.5, maxW: W - 52, italic: true, fill: C.ink })
      s += rect(M + 26, y, W - 26, q.h + 12, 8, C.sky) + q.svg
      y += q.h + 16
    }
  })
  y += 8

  // two boxes side by side
  const bw = (W - 12) / 2
  const b1 = rich(M + 14, y + 12, `**${d.everyone.title}**`, { size: 10.5, maxW: bw - 28, fill: C.navy })
  const b1t = rich(M + 14, y + 12 + b1.h + 2, d.everyone.text, { size: 9.5, maxW: bw - 28 })
  const b2 = rich(M + bw + 26, y + 12, `**${d.gotOne.title}**`, { size: 10.5, maxW: bw - 28, fill: C.navy })
  const b2t = rich(M + bw + 26, y + 12 + b2.h + 2, d.gotOne.text, { size: 9.5, maxW: bw - 28 })
  const bh = Math.max(b1.h + b1t.h, b2.h + b2t.h) + 28
  s += rect(M, y, bw, bh, 12, C.mint) + b1.svg + b1t.svg + rect(M + bw + 12, y, bw, bh, 12, '#FDE7D3') + b2.svg + b2t.svg
  y += bh + 14

  t = rich(M, A4.h - 44, d.footer, { size: 8, maxW: W, fill: C.grey }); s += `<rect x="${M}" y="${A4.h - 50}" width="${W}" height="1" fill="${C.line}"/>` + t.svg
  return { svg: svgDoc(A4.w, A4.h, s, '#FFFFFF'), used: y }
}

// An e-poster as an A4 frame
function posterSvg (p, spare = 0, tight = false) {
  const gap = spare / 4
  const M = 40
  const W = A4.w - M * 2
  let s = ''
  // header band
  s += rect(0, 0, A4.w, 64, 0, C.navy)
  s += `<circle cx="${M + 18}" cy="32" r="20" fill="#FFFFFF"/>` + logoAt(M + 4, 18, 28)
  s += `<text x="${M + 48}" y="38" font-family="Nunito" font-size="17" font-weight="900" fill="#FFFFFF">The SMART Study</text>`
  s += `<text x="${A4.w - M}" y="37" font-family="Inter" font-size="10" font-weight="700" fill="${C.sun}" text-anchor="end" letter-spacing=".6">${esc(p.eyebrow.toUpperCase())}</text>`
  let y = 92
  let t = rich(M, y, p.headline, { size: tight ? 30 : 34, font: 'Nunito', weight: 900, fill: C.navy, maxW: W, lh: tight ? 34 : 38 }); s += t.svg; y += t.h + 12
  t = rich(M, y, p.intro, { size: 13, maxW: W, fill: C.ink, lh: 18.5 }); s += t.svg; y += t.h + 5
  t = rich(M, y, `– ${p.signoff}`, { size: 11.5, maxW: W, fill: C.grey, italic: true }); s += t.svg; y += t.h + 18 + gap

  t = rich(M, y, `**${p.plansTitle}**`, { size: 12.5, maxW: W, fill: C.navy }); s += t.svg; y += t.h + 9
  const n = p.plans.length
  const pw = (W - (n - 1) * 12) / n
  const blocks = p.plans.map((pl, i) => {
    const px = M + i * (pw + 12)
    const ti = rich(px + 18, y + 48, pl.title, { size: 17, font: 'Nunito', weight: 900, fill: C.navy, maxW: pw - 36, lh: 20 })
    const tx = rich(px + 18, y + 48 + ti.h + 5, pl.text, { size: 12.5, maxW: pw - 36, lh: 17.5 })
    return { px, ti, tx, h: 48 + ti.h + 5 + tx.h + 18, pl }
  })
  const ph = Math.max(...blocks.map(b => b.h))
  blocks.forEach(b => {
    s += rect(b.px, y, pw, ph, 16, TINT[b.pl.colour]) + `<circle cx="${b.px + 30}" cy="${y + 26}" r="14" fill="#FFFFFF"/>` + glyph(b.pl.icon, b.px + 21, y + 17, 18, C.navy) + b.ti.svg + b.tx.svg
  })
  y += ph + 8
  y += 18 + gap

  // steps + QR
  const qr = 104
  t = rich(M, y, p.stepsTitle, { size: 18, font: 'Nunito', weight: 900, fill: C.navy, maxW: W }); s += t.svg
  let sy = y + t.h + 10
  p.steps.forEach((st, i) => {
    s += `<circle cx="${M + 13}" cy="${sy + 12}" r="13" fill="${C.sun}"/><text x="${M + 13}" y="${sy + 17}" font-family="Nunito" font-size="14" font-weight="900" fill="${C.navy}" text-anchor="middle">${i + 1}</text>`
    const st1 = rich(M + 38, sy + 2, st, { size: 13, maxW: W - qr - 58, lh: 18 }); s += st1.svg; sy += Math.max(st1.h, 24) + 10
  })
  const qy = y + 4
  s += rect(A4.w - M - qr, qy, qr, qr, 10, '#FFFFFF', ` stroke="${C.navy}" stroke-width="1.5" stroke-dasharray="5 4"`) + `<text x="${A4.w - M - qr / 2}" y="${qy + qr / 2 + 4}" font-family="Inter" font-size="10" fill="${C.grey}" text-anchor="middle">[${esc(p.qr)}]</text>`
  y = Math.max(sy, qy + qr) + 18 + gap

  // children
  const ct = rich(M + 58, y + 15, `**${p.children.title}** ${p.children.text}`, { size: 13, maxW: W - 76, lh: 18 })
  const chh = Math.max(ct.h + 28, 54)
  s += rect(M, y, W, chh, 16, C.lemon) + `<circle cx="${M + 30}" cy="${y + chh / 2}" r="16" fill="${C.sun}"/>` + glyph('star', M + 21, y + chh / 2 - 9, 18, C.navy) + ct.svg
  y += chh

  // footer
  const f1 = rich(M, A4.h - 58, p.contact, { size: 10.5, maxW: W, fill: C.navy, bold: false })
  const f2 = rich(M, A4.h - 38, p.runBy, { size: 8.5, maxW: W, fill: C.grey })
  s += `<rect x="${M}" y="${A4.h - 68}" width="${W}" height="1" fill="${C.line}"/>` + f1.svg + f2.svg
  return { svg: svgDoc(A4.w, A4.h, s, C.cream), used: y }
}

// Lay the poster out, then again with the spare space shared between sections
function fitPoster (p) {
  const limit = A4.h - 96
  let tight = false
  let first = posterSvg(p)
  if (first.used > limit) { tight = true; first = posterSvg(p, 0, true) }
  return posterSvg(p, Math.min(Math.max(0, limit - first.used), 160), tight)
}

// Lucide glyphs for the poster (from the site's icon sprite)
const sprite = fs.readFileSync(out('assets/js/icons.js'), 'utf8')
function glyph (name, x, y, size, colour) {
  const m = sprite.match(new RegExp(`<symbol id="i-${name}" viewBox="0 0 24 24">(.*?)</symbol>`))
  if (!m) return ''
  return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${m[1]}</g>`
}

// ------------------------------------------------------------------ PNG and PDF (rendered from the SVG)
async function renderAll (jobs) {
  let chromium
  try { chromium = require('playwright').chromium } catch (e) { chromium = require(path.join(process.env.PW || '', 'index.js')).chromium }
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
  const page = await browser.newPage({ deviceScaleFactor: 3, viewport: { width: A4.w, height: A4.h } })
  const font = (fam, w, file) => `@font-face{font-family:${fam};font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(out(`assets/fonts/${file}`)).toString('base64')}) format('woff2')}`
  const faces = [400, 500, 600, 700].map(w => font('Inter', w, `inter-latin-${w}-normal.woff2`)).join('') +
    [400, 700, 800, 900].map(w => font('Nunito', w, `nunito-latin-${w}-normal.woff2`)).join('')
  const results = {}
  for (const job of jobs) {
    await page.setContent(`<html><head><style>${faces} html,body{margin:0;padding:0} svg{display:block;width:${job.w || A4.w}px;height:${job.h || A4.h}px}</style></head><body>${job.svg}</body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    if (job.png) await (await page.$('svg')).screenshot({ path: job.png })
    if (job.buffer) results[job.key] = await (await page.$('svg')).screenshot({ omitBackground: true })
    if (job.pdf) {
      await page.setContent(`<html><head><style>${faces} @page{size:A4;margin:0} html,body{margin:0;padding:0} svg{display:block;width:210mm;height:297mm}</style></head><body>${job.svg}</body></html>`, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.pdf({ path: job.pdf, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } })
    }
  }
  await browser.close()
  return results
}

// ------------------------------------------------------------------ Word
const d = require('docx')
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, AlignmentType, ShadingType, LevelFormat, VerticalAlign, Tab, TabStopType } = d
const FONT = 'Arial'
const hex = c => c.replace('#', '')
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none }
const runs = (s, o = {}) => String(s).split(/(\*\*.+?\*\*)/).filter(Boolean).map(part => {
  const b = /^\*\*.+\*\*$/.test(part)
  return new TextRun({ text: b ? part.slice(2, -2) : part, bold: b || o.bold, color: o.color ? hex(o.color) : undefined, size: o.size, italics: o.italics, font: o.font || FONT })
})
const P = (s, o = {}) => new Paragraph({ children: runs(s, o), spacing: { before: o.before || 0, after: o.after ?? 80, line: o.line }, alignment: o.align, keepNext: o.keepNext })
const cell = (children, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: hex(o.fill) } : undefined,
  borders: o.borders || { top: none, bottom: none, left: none, right: none },
  margins: { top: o.pad ?? 120, bottom: o.pad ?? 120, left: o.padX ?? 160, right: o.padX ?? 160 },
  verticalAlign: o.valign || VerticalAlign.TOP,
  children
})
const table = (widths, rows) => new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, borders: noBorders, rows })
const spacer = (after = 80) => new Paragraph({ children: [], spacing: { after } })
const logoRun = (buf, size) => new ImageRun({ type: 'png', data: buf, transformation: { width: size, height: size }, altText: { title: 'SMART Study logo', description: 'The SMART Study logo: a sun, a parent and a child', name: 'logo' } })

function docFor (children, margin) {
  return new Document({
    creator: 'PUBLIC',
    title: 'SMART Study',
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    numbering: { config: [{ reference: 'tips', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } }, run: { bold: true, color: hex(C.coral) } } }] }] },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: margin, bottom: margin, left: margin, right: margin } } }, children }]
  })
}

function delayDocx (logo) {
  const g = R.delay
  const TW = 11906 - 2 * 850
  const ch = []
  ch.push(new Paragraph({ children: [logoRun(logo, 26), new TextRun({ text: '  ' + g.eyebrow.toUpperCase(), bold: true, color: hex(C.coral), size: 18, font: FONT })], spacing: { after: 160 } }))
  ch.push(P(g.title, { size: 52, bold: true, color: C.navy, after: 80 }))
  ch.push(P(g.lead, { size: 23, color: C.grey, after: 220 }))
  ch.push(table([TW], [new TableRow({ children: [cell([
    P(g.ask.title, { size: 27, bold: true, color: C.navy, after: 60 }),
    P(g.ask.text, { size: 28, after: 80 }),
    P(g.ask.still + ' ' + g.ask.chips.map(c => c.text.replace(/^./, m => m.toLowerCase())).join('; ') + '.', { size: 21, color: C.grey, after: 0 })
  ], { w: TW, fill: C.lemon, pad: 220, padX: 260 })] })]))
  ch.push(spacer(200))
  ch.push(P(g.why.title, { size: 27, bold: true, color: C.navy, after: 40, keepNext: true }))
  ch.push(P(g.why.text, { size: 21, after: 220 }))
  ch.push(P(g.tips.title, { size: 27, bold: true, color: C.navy, after: 100, keepNext: true }))
  g.tips.items.forEach(it => {
    ch.push(new Paragraph({ children: [...runs(`**${it.title}** `, { size: 21 }), ...runs(it.text, { size: 21 })], numbering: { reference: 'tips', level: 0 }, spacing: { after: it.quote ? 60 : 110 } }))
    if (it.quote) {
      ch.push(new Table({ width: { size: TW - 360, type: WidthType.DXA }, columnWidths: [TW - 360], indent: { size: 360, type: WidthType.DXA }, borders: noBorders, rows: [new TableRow({ children: [cell([P(`"${it.quote}"`, { size: 20, italics: true, after: 0 })], { w: TW - 360, fill: C.sky, pad: 120, padX: 200 })] })] }))
      ch.push(spacer(110))
    }
  })
  ch.push(spacer(120))
  const half = (TW - 200) / 2
  ch.push(table([half, 200, half], [new TableRow({ children: [
    cell([P(g.everyone.title, { size: 22, bold: true, color: C.navy, after: 60 }), P(g.everyone.text, { size: 20, after: 0 })], { w: half, fill: C.mint, pad: 180, padX: 200 }),
    cell([P('')], { w: 200, padX: 0 }),
    cell([P(g.gotOne.title, { size: 22, bold: true, color: C.navy, after: 60 }), P(g.gotOne.text, { size: 20, after: 0 })], { w: half, fill: '#FDE7D3', pad: 180, padX: 200 })
  ] })]))
  ch.push(spacer(260))
  ch.push(P(g.footer, { size: 16, color: C.grey, after: 0 }))
  return Packer.toBuffer(docFor(ch, 850))
}

function posterDocx (p, logo) {
  const MG = 720
  const TW = 11906 - 2 * MG
  const ch = []
  ch.push(table([TW], [new TableRow({ children: [cell([
    new Paragraph({ children: [logoRun(logo, 30), new TextRun({ text: '  The SMART Study', bold: true, color: 'FFFFFF', size: 32, font: FONT }), new TextRun({ children: [new Tab(), p.eyebrow.toUpperCase()], bold: true, color: hex(C.sun), size: 18, font: FONT })], tabStops: [{ type: TabStopType.RIGHT, position: TW - 360 }], spacing: { after: 0 } })
  ], { w: TW, fill: C.navy, pad: 140, padX: 180, valign: VerticalAlign.CENTER })] })]))
  ch.push(spacer(300))
  ch.push(P(p.headline, { size: 64, bold: true, color: C.navy, after: 200 }))
  ch.push(P(p.intro, { size: 26, after: 100 }))
  ch.push(P(`– ${p.signoff}`, { size: 23, italics: true, color: C.grey, after: 360 }))
  ch.push(P(p.plansTitle, { size: 25, bold: true, color: C.navy, after: 140 }))
  const n = p.plans.length
  const gap = 200
  const pw = (TW - gap * (n - 1)) / n
  const cells = []
  p.plans.forEach((pl, i) => {
    if (i) cells.push(cell([P('')], { w: gap, padX: 0 }))
    cells.push(cell([P(pl.title, { size: 33, bold: true, color: C.navy, after: 100 }), P(pl.text, { size: 25, after: 0 })], { w: pw, fill: TINT[pl.colour], pad: 280, padX: 260 }))
  })
  ch.push(table(n === 1 ? [TW] : [pw, gap, pw], [new TableRow({ children: cells })]))
  ch.push(spacer(400))
  const qrW = 2300
  const lw = TW - qrW - 200
  ch.push(table([lw, 200, qrW], [new TableRow({ children: [
    cell([P(p.stepsTitle, { size: 33, bold: true, color: C.navy, after: 160 }), ...p.steps.map((st, i) => new Paragraph({ children: [new TextRun({ text: `${i + 1}   `, bold: true, color: hex(C.coral), size: 30, font: FONT }), ...runs(st, { size: 26 })], spacing: { after: 160 } }))], { w: lw, padX: 0, pad: 0 }),
    cell([P('')], { w: 200, padX: 0 }),
    cell([P(`[${p.qr}]`, { size: 18, color: C.grey, align: AlignmentType.CENTER, after: 0 })], { w: qrW, valign: VerticalAlign.CENTER, pad: 820, borders: { top: { style: BorderStyle.DASHED, size: 8, color: hex(C.navy) }, bottom: { style: BorderStyle.DASHED, size: 8, color: hex(C.navy) }, left: { style: BorderStyle.DASHED, size: 8, color: hex(C.navy) }, right: { style: BorderStyle.DASHED, size: 8, color: hex(C.navy) } } })
  ] })]))
  ch.push(spacer(400))
  ch.push(table([TW], [new TableRow({ children: [cell([P(`**${p.children.title}** ${p.children.text}`, { size: 27, after: 0 })], { w: TW, fill: C.lemon, pad: 280, padX: 280 })] })]))
  ch.push(spacer(500))
  ch.push(P(p.contact, { size: 22, color: C.navy, after: 60 }))
  ch.push(P(p.runBy, { size: 17, color: C.grey, after: 0 }))
  return Packer.toBuffer(docFor(ch, MG))
}

// ------------------------------------------------------------------ microsite pages
function shell ({ title, access, page, onlyFor, body }) {
  return `<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <title>${esc(title)} – The SMART Study</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/site.css?v=3">
</head>
<!-- Generated by tools/build-resources.js from content/resources.js. Edit the content file, not this page. -->
<body class="govuk-template__body" data-access="${access}" data-page="${page}"${onlyFor ? ` data-only-for="${onlyFor}"` : ''}>
${body}
  <script src="assets/js/govuk-frontend.js?v=3"></script>
  <script src="assets/js/icons.js?v=3"></script>
  <script src="assets/js/site.js?v=3"></script>
</body>
</html>
`
}

function delayPage () {
  const g = R.delay
  const tips = g.tips.items.map(it => `
              <li id="${it.id}"><strong>${esc(it.title)}</strong> ${md(it.text)}${it.quote ? `<div class="govuk-inset-text smart-inset-friendly">"${esc(it.quote)}"</div>` : ''}${it.id === 'talking' ? `<p class="govuk-body">${md(g.video).replace('a 3-minute video about the study', '<a class="govuk-link" href="videos.html#children">a 3-minute video about the study</a>')}</p>` : ''}</li>`).join('')
  return shell({ title: g.title, access: 'member', page: 'guides', onlyFor: 'delay', body: `
  <div class="govuk-width-container">
    <nav class="govuk-breadcrumbs smart-no-print" aria-label="Breadcrumb">
      <ol class="govuk-breadcrumbs__list">
        <li class="govuk-breadcrumbs__list-item"><a class="govuk-breadcrumbs__link" href="start.html">Start here</a></li>
        <li class="govuk-breadcrumbs__list-item"><a class="govuk-breadcrumbs__link" href="guides.html">Guides</a></li>
      </ol>
    </nav>
    <main class="govuk-main-wrapper govuk-!-padding-top-0" id="main-content">
      <div class="smart-hero smart-hero--compact smart-hero--lemon">
        <div>
          <span class="smart-hero__eyebrow">${icon('book-open')} Guide for families</span>
          <h1 class="govuk-heading-xl">${esc(g.title)}</h1>
          <p class="govuk-body-l">${md(g.lead)}</p>
        </div>
        <img src="assets/images/illustrations/guide-delay.svg" alt="">
      </div>
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          <ul class="smart-guide-meta">
            <li>${icon('clock')} About 5 minutes to read</li>
            <li>${icon('book-open')} One page</li>
          </ul>
          <div class="govuk-button-group smart-no-print">
            <a href="#" class="govuk-button govuk-button--secondary" data-print>${icon('printer')} Print or save as PDF</a>
            <a class="govuk-link" href="exports/SMART-delay-guide.docx" download>Download the one-page guide (Word)</a>
          </div>

          <h2 class="govuk-heading-l" id="asking">${esc(g.ask.title)}</h2>
          <div class="smart-box">
            <p class="govuk-body-l">${md(g.ask.text)}</p>
            <p class="govuk-body">${esc(g.ask.still)}</p>
            <ul class="smart-chips">${g.ask.chips.map(c => `<li class="smart-chip">${icon(c.icon)}${esc(c.text)}</li>`).join('')}</ul>
          </div>

          <h2 class="govuk-heading-l" id="why">${esc(g.why.title)}</h2>
          <p class="govuk-body">${md(g.why.text)}</p>

          <h2 class="govuk-heading-l" id="tips">${esc(g.tips.title)}</h2>
          <ol class="govuk-list govuk-list--number govuk-list--spaced">${tips}
          </ol>

          <h2 class="govuk-heading-m">${esc(g.everyone.title)}</h2>
          <p class="govuk-body">${md(g.everyone.text)}</p>

          <h2 class="govuk-heading-m">${esc(g.gotOne.title)}</h2>
          <p class="govuk-body">${md(g.gotOne.text)}</p>
        </div>
      </div>
    </main>
  </div>
` })
}

function schoolsPage () {
  const cards = R.posters.map(p => `
            <li class="smart-poster">
              <a href="exports/posters/SMART-poster-${p.id}.pdf"><img src="exports/posters/SMART-poster-${p.id}.png" alt="E-poster: ${esc(plain(p.headline))}" loading="lazy"></a>
              <div>
                <h3 class="govuk-heading-s govuk-!-margin-bottom-1">${esc(p.name)}</h3>
                <p class="govuk-body-s">${esc(p.use)}</p>
                <ul class="govuk-list govuk-body-s smart-downloads">
                  <li><a class="govuk-link" href="exports/posters/SMART-poster-${p.id}.pdf" download>${icon('printer')} PDF, to print</a></li>
                  <li><a class="govuk-link" href="exports/posters/SMART-poster-${p.id}.png" download>${icon('image')} Image, for screens and newsletters</a></li>
                  <li><a class="govuk-link" href="exports/posters/SMART-poster-${p.id}.docx" download>${icon('file-text')} Word, to add your school's details</a></li>
                </ul>
              </div>
            </li>`).join('')
  return shell({ title: 'School resources', access: 'school', page: 'schools', body: `
  <div class="govuk-width-container">
    <main class="govuk-main-wrapper" id="main-content">
      <div class="smart-hero smart-hero--compact">
        <div>
          <span class="smart-hero__eyebrow">${icon('school')} For school leaders</span>
          <h1 class="govuk-heading-xl">School resources</h1>
          <p class="govuk-body-l">Everything your school needs for the SMART Study, in one place.</p>
        </div>
        <img src="assets/images/illustrations/school.svg" alt="">
      </div>
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          <h2 class="govuk-heading-l" id="onboarding">Onboarding pack</h2>
          <div class="smart-box">
            <p class="govuk-body"><strong>School onboarding pack</strong></p>
            <p class="govuk-body">What the study involves, the key dates, and what we'll ask of you and your staff.</p>
            <p class="govuk-body govuk-!-margin-bottom-0"><strong class="govuk-tag govuk-tag--grey">Coming soon</strong> We'll email you when it's ready to download.</p>
          </div>

          <h2 class="govuk-heading-l" id="posters">E-posters</h2>
          <p class="govuk-body">Print them, show them on screens, or send them with your newsletter. Your onboarding pack says which poster to use. Before you share one, add your school's details: the Word version can be edited.</p>
          <ul class="smart-posters">${cards}
          </ul>

          <h3 class="govuk-heading-m">Tips for sharing</h3>
          <ul class="govuk-list govuk-list--bullet">${R.sharingTips.map(t => `<li>${md(t)}</li>`).join('')}</ul>

          <details class="govuk-details">
            <summary class="govuk-details__summary"><span class="govuk-details__summary-text">Why the posters are worded the way they are</span></summary>
            <div class="govuk-details__text">
              <p class="govuk-body">Each poster is written so that it encourages families, rather than putting them off. If you change the wording, please keep to these:</p>
              <ul class="govuk-list govuk-list--bullet">${R.posterPrinciples.map(p => `<li><strong>${esc(p.title)}.</strong> ${md(p.text)}</li>`).join('')}</ul>
            </div>
          </details>

          <h2 class="govuk-heading-l" id="contact">Contact us</h2>
          <p class="govuk-body">Email <a class="govuk-link" href="mailto:${R.EMAIL}">${R.EMAIL}</a>. We reply within 5 working days.</p>
        </div>
      </div>
    </main>
  </div>
` })
}

// ------------------------------------------------------------------ run
;(async () => {
  mkdir('exports/figma')
  mkdir('exports/posters')
  const delay = delaySvg()
  fs.writeFileSync(out('exports/figma/delay-guide.svg'), delay.svg)
  if (delay.used > A4.h - 56) console.warn(`Delay guide frame is too full (${Math.round(delay.used)}px)`)
  const posterSvgs = R.posters.map(p => {
    const r = fitPoster(p)
    if (r.used > A4.h - 74) console.warn(`Poster ${p.id} is too full (${Math.round(r.used)}px)`)
    fs.writeFileSync(out(`exports/figma/poster-${p.id}.svg`), r.svg)
    return { p, svg: r.svg }
  })
  fs.writeFileSync(out('guide-delay.html'), delayPage())
  fs.writeFileSync(out('schools.html'), schoolsPage())
  console.log(`delay guide, ${posterSvgs.length} posters, 2 pages`)
  if (process.argv.includes('--no-export')) return
  const r = await renderAll([
    { key: 'logo', svg: logoSvg.replace('width="48" height="48"', 'width="192" height="192"'), w: 192, h: 192, buffer: true },
    ...posterSvgs.map(({ p, svg }) => ({ svg, png: out(`exports/posters/SMART-poster-${p.id}.png`), pdf: out(`exports/posters/SMART-poster-${p.id}.pdf`) }))
  ])
  fs.writeFileSync(out('exports/SMART-delay-guide.docx'), await delayDocx(r.logo))
  for (const { p } of posterSvgs) fs.writeFileSync(out(`exports/posters/SMART-poster-${p.id}.docx`), await posterDocx(p, r.logo))
  console.log('Word documents, PDFs and PNGs written')
})().catch(e => { console.error(e); process.exit(1) })
