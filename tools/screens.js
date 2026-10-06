/*
 * Draws a phone screen as SVG from a plain description (see content/guidance.js).
 *
 * The output is vector: it stays sharp at any size, prints cleanly, and
 * imports into Figma as editable layers (text stays text, in Inter).
 *
 * Screen fields
 *   os: 'ios' | 'android'
 *   bar: { back, title, largeTitle, close, right, rightHl, search }
 *   blocks: groups of rows and other parts (see the block types below)
 *   cut: true fades out the bottom, to show the screen continues
 *
 * Android blocks also include 'pin' (a four-digit PIN pad) and 'actions'
 * with leftButton: true (an outlined button on the left, leftHl to mark it).
 *
 * Row fields (iOS groups and Android lists)
 *   label, sub, value, icon + colour, chevron, toggle/switch 'on'|'off',
 *   check, select 'on'|'off', radio 'on'|'off', minus, plus, blue, muted,
 *   hl: 'label'   draws the coral "tap here" outline with that label
 *   avoid: 'label' draws a red dashed "don't" outline
 *   span: n       stretches the outline over n rows
 */
const glyphs = require('./glyphs.json')

const W = 360 // screen width
const BEZEL = 8
const FONT = 'Inter'
const CORAL = '#E8542F'
const AVOID = '#C62828'

const IOS = { bg: '#F2F2F7', card: '#FFFFFF', text: '#000000', grey: '#6D6D72', light: '#8A8A8E', sep: '#D8D8DC', blue: '#007AFF', green: '#34C759', red: '#FF3B30' }
const AND = { bg: '#FFFFFF', text: '#1F1F1F', grey: '#444746', light: '#747775', sep: '#E1E3E1', blue: '#0B57D0', surface: '#F0F4F9' }

// ------------------------------------------------------------------ helpers
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const r1 = n => Math.round(n * 10) / 10

function textWidth (s, size, weight) {
  const k = weight >= 600 ? 0.565 : weight >= 500 ? 0.55 : 0.53
  let w = 0
  for (const ch of String(s)) w += (/[ il.,:;'|!]/.test(ch) ? 0.5 : /[mwMW@]/.test(ch) ? 1.45 : /[A-Z0-9]/.test(ch) ? 1.18 : 1) * size * k
  return w
}

function wrap (s, size, weight, maxW) {
  const words = String(s).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (textWidth(test, size, weight) > maxW && line) { lines.push(line); line = w } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function truncate (s, size, weight, maxW) {
  if (textWidth(s, size, weight) <= maxW) return s
  let t = String(s)
  while (t.length > 1 && textWidth(t + '…', size, weight) > maxW) t = t.slice(0, -1)
  return t.trimEnd() + '…'
}

function text (x, y, s, o = {}) {
  const a = o.anchor ? ` text-anchor="${o.anchor}"` : ''
  return `<text x="${r1(x)}" y="${r1(y)}" font-family="${FONT}" font-size="${o.size || 15}" font-weight="${o.weight || 400}" fill="${o.fill || '#000'}"${a}${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`
}

function glyph (name, x, y, size, colour, stroke = 2) {
  const g = glyphs[name]
  if (!g) return ''
  const k = size / 24
  return `<g transform="translate(${r1(x)} ${r1(y)}) scale(${r1(k * 1000) / 1000})" fill="none" stroke="${colour}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${g}</g>`
}

function chevron (x, y, colour = '#C4C4C7') {
  return `<path d="M${r1(x)} ${r1(y - 5.5)} l5.5 5.5 -5.5 5.5" fill="none" stroke="${colour}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
}

function iconTile (x, y, size, colour, name, radius) {
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${size}" height="${size}" rx="${radius || size * 0.24}" fill="${colour}"/>` +
    glyph(name, x + size * 0.19, y + size * 0.19, size * 0.62, '#FFFFFF', 2.3)
}

// ------------------------------------------------------------------ highlights (drawn last, on top)
function highlightBox (hl, box, avoid, pos) {
  const colour = avoid ? AVOID : CORAL
  const pad = 3
  const x = box.x - pad
  const y = box.y - pad
  const w = box.w + pad * 2
  const h = box.h + pad * 2
  let s = `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="12" fill="none" stroke="${colour}" stroke-width="2.5"${avoid ? ' stroke-dasharray="6 4"' : ''}/>`
  if (hl) {
    const label = (avoid ? '✕  ' : '') + hl
    const tw = textWidth(label, 11.5, 700) + 18
    const px = pos === 'left' ? x + 12 : Math.max(6, Math.min(x + w - tw - 10, W - tw - 6))
    const py = pos === 'below' ? y + h - 10 : Math.max(2, y - 11)
    s += `<rect x="${r1(px)}" y="${r1(py)}" width="${r1(tw)}" height="21" rx="10.5" fill="${colour}"/>` +
      text(px + tw / 2, py + 14.5, label, { size: 11.5, weight: 700, fill: '#FFFFFF', anchor: 'middle' })
  }
  return s
}

// ------------------------------------------------------------------ status bars
function statusBar (os, dark) {
  const c = dark ? '#FFFFFF' : '#000000'
  if (os === 'android') {
    return text(20, 27, '9:41', { size: 14, weight: 500, fill: c }) +
      `<circle cx="${W / 2}" cy="21" r="6" fill="#1D1D1F"/>` +
      `<path d="M${W - 76} 26 l7 -9 7 9 z" fill="${c}"/>` +
      `<path d="M${W - 58} 27 l10 -11 v11 z" fill="${c}"/>` +
      `<rect x="${W - 40}" y="15" width="8" height="13" rx="1.5" fill="${c}"/>`
  }
  return text(34, 30, '9:41', { size: 15, weight: 600, fill: c }) +
    `<rect x="${W / 2 - 46}" y="11" width="92" height="27" rx="13.5" fill="#000"/>` +
    [0, 1, 2, 3].map(i => `<rect x="${W - 96 + i * 5}" y="${26 - (i + 1) * 3}" width="3.2" height="${(i + 1) * 3}" rx="0.8" fill="${c}"/>`).join('') +
    `<path d="M${W - 70} 21.5 a9 9 0 0 1 13 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M${W - 67} 24.5 a5 5 0 0 1 7 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/><circle cx="${W - 63.5}" cy="27" r="1.4" fill="${c}"/>` +
    `<rect x="${W - 50}" y="18" width="24" height="12" rx="3.5" fill="none" stroke="${c}" stroke-opacity=".45" stroke-width="1"/><rect x="${W - 48}" y="20" width="17" height="8" rx="2" fill="${c}"/><rect x="${W - 25}" y="22" width="1.8" height="4" rx=".9" fill="${c}" fill-opacity=".45"/>`
}

// ------------------------------------------------------------------ iOS
function iosBar (bar, ctx) {
  let s = ''
  let y = 44
  if (bar.largeTitle) {
    s += text(18, y + 36, bar.largeTitle, { size: 30, weight: 700 })
    return { s, y: y + 52 }
  }
  if (bar.search) return { s, y }
  const mid = y + 22
  let leftW = 0
  if (bar.close) {
    s += `<circle cx="36" cy="${mid}" r="16" fill="#E3E3E8"/>` + glyph('x', 27, mid - 9, 18, '#3C3C43', 2.4)
    leftW = 56
  }
  let rightW = 0
  if (bar.right) {
    const tw = textWidth(bar.right, 15, 600) + 28
    const bx = W - 16 - tw
    s += `<rect x="${r1(bx)}" y="${mid - 16}" width="${r1(tw)}" height="32" rx="16" fill="${IOS.blue}"/>` + text(bx + tw / 2, mid + 5, bar.right, { size: 15, weight: 600, fill: '#FFF', anchor: 'middle' })
    if (bar.rightHl) ctx.hls.push({ hl: bar.rightHl, box: { x: bx, y: mid - 16, w: tw, h: 32 } })
    rightW = tw + 16
  }
  if (bar.title || bar.back) {
    const titleW = bar.title ? textWidth(bar.title, 15.5, 600) : 0
    if (bar.back) {
      const space = (W - titleW) / 2 - 42
      const showLabel = bar.back && space > textWidth(bar.back, 15.5, 400) + 14 && bar.back !== true
      s += `<path d="M28 ${mid - 8} l-8 8 8 8" fill="none" stroke="${IOS.blue}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
      if (showLabel) s += text(34, mid + 5.5, bar.back, { size: 15.5, fill: IOS.blue })
      leftW = Math.max(leftW, 40)
    }
    if (bar.title) {
      const avail = W - 2 * Math.max(leftW, rightW) - 8
      s += text(W / 2, mid + 5.5, truncate(bar.title, 15.5, 600, avail), { size: 15.5, weight: 600, anchor: 'middle' })
    }
  }
  if (!bar.close && !bar.back && !bar.title && !bar.right) return { s, y: y + 6 }
  return { s, y: y + 50 }
}

function iosRowHeight (row) { return row.sub ? 58 : 46 }

function iosGroup (b, y, ctx) {
  let s = ''
  const gx = 16
  const gw = W - 32
  if (b.header) { s += text(gx + 16, y + 18, b.header, { size: 12.5, fill: IOS.grey }); y += 28 } else if (!b.cutTop) y += 4
  const heights = b.rows.map(iosRowHeight)
  const gh = heights.reduce((a, c) => a + c, 0)
  const top = b.cutTop ? y - 12 : y
  s += `<rect x="${gx}" y="${r1(top)}" width="${gw}" height="${r1(gh + (y - top))}" rx="12" fill="${IOS.card}"/>`
  let ry = y
  b.rows.forEach((row, i) => {
    const h = heights[i]
    const cy = ry + h / 2
    let lx = gx + 16
    if (row.select) {
      s += row.select === 'on'
        ? `<circle cx="${lx + 10}" cy="${cy}" r="10.5" fill="${IOS.blue}"/>` + `<path d="M${lx + 5.5} ${cy} l3.2 3.4 6 -6.5" fill="none" stroke="#FFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="${lx + 10}" cy="${cy}" r="10.5" fill="none" stroke="#C7C7CC" stroke-width="1.6"/>`
      lx += 32
    }
    if (row.minus || row.plus) {
      const c = row.minus ? IOS.red : IOS.green
      s += `<circle cx="${lx + 10}" cy="${cy}" r="10.5" fill="${c}"/><path d="M${lx + 5} ${cy} h10${row.plus ? ` M${lx + 10} ${cy - 5} v10` : ''}" stroke="#FFF" stroke-width="2.4" stroke-linecap="round"/>`
      lx += 32
    }
    if (row.icon && row.plainIcon) {
      s += glyph(row.icon, lx, cy - 10, 20, IOS.blue, 2.2)
      lx += 32
    } else if (row.icon) {
      const sz = row.app ? 32 : 30
      s += iconTile(lx, cy - sz / 2, sz, row.colour || '#8E8E93', row.icon, row.app ? 8 : 7)
      lx += sz + 13
    }
    // right side
    let rx = gx + gw - 16
    if (row.toggle) {
      const on = row.toggle === 'on'
      s += `<rect x="${rx - 51}" y="${cy - 15.5}" width="51" height="31" rx="15.5" fill="${on ? IOS.green : '#E9E9EA'}"/><circle cx="${on ? rx - 15.5 : rx - 35.5}" cy="${cy}" r="13.5" fill="#FFF" stroke="#000" stroke-opacity=".06"/>`
      rx -= 61
    }
    if (row.chevron) { s += chevron(rx - 6, cy); rx -= 18 }
    if (row.check) { s += `<path d="M${rx - 16} ${cy} l5 5 10 -11" fill="none" stroke="${IOS.blue}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`; rx -= 26 }
    if (row.value && !row.valueDark) {
      s += text(rx, cy + 5, row.value, { size: 14.5, fill: IOS.light, anchor: 'end' })
      rx -= textWidth(row.value, 14.5, 400) + 10
    }
    if (row.swipe) {
      s += `<rect x="${gx + gw - 86}" y="${ry}" width="86" height="${h}" fill="${IOS.red}"${i === 0 ? ' rx="0"' : ''}/>` + text(gx + gw - 43, cy + 5.5, 'Delete', { size: 15, weight: 500, fill: '#FFF', anchor: 'middle' })
      rx = gx + gw - 96
      lx -= 10
    }
    const labelColour = row.blue ? IOS.blue : row.placeholder ? '#B8B8BD' : IOS.text
    const maxLabel = rx - lx - 4
    if (row.sub) {
      s += text(lx, cy - 3, truncate(row.label, 15, 400, maxLabel), { size: 15, fill: labelColour })
      s += text(lx, cy + 15, truncate(row.sub, 12.5, 400, maxLabel), { size: 12.5, fill: IOS.light })
    } else {
      s += text(lx, cy + 5.5, truncate(row.label, 15, 400, row.valueDark ? 80 : maxLabel), { size: 15, fill: labelColour })
    }
    if (row.valueDark) s += text(gx + 110, cy + 5.5, row.value, { size: 15, fill: IOS.text })
    if (i < b.rows.length - 1) s += `<rect x="${r1(row.select || row.minus || row.plus ? gx + 16 + 32 + (row.icon ? 43 : 0) : row.icon && !row.plainIcon ? lx : gx + 16)}" y="${r1(ry + h - 0.5)}" width="${r1(gx + gw - (row.icon && !row.plainIcon ? lx : gx + 16))}" height="0.6" fill="${IOS.sep}"/>`
    if (row.swipe && row.hl) {
      ctx.hls.push({ hl: row.hl, box: { x: gx + gw - 86, y: ry, w: 86, h }, pos: 'below' })
    } else if (row.hl || row.avoid) {
      const n = row.span || 1
      const hh = heights.slice(i, i + n).reduce((a, c) => a + c, 0)
      const pos = i === 0 && b.header ? 'below' : row.toggle && i > 0 ? 'left' : undefined
      ctx.hls.push({ hl: row.hl || row.avoid, avoid: !!row.avoid, pos, box: { x: gx, y: ry, w: gw, h: hh } })
    }
    ry += h
  })
  y = ry
  if (b.footer) {
    const lines = wrap(b.footer, 12.5, 400, gw - 32)
    lines.forEach((l, i) => { s += text(gx + 16, y + 20 + i * 16, l, { size: 12.5, fill: IOS.grey }) })
    y += 10 + lines.length * 16
  }
  return { s, y: y + 18 }
}

function iosBlock (b, y, ctx) {
  let s = ''
  const gx = 16
  const gw = W - 32
  switch (b.type) {
    case 'group': return iosGroup(b, y, ctx)
    case 'caption':
      return { s: text(gx + 16, y + 14, b.text, { size: 12.5, fill: IOS.grey }), y: y + 22 }
    case 'note': {
      const lines = wrap(b.text, 13.5, 400, gw - 32)
      s += `<rect x="${gx}" y="${y}" width="${gw}" height="${lines.length * 18 + 22}" rx="12" fill="${IOS.card}"/>`
      lines.forEach((l, i) => { s += text(gx + 16, y + 25 + i * 18, l, { size: 13.5, fill: IOS.grey }) })
      return { s, y: y + lines.length * 18 + 22 + 16 }
    }
    case 'search':
      s += `<rect x="${gx}" y="${y}" width="${gw}" height="38" rx="12" fill="#E3E3E8"/>` + glyph('search', gx + 10, y + 10, 18, IOS.light, 2.2) + text(gx + 36, y + 24.5, 'Search', { size: 16, fill: IOS.light })
      return { s, y: y + 52 }
    case 'profile': {
      const h = 76
      s += `<rect x="${gx}" y="${y}" width="${gw}" height="${h}" rx="12" fill="${IOS.card}"/>`
      s += `<circle cx="${gx + 42}" cy="${y + h / 2}" r="26" fill="#A8B4C4"/>` + text(gx + 42, y + h / 2 + 7, b.initials, { size: 19, weight: 600, fill: '#FFF', anchor: 'middle' })
      s += text(gx + 80, y + h / 2 - 3, b.name, { size: 18, weight: 600 }) + text(gx + 80, y + h / 2 + 16, b.sub, { size: 12.5, fill: IOS.light })
      s += chevron(gx + gw - 22, y + h / 2)
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: gx, y, w: gw, h } })
      return { s, y: y + h + 18 }
    }
    case 'avatar':
      s += `<circle cx="${W / 2}" cy="${y + 44}" r="42" fill="#A8B4C4"/>` + text(W / 2, y + 54, b.initials, { size: 30, weight: 600, fill: '#FFF', anchor: 'middle' })
      s += text(W / 2, y + 116, b.name, { size: 21, weight: 700, anchor: 'middle' }) + text(W / 2, y + 136, b.sub, { size: 13.5, fill: IOS.light, anchor: 'middle' })
      return { s, y: y + 158 }
    case 'hero': {
      s += glyph(b.icon, gx + 8, y + 4, 44, b.colour || IOS.blue, 2)
      s += text(gx + 8, y + 80, b.title, { size: 20, weight: 700 })
      const lines = wrap(b.text, 15, 400, gw - 16)
      lines.forEach((l, i) => { s += text(gx + 8, y + 104 + i * 20, l, { size: 15, fill: IOS.grey }) })
      return { s, y: y + 104 + lines.length * 20 + 14 }
    }
    case 'features':
      b.items.forEach(it => {
        s += glyph(it.icon, gx + 10, y + 2, 24, IOS.blue, 2)
        s += text(gx + 48, y + 14, it.title, { size: 14.5, weight: 600 })
        const lines = wrap(it.text, 13, 400, gw - 56)
        lines.forEach((l, i) => { s += text(gx + 48, y + 32 + i * 17, l, { size: 13, fill: IOS.grey }) })
        y += 32 + lines.length * 17 + 8
      })
      return { s, y: y + 8 }
    case 'button': {
      const h = 50
      const style = b.style || 'filled'
      const fill = style === 'filled' ? IOS.blue : style === 'grey' ? '#E9E9EE' : IOS.card
      const tc = style === 'filled' ? '#FFF' : IOS.text
      s += `<rect x="${gx}" y="${y}" width="${gw}" height="${h}" rx="25" fill="${fill}"/>` + text(W / 2, y + 31, b.text, { size: 15.5, weight: 600, fill: tc, anchor: 'middle' })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: gx, y, w: gw, h } })
      return { s, y: y + h + 12 }
    }
    case 'text': {
      const title = b.style === 'title'
      const size = title ? 19 : 15
      const lines = wrap(b.text, size, title ? 700 : 400, gw - 8)
      lines.forEach((l, i) => { s += text(gx + 4, y + size + i * (size + 5), l, { size, weight: title ? 700 : 400, fill: title ? IOS.text : IOS.grey }) })
      return { s, y: y + lines.length * (size + 5) + 12 }
    }
    case 'field':
      s += `<rect x="${gx}" y="${y}" width="${gw}" height="46" rx="23" fill="#E9E9EE"/>` + text(gx + 20, y + 28.5, b.placeholder, { size: 15, fill: '#A1A1A6' })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: gx, y, w: gw, h: 46 } })
      return { s, y: y + 58 }
    case 'link':
      return { s: text(gx + 4, y + 14, b.text, { size: 14.5, fill: IOS.blue }), y: y + 30 }
    case 'picker': {
      const h = 190
      const cy = y + h / 2
      s += `<rect x="${gx}" y="${y}" width="${gw}" height="${h}" rx="12" fill="${IOS.card}"/>`
      s += `<rect x="${gx + 10}" y="${cy - 17}" width="${gw - 20}" height="34" rx="9" fill="#EEEEF0"/>`
      const cols = [W / 2 - 60, W / 2 + 50]
      ;[-3, -2, -1, 1, 2, 3].forEach(d => {
        const op = [0.18, 0.32, 0.55][3 - Math.abs(d)]
        cols.forEach((cx, ci) => { s += `<text x="${cx}" y="${cy + 6 + d * 30}" font-family="${FONT}" font-size="${20 - Math.abs(d) * 1.5}" fill="#000" fill-opacity="${op}" text-anchor="end">${d < 0 ? [57, 58, 59][d + 3] : d}</text>` })
      })
      s += text(cols[0], cy + 7, '0', { size: 21, anchor: 'end' }) + text(cols[0] + 8, cy + 7, 'hours', { size: 16 })
      s += text(cols[1], cy + 7, '0', { size: 21, anchor: 'end' }) + text(cols[1] + 8, cy + 7, 'min', { size: 16 })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: gx + 10, y: cy - 17, w: gw - 20, h: 34 } })
      return { s, y: y + h + 18 }
    }
    case 'urlbar':
      s += `<rect x="${gx}" y="${y}" width="${gw}" height="42" rx="21" fill="#FFF" stroke="#E0E0E5"/>` + glyph('lock', W / 2 - textWidth(b.text, 15, 400) / 2 - 22, y + 13, 15, IOS.light, 2.2) + text(W / 2, y + 26.5, b.text, { size: 15, anchor: 'middle' })
      return { s, y: y + 60 }
    case 'passcode': {
      s += text(W / 2, y + 26, b.title, { size: 17, weight: 600, anchor: 'middle' })
      s += text(W / 2, y + 56, b.text, { size: 15, fill: IOS.grey, anchor: 'middle' })
      const filled = b.filled || 0
      ;[0, 1, 2, 3].forEach(i => {
        const cx = W / 2 - 51 + i * 34
        s += i < filled ? `<circle cx="${cx}" cy="${y + 92}" r="7.5" fill="#000"/>` : `<circle cx="${cx}" cy="${y + 92}" r="7" fill="none" stroke="#000" stroke-width="1.4"/>`
      })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: W / 2 - 70, y: y + 76, w: 140, h: 32 }, pos: 'below' })
      const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], null, ['0', ''], null]
      keys.forEach((k, i) => {
        if (!k) return
        const cx = W / 2 + ((i % 3) - 1) * 92
        const cy = y + 164 + Math.floor(i / 3) * 78
        s += `<circle cx="${cx}" cy="${cy}" r="33" fill="#E3E3E8"/>` + text(cx, cy + (k[1] ? 4 : 9), k[0], { size: 28, anchor: 'middle' })
        if (k[1]) s += text(cx, cy + 19, k[1], { size: 9, weight: 600, anchor: 'middle', ls: 1.5 })
      })
      return { s, y: y + 164 + 3 * 78 + 50 }
    }
    case 'chart': {
      const h = 186
      s += `<rect x="${gx}" y="${y}" width="${gw}" height="${h}" rx="12" fill="${IOS.card}"/>`
      s += text(gx + 16, y + 26, 'Daily Average', { size: 13, fill: IOS.grey }) + text(gx + 16, y + 58, b.value, { size: 28, weight: 600 })
      const bars = b.bars || [40, 70, 30, 55, 60, 20, 45]
      const base = y + h - 34
      bars.forEach((v, i) => {
        const x = gx + 24 + i * 40
        s += `<rect x="${x}" y="${base - v}" width="20" height="${v}" rx="3" fill="#30B0C7"/>` + text(x + 10, base + 18, 'MTWTFSS'[i], { size: 11, fill: IOS.light, anchor: 'middle' })
      })
      s += `<rect x="${gx + 16}" y="${base}" width="${gw - 32}" height="1" fill="${IOS.sep}"/>`
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: gx, y, w: gw, h } })
      return { s, y: y + h + 18 }
    }
    case 'page': {
      s += `<rect x="0" y="${y}" width="${W}" height="54" fill="${b.colour || '#1A1A1A'}"/>` + text(20, y + 34, b.title, { size: 19, weight: 700, fill: '#FFF' })
      let py = y + 76
      s += text(20, py, b.heading, { size: 20, weight: 700 })
      py += 18
      ;[300, 280, 310, 190].forEach(w => { py += 18; s += `<rect x="20" y="${py}" width="${w}" height="9" rx="4.5" fill="#DADADF"/>` })
      py += 28
      s += `<rect x="20" y="${py}" width="${W - 40}" height="110" rx="12" fill="${b.tint || '#E8F1FB'}"/>`
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: 10, y, w: W - 20, h: py + 110 - y } })
      return { s, y: py + 130 }
    }
    case 'message': {
      const dark = b.dark
      const fg = dark ? '#FFF' : IOS.text
      const sub = dark ? '#C7C7CC' : IOS.grey
      s += `<circle cx="${W / 2}" cy="${y + 58}" r="36" fill="${dark ? '#3A3A3C' : '#E3E3E8'}"/>` + glyph(b.icon, W / 2 - 18, y + 40, 36, dark ? '#FFF' : IOS.light, 2)
      s += text(W / 2, y + 132, b.title, { size: 24, weight: 700, fill: fg, anchor: 'middle' })
      const lines = wrap(b.text, 15, 400, gw - 40)
      lines.forEach((l, i) => { s += text(W / 2, y + 160 + i * 20, l, { size: 15, fill: sub, anchor: 'middle' }) })
      const by = y + 160 + lines.length * 20 + 16
      if (b.button) {
        const tw = textWidth(b.button, 15, 600) + 40
        s += `<rect x="${r1(W / 2 - tw / 2)}" y="${r1(by)}" width="${r1(tw)}" height="42" rx="21" fill="${dark ? '#FFF' : '#E3E3E8'}"/>` + text(W / 2, by + 26.5, b.button, { size: 15, weight: 600, fill: dark ? '#000' : IOS.blue, anchor: 'middle' })
      }
      return { s, y: by + 90 }
    }
  }
  return { s, y }
}

// ------------------------------------------------------------------ Android (Material 3)
function andBar (bar, ctx) {
  let s = ''
  const y = 40
  if (bar.search) {
    s += `<rect x="16" y="${y + 6}" width="${W - 32}" height="48" rx="24" fill="${AND.surface}"/>` + glyph('arrow-left', 30, y + 18, 22, AND.grey, 2) + text(66, y + 36, bar.search, { size: 16, fill: AND.text }) + glyph('x', W - 54, y + 19, 20, AND.grey, 2)
    return { s, y: y + 68 }
  }
  if (bar.back) s += glyph('arrow-left', 18, y + 17, 24, AND.text, 2)
  if (bar.title) s += text(bar.back ? 62 : 20, y + 36, bar.title, { size: 21, fill: AND.text })
  return { s, y: y + 64 }
}

function andRowHeight (row) { return row.sub ? 72 : 56 }

function andBlock (b, y, ctx) {
  let s = ''
  switch (b.type) {
    case 'tabs': {
      const n = b.items.length
      const tw = W / n
      b.items.forEach((t, i) => {
        const on = i === b.active
        s += text(tw * i + tw / 2, y + 26, t, { size: 14, weight: 600, fill: on ? AND.blue : AND.grey, anchor: 'middle' })
        if (on) s += `<rect x="${r1(tw * i + tw / 2 - 28)}" y="${y + 43}" width="56" height="3" rx="1.5" fill="${AND.blue}"/>`
      })
      s += `<rect x="0" y="${y + 46}" width="${W}" height="1" fill="${AND.sep}"/>`
      return { s, y: y + 56 }
    }
    case 'header':
      return { s: text(20, y + 26, b.text, { size: 14, weight: 600, fill: AND.blue }), y: y + 38 }
    case 'list': {
      b.rows.forEach((row, i) => {
        const h = andRowHeight(row)
        const cy = y + h / 2
        let lx = 20
        if (row.radio) {
          s += `<circle cx="${lx + 10}" cy="${cy}" r="9" fill="none" stroke="${row.radio === 'on' ? AND.blue : AND.grey}" stroke-width="2"/>` + (row.radio === 'on' ? `<circle cx="${lx + 10}" cy="${cy}" r="5" fill="${AND.blue}"/>` : '')
          lx += 44
        }
        if (row.letter) {
          s += `<circle cx="${lx + 18}" cy="${cy}" r="18" fill="${row.colour || AND.blue}"/>` + text(lx + 18, cy + 6.5, row.letter, { size: 18, weight: 700, fill: '#FFF', anchor: 'middle' })
          lx += 52
        } else if (row.app) {
          s += `<circle cx="${lx + 18}" cy="${cy}" r="18" fill="${row.colour || AND.blue}"/>` + glyph(row.icon, lx + 8, cy - 10, 20, '#FFF', 2.2)
          lx += 52
        } else if (row.icon) {
          s += glyph(row.icon, lx, cy - 12, 24, AND.grey, 2)
          lx += 52
        }
        let rx = W - 20
        if (row.switch) {
          const on = row.switch === 'on'
          s += on
            ? `<rect x="${rx - 52}" y="${cy - 16}" width="52" height="32" rx="16" fill="${AND.blue}"/><circle cx="${rx - 16}" cy="${cy}" r="12" fill="#FFF"/><path d="M${rx - 21} ${cy} l3.5 3.5 7 -7" fill="none" stroke="${AND.blue}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
            : `<rect x="${rx - 51}" y="${cy - 15}" width="50" height="30" rx="15" fill="#E1E3E1" stroke="${AND.light}" stroke-width="2"/><circle cx="${rx - 35}" cy="${cy}" r="8" fill="${AND.light}"/>`
          rx -= 64
        }
        if (row.value) {
          s += text(rx, cy + 5, row.value, { size: 14, fill: row.muted ? AND.light : AND.grey, anchor: 'end' })
          rx -= textWidth(row.value, 14, 400) + 12
        }
        const max = rx - lx - 4
        const lc = row.muted ? AND.light : AND.text
        if (row.sub) {
          s += text(lx, cy - 3, truncate(row.label, 16, 400, max), { size: 16, fill: lc }) + text(lx, cy + 17, truncate(row.sub, 13.5, 400, max), { size: 13.5, fill: AND.grey })
        } else s += text(lx, cy + 6, truncate(row.label, 16, 400, max), { size: 16, fill: lc })
        if (row.hl || row.avoid) {
          const n = row.span || 1
          const hh = b.rows.slice(i, i + n).map(andRowHeight).reduce((a, c) => a + c, 0)
          ctx.hls.push({ hl: row.hl || row.avoid, avoid: !!row.avoid, box: { x: 10, y, w: W - 20, h: hh } })
        }
        y += h
      })
      return { s, y: y + 6 }
    }
    case 'days': {
      const gap = (W - 40) / 7
      b.items.forEach((d, i) => {
        const cx = 20 + gap * i + gap / 2
        const on = i === b.active
        s += `<circle cx="${r1(cx)}" cy="${y + 26}" r="18" fill="${on ? AND.blue : AND.surface}"/>` + text(cx, y + 31, d, { size: 14, weight: 600, fill: on ? '#FFF' : AND.grey, anchor: 'middle' })
      })
      return { s, y: y + 62 }
    }
    case 'mbutton': {
      s += `<rect x="20" y="${y + 8}" width="${W - 40}" height="44" rx="22" fill="${AND.blue}"/>` + text(W / 2, y + 35, b.text, { size: 14.5, weight: 600, fill: '#FFF', anchor: 'middle' })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: 20, y: y + 8, w: W - 40, h: 44 } })
      return { s, y: y + 68 }
    }
    case 'device': {
      s += `<rect x="16" y="${y + 8}" width="${W - 32}" height="76" rx="16" fill="${AND.surface}"/>` + glyph('smartphone', 34, y + 32, 28, AND.blue, 2)
      s += text(80, y + 42, b.name, { size: 16, weight: 600, fill: AND.text }) + text(80, y + 62, b.sub, { size: 13.5, fill: AND.grey })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: 16, y: y + 8, w: W - 32, h: 76 } })
      return { s, y: y + 96 }
    }
    case 'ahero': {
      s += glyph(b.icon, 22, y + 8, 40, AND.blue, 2)
      const tl = wrap(b.title, 24, 400, W - 44)
      tl.forEach((l, i) => { s += text(22, y + 88 + i * 30, l, { size: 24, fill: AND.text }) })
      y += (tl.length - 1) * 30
      const lines = wrap(b.text, 15, 400, W - 44)
      lines.forEach((l, i) => { s += text(22, y + 116 + i * 21, l, { size: 15, fill: AND.grey }) })
      return { s, y: y + 116 + lines.length * 21 + 10 }
    }
    case 'afield': {
      s += `<rect x="20" y="${y + 10}" width="${W - 40}" height="54" rx="6" fill="#FFF" stroke="${b.focus ? AND.blue : AND.light}" stroke-width="${b.focus ? 2 : 1.2}"/>`
      s += `<rect x="32" y="${y + 3}" width="${textWidth(b.label, 12, 400) + 10}" height="14" fill="${b.bg || AND.bg}"/>` + text(37, y + 14, b.label, { size: 12, fill: b.focus ? AND.blue : AND.grey })
      s += text(36, y + 43, b.value || b.placeholder || '', { size: 16, fill: b.value ? AND.text : AND.light })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: 20, y: y + 10, w: W - 40, h: 54 } })
      return { s, y: y + 78 }
    }
    case 'actions': {
      if (b.left && b.leftButton) {
        const lw = textWidth(b.left, 14.5, 600) + 44
        s += `<rect x="20" y="${y + 10}" width="${r1(lw)}" height="40" rx="20" fill="#FFF" stroke="${AND.light}" stroke-width="1.2"/>` + text(20 + lw / 2, y + 35, b.left, { size: 14.5, weight: 600, fill: AND.blue, anchor: 'middle' })
        if (b.leftHl) ctx.hls.push({ hl: b.leftHl, box: { x: 20, y: y + 10, w: lw, h: 40 } })
      } else if (b.left) s += text(36, y + 34, b.left, { size: 14.5, weight: 600, fill: AND.blue })
      const tw = textWidth(b.right, 14.5, 600) + 44
      s += `<rect x="${r1(W - 20 - tw)}" y="${y + 10}" width="${r1(tw)}" height="40" rx="20" fill="${AND.blue}"/>` + text(W - 20 - tw / 2, y + 35, b.right, { size: 14.5, weight: 600, fill: '#FFF', anchor: 'middle' })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: W - 20 - tw, y: y + 10, w: tw, h: 40 } })
      return { s, y: y + 64 }
    }
    case 'pin': {
      s += glyph('key-round', W / 2 - 18, y + 4, 36, AND.blue, 2)
      s += text(W / 2, y + 74, b.title, { size: 22, fill: AND.text, anchor: 'middle' })
      s += text(W / 2, y + 100, b.text, { size: 14.5, fill: AND.grey, anchor: 'middle' })
      const filled = b.filled || 0
      ;[0, 1, 2, 3].forEach(i => {
        const cx = W / 2 - 51 + i * 34
        s += i < filled ? `<circle cx="${cx}" cy="${y + 136}" r="7" fill="${AND.text}"/>` : `<circle cx="${cx}" cy="${y + 136}" r="7" fill="none" stroke="${AND.grey}" stroke-width="1.4"/>`
      })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: W / 2 - 70, y: y + 120, w: 140, h: 32 }, pos: 'below' })
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', null, '0', null]
      keys.forEach((k, i) => {
        if (!k) return
        const cx = W / 2 + ((i % 3) - 1) * 100
        const cy = y + 214 + Math.floor(i / 3) * 62
        s += `<rect x="${cx - 44}" y="${cy - 25}" width="88" height="50" rx="25" fill="${AND.surface}"/>` + text(cx, cy + 9, k, { size: 24, fill: AND.text, anchor: 'middle' })
      })
      return { s, y: y + 214 + 3 * 62 + 40 }
    }
    case 'dialog': {
      s += `<rect x="0" y="${y - 400}" width="${W}" height="1200" fill="#000" fill-opacity=".32"/>`
      const dy = y + 10
      const dh = 250
      s += `<rect x="24" y="${dy}" width="${W - 48}" height="${dh}" rx="28" fill="${AND.surface}"/>`
      s += text(48, dy + 44, b.title, { size: 22, fill: AND.text })
      s += `<rect x="44" y="${dy + 76}" width="${W - 88}" height="54" rx="6" fill="${AND.surface}" stroke="${AND.blue}" stroke-width="2"/>`
      s += `<rect x="54" y="${dy + 69}" width="${textWidth(b.label, 12, 400) + 10}" height="14" fill="${AND.surface}"/>` + text(59, dy + 80, b.label, { size: 12, fill: AND.blue })
      s += text(58, dy + 109, b.value, { size: 16, fill: AND.text })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: 44, y: dy + 76, w: W - 88, h: 54 } })
      s += text(W - 120, dy + 206, 'Cancel', { size: 14.5, weight: 600, fill: AND.blue, anchor: 'end' }) + text(W - 56, dy + 206, b.ok || 'Add', { size: 14.5, weight: 600, fill: AND.blue, anchor: 'end' })
      if (b.okHl) ctx.hls.push({ hl: b.okHl, box: { x: W - 92, y: dy + 186, w: 48, h: 30 }, pos: 'below' })
      return { s, y: dy + dh + 40 }
    }
    case 'storeitem': {
      s += `<rect x="20" y="${y + 8}" width="60" height="60" rx="14" fill="#FFF" stroke="${AND.sep}"/>` + glyph(b.icon, 32, y + 20, 36, '#1E8E3E', 2)
      s += text(94, y + 32, b.name, { size: 16, weight: 600, fill: AND.text }) + text(94, y + 52, b.sub, { size: 13, fill: AND.grey })
      const bw = W - 40
      s += `<rect x="20" y="${y + 86}" width="${bw}" height="42" rx="21" fill="#01875F"/>` + text(W / 2, y + 112, b.button, { size: 15, weight: 600, fill: '#FFF', anchor: 'middle' })
      if (b.hl) ctx.hls.push({ hl: b.hl, box: { x: 20, y: y + 86, w: bw, h: 42 } })
      s += text(20, y + 160, 'Set screen time limits · Manage apps', { size: 13, fill: AND.grey })
      return { s, y: y + 180 }
    }
  }
  return { s, y }
}

// ------------------------------------------------------------------ whole screen
function render (screen, opts = {}) {
  const ctx = { hls: [] }
  const os = screen.os
  const dark = screen.blocks.some(b => b.dark)
  const bg = dark ? '#000000' : os === 'android' ? AND.bg : IOS.bg
  let body = ''
  const bar = (os === 'android' ? andBar : iosBar)(screen.bar || {}, ctx)
  body += bar.s
  let y = bar.y
  for (const b of screen.blocks) {
    const out = (os === 'android' ? andBlock : iosBlock)(b, y, ctx)
    body += out.s
    y = out.y
  }
  const H = Math.max(Math.round(y + (screen.cut ? 10 : 6)), 240)
  const hls = ctx.hls.map(h => highlightBox(h.hl, h.box, h.avoid, h.pos)).join('')
  const OW = W + BEZEL * 2
  const OH = H + BEZEL * 2
  const id = (screen.id || 's').replace(/[^\w-]/g, '')
  const fade = screen.cut
    ? `<defs><linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg}" stop-opacity="0"/><stop offset="1" stop-color="${bg}"/></linearGradient></defs><rect x="0" y="${H - 56}" width="${W}" height="56" fill="url(#${id}-fade)"/>`
    : ''
  const title = opts.title !== false && screen.alt ? `<title>${esc(screen.alt)}</title>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OW} ${OH}" width="${OW}" height="${OH}" role="img">${title}` +
    `<rect x="0" y="0" width="${OW}" height="${OH}" rx="${os === 'android' ? 30 : 40}" fill="#1D1D1F"/>` +
    `<defs><clipPath id="${id}-clip"><rect x="0" y="0" width="${W}" height="${H}" rx="${os === 'android' ? 23 : 33}"/></clipPath></defs>` +
    `<g transform="translate(${BEZEL} ${BEZEL})"><g clip-path="url(#${id}-clip)"><rect x="0" y="0" width="${W}" height="${H}" fill="${bg}"/>` +
    statusBar(os, dark) + body + fade + '</g>' + hls + '</g></svg>'
}

module.exports = { render, W, BEZEL }
