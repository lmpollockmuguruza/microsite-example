/*
 * Builds the delay guide, the school e-posters and the schools page from
 * content/resources.js:
 *
 *   guide-delay.html                          the guide for families whose child has no phone yet
 *   schools.html                              the school leaders' page
 *   exports/SMART-delay-guide.docx            one-page Word guide
 *   exports/figma/delay-guide.svg             A4 frame for Figma
 *   exports/posters/SMART-poster-*.docx|pdf|png   each e-poster
 *   exports/figma/poster-*.svg                each e-poster as an A4 frame
 *   exports/invitations/SMART-invitation-*.docx|pdf|png   each invitation to take part
 *   exports/figma/invitation-*.svg            each invitation as an A4 frame
 *   exports/SMART-onboarding-pack-schools.docx|pdf   the schools' onboarding pack (content/onboarding.js)
 *   exports/figma/onboarding-pack-schools.svg  its A4 pages side by side
 *
 * Run: npm run build:resources
 */
const fs = require('fs')
const path = require('path')
const R = require('../content/resources')
const PACKS = [require('../content/onboarding')]

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

// ------------------------------------------------------------------ onboarding pack: A4 pages
// The pack is a list of blocks. Each block becomes one or more "atoms" that
// are placed down the page; an atom that doesn't fit starts a new page.
// Headings stay with the atom after them, and table rows repeat the header.
const PACK = { M: 44, top: 70, bottom: A4.h - 52 }
PACK.W = A4.w - PACK.M * 2

function packAtoms (pack) {
  const { M, W } = PACK
  const atoms = []
  const add = (draw, o = {}) => atoms.push({ draw, gap: o.gap ?? 10, keep: !!o.keep, header: o.header })
  const TINT = { mint: C.mint, peach: '#FDE7D3' }

  // page 1 title
  add(y => {
    let s = ''
    let t = rich(M, y, pack.title, { size: 28, font: 'Nunito', weight: 900, fill: C.navy, maxW: W, lh: 32 }); s += t.svg; let h = t.h + 6
    t = rich(M, y + h, pack.lead, { size: 11.5, maxW: W, fill: C.grey, lh: 16 }); s += t.svg; h += t.h
    return { svg: s, h }
  }, { gap: 16 })

  for (const b of pack.blocks) {
    if (b.type === 'h2') {
      add(y => { const t = rich(M, y + 8, b.text, { size: 15, font: 'Nunito', weight: 900, fill: C.navy, maxW: W }); return { svg: t.svg, h: t.h + 8 } }, { gap: 6, keep: true })
    } else if (b.type === 'p') {
      add(y => { const t = rich(M, y, b.text, { size: 10.5, maxW: W, lh: 15 }); return t }, { gap: 8 })
    } else if (b.type === 'ask') {
      add(y => {
        const X = M + 18
        const IW = W - 36
        let s = ''
        let h = 16
        let t = rich(X, y + h, b.title, { size: 15, font: 'Nunito', weight: 900, fill: C.navy, maxW: IW }); s += t.svg; h += t.h + 4
        t = rich(X, y + h, b.intro, { size: 11.5, maxW: IW }); s += t.svg; h += t.h + 8
        b.items.forEach((it, i) => {
          s += `<circle cx="${X + 9}" cy="${(y + h + 8).toFixed(1)}" r="9" fill="${C.sun}"/><text x="${X + 9}" y="${(y + h + 11.5).toFixed(1)}" font-family="Nunito" font-size="10" font-weight="900" fill="${C.navy}" text-anchor="middle">${i + 1}</text>`
          t = rich(X + 26, y + h, `**${it.title}** ${it.text}`, { size: 10.5, maxW: IW - 26, lh: 14.5 }); s += t.svg; h += t.h + 6
        })
        t = rich(X, y + h + 2, b.outro, { size: 10, maxW: IW, fill: C.grey }); s += t.svg; h += t.h + 18
        return { svg: rect(M, y, W, h, 14, C.lemon) + s, h }
      }, { gap: 14 })
    } else if (b.type === 'stats') {
      add(y => {
        const n = b.items.length
        const tw = (W - (n - 1) * 10) / n
        let s = ''
        b.items.forEach((it, i) => {
          const x = M + i * (tw + 10)
          s += rect(x, y, tw, 60, 12, C.sky) +
            `<text x="${x + tw / 2}" y="${y + 30}" font-family="Nunito" font-size="22" font-weight="900" fill="${C.navy}" text-anchor="middle">${esc(it.n)}</text>` +
            `<text x="${x + tw / 2}" y="${y + 47}" font-family="Inter" font-size="9.5" fill="${C.grey}" text-anchor="middle">${esc(it.label)}</text>`
        })
        return { svg: s, h: 60 }
      }, { gap: 12 })
    } else if (b.type === 'table') {
      const xs = []
      let acc = 0
      b.widths.forEach(f => { xs.push(M + acc * W); acc += f })
      const header = y => {
        let s = rect(M, y, W, 24, 6, C.navy)
        b.cols.forEach((c, i) => { s += `<text x="${xs[i] + 10}" y="${y + 15.5}" font-family="Inter" font-size="9.5" font-weight="700" fill="#FFFFFF">${esc(c)}</text>` })
        return { svg: s, h: 24 }
      }
      add(header, { gap: 0, keep: true })
      b.rows.forEach((row, r) => {
        add(y => {
          const cells = row.map((txt, i) => rich(xs[i] + 10, y + 8, txt, { size: 9.5, maxW: b.widths[i] * W - 20, lh: 13, bold: i === 0, fill: i === 0 ? C.navy : C.ink }))
          const h = Math.max(...cells.map(c => c.h)) + 16
          return { svg: rect(M, y, W, h, 0, r % 2 ? '#FFFFFF' : C.cream) + `<rect x="${M}" y="${(y + h - 1).toFixed(1)}" width="${W}" height="1" fill="${C.line}"/>` + cells.map(c => c.svg).join(''), h }
        }, { gap: r === b.rows.length - 1 ? 12 : 0, header })
      })
    } else if (b.type === 'bullets' || b.type === 'steps') {
      b.items.forEach((it, i) => {
        add(y => {
          const marker = b.type === 'steps'
            ? `<circle cx="${M + 9}" cy="${(y + 8).toFixed(1)}" r="9" fill="${C.sun}"/><text x="${M + 9}" y="${(y + 11.5).toFixed(1)}" font-family="Nunito" font-size="10" font-weight="900" fill="${C.navy}" text-anchor="middle">${i + 1}</text>`
            : `<circle cx="${M + 5}" cy="${(y + 7.5).toFixed(1)}" r="3" fill="${C.coral}"/>`
          const indent = b.type === 'steps' ? 26 : 16
          const t = rich(M + indent, y, it, { size: 10.5, maxW: W - indent, lh: 14.5 })
          return { svg: marker + t.svg, h: Math.max(t.h, 18) }
        }, { gap: i === b.items.length - 1 ? 10 : 5 })
      })
    } else if (b.type === 'boxes') {
      add(y => {
        const n = b.items.length
        const bw = (W - (n - 1) * 12) / n
        const parts = b.items.map((it, i) => {
          const x = M + i * (bw + 12)
          const ti = rich(x + 14, y + 12, it.title, { size: 11, maxW: bw - 28, bold: true, fill: C.navy, lh: 14 })
          const tx = rich(x + 14, y + 12 + ti.h + 3, it.text, { size: 10, maxW: bw - 28, lh: 14 })
          return { x, it, svg: ti.svg + tx.svg, h: ti.h + tx.h + 30 }
        })
        const h = Math.max(...parts.map(p => p.h))
        return { svg: parts.map(p => rect(p.x, y, bw, h, 12, TINT[p.it.tint]) + p.svg).join(''), h }
      }, { gap: 14 })
    }
  }
  // closing line
  add(y => { const t = rich(M, y + 6, `${pack.footer} ${R.RUN_BY}`, { size: 9.5, maxW: W, fill: C.grey }); return { svg: t.svg, h: t.h + 6 } }, { gap: 0 })
  return atoms
}

// Place the atoms on pages. Returns one SVG per page.
function packPages (pack) {
  const { M, W, top, bottom } = PACK
  const atoms = packAtoms(pack)
  const pages = [[]]
  const firstTop = 92
  let y = firstTop
  const pageTop = () => pages.length === 1 ? firstTop : top
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i]
    // a heading or table header needs room for what it's kept with
    let need = a.draw(y).h
    for (let j = i; atoms[j].keep && atoms[j + 1]; j++) need += atoms[j].gap + atoms[j + 1].draw(y).h
    if (y + need > bottom && y > pageTop()) {
      pages.push([])
      y = top
      if (a.header) { const hd = a.header(y); pages[pages.length - 1].push(hd.svg); y += hd.h }
    }
    const r = a.draw(y)
    pages[pages.length - 1].push(r.svg)
    y += r.h + a.gap
  }
  const n = pages.length
  return pages.map((body, i) => {
    let s = ''
    if (i === 0) {
      s += logoAt(M, 36, 30) + `<text x="${M + 40}" y="${56}" font-family="Inter" font-size="10" font-weight="700" fill="${C.coral}" letter-spacing=".6">THE SMART STUDY · ${esc(pack.eyebrow.toUpperCase())}</text>`
    } else {
      s += logoAt(M, 26, 20) + `<text x="${M + 28}" y="${40}" font-family="Inter" font-size="8.5" font-weight="700" fill="${C.coral}" letter-spacing=".6">THE SMART STUDY · ${esc(pack.eyebrow.toUpperCase())}</text>`
    }
    s += body.join('')
    s += `<rect x="${M}" y="${A4.h - 38}" width="${W}" height="1" fill="${C.line}"/>` +
      `<text x="${A4.w - M}" y="${A4.h - 24}" font-family="Inter" font-size="8.5" fill="${C.grey}" text-anchor="end">Page ${i + 1} of ${n}</text>`
    return svgDoc(A4.w, A4.h, s, '#FFFFFF')
  })
}

// All the pages side by side, for Figma: one named group per page
function packBoard (pages) {
  const GAP = 40
  const w = pages.length * A4.w + (pages.length - 1) * GAP
  const body = pages.map((p, i) => `<g id="Page ${i + 1}" transform="translate(${i * (A4.w + GAP)} 0)">${p.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</g>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${A4.h}" width="${w}" height="${A4.h}">${body}</svg>\n`
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

// The onboarding pack in Word. Word does the page breaks; headings keep
// with what follows, and table header rows repeat on a new page.
function packDocx (pack, logo) {
  const MG = 850
  const TW = 11906 - 2 * MG
  const ch = []
  const TINT = { mint: C.mint, peach: '#FDE7D3' }
  ch.push(new Paragraph({ children: [logoRun(logo, 26), new TextRun({ text: '  THE SMART STUDY · ' + pack.eyebrow.toUpperCase(), bold: true, color: hex(C.coral), size: 18, font: FONT })], spacing: { after: 160 } }))
  ch.push(P(pack.title, { size: 52, bold: true, color: C.navy, after: 80 }))
  ch.push(P(pack.lead, { size: 23, color: C.grey, after: 240 }))
  const line = { style: BorderStyle.SINGLE, size: 4, color: hex(C.line) }
  for (const b of pack.blocks) {
    if (b.type === 'h2') ch.push(P(b.text, { size: 29, bold: true, color: C.navy, before: 200, after: 80, keepNext: true }))
    else if (b.type === 'p') ch.push(P(b.text, { size: 21, after: 140 }))
    else if (b.type === 'ask') {
      ch.push(table([TW], [new TableRow({ cantSplit: true, children: [cell([
        P(b.title, { size: 29, bold: true, color: C.navy, after: 60 }),
        P(b.intro, { size: 23, after: 100 }),
        ...b.items.map(it => new Paragraph({ children: [...runs(`**${it.title}** `, { size: 21 }), ...runs(it.text, { size: 21 })], numbering: { reference: 'tips', level: 0 }, spacing: { after: 80 } })),
        P(b.outro, { size: 20, color: C.grey, before: 60, after: 0 })
      ], { w: TW, fill: C.lemon, pad: 220, padX: 260 })] })]))
      ch.push(spacer(200))
    } else if (b.type === 'stats') {
      const g = 160
      const w = Math.floor((TW - g * (b.items.length - 1)) / b.items.length)
      const widths = []
      const cells = []
      b.items.forEach((it, i) => {
        if (i) { widths.push(g); cells.push(cell([P('')], { w: g, padX: 0 })) }
        widths.push(w)
        cells.push(cell([P(it.n, { size: 40, bold: true, color: C.navy, align: AlignmentType.CENTER, after: 20 }), P(it.label, { size: 18, color: C.grey, align: AlignmentType.CENTER, after: 0 })], { w, fill: C.sky, pad: 160, padX: 120 }))
      })
      ch.push(table(widths, [new TableRow({ children: cells })]))
      ch.push(spacer(160))
    } else if (b.type === 'table') {
      const widths = b.widths.map(f => Math.round(f * TW))
      ch.push(table(widths, [
        new TableRow({ tableHeader: true, cantSplit: true, children: b.cols.map((c, i) => cell([P(c, { size: 19, bold: true, color: '#FFFFFF', after: 0 })], { w: widths[i], fill: C.navy, pad: 90, padX: 140 })) }),
        ...b.rows.map((row, r) => new TableRow({ cantSplit: true, children: row.map((txt, i) => cell([P(txt, { size: 19, bold: i === 0, color: i === 0 ? C.navy : undefined, after: 0 })], { w: widths[i], fill: r % 2 ? '#FFFFFF' : C.cream, pad: 100, padX: 140, borders: { top: none, left: none, right: none, bottom: line } })) }))
      ]))
      ch.push(spacer(160))
    } else if (b.type === 'bullets') {
      b.items.forEach((it, i) => ch.push(new Paragraph({ children: runs(it, { size: 21 }), numbering: { reference: 'bullets', level: 0 }, spacing: { after: i === b.items.length - 1 ? 140 : 70 } })))
    } else if (b.type === 'steps') {
      b.items.forEach((it, i) => ch.push(new Paragraph({ children: runs(it, { size: 21 }), numbering: { reference: 'steps', level: 0 }, spacing: { after: i === b.items.length - 1 ? 140 : 70 } })))
    } else if (b.type === 'boxes') {
      const g = 200
      const w = Math.floor((TW - g * (b.items.length - 1)) / b.items.length)
      const widths = []
      const cells = []
      b.items.forEach((it, i) => {
        if (i) { widths.push(g); cells.push(cell([P('')], { w: g, padX: 0 })) }
        widths.push(w)
        cells.push(cell([P(it.title, { size: 22, bold: true, color: C.navy, after: 60 }), P(it.text, { size: 20, after: 0 })], { w, fill: TINT[it.tint], pad: 180, padX: 200 }))
      })
      ch.push(spacer(80))
      ch.push(table(widths, [new TableRow({ cantSplit: true, children: cells })]))
      ch.push(spacer(120))
    }
  }
  ch.push(P(`${pack.footer} ${R.RUN_BY}`, { size: 18, color: C.grey, before: 200, after: 0 }))
  const doc = new Document({
    creator: 'PUBLIC',
    title: `SMART Study: ${pack.eyebrow.toLowerCase()}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    numbering: { config: [
      { reference: 'tips', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } }, run: { bold: true, color: hex(C.coral) } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } }, run: { bold: true, color: hex(C.coral) } } }] },
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } }, run: { color: hex(C.coral) } } }] }
    ] },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: MG, bottom: MG, left: MG, right: MG } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `The SMART Study · ${pack.eyebrow} · page `, size: 16, color: hex(C.grey), font: FONT }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: hex(C.grey), font: FONT })] })] }) },
      children: ch
    }]
  })
  return Packer.toBuffer(doc)
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

function schoolsPage (pages) {
  const pack = PACKS[0]
  const ask = pack.blocks.find(b => b.type === 'ask')
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
            <p class="govuk-body"><strong>${esc(pack.eyebrow)}</strong></p>
            <p class="govuk-body">What the study involves, the key dates, what we'll ask of you and your staff, and what your school receives.</p>
            <h3 class="govuk-heading-s govuk-!-margin-bottom-2">${esc(ask.title)}, at a glance</h3>
            <ol class="govuk-list govuk-list--number">${ask.items.map(it => `<li><strong>${md(it.title.replace(/[.,]$/, ''))}</strong></li>`).join('')}</ol>
            <ul class="govuk-list govuk-body-s smart-downloads govuk-!-margin-bottom-0">
              <li><a class="govuk-link" href="exports/SMART-onboarding-pack-${pack.id}.pdf" download>${icon('printer')} Download the pack (PDF, ${pages} pages)</a></li>
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
  const delay = delaySvg()
  fs.writeFileSync(out('exports/figma/delay-guide.svg'), delay.svg)
  if (delay.used > A4.h - 56) console.warn(`Delay guide frame is too full (${Math.round(delay.used)}px)`)
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
  const packs = PACKS.map(pack => {
    const pages = packPages(pack)
    fs.writeFileSync(out(`exports/figma/onboarding-pack-${pack.id}.svg`), packBoard(pages))
    return { pack, pages }
  })
  fs.writeFileSync(out('guide-delay.html'), delayPage())
  fs.writeFileSync(out('schools.html'), schoolsPage(packs[0].pages.length))
  console.log(`delay guide, ${posterSvgs.length} posters, ${invitationSvgs.length} invitations, onboarding pack (${packs.map(p => p.pages.length + ' pages').join(', ')}), 2 site pages`)
  if (process.argv.includes('--no-export')) return
  const r = await renderAll([
    { key: 'logo', svg: logoSvg.replace('width="48" height="48"', 'width="192" height="192"'), w: 192, h: 192, buffer: true },
    ...posterSvgs.map(({ p, svg }) => ({ svg, png: out(`exports/posters/SMART-poster-${p.id}.png`), pdf: out(`exports/posters/SMART-poster-${p.id}.pdf`) })),
    ...invitationSvgs.map(({ v, svg }) => ({ svg, png: out(`exports/invitations/SMART-invitation-${v.id}.png`), pdf: out(`exports/invitations/SMART-invitation-${v.id}.pdf`) })),
    ...packs.map(({ pack, pages }) => ({ pages, pagesPdf: out(`exports/SMART-onboarding-pack-${pack.id}.pdf`) }))
  ])
  fs.writeFileSync(out('exports/SMART-delay-guide.docx'), await delayDocx(r.logo))
  for (const { p } of posterSvgs) fs.writeFileSync(out(`exports/posters/SMART-poster-${p.id}.docx`), await posterDocx(p, r.logo))
  for (const { pack } of packs) fs.writeFileSync(out(`exports/SMART-onboarding-pack-${pack.id}.docx`), await packDocx(pack, r.logo))
  for (const { v } of invitationSvgs) fs.writeFileSync(out(`exports/invitations/SMART-invitation-${v.id}.docx`), await invitationDocx(v, r.logo))
  console.log('Word documents, PDFs and PNGs written')
})().catch(e => { console.error(e); process.exit(1) })
