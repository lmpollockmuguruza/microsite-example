/*
 * "Where's Margot?" character kit (style 3: design-first indie).
 *
 * Soft organic shapes (smooth curves through points, not circles and boxes),
 * no outlines, a limited risograph-style palette, shading as shapes, and dark
 * ink only for faces and small details. A paper grain and a slight hand-cut
 * wobble are added by the page (see filters()).
 */
const INK = '#1F2440'
const PAPER = '#F7F1E3'
const RISO = { blue: '#3E64C8', blueDeep: '#2E4EA3', teal: '#1E9E94', pink: '#FF7A8A', yellow: '#FFC94A', orange: '#F28A3B', lilac: '#B9A6E6', lilacDeep: '#9C86D4', green: '#5DBB7A', red: '#E2463F', sky: '#9ED3F0', cream: '#FFFDF7' }
const UNI = { jumper: RISO.blue, jumperShade: RISO.blueDeep, polo: '#FFFDF8', poloShade: '#E4E2DA', trousers: '#5A6275', trousersShade: '#485064', shoe: '#2B2F45' }

const CAST = {
  stan: { name: 'Stan', skin: '#F3C9A5', skinShade: '#E3AF88', hair: '#F2C14E', hairShade: '#D9A12F' },
  maisie: { name: 'Maisie', skin: '#F7D6BF', skinShade: '#EBBC9F', hair: '#E0743A', hairShade: '#C35A24' },
  priya: { name: 'Priya', skin: '#B8804F', skinShade: '#9E683B', hair: '#1D1715', hairShade: '#3A302C' },
  kofi: { name: 'Kofi', skin: '#7B4A2E', skinShade: '#653A22', hair: '#1D1512', hairShade: '#3B2C25' },
  tomasz: { name: 'Tomasz', skin: '#EFC7A6', skinShade: '#DEAC88', hair: '#9A6A42', hairShade: '#7E522F' },
  hargreaves: { name: 'Mrs Hargreaves', skin: '#F2CDB4', skinShade: '#E2B396', hair: '#D2D2DA', hairShade: '#B4B4C0' }
}

const f = n => Math.round(n * 10) / 10
let uid = 0
const nid = p => `${p}${++uid}`

// ------------------------------------------------------------------ geometry
/** Smooth closed (or open) curve through points (Catmull-Rom → cubic Bézier) */
function smooth (pts, closed = true, t = 1) {
  const n = pts.length
  const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1); const p1 = P(i); const p2 = P(i + 1); const p3 = P(i + 2)
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * t, p1[1] + (p2[1] - p0[1]) / 6 * t]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * t, p2[1] - (p3[1] - p1[1]) / 6 * t]
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return closed ? d + ' Z' : d
}
const rel = (cx, cy, pts) => pts.map(([x, y]) => [cx + x, cy + y])

/** An organic blob; with `curl` it gets a scalloped, curly edge (Margot's fur) */
function blob (cx, cy, rx, ry, o = {}) {
  const n = o.n || 22
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (o.rot || 0)
    let k = 1 + (o.wobble || 0) * Math.sin(a * 3 + (o.seed || 0))
    if (o.curl) k *= i % 2 ? 1 - o.curl : 1 + o.curl
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k])
  }
  return smooth(pts)
}

const fill = (d, c, op) => `<path d="${d}" fill="${c}"${op ? ` fill-opacity="${op}"` : ''}/>`
/** Shape with a shadow region clipped inside it */
function shaded (d, c, shade, _shadeD, dx = -11, dy = -7) {
  // A soft crescent of shadow: fill with the shadow colour, then lay the
  // base colour over it, nudged up and left, clipped to the shape.
  if (!shade) return fill(d, c)
  const id = nid('k')
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${fill(d, shade)}<path d="${d}" fill="${c}" transform="translate(${dx} ${dy})"/></g>`
}
const ink = (d, w = 2.4, c = INK) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`

/** A limb: a soft tapered tube through 3 points, with rounded ends */
function limb (pts, w1, w2, c) {
  const [a, b, cc] = pts
  const nrm = (p, q) => { const dx = q[0] - p[0]; const dy = q[1] - p[1]; const l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l] }
  const n1 = nrm(a, b); const n2 = nrm(b, cc)
  const nb = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2]
  const wm = (w1 + w2) / 2
  const off = (p, nn, w, s) => [p[0] + nn[0] * w / 2 * s, p[1] + nn[1] * w / 2 * s]
  const L = [off(a, n1, w1, 1), off(b, nb, wm, 1), off(cc, n2, w2, 1)]
  const R = [off(cc, n2, w2, -1), off(b, nb, wm, -1), off(a, n1, w1, -1)]
  const d = `M${f(L[0][0])} ${f(L[0][1])} Q${f(L[1][0])} ${f(L[1][1])} ${f(L[2][0])} ${f(L[2][1])} L${f(R[0][0])} ${f(R[0][1])} Q${f(R[1][0])} ${f(R[1][1])} ${f(R[2][0])} ${f(R[2][1])} Z`
  return fill(d, c) + `<circle cx="${f(a[0])}" cy="${f(a[1])}" r="${f(w1 / 2)}" fill="${c}"/><circle cx="${f(cc[0])}" cy="${f(cc[1])}" r="${f(w2 / 2)}" fill="${c}"/>`
}
function hand (x, y, skin, dir = 1, s = 1) {
  return fill(smooth(rel(x, y, [[-7 * s, -8 * s], [3 * s, -10 * s], [9 * s, -2 * s], [7 * s, 8 * s], [-2 * s, 10 * s], [-9 * s, 3 * s]])), skin) +
    fill(smooth(rel(x, y, [[dir * -6 * s, -6 * s], [dir * -13 * s, -9 * s], [dir * -12 * s, -3 * s], [dir * -6 * s, 1 * s]])), skin)
}

// ------------------------------------------------------------------ faces
const headPath = (cx, cy, w = 104, h = 108, chin = 0.42) => smooth(rel(cx, cy, [
  [0, -h / 2], [w * 0.36, -h * 0.44], [w / 2, -h * 0.12], [w * 0.47, h * 0.16], [w * 0.3, h * chin], [0, h / 2],
  [-w * 0.3, h * chin], [-w * 0.47, h * 0.16], [-w / 2, -h * 0.12], [-w * 0.36, -h * 0.44]
]))

function features (p, cx, cy, expr, look) {
  const lx = look * 5
  const L = cx - 17 + lx
  const R = cx + 17 + lx
  const ey = cy + 4
  const my = cy + 30
  const mx = cx + lx
  let s = ''
  const eyes = (sc = 1) => `<ellipse cx="${f(L)}" cy="${f(ey)}" rx="${3.4 * sc}" ry="${4.6 * sc}" fill="${INK}"/><ellipse cx="${f(R)}" cy="${f(ey)}" rx="${3.4 * sc}" ry="${4.6 * sc}" fill="${INK}"/>`
  const closed = () => ink(`M${f(L - 5)} ${f(ey + 1)} q5 -5 10 0 M${f(R - 5)} ${f(ey + 1)} q5 -5 10 0`, 2.4)
  const brows = (dl = 0, dr = 0, up = 0) => ink(`M${f(L - 7)} ${f(ey - 13 - up + dl)} q7 -4 14 ${f(-dl * 2)} M${f(R - 7)} ${f(ey - 13 - up - dr)} q7 -4 14 ${f(dr * 2)}`, 2.2)
  switch (expr) {
    case 'laugh':
      s += closed() + brows(0, 0, 2) + fill(`M${f(mx - 11)} ${f(my - 3)} Q${f(mx)} ${f(my + 13)} ${f(mx + 11)} ${f(my - 3)} Z`, '#7A2734') + fill(`M${f(mx - 5)} ${f(my + 4)} q5 -3 10 0 q-5 5 -10 0z`, '#F08A92')
      break
    case 'surprised':
      s += eyes(1.25) + brows(0, 0, 6) + fill(blob(mx, my + 1, 4.5, 6), '#7A2734')
      break
    case 'worried':
      s += eyes() + brows(-2.5, -2.5, 2) + ink(`M${f(mx - 7)} ${f(my + 2)} q3.5 -4 7 0 t7 0`, 2.2)
      break
    case 'cheeky':
      s += eyes() + brows(1.5, -1, 3) + ink(`M${f(mx - 8)} ${f(my)} Q${f(mx + 2)} ${f(my + 6)} ${f(mx + 9)} ${f(my - 4)}`, 2.4)
      break
    case 'determined':
      s += eyes() + brows(2.5, 2.5, -1) + ink(`M${f(mx - 6)} ${f(my + 1)} q6 2 12 0`, 2.4)
      break
    case 'kind':
      s += closed() + brows(-1, -1, 3) + ink(`M${f(mx - 9)} ${f(my - 2)} Q${f(mx)} ${f(my + 7)} ${f(mx + 9)} ${f(my - 2)}`, 2.4)
      break
    case 'thinking':
      s += eyes() + brows(0, -2, 4) + ink(`M${f(mx - 5)} ${f(my + 1)} h9`, 2.4)
      break
    default:
      s += eyes() + brows(0, 0, 2) + ink(`M${f(mx - 9)} ${f(my - 2)} Q${f(mx)} ${f(my + 7)} ${f(mx + 9)} ${f(my - 2)}`, 2.4)
  }
  // nose and cheeks
  s += fill(smooth(rel(cx + lx * 1.4, cy + 15, [[-3, -5], [4, -2], [4, 4], [-2, 5], [-5, 1]])), p.skinShade)
  s += `<ellipse cx="${f(L - 7)}" cy="${f(cy + 21)}" rx="8" ry="5" fill="${RISO.pink}" fill-opacity=".32"/><ellipse cx="${f(R + 7)}" cy="${f(cy + 21)}" rx="8" ry="5" fill="${RISO.pink}" fill-opacity=".32"/>`
  return s
}

function head (who, cx, cy, expr = 'happy', look = 0) {
  const p = CAST[who]
  let back = ''
  let front = ''
  let extra = ''
  const W = who === 'kofi' ? 108 : who === 'stan' ? 100 : 104
  const Hh = who === 'stan' ? 112 : 106
  if (who === 'stan') {
    front = shaded(smooth(rel(cx, cy, [[-50, -2], [-54, -34], [-38, -58], [-8, -66], [16, -72], [36, -86], [32, -66], [48, -50], [54, -18], [50, 0], [38, -22], [20, -30], [4, -22], [-14, -32], [-32, -26], [-46, -12]])), p.hair, p.hairShade, `M${cx + 14} ${cy - 100} h60 v100 h-60z`)
  } else if (who === 'kofi') {
    front = shaded(smooth(rel(cx, cy, [[-50, -4], [-52, -38], [-40, -66], [-12, -76], [14, -76], [40, -66], [52, -38], [50, -4], [42, -26], [22, -36], [-22, -36], [-42, -26]])), p.hair, p.hairShade, `M${cx + 18} ${cy - 90} h50 v90 h-50z`)
    ;[[-24, -60], [-6, -66], [12, -64], [28, -56], [-34, -44], [0, -50], [36, -42]].forEach(([dx, dy]) => { extra += ink(`M${f(cx + dx - 3)} ${f(cy + dy)} q3 -3 6 0`, 1.6, p.hairShade) })
  } else if (who === 'priya') {
    ;[-1, 1].forEach(side => {
      back += fill(smooth(rel(cx, cy, [[side * 44, 0], [side * 58, 24], [side * 60, 70], [side * 56, 118], [side * 48, 122], [side * 46, 70], [side * 38, 20]])), p.hair)
      for (let i = 0; i < 4; i++) extra += ink(`M${f(cx + side * 46)} ${f(cy + 34 + i * 22)} q${side * 6} 6 ${side * 12} 0`, 1.6, p.hairShade)
      extra += fill(blob(cx + side * 52, cy + 122, 9, 6, { rot: side * 0.5 }), RISO.pink)
    })
    back += fill(smooth(rel(cx, cy, [[-52, 14], [-58, -26], [-38, -58], [0, -64], [38, -58], [58, -26], [52, 14]])), p.hair)
    front = fill(smooth(rel(cx, cy, [[-50, 8], [-54, -30], [-32, -58], [0, -62], [32, -58], [54, -30], [50, 8], [40, -20], [16, -38], [1, -52], [-14, -38], [-40, -20]])), p.hair)
  } else if (who === 'maisie') {
    back = shaded(blob(cx + 10, cy - 68, 24, 20, { wobble: 0.08 }), p.hair, p.hairShade, `M${cx + 10} ${cy - 100} h40 v60 h-40z`)
    back += `<g transform="rotate(-28 ${cx + 10} ${cy - 70})"><rect x="${cx - 26}" y="${cy - 74}" width="62" height="8" rx="2" fill="${RISO.yellow}"/><path d="M${cx + 36} ${cy - 74} l10 4 -10 4z" fill="#F4D7AE"/><rect x="${cx - 30}" y="${cy - 74}" width="6" height="8" rx="2" fill="${RISO.pink}"/></g>`
    front = shaded(smooth(rel(cx, cy, [[-50, 6], [-55, -32], [-30, -60], [6, -62], [36, -56], [54, -30], [50, 8], [46, -16], [28, -32], [6, -28], [-16, -38], [-38, -22], [-46, -6]])), p.hair, p.hairShade, `M${cx + 16} ${cy - 80} h50 v90 h-50z`)
    extra += fill(smooth(rel(cx, cy, [[-50, 0], [-58, 20], [-52, 46], [-46, 22]])), p.hair)
    ;[[-26, 17], [-20, 22], [-31, 23], [24, 17], [18, 22], [29, 23]].forEach(([dx, dy]) => { extra += `<circle cx="${f(cx + dx + look * 5)}" cy="${f(cy + dy)}" r="1.6" fill="#C9734A"/>` })
    extra += fill(blob(cx + 30 + look * 5, cy + 30, 5, 3.5, { rot: 0.4 }), RISO.teal, 0.85)
  } else if (who === 'tomasz') {
    front = shaded(smooth(rel(cx, cy, [[-52, 10], [-56, -28], [-40, -60], [-6, -70], [30, -66], [52, -46], [56, -10], [50, 12], [42, -10], [32, -18], [26, -6], [14, -20], [2, -8], [-10, -22], [-22, -8], [-34, -20], [-44, -2]])), p.hair, p.hairShade, `M${cx + 18} ${cy - 90} h50 v100 h-50z`)
    extra += fill(smooth(rel(cx + 30 + look * 5, cy + 26, [[-8, -4], [8, -4], [8, 4], [-8, 4]])), '#F6D8A8') + ink(`M${f(cx + 28 + look * 5)} ${f(cy + 23)} v6 M${f(cx + 32 + look * 5)} ${f(cy + 23)} v6`, 1, '#C9A06A')
  } else if (who === 'hargreaves') {
    back = shaded(blob(cx - 2, cy - 72, 26, 20, { wobble: 0.06 }), p.hair, p.hairShade, `M${cx + 8} ${cy - 100} h40 v60 h-40z`)
    front = shaded(smooth(rel(cx, cy, [[-52, 14], [-58, -22], [-40, -56], [-4, -64], [34, -58], [56, -32], [54, 14], [44, -12], [30, -30], [8, -36], [-14, -30], [-36, -16], [-46, 4]])), p.hair, p.hairShade, `M${cx + 20} ${cy - 80} h50 v100 h-50z`)
    extra += ink(`M${cx - 38} ${cy - 30} q16 -14 36 -20 M${cx + 6} ${cy - 44} q16 2 28 14`, 1.6, p.hairShade)
  }
  let s = back
  s += fill(blob(cx - W / 2 + 2, cy + 6, 9, 12), p.skin) + fill(blob(cx + W / 2 - 2, cy + 6, 9, 12), p.skin)
  s += shaded(headPath(cx, cy, W, Hh), p.skin, p.skinShade, `M${cx + 26} ${cy - 70} C${cx + 60} ${cy - 30} ${cx + 56} ${cy + 36} ${cx + 8} ${cy + 64} L${cx + 70} ${cy + 70} L${cx + 70} ${cy - 70} Z`)
  s += features(p, cx, cy, expr, look)
  s += front + extra
  if (who === 'priya' || who === 'hargreaves') {
    const lx = look * 5
    const c = who === 'hargreaves' ? '#8E5BA8' : INK
    s += `<circle cx="${f(cx - 17 + lx)}" cy="${f(cy + 4)}" r="12" fill="#FFF" fill-opacity=".18" stroke="${c}" stroke-width="2.2"/><circle cx="${f(cx + 17 + lx)}" cy="${f(cy + 4)}" r="12" fill="#FFF" fill-opacity=".18" stroke="${c}" stroke-width="2.2"/>` + ink(`M${f(cx - 5 + lx)} ${f(cy + 2)} q5 -4 10 0`, 2, c)
  }
  return s
}

// ------------------------------------------------------------------ bodies
const ARMS = {
  down: [[[-40, -156], [-50, -122], [-48, -92]], [[40, -156], [50, -122], [48, -92]]],
  ball: [[[-40, -156], [-50, -122], [-48, -92]], [[40, -156], [56, -126], [36, -108]]],
  hold: [[[-40, -156], [-46, -124], [-18, -112]], [[40, -156], [46, -124], [18, -112]]],
  wave: [[[-40, -156], [-50, -122], [-48, -92]], [[40, -156], [64, -176], [66, -214]]],
  mug: [[[-40, -156], [-50, -122], [-48, -92]], [[40, -156], [52, -128], [30, -118]]],
  shrug: [[[-40, -156], [-60, -130], [-64, -150]], [[40, -156], [60, -130], [64, -150]]]
}

function standing (who, o = {}) {
  const p = CAST[who]
  const adult = who === 'hargreaves'
  const shorts = who === 'stan'
  const skirt = who === 'priya'
  const pose = o.pose || 'down'
  const lift = adult ? -28 : 0 // adults are taller
  const hy = -226 + lift
  const top = -164 + lift
  const hem = -96
  let s = `<ellipse cx="0" cy="-2" rx="52" ry="8" fill="${INK}" fill-opacity=".1"/>`
  // legs
  const legC = shorts ? p.skin : skirt ? '#2E3A6E' : adult ? '#7B6A8E' : UNI.trousers
  const legTop = shorts ? -70 : skirt ? -80 : hem + 4
  s += limb([[-13, legTop], [-14, -50], [-14, -16]], adult ? 18 : 20, adult ? 14 : 16, legC) + limb([[13, legTop], [14, -50], [14, -16]], adult ? 18 : 20, adult ? 14 : 16, legC)
  if (shorts) s += fill('M-24 -46 h20 v28 h-20z', UNI.polo) + fill('M4 -46 h20 v28 h-20z', UNI.polo)
  if (who === 'kofi') s += fill('M4 -32 h20 v16 h-20z', UNI.polo)
  const shoe = who === 'kofi' ? '#FFFFFF' : adult ? '#8E5BA8' : UNI.shoe
  s += fill(smooth([[-30, -2], [-34, -12], [-22, -20], [-6, -18], [-4, -6], [-12, -1]]), shoe) + fill(smooth([[30, -2], [34, -12], [22, -20], [6, -18], [4, -6], [12, -1]]), shoe)
  if (who === 'kofi') s += ink('M-28 -8 h16 M28 -8 h-16', 2.2, RISO.red)
  // bottoms
  if (shorts) s += shaded(smooth([[-36, hem - 10], [-38, -66], [-4, -64], [0, -80], [4, -64], [38, -66], [36, hem - 10]]), UNI.trousers, UNI.trousersShade, 'M10 -130 h40 v80 h-40z')
  if (skirt) s += shaded(smooth([[-34, hem - 12], [-46, -64], [0, -60], [46, -64], [34, hem - 12]]), UNI.trousers, UNI.trousersShade, 'M10 -130 h50 v80 h-50z') + ink('M-18 -92 l-6 26 M0 -92 v30 M18 -92 l6 26', 1.6, UNI.trousersShade)
  if (adult) s += shaded(smooth([[-38, hem - 16], [-46, -44], [46, -44], [38, hem - 16]]), RISO.teal, '#178A80', 'M10 -140 h50 v110 h-50z')
  // torso
  const tc = shorts ? UNI.polo : adult ? RISO.lilac : UNI.jumper
  const ts = shorts ? UNI.poloShade : adult ? RISO.lilacDeep : UNI.jumperShade
  const torso = smooth([[-38, top], [-50, top + 14], [-48, top + 40], [-44, hem], [0, hem + 6], [44, hem], [48, top + 40], [50, top + 14], [38, top], [0, top - 6]])
  s += shaded(torso, tc, ts, `M16 ${top - 20} h60 v${-top + 40} h-60z`)
  if (adult) s += fill(smooth([[-14, top - 2], [14, top - 2], [10, hem + 2], [-10, hem + 2]]), '#FFFDF8') + ink(`M-12 ${top + 2} V${hem} M12 ${top + 2} V${hem}`, 1.6, RISO.lilacDeep)
  if (!shorts && !adult) {
    s += ink(`M-42 ${hem - 6} Q0 ${hem} 42 ${hem - 6}`, 2, '#5B7FDA')
    s += fill(blob(24, top + 24, 7, 8), RISO.yellow)
  }
  if (shorts) s += fill(smooth([[-46, hem - 18], [0, hem - 10], [46, hem - 18], [48, hem - 4], [0, hem + 4], [-48, hem - 4]]), UNI.jumper) + fill(smooth([[-6, hem - 12], [-18, hem + 22], [-8, hem + 24], [2, hem - 8]]), UNI.jumper)
  s += fill(`M-18 ${top - 4} L0 ${top + 14} L18 ${top - 4} L10 ${top - 8} L0 ${top + 2} L-10 ${top - 8} Z`, UNI.polo)
  if (who === 'kofi') s += fill(smooth([[-30, hem - 2], [-34, hem + 12], [-14, hem + 12], [-12, hem]]), UNI.polo)
  if (who === 'tomasz') s += ink(`M-22 ${top - 2} C-28 ${top + 34} -8 ${top + 52} 0 ${top + 44} C8 ${top + 52} 28 ${top + 34} 22 ${top - 2}`, 2.6, RISO.teal) + `<circle cx="0" cy="${top + 47}" r="6" fill="#D5DCE6"/>` + fill(blob(-26, top + 24, 8, 8), '#FFF') + fill(`M-28 ${top + 18} h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z`, RISO.green)
  if (adult) s += ink(`M-16 ${top - 4} C-20 ${top + 30} -10 ${top + 44} 0 ${top + 52} C10 ${top + 44} 20 ${top + 30} 16 ${top - 4}`, 2, RISO.teal) + fill(`M-9 ${top + 50} h18 v22 h-18z`, '#FFF') + ink(`M-5 ${top + 58} h10 M-5 ${top + 64} h7`, 1.4, '#9AA0AE')
  // arms
  const arms = ARMS[pose] || ARMS.down
  arms.forEach((a0, i) => {
    const a = a0.map(([x, y], k) => [x, y + (k === 0 ? lift : lift * 0.6)])
    if (shorts) {
      s += limb([a[0], [(a[0][0] * 2 + a[1][0]) / 3, (a[0][1] * 2 + a[1][1]) / 3], [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2]], 22, 20, UNI.polo)
      s += limb([[(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2], a[1], a[2]], 14, 12, p.skin)
    } else s += limb(a, 20, 16, tc)
    s += hand(a[2][0], a[2][1] + 6, p.skin, i ? 1 : -1)
  })
  // props
  if (o.prop === 'ball') s += `<circle cx="50" cy="-104" r="20" fill="#FFFDF8"/>` + fill(smooth(rel(50, -106, [[0, -7], [7, -2], [4, 6], [-4, 6], [-7, -2]])), INK) + ink('M50 -113 v-8 M57 -108 l9 -4 M54 -100 l6 9 M46 -100 l-6 9 M43 -108 l-9 -4', 1.6, '#B8BCC8')
  if (o.prop === 'notebook') s += fill(smooth([[-26, -132], [26, -134], [28, -98], [-24, -96]]), RISO.pink) + `<text x="1" y="-110" font-family="Atkinson Hyperlegible" font-weight="700" font-size="12" fill="#FFF" text-anchor="middle">HOLA!</text>`
  if (o.prop === 'mug') s += fill(smooth([[18, -124 + lift * 0.6], [42, -124 + lift * 0.6], [40, -100 + lift * 0.6], [20, -100 + lift * 0.6]]), '#FFFDF8') + `<path d="M41 ${-118 + lift * 0.6} q10 2 0 12" fill="none" stroke="#FFFDF8" stroke-width="4"/>` + fill(blob(30, -112 + lift * 0.6, 6, 4), RISO.pink, 0.8) + ink(`M24 ${-134 + lift * 0.6} q4 -6 0 -10 M32 ${-134 + lift * 0.6} q4 -6 0 -10`, 1.6, '#B8BCC8')
  // neck and head
  s += fill(`M-9 ${top - 14} h18 v14 h-18z`, p.skinShade)
  s += head(who, 0, hy, o.expr || 'happy', o.look || 0)
  return `<g transform="translate(${f(o.x || 0)} ${f(o.y || 0)}) scale(${o.scale || 1})">${s}</g>`
}

/** Maisie: in her sports wheelchair, sketchbook on her lap */
function maisieChair (o = {}) {
  const p = CAST.maisie
  let s = `<ellipse cx="0" cy="-2" rx="64" ry="9" fill="${INK}" fill-opacity=".1"/>`
  s += `<circle cx="-18" cy="-58" r="54" fill="none" stroke="#4A5068" stroke-width="7"/>`
  s += limb([[-30, -96], [6, -98], [34, -96]], 24, 22, UNI.trousers)
  s += limb([[36, -94], [40, -60], [42, -22]], 20, 17, UNI.trousers)
  s += fill(smooth([[30, -6], [30, -16], [44, -22], [60, -20], [62, -8], [48, -4]]), UNI.shoe)
  s += ink('M-44 -84 L34 -84 L48 -18', 6, RISO.teal)
  s += `<circle cx="50" cy="-12" r="9" fill="#4A5068"/>`
  const top = -178
  s += shaded(smooth([[-36, top], [-48, top + 14], [-46, top + 40], [-42, -92], [0, -88], [42, -92], [46, top + 40], [48, top + 14], [36, top], [0, top - 6]]), UNI.jumper, UNI.jumperShade, `M16 ${top - 20} h60 v120 h-60z`)
  s += fill(`M-18 ${top - 4} L0 ${top + 14} L18 ${top - 4} L10 ${top - 8} L0 ${top + 2} L-10 ${top - 8} Z`, UNI.polo)
  s += fill(blob(24, top + 24, 7, 8), RISO.yellow)
  s += fill(smooth([[-20, -118], [40, -124], [44, -96], [-16, -92]]), '#F3E6C8') + ink('M-6 -108 q10 -10 22 -2 t18 -4', 2, RISO.teal) + fill(blob(8, -102, 6, 4), RISO.pink, 0.7)
  s += limb([[-36, top + 10], [-44, -128], [-10, -112]], 20, 16, UNI.jumper) + hand(-10, -106, p.skin, -1)
  s += limb([[36, top + 10], [48, -134], [26, -120]], 20, 16, UNI.jumper) + hand(26, -114, p.skin, 1)
  s += `<g transform="rotate(30 26 -118)"><rect x="22" y="-146" width="7" height="34" rx="2" fill="${RISO.yellow}"/><path d="M22 -112 l3.5 9 3.5 -9z" fill="#F4D7AE"/></g>`
  s += fill(`M-9 ${top - 14} h18 v14 h-18z`, p.skinShade)
  s += head('maisie', 0, -238, o.expr || 'happy', o.look || 0)
  s += `<circle cx="-6" cy="-54" r="56" fill="none" stroke="#3A4058" stroke-width="9"/><circle cx="-6" cy="-54" r="46" fill="none" stroke="${RISO.teal}" stroke-width="4"/>`
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; s += ink(`M-6 -54 L${f(-6 + Math.cos(a) * 42)} ${f(-54 + Math.sin(a) * 42)}`, 1.6, '#8A90A4') }
  s += `<circle cx="-6" cy="-54" r="7" fill="${RISO.teal}"/>`
  return `<g transform="translate(${f(o.x || 0)} ${f(o.y || 0)}) scale(${o.scale || 1})">${s}</g>`
}

// ------------------------------------------------------------------ Margot
const DOG = { fur: '#E8B66A', furShade: '#D49B4C', ear: '#C9884A', muzzle: '#F7E2BC', nose: '#2B2020' }

function margotHead (cx, cy, mood = 'smug', s = 1) {
  let g = ''
  g += fill(blob(-36, 14, 15, 32, { curl: 0.07, n: 18, rot: 0.2 }), DOG.ear) + fill(blob(36, 14, 15, 32, { curl: 0.07, n: 18, rot: -0.2 }), DOG.ear)
  g += shaded(blob(0, 0, 40, 38, { curl: 0.06, n: 26 }), DOG.fur, DOG.furShade, 'M10 -60 h60 v120 h-60z')
  g += fill(blob(0, -30, 18, 10, { curl: 0.12, n: 14 }), DOG.fur)
  g += fill(blob(0, 18, 20, 15), DOG.muzzle)
  g += fill(smooth([[-8, 9], [8, 9], [5, 17], [0, 19], [-5, 17]]), DOG.nose) + `<ellipse cx="-2" cy="11" rx="2.4" ry="1.4" fill="#FFF" fill-opacity=".6"/>`
  const eye = (x, lid, py = 0) => {
    const id = nid('e')
    let e = `<clipPath id="${id}"><ellipse cx="${x}" cy="-6" rx="11" ry="13"/></clipPath><ellipse cx="${x}" cy="-6" rx="11" ry="13" fill="#FFFDF8"/><circle cx="${x + 1}" cy="${-3 + py}" r="4.2" fill="${INK}"/>`
    if (lid) e += `<g clip-path="url(#${id})"><rect x="${x - 14}" y="-22" width="28" height="${lid + 3}" fill="${DOG.furShade}"/></g>` + ink(`M${x - 10} ${-19 + lid} q10 3 20 0`, 2, '#8A5A2A')
    return e
  }
  if (mood === 'smug') g += eye(-11, 9) + eye(11, 9) + ink('M-8 27 Q0 31 10 24', 2.4)
  else if (mood === 'excited') g += eye(-11, 0, -3) + eye(11, 0, -3) + fill('M-9 25 Q0 38 9 25 Z', '#7A2734') + fill(blob(0, 31, 4, 3), '#F08A92')
  else if (mood === 'sleepy') g += eye(-11, 14) + eye(11, 14) + ink('M-6 27 h12', 2.4)
  else g += eye(-11, 4, 3) + eye(11, 4, 3) + ink('M-8 27 Q0 23 8 27', 2.4)
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${s})">${g}</g>`
}

function margot (o = {}) {
  let g = `<ellipse cx="10" cy="-2" rx="70" ry="9" fill="${INK}" fill-opacity=".1"/>`
  g += fill(blob(66, -64, 14, 14, { curl: 0.1, n: 14 }), DOG.fur)
  g += shaded(blob(20, -50, 52, 40, { curl: 0.05, n: 30 }), DOG.fur, DOG.furShade, 'M30 -100 h60 v110 h-60z')
  g += fill(blob(56, -18, 16, 18, { curl: 0.08, n: 16 }), DOG.furShade)
  g += fill(blob(-14, -22, 11, 22, { curl: 0.08, n: 16 }), DOG.fur) + fill(blob(10, -22, 11, 22, { curl: 0.08, n: 16 }), DOG.fur)
  g += fill(blob(-14, -2, 12, 6), DOG.furShade) + fill(blob(10, -2, 12, 6), DOG.furShade) + fill(blob(58, -2, 13, 6), DOG.furShade)
  g += fill(smooth([[-34, -88], [-6, -78], [22, -88], [-4, -54]]), RISO.red)
  ;[[-20, -80], [-6, -76], [6, -82], [-6, -64]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="2.2" fill="#FFF"/>` })
  g += `<rect x="-24" y="-58" width="38" height="15" rx="5" fill="${RISO.yellow}"/><text x="-5" y="-47" font-family="Atkinson Hyperlegible" font-weight="700" font-size="8" fill="${INK}" text-anchor="middle">READING</text>`
  g += margotHead(-6, -122, o.mood || 'smug', 1)
  return `<g transform="translate(${f(o.x || 0)} ${f(o.y || 0)}) scale(${o.scale || 1})">${g}</g>`
}

/** Paper grain and a slight hand-cut wobble, for a page's <defs> */
function filters () {
  return `<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.16"/></feComponentTransfer></filter>`
}

module.exports = { INK, PAPER, RISO, UNI, CAST, DOG, standing, maisieChair, margot, margotHead, head, filters, smooth, blob }
