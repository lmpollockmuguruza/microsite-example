/*
 * Comic kit: characters, props, backgrounds and lettering for
 * "The Off-Grid Gang", drawn as SVG in a bold indie-comic style
 * (thick ink lines, flat colour, halftone dots).
 *
 * All text is real <text> in Google Fonts (Bangers for titles and sound
 * effects, Comic Neue for lettering), so it stays editable in Figma.
 */
const INK = '#1B1B22'
const LW = 3.5 // ink line width

const C = {
  paper: '#FFFDF6',
  sky: '#8FD3FF', skyDeep: '#4FA8E8', sunset1: '#FFB36B', sunset2: '#FF7E8A',
  grass: '#6BCB77', grassDark: '#3FA35A', tarmac: '#B9BEC8', brick: '#D9644A',
  yellow: '#FFD23F', coral: '#FF6B4A', teal: '#2EC4B6', purple: '#7B5CD6',
  night: '#2A2550', nightDeep: '#16132E', white: '#FFFFFF'
}

const CAST = {
  kofi: { skin: '#7A4A2B', hair: '#1D1410', top: '#FF8A3D', topTrim: '#FFFFFF', bottom: '#27407A', shoes: '#FFFFFF', shoeTrim: '#E63946' },
  priya: { skin: '#C68A5E', hair: '#15100E', top: '#7B5CD6', topTrim: '#9C82EA', bottom: '#2B2B3A', shoes: '#FFD23F', shoeTrim: '#1B1B22' },
  maisie: { skin: '#F7D5BC', hair: '#E2733A', top: '#2FB38A', topTrim: '#25947A', bottom: '#4A6FB5', shoes: '#FF6B4A', shoeTrim: '#FFFFFF' },
  tomasz: { skin: '#EDC3A0', hair: '#6B4226', top: '#5B7DB1', topTrim: '#46669A', bottom: '#2E2E38', shoes: '#E9E3D5', shoeTrim: '#1B1B22' }
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const f = n => Math.round(n * 10) / 10
let uid = 0
const nid = p => `${p}${++uid}`

// ------------------------------------------------------------------ lettering
function textWidth (s, size, font) {
  const k = font === 'Bangers' ? 0.48 : 0.56
  let w = 0
  for (const ch of String(s)) w += (/[ il.,:;'!|]/.test(ch) ? 0.45 : /[MW@]/.test(ch) ? 1.4 : /[A-Z0-9?]/.test(ch) ? 1.12 : 1) * size * k
  return w
}
function wrap (s, size, maxW, font) {
  const out = []
  String(s).split('\n').forEach(par => {
    let line = ''
    par.split(/\s+/).forEach(w => {
      const t = line ? line + ' ' + w : w
      if (textWidth(t, size, font) > maxW && line) { out.push(line); line = w } else line = t
    })
    out.push(line)
  })
  return out
}
function txt (x, y, s, o = {}) {
  const font = o.font || 'Comic Neue'
  return `<text x="${f(x)}" y="${f(y)}" font-family="${font}" font-size="${o.size || 18}" font-weight="${o.weight || (font === 'Comic Neue' ? 700 : 400)}" fill="${o.fill || INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 6}" stroke-linejoin="round" paint-order="stroke"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.rotate ? ` transform="rotate(${o.rotate} ${f(x)} ${f(y)})"` : ''}>${esc(s)}</text>`
}

/** Speech bubble. x,y = top-left. tail = [tx, ty] the point it aims at. */
function bubble (x, y, w, s, tail, o = {}) {
  const size = o.size || 19
  const lines = wrap(s.toUpperCase(), size, w - 30)
  const lh = size * 1.18
  const h = lines.length * lh + 24
  const cx = x + w / 2
  let tailPath = ''
  if (tail) {
    const [tx, ty] = tail
    const bx = Math.max(x + 26, Math.min(x + w - 26, tx < cx ? cx - w * 0.18 : cx + w * 0.18))
    const by = ty > y + h / 2 ? y + h - 4 : y + 4
    tailPath = `M${f(bx - 13)} ${f(by)} Q${f((bx + tx) / 2)} ${f((by + ty) / 2)} ${f(tx)} ${f(ty)} Q${f((bx + tx) / 2 + 8)} ${f((by + ty) / 2)} ${f(bx + 13)} ${f(by)}`
  }
  const fill = o.fill || C.white
  const shout = o.shout
  let shape
  if (shout) {
    const pts = []
    const n = 18
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const r = i % 2 ? 1 : 1.12
      pts.push(`${f(cx + Math.cos(a) * (w / 2 + 6) * r)},${f(y + h / 2 + Math.sin(a) * (h / 2 + 10) * r)}`)
    }
    shape = `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`
  } else {
    shape = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(h / 2, 26))}" fill="${fill}" stroke="${INK}" stroke-width="${LW}"/>`
  }
  let out = ''
  if (tailPath) out += `<path d="${tailPath}" fill="${fill}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`
  out += shape
  if (tailPath) {
    // cover the tail's join with the bubble
    const [tx] = tail
    const bx = Math.max(x + 26, Math.min(x + w - 26, tx < cx ? cx - w * 0.18 : cx + w * 0.18))
    const by = tail[1] > y + h / 2 ? y + h - LW : y + LW
    out += `<rect x="${f(bx - 11)}" y="${f(by - 3)}" width="22" height="6" fill="${fill}"/>`
  }
  lines.forEach((l, i) => { out += txt(cx, y + 12 + size + i * lh - 2, l, { size, anchor: 'middle', fill: o.color || INK }) })
  return { svg: out, h }
}

/** Yellow caption box */
function caption (x, y, w, s, o = {}) {
  const size = o.size || 17
  const lines = wrap(s.toUpperCase(), size, w - 22)
  const h = lines.length * size * 1.2 + 16
  let out = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${o.fill || C.yellow}" stroke="${INK}" stroke-width="${LW}"/>`
  lines.forEach((l, i) => { out += txt(x + 11, y + 8 + size + i * size * 1.2 - 2, l, { size, fill: o.color || INK }) })
  return out
}

/** Sound effect lettering */
function sfx (x, y, s, o = {}) {
  return txt(x, y, s, { font: 'Bangers', size: o.size || 64, fill: o.fill || C.yellow, stroke: INK, sw: o.sw || 9, anchor: o.anchor || 'middle', rotate: o.rotate || -6, ls: o.ls || 2 })
}

// ------------------------------------------------------------------ patterns and panels
function defs () {
  return `<defs>
    <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="3" cy="3" r="2.1" fill="#000" fill-opacity=".14"/></pattern>
    <pattern id="dotsLight" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="2.5" cy="2.5" r="1.6" fill="#FFF" fill-opacity=".35"/></pattern>
    <radialGradient id="bitGlow"><stop offset="0" stop-color="#7DF9FF" stop-opacity=".85"/><stop offset=".55" stop-color="#7DF9FF" stop-opacity=".25"/><stop offset="1" stop-color="#7DF9FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="bitGlowDim"><stop offset="0" stop-color="#7DF9FF" stop-opacity=".35"/><stop offset="1" stop-color="#7DF9FF" stop-opacity="0"/></radialGradient>
    <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.skyDeep}"/><stop offset="1" stop-color="${C.sky}"/></linearGradient>
    <linearGradient id="skySunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sunset2}"/><stop offset="1" stop-color="${C.sunset1}"/></linearGradient>
    <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.nightDeep}"/><stop offset="1" stop-color="${C.night}"/></linearGradient>
  </defs>`
}

/** A panel: clipped contents with a thick ink border */
function panel (x, y, w, h, content) {
  const id = nid('p')
  return `<g><clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="4"/></clipPath>` +
    `<g clip-path="url(#${id})">${content}</g>` +
    `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="4" fill="none" stroke="${INK}" stroke-width="5"/></g>`
}

function fill (x, y, w, h, colour, dots = 'dots') {
  return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${colour}"/>` + (dots ? `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#${dots})"/>` : '')
}

function speedLines (cx, cy, r1, r2, n, colour = '#FFF', op = 0.7) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (i % 3) * 0.05
    const w = 3 + (i % 4)
    s += `<path d="M${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)} L${f(cx + Math.cos(a + 0.02) * r2)} ${f(cy + Math.sin(a + 0.02) * r2)}" stroke="${colour}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`
  }
  return s
}

function burst (cx, cy, r, colour, spikes = 14) {
  const pts = []
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2
    const rr = i % 2 ? r * 0.72 : r
    pts.push(`${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)}`)
  }
  return `<polygon points="${pts.join(' ')}" fill="${colour}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`
}

// ------------------------------------------------------------------ faces
function face (cx, cy, r, expr, look, skin) {
  const lx = look * r * 0.16
  const e = r * 0.34
  const ey = cy - r * 0.02
  const ex1 = cx - e + lx
  const ex2 = cx + e + lx
  let s = ''
  const brow = (dy1, dy2, raise1 = 0, raise2 = 0) =>
    `<path d="M${f(ex1 - 9)} ${f(ey - r * 0.36 - raise1 + dy1)} L${f(ex1 + 8)} ${f(ey - r * 0.38 - raise1 - dy1)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M${f(ex2 - 8)} ${f(ey - r * 0.38 - raise2 - dy2)} L${f(ex2 + 9)} ${f(ey - r * 0.36 - raise2 + dy2)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
  const dotEyes = (rr = 5) => `<ellipse cx="${f(ex1)}" cy="${f(ey)}" rx="${rr}" ry="${rr * 1.25}" fill="${INK}"/><ellipse cx="${f(ex2)}" cy="${f(ey)}" rx="${rr}" ry="${rr * 1.25}" fill="${INK}"/>` +
    `<circle cx="${f(ex1 + 1.5)}" cy="${f(ey - 2)}" r="1.6" fill="#FFF"/><circle cx="${f(ex2 + 1.5)}" cy="${f(ey - 2)}" r="1.6" fill="#FFF"/>`
  const my = cy + r * 0.42
  const mx = cx + lx * 1.2
  switch (expr) {
    case 'grin':
      s += `<path d="M${f(ex1 - 7)} ${f(ey + 2)} q7 -9 14 0 M${f(ex2 - 7)} ${f(ey + 2)} q7 -9 14 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      s += brow(0, 0, 4, 4)
      s += `<path d="M${f(mx - r * 0.38)} ${f(my - 6)} Q${f(mx)} ${f(my + r * 0.42)} ${f(mx + r * 0.38)} ${f(my - 6)} Z" fill="#7A1F2B" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M${f(mx - r * 0.18)} ${f(my + r * 0.14)} q${f(r * 0.18)} -${f(r * 0.1)} ${f(r * 0.36)} 0" fill="#FF7E8A"/>`
      break
    case 'shock':
      s += `<ellipse cx="${f(ex1)}" cy="${f(ey)}" rx="9" ry="11" fill="#FFF" stroke="${INK}" stroke-width="3"/><ellipse cx="${f(ex2)}" cy="${f(ey)}" rx="9" ry="11" fill="#FFF" stroke="${INK}" stroke-width="3"/>`
      s += `<circle cx="${f(ex1 + look * 2)}" cy="${f(ey)}" r="3.6" fill="${INK}"/><circle cx="${f(ex2 + look * 2)}" cy="${f(ey)}" r="3.6" fill="${INK}"/>`
      s += brow(0, 0, 9, 9)
      s += `<ellipse cx="${f(mx)}" cy="${f(my + 2)}" rx="${f(r * 0.15)}" ry="${f(r * 0.2)}" fill="#7A1F2B" stroke="${INK}" stroke-width="3.5"/>`
      break
    case 'smirk':
      s += dotEyes(4.6) + brow(0, 3, 0, 7)
      s += `<path d="M${f(mx - r * 0.2)} ${f(my + 2)} Q${f(mx + r * 0.1)} ${f(my + 8)} ${f(mx + r * 0.3)} ${f(my - 4)}" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      break
    case 'talk':
      s += dotEyes(4.8) + brow(0, 0, 2, 2)
      s += `<path d="M${f(mx - r * 0.22)} ${f(my - 2)} Q${f(mx)} ${f(my + r * 0.3)} ${f(mx + r * 0.22)} ${f(my - 2)} Z" fill="#7A1F2B" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
      break
    case 'worried':
      s += dotEyes(4.6) + brow(-3, -3, 3, 3)
      s += `<path d="M${f(mx - r * 0.22)} ${f(my + 4)} q${f(r * 0.11)} -6 ${f(r * 0.22)} 0 t${f(r * 0.22)} 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      break
    case 'sheepish':
      s += `<path d="M${f(ex1 - 6)} ${f(ey)} h12 M${f(ex2 - 6)} ${f(ey)} h12" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` + brow(-3, -3, 2, 2)
      s += `<path d="M${f(mx - r * 0.24)} ${f(my)} Q${f(mx)} ${f(my + 9)} ${f(mx + r * 0.24)} ${f(my)}" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      s += `<path d="M${f(cx + r * 0.72)} ${f(cy - r * 0.55)} q6 10 0 16 q-6 -6 0 -16z" fill="#8FD3FF" stroke="${INK}" stroke-width="2"/>`
      break
    default: // happy
      s += dotEyes(4.8) + brow(0, 0, 3, 3)
      s += `<path d="M${f(mx - r * 0.3)} ${f(my - 3)} Q${f(mx)} ${f(my + r * 0.3)} ${f(mx + r * 0.3)} ${f(my - 3)}" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
  }
  // cheeks
  s += `<ellipse cx="${f(ex1 - 6)}" cy="${f(ey + r * 0.32)}" rx="7" ry="4" fill="#FF6B6B" fill-opacity=".28"/><ellipse cx="${f(ex2 + 6)}" cy="${f(ey + r * 0.32)}" rx="7" ry="4" fill="#FF6B6B" fill-opacity=".28"/>`
  return s
}

// ------------------------------------------------------------------ heads with hair
function head (who, cx, cy, r, expr, look) {
  const p = CAST[who]
  const st = `stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"`
  let back = ''
  let front = ''
  if (who === 'kofi') {
    const blobs = [[-0.75, -0.45, 0.42], [-0.45, -0.82, 0.44], [0, -0.95, 0.46], [0.45, -0.82, 0.44], [0.78, -0.45, 0.42], [-0.2, -0.75, 0.4], [0.25, -0.72, 0.4]]
    back = blobs.map(([dx, dy, rr]) => `<circle cx="${f(cx + dx * r)}" cy="${f(cy + dy * r)}" r="${f(rr * r)}" fill="${p.hair}" ${st}/>`).join('')
    front = blobs.slice(0, 5).map(([dx, dy, rr]) => `<circle cx="${f(cx + dx * r)}" cy="${f(cy + dy * r)}" r="${f(rr * r * 0.86)}" fill="${p.hair}"/>`).join('')
    front += `<path d="M${f(cx - r * 0.95)} ${f(cy - r * 0.42)} Q${f(cx)} ${f(cy - r * 0.78)} ${f(cx + r * 0.95)} ${f(cy - r * 0.42)} L${f(cx + r * 0.9)} ${f(cy - r * 0.62)} Q${f(cx)} ${f(cy - r * 1.2)} ${f(cx - r * 0.9)} ${f(cy - r * 0.62)} Z" fill="${p.hair}"/>`
  } else if (who === 'priya') {
    back = `<path d="M${f(cx - r * 1.05)} ${f(cy + r * 0.6)} Q${f(cx - r * 1.2)} ${f(cy - r * 1.25)} ${f(cx)} ${f(cy - r * 1.1)} Q${f(cx + r * 1.2)} ${f(cy - r * 1.25)} ${f(cx + r * 1.05)} ${f(cy + r * 0.6)} Z" fill="${p.hair}" ${st}/>`
    // braid over the shoulder
    for (let i = 0; i < 5; i++) back += `<ellipse cx="${f(cx + r * 0.95 + i * 2)}" cy="${f(cy + r * 0.75 + i * r * 0.32)}" rx="${f(r * 0.2)}" ry="${f(r * 0.2)}" fill="${p.hair}" ${st}/>`
    back += `<circle cx="${f(cx + r * 1.03)}" cy="${f(cy + r * 2.35)}" r="${f(r * 0.1)}" fill="${C.yellow}" ${st}/>`
    front = `<path d="M${f(cx - r * 0.98)} ${f(cy - r * 0.1)} Q${f(cx - r * 0.9)} ${f(cy - r * 1.05)} ${f(cx + r * 0.1)} ${f(cy - r * 1.02)} Q${f(cx + r * 0.95)} ${f(cy - r * 0.95)} ${f(cx + r * 0.98)} ${f(cy - r * 0.1)} Q${f(cx + r * 0.5)} ${f(cy - r * 0.6)} ${f(cx - r * 0.1)} ${f(cy - r * 0.55)} Q${f(cx - r * 0.6)} ${f(cy - r * 0.5)} ${f(cx - r * 0.98)} ${f(cy - r * 0.1)} Z" fill="${p.hair}"/>`
    front += `<rect x="${f(cx - r * 0.7)}" y="${f(cy - r * 0.86)}" width="${f(r * 0.4)}" height="${f(r * 0.14)}" rx="${f(r * 0.07)}" fill="${C.yellow}" ${st} transform="rotate(-20 ${f(cx - r * 0.5)} ${f(cy - r * 0.8)})"/>`
  } else if (who === 'maisie') {
    back = `<circle cx="${f(cx - r * 0.82)}" cy="${f(cy - r * 0.82)}" r="${f(r * 0.38)}" fill="${p.hair}" ${st}/><circle cx="${f(cx + r * 0.82)}" cy="${f(cy - r * 0.82)}" r="${f(r * 0.38)}" fill="${p.hair}" ${st}/>`
    back += `<circle cx="${f(cx)}" cy="${f(cy - r * 0.15)}" r="${f(r * 1.03)}" fill="${p.hair}" ${st}/>`
    front = `<path d="M${f(cx - r * 0.97)} ${f(cy - r * 0.05)} Q${f(cx - r * 0.95)} ${f(cy - r * 1.02)} ${f(cx)} ${f(cy - r * 1.02)} Q${f(cx + r * 0.95)} ${f(cy - r * 1.02)} ${f(cx + r * 0.97)} ${f(cy - r * 0.05)} L${f(cx + r * 0.7)} ${f(cy - r * 0.42)} L${f(cx + r * 0.35)} ${f(cy - r * 0.3)} L${f(cx)} ${f(cy - r * 0.5)} L${f(cx - r * 0.35)} ${f(cy - r * 0.32)} L${f(cx - r * 0.7)} ${f(cy - r * 0.45)} Z" fill="${p.hair}"/>`
  } else if (who === 'tomasz') {
    back = `<path d="M${f(cx - r * 1.25)} ${f(cy + r * 1.1)} Q${f(cx - r * 1.4)} ${f(cy - r * 0.6)} ${f(cx)} ${f(cy - r * 0.4)} Q${f(cx + r * 1.4)} ${f(cy - r * 0.6)} ${f(cx + r * 1.25)} ${f(cy + r * 1.1)} Z" fill="${p.top}" ${st}/>`
    front = `<path d="M${f(cx - r * 1.0)} ${f(cy - r * 0.15)} L${f(cx - r * 0.95)} ${f(cy - r * 0.85)} L${f(cx - r * 0.55)} ${f(cy - r * 0.95)} L${f(cx - r * 0.45)} ${f(cy - r * 1.25)} L${f(cx - r * 0.1)} ${f(cy - r * 1.02)} L${f(cx + r * 0.2)} ${f(cy - r * 1.3)} L${f(cx + r * 0.42)} ${f(cy - r * 1.0)} L${f(cx + r * 0.85)} ${f(cy - r * 1.1)} L${f(cx + r * 0.8)} ${f(cy - r * 0.75)} L${f(cx + r * 1.0)} ${f(cy - r * 0.15)} Q${f(cx + r * 0.6)} ${f(cy - r * 0.55)} ${f(cx + r * 0.1)} ${f(cy - r * 0.45)} L${f(cx - r * 0.15)} ${f(cy - r * 0.62)} L${f(cx - r * 0.35)} ${f(cy - r * 0.42)} Q${f(cx - r * 0.75)} ${f(cy - r * 0.5)} ${f(cx - r * 1.0)} ${f(cy - r * 0.15)} Z" fill="${p.hair}" ${st}/>`
  }
  let s = back
  // ears + head
  s += `<circle cx="${f(cx - r * 0.98)}" cy="${f(cy + r * 0.08)}" r="${f(r * 0.2)}" fill="${p.skin}" ${st}/><circle cx="${f(cx + r * 0.98)}" cy="${f(cy + r * 0.08)}" r="${f(r * 0.2)}" fill="${p.skin}" ${st}/>`
  s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r)}" ry="${f(r * 1.02)}" fill="${p.skin}" ${st}/>`
  s += front
  if (who === 'maisie') [[-0.42, 0.28], [-0.32, 0.36], [-0.5, 0.38], [0.42, 0.28], [0.32, 0.36], [0.5, 0.38]].forEach(([dx, dy]) => { s += `<circle cx="${f(cx + dx * r + look * 4)}" cy="${f(cy + dy * r)}" r="1.8" fill="#C0643A"/>` })
  s += face(cx, cy, r, expr, look, p.skin)
  if (who === 'priya') {
    const lx = look * r * 0.16
    const e = r * 0.34
    s += `<circle cx="${f(cx - e + lx)}" cy="${f(cy)}" r="${f(r * 0.27)}" fill="#FFF" fill-opacity=".18" stroke="${INK}" stroke-width="3.2"/><circle cx="${f(cx + e + lx)}" cy="${f(cy)}" r="${f(r * 0.27)}" fill="#FFF" fill-opacity=".18" stroke="${INK}" stroke-width="3.2"/><path d="M${f(cx - e + lx + r * 0.27)} ${f(cy - 2)} h${f(2 * e - r * 0.54)}" stroke="${INK}" stroke-width="3"/>`
  }
  return s
}

// ------------------------------------------------------------------ bodies
function arm (sx, sy, ex, ey, hx, hy, sleeve, skin) {
  return `<path d="M${f(sx)} ${f(sy)} Q${f(ex)} ${f(ey)} ${f(hx)} ${f(hy)}" stroke="${INK}" stroke-width="23" fill="none" stroke-linecap="round"/>` +
    `<path d="M${f(sx)} ${f(sy)} Q${f(ex)} ${f(ey)} ${f(hx)} ${f(hy)}" stroke="${sleeve}" stroke-width="16" fill="none" stroke-linecap="round"/>` +
    `<circle cx="${f(hx)}" cy="${f(hy)}" r="9.5" fill="${skin}" stroke="${INK}" stroke-width="${LW}"/>`
}

const ARMS = {
  down: [[-1, -6, 22, -14, 46], [1, 6, 22, 14, 46]],
  wave: [[-1, -6, 22, -14, 46], [1, 36, -6, 30, -46]],
  cheer: [[-1, -36, -6, -30, -46], [1, 36, -6, 30, -46]],
  point: [[-1, -6, 22, -14, 46], [1, 40, 12, 64, 4]],
  hold: [[-1, -18, 34, 6, 26], [1, 18, 34, -6, 26]],
  six7: [[-1, -34, 22, -46, 4], [1, 34, 10, 46, -18]],
  shrug: [[-1, -34, 26, -44, 6], [1, 34, 26, 44, 6]],
  hips: [[-1, -30, 30, -10, 46], [1, 30, 30, 10, 46]],
  facepalm: [[-1, -6, 22, -14, 46], [1, 14, 4, 2, -38]]
}

function figure (who, x, y, o = {}) {
  const s = o.scale || 1
  const look = o.look ?? 0
  const pose = o.pose || 'down'
  const p = CAST[who]
  const st = `stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"`
  let g = ''
  const hr = 38
  const torsoTop = -128
  const torsoH = 66
  const hipY = torsoTop + torsoH
  // legs
  if (!o.sitting) {
    g += `<rect x="-26" y="${hipY - 6}" width="22" height="58" rx="9" fill="${p.bottom}" ${st}/><rect x="4" y="${hipY - 6}" width="22" height="58" rx="9" fill="${p.bottom}" ${st}/>`
    g += `<path d="M-38 ${hipY + 62} q0 -14 14 -14 h10 q4 0 4 6 v8 z" fill="${p.shoes}" ${st}/><path d="M38 ${hipY + 62} q0 -14 -14 -14 h-10 q-4 0 -4 6 v8 z" fill="${p.shoes}" ${st}/>`
    g += `<path d="M-34 ${hipY + 56} h22 M34 ${hipY + 56} h-22" stroke="${p.shoeTrim}" stroke-width="3"/>`
  }
  // arms behind for some poses are drawn after torso for simplicity
  const arms = ARMS[pose] || ARMS.down
  // torso
  g += `<path d="M-36 ${hipY} L-34 ${torsoTop + 16} Q-34 ${torsoTop} -18 ${torsoTop} L18 ${torsoTop} Q34 ${torsoTop} 34 ${torsoTop + 16} L36 ${hipY} Z" fill="${p.top}" ${st}/>`
  if (who === 'kofi') g += `<rect x="-35" y="${torsoTop + 30}" width="70" height="9" fill="${p.topTrim}"/><text x="0" y="${torsoTop + 60}" font-family="Bangers" font-size="22" fill="#FFF" text-anchor="middle" stroke="${INK}" stroke-width="3" paint-order="stroke" letter-spacing="1">67</text>`
  if (who === 'priya') g += `<path d="M-18 ${hipY - 6} h36 v-16 q-18 -6 -36 0 z" fill="${p.topTrim}" ${st}/><path d="M-6 ${torsoTop + 2} l-2 18 M6 ${torsoTop + 2} l2 18" stroke="${INK}" stroke-width="2.5"/>`
  if (who === 'maisie') g += `<path d="M0 ${torsoTop + 2} V${hipY}" stroke="${INK}" stroke-width="2.5"/><rect x="-26" y="${torsoTop + 14}" width="14" height="10" rx="2" fill="${C.yellow}" ${st}/>`
  if (who === 'tomasz') g += `<path d="M-14 ${hipY - 4} h28 v-14 h-28 z" fill="${p.topTrim}" ${st}/><path d="M-5 ${torsoTop + 4} v14 M5 ${torsoTop + 4} v14" stroke="#FFF" stroke-width="3"/>`
  // arms
  arms.forEach(([side, ex, ey, hx, hy]) => {
    const sx = side * 30
    const sy = torsoTop + 14
    g += arm(sx, sy, sx + ex * 0.5, sy + ey, sx + hx, sy + hy, p.top, p.skin)
  })
  if (o.prop === 'phone') {
    const [px, py] = pose === 'six7' ? [-62, torsoTop + 2] : pose === 'point' ? [94, torsoTop + 6] : pose === 'wave' ? [60, torsoTop - 40] : [0, torsoTop + 30]
    g += `<rect x="${px - 13}" y="${py - 24}" width="26" height="44" rx="5" fill="#2B2B3A" ${st}/><rect x="${px - 9}" y="${py - 19}" width="18" height="32" rx="2" fill="#8FE9FF"/>`
  }
  if (o.prop === 'sketchbook') g += `<rect x="-22" y="${torsoTop + 22}" width="44" height="34" rx="3" fill="#F4EBD0" ${st}/><path d="M-14 ${torsoTop + 34} q10 -10 18 0 t12 0" stroke="${INK}" stroke-width="2.5" fill="none"/>`
  if (o.prop === 'notebook') g += `<rect x="-18" y="${torsoTop + 26}" width="36" height="28" rx="2" fill="${C.yellow}" ${st}/><path d="M-10 ${torsoTop + 36} h20 M-10 ${torsoTop + 44} h14" stroke="${INK}" stroke-width="2.5"/>`
  // neck + head
  g += `<rect x="-8" y="${torsoTop - 10}" width="16" height="14" fill="${p.skin}" ${st}/>`
  g += head(who, 0, torsoTop - hr - 2, hr, o.expr || 'happy', look)
  const flip = o.flip ? -1 : 1
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * flip)} ${f(s)})">${g}</g>`
}

/** Maisie in her wheelchair */
function maisie (x, y, o = {}) {
  const s = o.scale || 1
  const p = CAST.maisie
  const st = `stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"`
  let g = ''
  // big wheel behind
  g += `<circle cx="-6" cy="-52" r="52" fill="none" stroke="${INK}" stroke-width="12"/><circle cx="-6" cy="-52" r="52" fill="none" stroke="#5A6B85" stroke-width="6"/>`
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g += `<path d="M-6 -52 L${f(-6 + Math.cos(a) * 46)} ${f(-52 + Math.sin(a) * 46)}" stroke="${INK}" stroke-width="2.4"/>` }
  g += `<circle cx="-6" cy="-52" r="7" fill="#5A6B85" ${st}/><circle cx="-6" cy="-52" r="40" fill="none" stroke="${C.coral}" stroke-width="3"/>`
  // frame and seat
  g += `<path d="M-46 -132 L-40 -70 L40 -70 L52 -14" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-46 -132 L-40 -70 L40 -70 L52 -14" stroke="#3E7BD8" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  g += `<circle cx="54" cy="-10" r="10" fill="#5A6B85" ${st}/>`
  // body seated
  g += `<rect x="-28" y="-90" width="70" height="22" rx="10" fill="${p.bottom}" ${st}/>` // thighs
  g += `<rect x="28" y="-86" width="20" height="54" rx="9" fill="${p.bottom}" ${st}/>` // shins
  g += `<path d="M34 -30 q0 -10 12 -10 h12 q6 0 6 8 v4 z" fill="${p.shoes}" ${st}/>`
  g += `<path d="M-34 -78 L-32 -136 Q-32 -150 -16 -150 L16 -150 Q32 -150 32 -136 L34 -78 Z" fill="${p.top}" ${st}/>`
  g += `<path d="M0 -148 V-80" stroke="${INK}" stroke-width="2.5"/><rect x="-24" y="-134" width="14" height="10" rx="2" fill="${C.yellow}" ${st}/>`
  const pose = o.pose || 'down'
  const ARM = {
    down: [[-28, -138, -40, -104, -30, -86], [28, -138, 40, -104, 30, -86]],
    cheer: [[-28, -138, -46, -170, -44, -196], [28, -138, 46, -170, 44, -196]],
    point: [[-28, -138, -40, -104, -30, -86], [28, -138, 60, -132, 84, -142]],
    wheel: [[-28, -138, -38, -104, -20, -70], [28, -138, 40, -104, 30, -86]]
  }[pose]
  ARM.forEach(([sx, sy, ex, ey, hx, hy]) => { g += arm(sx, sy, ex, ey, hx, hy, p.top, p.skin) })
  g += `<rect x="-8" y="-160" width="16" height="14" fill="${p.skin}" ${st}/>`
  g += head('maisie', 0, -198, 38, o.expr || 'happy', o.look ?? 0)
  const flip = o.flip ? -1 : 1
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * flip)} ${f(s)})">${g}</g>`
}

/** Bit: a small pixel creature. mood: happy | shock | weak | talk */
function bit (x, y, o = {}) {
  const s = o.scale || 1
  const mood = o.mood || 'happy'
  const px = 14
  const shape = ['.XXX.', 'XXXXX', 'XXXXX', 'XXXXX', '.X.X.']
  const cols = mood === 'weak' ? ['#A9C9D6', '#8FB3C4', '#7F9FB0'] : ['#5EF2FF', '#3FC8F2', '#B06BFF']
  let g = `<circle cx="0" cy="0" r="${mood === 'weak' ? 70 : 92}" fill="url(#${mood === 'weak' ? 'bitGlowDim' : 'bitGlow'})"/>`
  const w = shape[0].length * px
  const h = shape.length * px
  shape.forEach((row, r) => [...row].forEach((c, ci) => {
    if (c !== 'X') return
    const col = r < 2 ? cols[0] : r < 4 ? cols[1] : cols[2]
    g += `<rect x="${f(ci * px - w / 2)}" y="${f(r * px - h / 2)}" width="${px}" height="${px}" fill="${col}" stroke="${INK}" stroke-width="2.6"/>`
  }))
  // antenna
  g += `<rect x="-3" y="${f(-h / 2 - 16)}" width="6" height="14" fill="${INK}"/><rect x="-7" y="${f(-h / 2 - 28)}" width="14" height="14" fill="${mood === 'weak' ? '#C9D6DD' : '#FF4FD8'}" stroke="${INK}" stroke-width="2.6"/>`
  // eyes
  const ey = -10
  if (mood === 'shock') {
    g += `<rect x="-26" y="${ey - 12}" width="20" height="24" rx="4" fill="#FFF" stroke="${INK}" stroke-width="2.6"/><rect x="6" y="${ey - 12}" width="20" height="24" rx="4" fill="#FFF" stroke="${INK}" stroke-width="2.6"/><rect x="-19" y="${ey - 4}" width="6" height="8" fill="${INK}"/><rect x="13" y="${ey - 4}" width="6" height="8" fill="${INK}"/>`
  } else if (mood === 'weak') {
    g += `<path d="M-24 ${ey} h16 M8 ${ey} h16" stroke="${INK}" stroke-width="4"/><path d="M-8 ${ey + 18} h16" stroke="${INK}" stroke-width="4"/>`
  } else {
    g += `<rect x="-24" y="${ey - 10}" width="18" height="20" rx="4" fill="#FFF" stroke="${INK}" stroke-width="2.6"/><rect x="6" y="${ey - 10}" width="18" height="20" rx="4" fill="#FFF" stroke="${INK}" stroke-width="2.6"/><rect x="-16" y="${ey - 4}" width="7" height="9" fill="${INK}"/><rect x="14" y="${ey - 4}" width="7" height="9" fill="${INK}"/>`
    g += mood === 'talk'
      ? `<rect x="-7" y="${ey + 14}" width="14" height="10" fill="#7A1F2B" stroke="${INK}" stroke-width="2.4"/>`
      : `<path d="M-9 ${ey + 15} h4 v4 h10 v-4 h4" stroke="${INK}" stroke-width="3.5" fill="none"/>`
  }
  if (o.arms) g += `<rect x="${f(-w / 2 - 16)}" y="2" width="14" height="14" fill="${cols[1]}" stroke="${INK}" stroke-width="2.6"/><rect x="${f(w / 2 + 2)}" y="${o.arms === 'up' ? -22 : 2}" width="14" height="14" fill="${cols[1]}" stroke="${INK}" stroke-width="2.6"/>`
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${g}</g>`
}

/** The hidden pixel (spot it on every page) */
function hiddenPixel (x, y) {
  return `<rect x="${f(x)}" y="${f(y)}" width="9" height="9" fill="#FF4FD8" stroke="${INK}" stroke-width="1.6"/>`
}

// ------------------------------------------------------------------ scenery
function school (x, y, w) {
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="150" fill="${C.brick}" stroke="${INK}" stroke-width="${LW}"/>`
  s += `<path d="M${f(x - 10)} ${f(y)} L${f(x + w / 2)} ${f(y - 60)} L${f(x + w + 10)} ${f(y)} Z" fill="#7A3B2E" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`
  for (let i = 0; i < Math.floor(w / 70); i++) s += `<rect x="${f(x + 20 + i * 70)}" y="${f(y + 26)}" width="40" height="34" fill="#BFE6FF" stroke="${INK}" stroke-width="3"/><path d="M${f(x + 40 + i * 70)} ${f(y + 26)} v34" stroke="${INK}" stroke-width="2"/>`
  s += `<circle cx="${f(x + w / 2)}" cy="${f(y - 22)}" r="14" fill="#FFF" stroke="${INK}" stroke-width="3"/><path d="M${f(x + w / 2)} ${f(y - 30)} v8 l6 4" stroke="${INK}" stroke-width="2.5" fill="none"/>`
  return s
}
function tree (x, y, r, c1 = C.grass, c2 = C.grassDark) {
  return `<rect x="${f(x - 8)}" y="${f(y - r * 0.4)}" width="16" height="${f(r * 1.2)}" fill="#8A5A3B" stroke="${INK}" stroke-width="${LW}"/>` +
    `<circle cx="${f(x)}" cy="${f(y - r)}" r="${f(r)}" fill="${c1}" stroke="${INK}" stroke-width="${LW}"/><circle cx="${f(x - r * 0.45)}" cy="${f(y - r * 0.8)}" r="${f(r * 0.55)}" fill="${c2}" stroke="${INK}" stroke-width="${LW}"/>`
}
function bench (x, y, w) {
  return `<rect x="${f(x)}" y="${f(y - 44)}" width="${f(w)}" height="12" fill="#B9773F" stroke="${INK}" stroke-width="${LW}"/><rect x="${f(x)}" y="${f(y - 74)}" width="${f(w)}" height="12" fill="#B9773F" stroke="${INK}" stroke-width="${LW}"/>` +
    `<rect x="${f(x + 14)}" y="${f(y - 32)}" width="10" height="32" fill="#3A3A44"/><rect x="${f(x + w - 24)}" y="${f(y - 32)}" width="10" height="32" fill="#3A3A44"/>`
}
function cloud (x, y, s = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${s})"><path d="M0 0 q-2 -24 22 -24 q8 -20 32 -14 q20 -14 36 6 q24 0 22 32 z" fill="#FFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>`
}
function skyline (x, y, w, colour = '#3B3570') {
  let s = ''
  const hs = [70, 110, 85, 140, 95, 120, 75, 105, 90]
  const bw = w / hs.length
  hs.forEach((h, i) => {
    s += `<rect x="${f(x + i * bw)}" y="${f(y - h)}" width="${f(bw + 1)}" height="${h}" fill="${colour}" stroke="${INK}" stroke-width="2.5"/>`
    for (let k = 0; k < 3; k++) if ((i + k) % 2) s += `<rect x="${f(x + i * bw + 8 + k * 12)}" y="${f(y - h + 16)}" width="7" height="9" fill="${C.yellow}"/>`
  })
  return s
}
/** The Endless Scroll: a swirling cloud of video tiles, with sleepy eyes */
function scrollBeast (cx, cy, r, eyes = 'sleepy') {
  let s = ''
  for (let i = 0; i < 3; i++) s += `<path d="M${f(cx + r * (1 - i * 0.3))} ${f(cy)} A${f(r * (1 - i * 0.3))} ${f(r * (0.7 - i * 0.2))} 0 1 1 ${f(cx - r * (1 - i * 0.3) * 0.6)} ${f(cy - r * 0.3)}" stroke="#6A4FD8" stroke-width="${20 - i * 4}" fill="none" stroke-linecap="round" stroke-opacity="${0.85 - i * 0.2}"/>`
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7
    const rr = r * (0.55 + (i % 3) * 0.2)
    s += `<rect x="${f(cx + Math.cos(a) * rr - 14)}" y="${f(cy + Math.sin(a) * rr * 0.6 - 10)}" width="28" height="20" rx="3" fill="#2B2350" stroke="#9C82EA" stroke-width="2"/><path d="M${f(cx + Math.cos(a) * rr - 4)} ${f(cy + Math.sin(a) * rr * 0.6 - 5)} l9 5 -9 5z" fill="#FF4FD8"/>`
  }
  if (eyes === 'sleepy') s += `<path d="M${f(cx - 40)} ${f(cy - 6)} q14 10 28 0 M${f(cx + 12)} ${f(cy - 6)} q14 10 28 0" stroke="#FFD23F" stroke-width="5" fill="none" stroke-linecap="round"/>`
  else s += `<ellipse cx="${f(cx - 26)}" cy="${f(cy - 6)}" rx="14" ry="9" fill="#FFD23F" stroke="${INK}" stroke-width="3"/><ellipse cx="${f(cx + 26)}" cy="${f(cy - 6)}" rx="14" ry="9" fill="#FFD23F" stroke="${INK}" stroke-width="3"/><circle cx="${f(cx - 24)}" cy="${f(cy - 6)}" r="4.5" fill="${INK}"/><circle cx="${f(cx + 28)}" cy="${f(cy - 6)}" r="4.5" fill="${INK}"/>`
  return s
}

module.exports = { INK, LW, C, CAST, txt, wrap, bubble, caption, sfx, defs, panel, fill, speedLines, burst, figure, maisie, bit, hiddenPixel, school, tree, bench, cloud, skyline, scrollBeast, head, esc }
