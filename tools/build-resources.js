/*
 * Builds the delay guide, the school e-posters and the schools page from
 * content/resources.js:
 *
 *   guide-delay.html                          the guide for families whose child has no phone yet
 *   schools.html                              the school leaders' page
 *   exports/posters/SMART-poster-*.docx|pdf|png   each e-poster
 *   exports/figma/poster-*.svg                each e-poster as an A4 frame
 *   exports/invitations/SMART-invitation-*.docx|pdf|png   each invitation to take part
 *   exports/figma/invitation-*.svg            each invitation as an A4 frame
 *
 * The onboarding packs and the guidance for parents are built by tools/build-docs.js
 * (npm run build:docs); run it first, so the schools page shows their page counts.
 *
 * Run: npm run build:resources
 */
const fs = require('fs')
const path = require('path')
const R = require('../content/resources')
const PACKS = require('../content/onboarding').packs

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const mkdir = p => fs.mkdirSync(out(p), { recursive: true })

const C = { navy: '#003A69', ink: '#12263F', grey: '#4A5B70', coral: '#C4412A', sun: '#FFC845', lemon: '#FFF1C9', mint: '#E6F7F1', mintDark: '#0B7A67', sky: '#EEF6FD', cream: '#FFFAF3', line: '#DFE5EC', link: '#1A5C9E' }
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
  String(s).split(/(\*\*.+?\*\*|\[[^\]]+\]\(https?:[^)]+\))/).filter(Boolean).forEach(part => {
    const b = /^\*\*.+\*\*$/.test(part)
    const link = !b && /^\[[^\]]+\]\(https?:/.test(part)
    const txt = b ? part.slice(2, -2) : link ? part.slice(1, part.indexOf('](')) : part
    txt.split(/\s+/).filter(Boolean).forEach((w, i) => words.push({ w, b: b || !!o.bold, l: link, glue: i === 0 && !spaceBefore && !/^\s/.test(txt) }))
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
      if (last && last.b === wd.b && last.l === wd.l) last.t += t
      else if (wd.l && t[0] === ' ') {
        // keep the space before a link out of its underline
        if (last && !last.l) last.t += ' '
        else spans.push({ b: false, l: false, t: ' ' })
        spans.push({ b: wd.b, l: true, t: t.slice(1) })
      } else spans.push({ b: wd.b, l: wd.l, t })
    })
    svg += `<text x="${x}" y="${(y + size + i * lh).toFixed(1)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${o.fill || C.ink}"${o.italic ? ' font-style="italic"' : ''}${anchor} xml:space="preserve">` +
      spans.map(sp => sp.l ? `<tspan fill="${C.link}" text-decoration="underline">${esc(sp.t)}</tspan>` : sp.b && weight < 700 ? `<tspan font-weight="700">${esc(sp.t)}</tspan>` : esc(sp.t)).join('') + '</text>'
  })
  return { svg, h: lines.length * lh }
}

const rect = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y.toFixed(1)}" width="${w}" height="${h.toFixed(1)}" rx="${r}" fill="${fill}"${extra}/>`
const logoAt = (x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 48})">${logoSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</g>`
const svgDoc = (w, h, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${rect(0, 0, w, h, 0, bg)}${body}</svg>\n`

const A4 = { w: 595, h: 842 }

// The delay guide as an A4 frame

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

// An invitation to take part as an A4 frame. `spare` is shared out between
// the sections once we know how much room is left.
const TILE_TINTS = [C.mint, '#FDE7D3', '#EFEAFD', C.lemon]
function invitationSvg (v, spare = 0) {
  const gap = spare / 5
  const M = 40
  const W = A4.w - M * 2
  let s = ''
  // header band
  s += rect(0, 0, A4.w, 64, 0, C.navy)
  s += `<circle cx="${M + 18}" cy="32" r="20" fill="#FFFFFF"/>` + logoAt(M + 4, 18, 28)
  s += `<text x="${M + 48}" y="38" font-family="Nunito" font-size="17" font-weight="900" fill="#FFFFFF">The SMART Study</text>`
  s += `<text x="${A4.w - M}" y="37" font-family="Inter" font-size="9.5" font-weight="700" fill="${C.sun}" text-anchor="end" letter-spacing=".6">${esc(v.eyebrow.toUpperCase())}</text>`
  let y = 86
  let t = rich(M, y, v.headline, { size: 25, font: 'Nunito', weight: 900, fill: C.navy, maxW: W, lh: 29 }); s += t.svg; y += t.h + 8
  t = rich(M, y, v.intro, { size: 11, maxW: W, lh: 15.5 }); s += t.svg; y += t.h + 12 + gap

  // the ask, with the QR code
  const qr = 66
  const at = rich(M + 20, y + 16, v.ask.title, { size: 18, font: 'Nunito', weight: 900, fill: C.navy, maxW: W - qr - 60 })
  const ax = rich(M + 20, y + 16 + at.h + 4, v.ask.text, { size: 12, maxW: W - qr - 60, lh: 16.5 })
  const ah = Math.max(at.h + ax.h + 32, qr + 20)
  s += rect(M, y, W, ah, 16, C.lemon) + at.svg + ax.svg
  s += rect(A4.w - M - qr - 12, y + (ah - qr) / 2, qr, qr, 8, '#FFFFFF', ` stroke="${C.navy}" stroke-width="1.2" stroke-dasharray="4 3"`) +
    `<text x="${A4.w - M - 12 - qr / 2}" y="${(y + ah / 2 + 3).toFixed(1)}" font-family="Inter" font-size="8.5" fill="${C.grey}" text-anchor="middle">[${esc(v.qr)}]</text>`
  y += ah + 16 + gap

  // what taking part involves: a timeline
  t = rich(M, y, v.involvesTitle, { size: 14, font: 'Nunito', weight: 900, fill: C.navy, maxW: W }); s += t.svg; y += t.h + 8
  // lay out each row first, then draw the line, the dots and the text
  const whenW = 134
  const rows = v.timeline.map(r => {
    const top = y
    const wh = rich(M + 20, top, r.when, { size: 10, maxW: whenW - 24, bold: true, fill: C.navy, lh: 13 })
    const tx = rich(M + whenW, top, r.text, { size: 10, maxW: W - whenW, lh: 14 })
    y += Math.max(wh.h, tx.h) + 9 + gap / 3
    return { dot: top + 7, svg: wh.svg + tx.svg }
  })
  const first = rows[0].dot
  const last = rows[rows.length - 1].dot
  s += `<rect x="${M + 5}" y="${first.toFixed(1)}" width="2" height="${(last - first).toFixed(1)}" fill="${C.sun}"/>`
  rows.forEach(r => { s += `<circle cx="${M + 6}" cy="${r.dot.toFixed(1)}" r="5" fill="${C.sun}" stroke="${C.cream}" stroke-width="2"/>` + r.svg })
  y += 6 + gap / 2

  // the two groups
  const gt = rich(M + 52, y + 13, `**${v.groupsTitle}.** ${v.groups}`, { size: 9.8, maxW: W - 70, lh: 13.6 })
  const gh = gt.h + 26
  s += rect(M, y, W, gh, 14, C.sky) + `<circle cx="${M + 26}" cy="${y + 26}" r="14" fill="#FFFFFF"/>` + glyph('users', M + 18, y + 18, 16, C.navy) + gt.svg
  y += gh + 16 + gap

  // what you get
  t = rich(M, y, v.getTitle, { size: 14, font: 'Nunito', weight: 900, fill: C.navy, maxW: W }); s += t.svg; y += t.h + 8
  // one row of tiles: icon, then title, then text
  const n = v.gets.length
  const tw = (W - (n - 1) * 10) / n
  const tiles = v.gets.map((g, i) => {
    const x = M + i * (tw + 10)
    const ti = rich(x + 14, y + 46, g.title, { size: 11.5, font: 'Nunito', weight: 900, fill: C.navy, maxW: tw - 26, lh: 14 })
    const tx = rich(x + 14, y + 46 + ti.h + 2, g.text, { size: 9.3, maxW: tw - 26, lh: 12.5 })
    return { x, g, i, svg: ti.svg + tx.svg, h: 46 + ti.h + 2 + tx.h + 12 }
  })
  const th = Math.max(...tiles.map(t => t.h))
  tiles.forEach(t => {
    s += rect(t.x, y, tw, th, 14, '#FFFFFF', ` stroke="${C.line}" stroke-width="1"`) +
      `<circle cx="${t.x + 28}" cy="${y + 25}" r="14" fill="${TILE_TINTS[t.i % TILE_TINTS.length]}"/>` + glyph(t.g.icon, t.x + 20, y + 17, 16, C.navy) + t.svg
  })
  y += th + 4

  // footer
  const f0 = rich(M, A4.h - 76, v.choice, { size: 10.5, maxW: W, bold: true, fill: C.navy })
  const f1 = rich(M, A4.h - 60, v.contact, { size: 10.5, maxW: W, fill: C.navy })
  const f2 = rich(M, A4.h - 40, v.runBy, { size: 8.5, maxW: W, fill: C.grey })
  s += `<rect x="${M}" y="${A4.h - 84}" width="${W}" height="1" fill="${C.line}"/>` + f0.svg + f1.svg + f2.svg
  return { svg: svgDoc(A4.w, A4.h, s, C.cream), used: y }
}

function fitInvitation (v) {
  const limit = A4.h - 96
  const first = invitationSvg(v)
  return invitationSvg(v, Math.min(Math.max(0, limit - first.used), 120))
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
    if (job.pages) {
      await page.setContent(`<html><head><style>${faces} @page{size:A4;margin:0} html,body{margin:0;padding:0} svg{display:block;width:210mm;height:297mm;break-after:page}</style></head><body>${job.pages.join('')}</body></html>`, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.pdf({ path: job.pagesPdf, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } })
    }
  }
  await browser.close()
  return results
}

// ------------------------------------------------------------------ Word
const d = require('docx')
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, AlignmentType, ShadingType, LevelFormat, VerticalAlign, Tab, TabStopType, ExternalHyperlink, Footer, PageNumber } = d
const FONT = 'Arial'
const hex = c => c.replace('#', '')
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none }
const runs = (s, o = {}) => String(s).split(/(\*\*.+?\*\*|\[[^\]]+\]\(https?:[^)]+\))/).filter(Boolean).map(part => {
  const b = /^\*\*.+\*\*$/.test(part)
  const link = !b && part.match(/^\[([^\]]+)\]\((https?:[^)]+)\)$/)
  if (link) return new ExternalHyperlink({ link: link[2], children: [new TextRun({ text: link[1], color: hex(C.link), underline: {}, size: o.size, font: o.font || FONT })] })
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

function invitationDocx (v, logo) {
  const MG = 680
  const TW = 11906 - 2 * MG
  const ch = []
  ch.push(table([TW], [new TableRow({ children: [cell([
    new Paragraph({ children: [logoRun(logo, 28), new TextRun({ text: '  The SMART Study', bold: true, color: 'FFFFFF', size: 30, font: FONT }), new TextRun({ children: [new Tab(), v.eyebrow.toUpperCase()], bold: true, color: hex(C.sun), size: 16, font: FONT })], tabStops: [{ type: TabStopType.RIGHT, position: TW - 360 }], spacing: { after: 0 } })
  ], { w: TW, fill: C.navy, pad: 130, padX: 180, valign: VerticalAlign.CENTER })] })]))
  ch.push(spacer(240))
  ch.push(P(v.headline, { size: 46, bold: true, color: C.navy, after: 140 }))
  ch.push(P(v.intro, { size: 23, after: 260 }))

  // the ask, with the QR code
  const qrW = 1700
  const dash = { style: BorderStyle.DASHED, size: 8, color: hex(C.navy) }
  ch.push(table([TW - qrW, qrW], [new TableRow({ children: [
    cell([P(v.ask.title, { size: 34, bold: true, color: C.navy, after: 80 }), P(v.ask.text, { size: 25, after: 0 })], { w: TW - qrW, fill: C.lemon, pad: 280, padX: 280, valign: VerticalAlign.CENTER }),
    cell([P(`[${v.qr}]`, { size: 16, color: C.grey, align: AlignmentType.CENTER, after: 0 })], { w: qrW, fill: 'FFFFFF', pad: 380, padX: 120, valign: VerticalAlign.CENTER, borders: { top: dash, bottom: dash, left: dash, right: dash } })
  ] })]))
  ch.push(spacer(300))

  // what taking part involves
  ch.push(P(v.involvesTitle, { size: 29, bold: true, color: C.navy, after: 120, keepNext: true }))
  const whenW = 2300
  const line = { style: BorderStyle.SINGLE, size: 4, color: hex(C.line) }
  ch.push(table([whenW, TW - whenW], v.timeline.map((r, i) => new TableRow({ children: [
    cell([P(r.when, { size: 22, bold: true, color: C.navy, after: 0 })], { w: whenW, pad: 100, padX: 0, borders: { top: i ? line : none, bottom: none, left: none, right: none } }),
    cell([P(r.text, { size: 22, after: 0 })], { w: TW - whenW, pad: 100, padX: 120, borders: { top: i ? line : none, bottom: none, left: none, right: none } })
  ] }))))
  ch.push(spacer(240))

  // the two groups
  ch.push(table([TW], [new TableRow({ children: [cell([P(`**${v.groupsTitle}.** ${v.groups}`, { size: 21, after: 0 })], { w: TW, fill: C.sky, pad: 200, padX: 260 })] })]))
  ch.push(spacer(300))

  // what you get
  ch.push(P(v.getTitle, { size: 29, bold: true, color: C.navy, after: 120, keepNext: true }))
  const n = v.gets.length
  const g = 140
  const cw = Math.floor((TW - g * (n - 1)) / n)
  const widths = []
  const cells = []
  v.gets.forEach((it, i) => {
    if (i) { widths.push(g); cells.push(cell([P('')], { w: g, padX: 0 })) }
    widths.push(cw)
    cells.push(cell([P(it.title, { size: 24, bold: true, color: C.navy, after: 60 }), P(it.text, { size: 20, after: 0 })], { w: cw, fill: TILE_TINTS[i % TILE_TINTS.length], pad: 200, padX: 180 }))
  })
  ch.push(table(widths, [new TableRow({ children: cells })]))
  ch.push(spacer(360))

  ch.push(P(v.choice, { size: 22, bold: true, color: C.navy, after: 60 }))
  ch.push(P(v.contact, { size: 22, color: C.navy, after: 80 }))
  ch.push(P(v.runBy, { size: 16, color: C.grey, after: 0 }))
  return Packer.toBuffer(docFor(ch, MG))
}

// ------------------------------------------------------------------ microsite pages
function shell ({ title, access, page, body }) {
  return `<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <title>${esc(title)} – The SMART Study</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/site.css?v=5">
</head>
<!-- Generated by tools/build-resources.js from content/resources.js. Edit the content file, not this page. -->
<body class="govuk-template__body" data-access="${access}" data-page="${page}">
${body}
  <script src="assets/js/govuk-frontend.js?v=4"></script>
  <script src="assets/js/icons.js?v=5"></script>
  <script src="assets/js/site.js?v=5"></script>
</body>
</html>
`
}

function delayPage () {
  const g = R.delay
  const tips = g.tips.items.map(it => `
              <li id="${it.id}"><strong>${esc(it.title)}</strong> ${md(it.text)}${it.quote ? `<div class="govuk-inset-text smart-inset-friendly">"${esc(it.quote)}"</div>` : ''}${it.id === 'talking' ? `<p class="govuk-body">${md(g.video).replace('a 3-minute video about the study', '<a class="govuk-link" href="videos.html#study">a 3-minute video about the study</a>')}</p>` : ''}</li>`).join('')
  return shell({ title: g.title, access: 'member', page: 'guides', body: `
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
            <a class="govuk-link" href="exports/SMART-delay-guide.pdf" download>Download the guide (PDF)</a> or <a class="govuk-link" href="exports/SMART-delay-guide.docx" download>Word</a>
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

// Pages in a PDF built by tools/build-docs.js (0 if it hasn't been built yet)
function pdfPages (file) {
  try { return (fs.readFileSync(out(file), 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length } catch (e) { return 0 }
}

function schoolsPage () {
  const [schools, parents, children] = PACKS
  const ask = schools.blocks.find(b => b.type === 'ask')
  const dl = (pack, label) => {
    const n = pdfPages(`exports/SMART-onboarding-pack-${pack.id}.pdf`)
    return `<li><a class="govuk-link" href="exports/SMART-onboarding-pack-${pack.id}.pdf" download>${icon('printer')} ${label} (PDF${n ? `, ${n} pages` : ''})</a></li>
              <li><a class="govuk-link" href="exports/SMART-onboarding-pack-${pack.id}.docx" download>${icon('file-text')} Word version</a></li>`
  }
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
          <h2 class="govuk-heading-l" id="onboarding">Onboarding packs</h2>
          <div class="smart-box">
            <p class="govuk-body"><strong>${esc(schools.name)}</strong></p>
            <p class="govuk-body">What the study involves, the key dates, what we'll ask of you and your staff, and what your school receives.</p>
            <h3 class="govuk-heading-s govuk-!-margin-bottom-2">${esc(ask.title)}, at a glance</h3>
            <ol class="govuk-list govuk-list--number">${ask.items.map(it => `<li><strong>${md(it.title.replace(/[.,]$/, ''))}</strong></li>`).join('')}</ol>
            <ul class="govuk-list govuk-body-s smart-downloads govuk-!-margin-bottom-0">
              ${dl(schools, 'Download the pack')}
            </ul>
          </div>
          <div class="smart-box">
            <p class="govuk-body"><strong>${esc(parents.name)}</strong></p>
            <p class="govuk-body">For you to share with families in ${R.YEARS}: what the study is, what we're asking, the year ahead and the help they'll get. It comes with their guide: waiting for a first smartphone, or setting up the phone their child already has.</p>
            <ul class="govuk-list govuk-body-s smart-downloads govuk-!-margin-bottom-0">
              ${dl(parents, 'Download the families\' pack')}
              <li><a class="govuk-link" href="exports/SMART-delay-guide.pdf" download>${icon('printer')} Waiting for a first smartphone (PDF)</a></li>
              <li><a class="govuk-link" href="exports/SMART-setting-up-your-childs-phone.pdf" download>${icon('printer')} Setting up your child's phone (PDF)</a></li>
            </ul>
          </div>
          <div class="smart-box">
            <p class="govuk-body"><strong>${esc(children.name)}</strong></p>
            <p class="govuk-body">For children in ${R.YEARS}, in bigger text and pictures: why the study matters, what it means for them, and that it's OK to find it hard.</p>
            <ul class="govuk-list govuk-body-s smart-downloads govuk-!-margin-bottom-0">
              ${dl(children, 'Download the children\'s pack')}
            </ul>
          </div>

          <h2 class="govuk-heading-l" id="posters">E-posters</h2>
          <p class="govuk-body">Print them, show them on screens, or send them with your newsletter. Most schools only need the first one. Before you share one, add your school's details: the Word version can be edited.</p>
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
  mkdir('exports/invitations')
  const posterSvgs = R.posters.map(p => {
    const r = fitPoster(p)
    if (r.used > A4.h - 74) console.warn(`Poster ${p.id} is too full (${Math.round(r.used)}px)`)
    fs.writeFileSync(out(`exports/figma/poster-${p.id}.svg`), r.svg)
    return { p, svg: r.svg }
  })
  const invitationSvgs = R.invitations.map(v => {
    const r = fitInvitation(v)
    if (r.used > A4.h - 92) console.warn(`Invitation ${v.id} is too full (${Math.round(r.used)}px)`)
    fs.writeFileSync(out(`exports/figma/invitation-${v.id}.svg`), r.svg)
    return { v, svg: r.svg }
  })
  fs.writeFileSync(out('guide-delay.html'), delayPage())
  fs.writeFileSync(out('schools.html'), schoolsPage())
  console.log(`delay guide, ${posterSvgs.length} posters, ${invitationSvgs.length} invitations, 2 site pages`)
  if (process.argv.includes('--no-export')) return
  const r = await renderAll([
    { key: 'logo', svg: logoSvg.replace('width="48" height="48"', 'width="192" height="192"'), w: 192, h: 192, buffer: true },
    ...posterSvgs.map(({ p, svg }) => ({ svg, png: out(`exports/posters/SMART-poster-${p.id}.png`), pdf: out(`exports/posters/SMART-poster-${p.id}.pdf`) })),
    ...invitationSvgs.map(({ v, svg }) => ({ svg, png: out(`exports/invitations/SMART-invitation-${v.id}.png`), pdf: out(`exports/invitations/SMART-invitation-${v.id}.pdf`) }))
  ])
  for (const { p } of posterSvgs) fs.writeFileSync(out(`exports/posters/SMART-poster-${p.id}.docx`), await posterDocx(p, r.logo))
  for (const { v } of invitationSvgs) fs.writeFileSync(out(`exports/invitations/SMART-invitation-${v.id}.docx`), await invitationDocx(v, r.logo))
  console.log('Word documents, PDFs and PNGs written')
})().catch(e => { console.error(e); process.exit(1) })
