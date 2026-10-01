/*
 * "Where's Margot?" character kit (style v2: clean line, after Tintin's
 * ligne claire, with Garfield-style expressive eyes for Margot).
 *
 * One even outline weight, flat colours with a single soft shadow tone,
 * dot eyes and small noses. Everything is SVG; text stays editable in Figma.
 */
const LINE = '#23232B'
const LW = 2.6

const UNI = { jumper: '#26386B', jumperShade: '#1B2A55', polo: '#FFFFFF', poloShade: '#DDE3EE', trousers: '#6E7480', trousersShade: '#585E69', shoe: '#2A2A30', badge: '#F2C230' }

const CAST = {
  stan: { name: 'Stan', skin: '#F2C9A6', skinShade: '#E2AE88', hair: '#F0C75A', hairShade: '#D9A83A', brow: '#B98A2A', age: 'Year 6' },
  maisie: { name: 'Maisie', skin: '#F8D9C2', skinShade: '#EDBFA0', hair: '#D9692F', hairShade: '#B9531F', brow: '#A9471A', age: 'Year 6' },
  priya: { name: 'Priya', skin: '#B97C52', skinShade: '#9E6640', hair: '#1E1715', hairShade: '#000000', brow: '#1E1715', age: 'Year 6' },
  kofi: { name: 'Kofi', skin: '#6E432A', skinShade: '#5A3520', hair: '#17110E', hairShade: '#000000', brow: '#17110E', age: 'Year 5' },
  tomasz: { name: 'Tomasz', skin: '#EEC6A6', skinShade: '#DDAA86', hair: '#8A5A36', hairShade: '#6E4427', brow: '#5E3A22', age: 'Year 5' },
  hargreaves: { name: 'Mrs Hargreaves', skin: '#F1CDB4', skinShade: '#E0B295', hair: '#C9CBD1', hairShade: '#A9ACB5', brow: '#8B8E98', age: 'Deputy head' }
}

const f = n => Math.round(n * 10) / 10
let uid = 0
const nid = p => `${p}${++uid}`
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** A filled, outlined shape with an optional shadow region clipped inside it */
function shape (d, fill, shade, shadeD) {
  if (!shade || !shadeD) return `<path d="${d}" fill="${fill}" stroke="${LINE}" stroke-width="${LW}" stroke-linejoin="round" stroke-linecap="round"/>`
  const id = nid('c')
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${fill}"/><path d="${shadeD}" fill="${shade}" clip-path="url(#${id})"/><path d="${d}" fill="none" stroke="${LINE}" stroke-width="${LW}" stroke-linejoin="round" stroke-linecap="round"/>`
}
const line = (d, w = LW, col = LINE) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`

/** A limb (sleeve, leg) as a tapered tube through 3 points */
function tube (pts, w1, w2) {
  const [a, b, c] = pts
  const n = (p, q) => { const dx = q[0] - p[0]; const dy = q[1] - p[1]; const l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l] }
  const n1 = n(a, b)
  const n2 = n(b, c)
  const nb = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2]
  const wm = (w1 + w2) / 2
  const L = (p, nn, w, s) => [p[0] + nn[0] * w / 2 * s, p[1] + nn[1] * w / 2 * s]
  const a1 = L(a, n1, w1, 1); const b1 = L(b, nb, wm, 1); const c1 = L(c, n2, w2, 1)
  const a2 = L(a, n1, w1, -1); const b2 = L(b, nb, wm, -1); const c2 = L(c, n2, w2, -1)
  return `M${f(a1[0])} ${f(a1[1])} Q${f(b1[0])} ${f(b1[1])} ${f(c1[0])} ${f(c1[1])} L${f(c2[0])} ${f(c2[1])} Q${f(b2[0])} ${f(b2[1])} ${f(a2[0])} ${f(a2[1])} Z`
}

function hand (x, y, skin, flip = 1, r = 10) {
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${r}" ry="${r * 1.12}" fill="${skin}" stroke="${LINE}" stroke-width="${LW}"/>` +
    `<path d="M${f(x - flip * (r - 2))} ${f(y - 2)} q${f(-flip * 7)} -3 ${f(-flip * 6)} -10" fill="${skin}" stroke="${LINE}" stroke-width="${LW}" stroke-linecap="round"/>`
}

// ------------------------------------------------------------------ faces
function face (p, cx, cy, expr, look = 0) {
  const lx = look * 5
  const ex = 15
  const ey = cy + 1
  let s = ''
  const eye = (x, open = 1) => open === 'happy'
    ? line(`M${f(x - 5)} ${f(ey + 1)} q5 -6 10 0`, 2.6)
    : `<ellipse cx="${f(x)}" cy="${f(ey)}" rx="${3.6 * open}" ry="${5 * open}" fill="${LINE}"/>`
  const browY = ey - 13
  const brow = (x, tilt = 0, raise = 0, col = p.brow) => line(`M${f(x - 7)} ${f(browY - raise + tilt)} Q${f(x)} ${f(browY - raise - 3)} ${f(x + 7)} ${f(browY - raise - tilt)}`, 2.6, col)
  const L = cx - ex + lx
  const R = cx + ex + lx
  const my = cy + 27
  const mx = cx + lx * 0.8
  switch (expr) {
    case 'surprised':
      s += `<ellipse cx="${f(L)}" cy="${f(ey)}" rx="6" ry="7.5" fill="#FFF" stroke="${LINE}" stroke-width="2"/><ellipse cx="${f(R)}" cy="${f(ey)}" rx="6" ry="7.5" fill="#FFF" stroke="${LINE}" stroke-width="2"/><circle cx="${f(L + look)}" cy="${f(ey)}" r="2.8" fill="${LINE}"/><circle cx="${f(R + look)}" cy="${f(ey)}" r="2.8" fill="${LINE}"/>`
      s += brow(L, 0, 6) + brow(R, 0, 6)
      s += `<ellipse cx="${f(mx)}" cy="${f(my + 1)}" rx="5" ry="6.5" fill="#6B2430" stroke="${LINE}" stroke-width="2.2"/>`
      break
    case 'laugh':
      s += eye(L, 'happy') + eye(R, 'happy') + brow(L, 0, 3) + brow(R, 0, 3)
      s += `<path d="M${f(mx - 12)} ${f(my - 4)} Q${f(mx)} ${f(my + 14)} ${f(mx + 12)} ${f(my - 4)} Z" fill="#6B2430" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/><path d="M${f(mx - 6)} ${f(my + 4)} q6 -3 12 0" fill="#E8707A"/>`
      break
    case 'cheeky':
      s += eye(L) + eye(R) + brow(L, 2, -1) + brow(R, -2, 4)
      s += line(`M${f(mx - 8)} ${f(my + 1)} Q${f(mx + 2)} ${f(my + 6)} ${f(mx + 10)} ${f(my - 3)}`, 2.6)
      break
    case 'worried':
      s += eye(L) + eye(R) + brow(L, -3, 2) + brow(R, 3, 2)
      s += line(`M${f(mx - 8)} ${f(my + 2)} q4 -4 8 0 t8 0`, 2.4)
      break
    case 'determined':
      s += eye(L) + eye(R) + brow(L, 3, -2) + brow(R, -3, -2)
      s += line(`M${f(mx - 7)} ${f(my)} h14`, 2.6)
      break
    default: // happy
      s += eye(L) + eye(R) + brow(L, 0, 1) + brow(R, 0, 1)
      s += line(`M${f(mx - 9)} ${f(my - 2)} Q${f(mx)} ${f(my + 7)} ${f(mx + 9)} ${f(my - 2)}`, 2.6)
  }
  // nose: a small hook (ligne claire)
  s += line(`M${f(cx + lx * 1.3 + 1)} ${f(cy + 9)} q4 5 -1 8`, 2.2, p.skinShade === '#5A3520' ? '#2A170E' : '#B07A5A')
  s += `<ellipse cx="${f(L - 6)}" cy="${f(cy + 17)}" rx="6" ry="3.4" fill="#F0857A" fill-opacity=".3"/><ellipse cx="${f(R + 6)}" cy="${f(cy + 17)}" rx="6" ry="3.4" fill="#F0857A" fill-opacity=".3"/>`
  return s
}

const facePath = (cx, cy) => `M${f(cx - 41)} ${f(cy - 6)} C${f(cx - 42)} ${f(cy - 54)} ${f(cx + 42)} ${f(cy - 54)} ${f(cx + 41)} ${f(cy - 6)} C${f(cx + 40)} ${f(cy + 28)} ${f(cx + 20)} ${f(cy + 46)} ${f(cx)} ${f(cy + 46)} C${f(cx - 20)} ${f(cy + 46)} ${f(cx - 40)} ${f(cy + 28)} ${f(cx - 41)} ${f(cy - 6)} Z`

function head (who, cx, cy, expr = 'happy', look = 0) {
  const p = CAST[who]
  let back = ''
  let front = ''
  let extra = ''
  if (who === 'stan') {
    front = shape(`M${cx - 43} ${cy - 2} C${cx - 48} ${cy - 46} ${cx - 20} ${cy - 62} ${cx + 4} ${cy - 58} C${cx + 30} ${cy - 56} ${cx + 48} ${cy - 40} ${cx + 43} ${cy - 2} C${cx + 36} ${cy - 22} ${cx + 22} ${cy - 30} ${cx + 4} ${cy - 30} C${cx - 16} ${cy - 30} ${cx - 34} ${cy - 22} ${cx - 43} ${cy - 2} Z`, p.hair, p.hairShade, `M${cx + 10} ${cy - 70} h60 v80 h-60z`)
    // the quiff
    front += shape(`M${cx - 14} ${cy - 44} C${cx - 18} ${cy - 74} ${cx + 4} ${cy - 92} ${cx + 28} ${cy - 84} C${cx + 16} ${cy - 78} ${cx + 12} ${cy - 66} ${cx + 18} ${cy - 46} C${cx + 8} ${cy - 50} ${cx - 4} ${cy - 50} ${cx - 14} ${cy - 44} Z`, p.hair, p.hairShade, `M${cx + 10} ${cy - 92} h24 v50 h-24z`)
  } else if (who === 'kofi') {
    front = shape(`M${cx - 42} ${cy - 6} C${cx - 46} ${cy - 34} ${cx - 42} ${cy - 62} ${cx - 22} ${cy - 68} C${cx - 8} ${cy - 72} ${cx + 8} ${cy - 72} ${cx + 22} ${cy - 68} C${cx + 42} ${cy - 62} ${cx + 46} ${cy - 34} ${cx + 42} ${cy - 6} C${cx + 38} ${cy - 22} ${cx + 32} ${cy - 30} ${cx + 22} ${cy - 32} C${cx + 8} ${cy - 34} ${cx - 8} ${cy - 34} ${cx - 22} ${cy - 32} C${cx - 32} ${cy - 30} ${cx - 38} ${cy - 22} ${cx - 42} ${cy - 6} Z`, p.hair, '#2E2420', `M${cx + 14} ${cy - 80} h40 v80 h-40z`)
    ;[[-18, -58], [-4, -62], [10, -58], [-26, -46], [24, -46], [0, -48]].forEach(([dx, dy]) => { extra += line(`M${cx + dx - 4} ${cy + dy} q4 -4 8 0`, 1.6, '#4A3A33') })
  } else if (who === 'priya') {
    back = shape(`M${cx - 44} ${cy + 22} C${cx - 52} ${cy - 30} ${cx - 34} ${cy - 58} ${cx} ${cy - 58} C${cx + 34} ${cy - 58} ${cx + 52} ${cy - 30} ${cx + 44} ${cy + 22} Z`, p.hair)
    // plaits with ribbons
    ;[-1, 1].forEach(side => {
      for (let i = 0; i < 4; i++) back += shape(`M${cx + side * 46} ${cy + 18 + i * 17} c${side * 10} 0 ${side * 12} 16 0 18 c${side * -12} -2 ${side * -10} -18 0 -18 z`, p.hair)
      back += `<path d="M${cx + side * 46} ${cy + 88} l${side * 10} 8 l${side * -2} -12 z M${cx + side * 46} ${cy + 88} l${side * -8} 10 l${side * -2} -12 z" fill="#D9343F" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`
    })
    front = shape(`M${cx - 42} ${cy - 2} C${cx - 46} ${cy - 44} ${cx - 22} ${cy - 56} ${cx} ${cy - 54} C${cx + 22} ${cy - 56} ${cx + 46} ${cy - 44} ${cx + 42} ${cy - 2} C${cx + 30} ${cy - 30} ${cx + 12} ${cy - 40} ${cx + 1} ${cy - 50} C${cx - 10} ${cy - 40} ${cx - 30} ${cy - 30} ${cx - 42} ${cy - 2} Z`, p.hair)
    extra += line(`M${cx + 1} ${cy - 54} v6`, 1.6, '#3A2E2A')
  } else if (who === 'tomasz') {
    front = shape(`M${cx - 48} ${cy + 10} C${cx - 56} ${cy - 30} ${cx - 34} ${cy - 66} ${cx + 2} ${cy - 64} C${cx + 40} ${cy - 66} ${cx + 58} ${cy - 30} ${cx + 48} ${cy + 10} C${cx + 44} ${cy - 6} ${cx + 38} ${cy - 16} ${cx + 30} ${cy - 18} L${cx + 26} ${cy - 8} L${cx + 18} ${cy - 22} L${cx + 6} ${cy - 10} L${cx - 2} ${cy - 24} L${cx - 14} ${cy - 10} L${cx - 22} ${cy - 22} L${cx - 32} ${cy - 12} C${cx - 40} ${cy - 10} ${cx - 44} ${cy - 2} ${cx - 48} ${cy + 10} Z`, p.hair, p.hairShade, `M${cx + 10} ${cy - 70} h60 v90 h-60z`)
    // pencil behind the ear
    extra += `<g transform="rotate(-30 ${cx + 46} ${cy - 2})"><rect x="${cx + 34}" y="${cy - 6}" width="34" height="7" fill="#F2C230" stroke="${LINE}" stroke-width="2"/><path d="M${cx + 68} ${cy - 6} l8 3.5 -8 3.5 z" fill="#F1D3A8" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/><rect x="${cx + 30}" y="${cy - 6}" width="5" height="7" fill="#E9828E" stroke="${LINE}" stroke-width="2"/></g>`
  } else if (who === 'maisie') {
    back = shape(`M${cx + 6} ${cy - 54} C${cx + 30} ${cy - 76} ${cx + 66} ${cy - 66} ${cx + 66} ${cy - 30} C${cx + 66} ${cy - 6} ${cx + 52} ${cy + 10} ${cx + 44} ${cy + 18} C${cx + 54} ${cy - 10} ${cx + 48} ${cy - 40} ${cx + 22} ${cy - 46} Z`, p.hair, p.hairShade, `M${cx + 40} ${cy - 80} h40 v100 h-40z`)
    back += `<ellipse cx="${cx + 18}" cy="${cy - 56}" rx="9" ry="7" fill="#2FB38A" stroke="${LINE}" stroke-width="${LW}"/>`
    front = shape(`M${cx - 42} ${cy - 2} C${cx - 46} ${cy - 46} ${cx - 16} ${cy - 58} ${cx + 4} ${cy - 56} C${cx + 28} ${cy - 56} ${cx + 46} ${cy - 42} ${cx + 42} ${cy - 2} C${cx + 34} ${cy - 18} ${cx + 22} ${cy - 30} ${cx + 4} ${cy - 30} C${cx - 18} ${cy - 30} ${cx - 34} ${cy - 22} ${cx - 42} ${cy - 2} Z`, p.hair, p.hairShade, `M${cx + 14} ${cy - 70} h60 v80 h-60z`)
    ;[[-24, 15], [-18, 19], [-28, 20], [22, 15], [16, 19], [26, 20]].forEach(([dx, dy]) => { extra += `<circle cx="${cx + dx + look * 4}" cy="${cy + dy}" r="1.5" fill="#C9734A"/>` })
  } else if (who === 'hargreaves') {
    back = shape(`M${cx - 22} ${cy - 74} a22 18 0 1 1 44 0 a22 18 0 1 1 -44 0 z`, p.hair, p.hairShade, `M${cx + 6} ${cy - 96} h30 v40 h-30z`) + line(`M${cx - 18} ${cy - 76} q18 -8 36 0`, 1.8, p.hairShade)
    front = shape(`M${cx - 43} ${cy + 4} C${cx - 48} ${cy - 46} ${cx - 18} ${cy - 60} ${cx + 4} ${cy - 58} C${cx + 30} ${cy - 56} ${cx + 48} ${cy - 42} ${cx + 43} ${cy + 4} C${cx + 38} ${cy - 18} ${cx + 30} ${cy - 30} ${cx + 10} ${cy - 34} C${cx - 4} ${cy - 30} ${cx - 30} ${cy - 26} ${cx - 43} ${cy + 4} Z`, p.hair, p.hairShade, `M${cx + 16} ${cy - 70} h50 v80 h-50z`)
    extra += line(`M${cx - 30} ${cy - 30} q14 -16 34 -22 M${cx - 18} ${cy - 22} q14 -18 30 -26`, 1.6, p.hairShade)
  }
  let s = back
  // ears
  s += shape(`M${cx - 40} ${cy - 4} c-12 -4 -14 16 -2 20 z`, p.skin) + shape(`M${cx + 40} ${cy - 4} c12 -4 14 16 2 20 z`, p.skin)
  s += shape(facePath(cx, cy), p.skin, p.skinShade, `M${cx + 22} ${cy - 60} C${cx + 46} ${cy - 30} ${cx + 44} ${cy + 30} ${cx + 4} ${cy + 52} L${cx + 60} ${cy + 60} L${cx + 60} ${cy - 60} Z`)
  s += face(p, cx, cy, expr, look)
  s += front + extra
  if (who === 'priya' || who === 'hargreaves') {
    const cat = who === 'hargreaves'
    const lx = look * 5
    s += `<path d="M${cx - 27 + lx} ${cy - 6} h22 q2 14 -11 15 q-13 -1 -11 -15 z M${cx + 5 + lx} ${cy - 6} h22 q2 14 -11 15 q-13 -1 -11 -15 z" fill="#FFFFFF" fill-opacity=".22" stroke="${cat ? '#7A2E5C' : LINE}" stroke-width="2.4" stroke-linejoin="round"/>` + line(`M${cx - 5 + lx} ${cy - 4} q5 -4 10 0`, 2.2, cat ? '#7A2E5C' : LINE)
    if (cat) s += line(`M${cx - 27 + lx} ${cy - 4} C${cx - 46} ${cy + 20} ${cx - 44} ${cy + 60} ${cx - 30} ${cy + 76}`, 1.4, '#B8A060')
  }
  return s
}

// ------------------------------------------------------------------ bodies
function standing (who, o = {}) {
  const p = CAST[who]
  const pose = o.pose || 'down'
  let s = ''
  const hy = -238 // face centre
  const legBottom = -16
  const adult = who === 'hargreaves'
  const shorts = who === 'stan'
  const skirt = who === 'priya' || adult
  // legs
  if (skirt) {
    s += shape(tube([[-14, -96], [-15, -56], [-15, legBottom]], 18, 15), adult ? '#3A3550' : '#26386B')
    s += shape(tube([[14, -96], [15, -56], [15, legBottom]], 18, 15), adult ? '#3A3550' : '#26386B')
  } else if (shorts) {
    s += shape(tube([[-15, -78], [-15, -50], [-15, legBottom]], 18, 15), p.skin)
    s += shape(tube([[15, -78], [15, -50], [15, legBottom]], 18, 15), p.skin)
    s += shape(`M-25 -46 h20 v30 h-20z`, '#FFF', UNI.poloShade, 'M-25 -46 h20 v6 h-20z') + shape(`M5 -46 h20 v30 h-20z`, '#FFF', UNI.poloShade, 'M5 -46 h20 v6 h-20z')
  } else {
    s += shape(tube([[-15, -102], [-16, -56], [-16, legBottom]], 28, 23), UNI.trousers, UNI.trousersShade, 'M-40 -110 h22 v110 h-22z')
    s += shape(tube([[15, -102], [16, -56], [16, legBottom]], 28, 23), UNI.trousers, UNI.trousersShade, 'M18 -110 h22 v110 h-22z')
    if (who === 'kofi') s += shape(`M5 -30 h22 v14 h-22z`, '#FFF') // one sock down
  }
  // shoes
  const shoe = who === 'kofi' ? '#FFFFFF' : UNI.shoe
  s += shape(`M-36 -2 C-38 -14 -26 -20 -12 -18 L-4 -18 L-4 -2 Z`, shoe) + shape(`M36 -2 C38 -14 26 -20 12 -18 L4 -18 L4 -2 Z`, shoe)
  if (who === 'kofi') s += line('M-30 -8 h18 M30 -8 h-18', 2, '#D9343F')
  // skirt or shorts or trouser top
  if (skirt) s += shape(adult ? `M-36 -112 L-40 -48 L40 -48 L36 -112 Z` : `M-36 -112 L-44 -68 L44 -68 L36 -112 Z`, adult ? '#3A3550' : UNI.trousers, adult ? '#2C2840' : UNI.trousersShade, 'M10 -120 h40 v80 h-40z') + (adult ? '' : line('M-20 -108 l-6 38 M0 -108 v38 M20 -108 l6 38', 2, UNI.trousersShade))
  if (shorts) s += shape(`M-34 -112 L-36 -50 L-2 -50 L0 -86 L2 -50 L36 -50 L34 -112 Z`, UNI.trousers, UNI.trousersShade, 'M14 -120 h40 v80 h-40z')
  // torso: jumper (or polo + jumper round the waist for Stan; cardigan for Mrs H)
  const torso = `M-44 -184 C-52 -180 -54 -168 -52 -156 L-46 -104 C-30 -100 30 -100 46 -104 L52 -156 C54 -168 52 -180 44 -184 C26 -192 -26 -192 -44 -184 Z`
  const top = shorts ? UNI.polo : adult ? '#8C3F5C' : UNI.jumper
  const topShade = shorts ? UNI.poloShade : adult ? '#73304A' : UNI.jumperShade
  s += shape(torso, top, topShade, 'M18 -200 h50 v110 h-50z')
  if (!shorts && !adult) {
    s += line('M-44 -110 C-20 -106 20 -106 44 -110', 2, '#3A4E8A') + line('M-44 -104 C-20 -100 20 -100 44 -104', 2, '#3A4E8A')
    s += `<path d="M24 -164 a7 8 0 1 0 14 0 a7 8 0 1 0 -14 0" fill="${UNI.badge}" stroke="${LINE}" stroke-width="2"/>` // school badge
  }
  if (shorts) s += shape(`M-48 -112 C-20 -104 20 -104 48 -112 L50 -98 C20 -92 -20 -92 -50 -98 Z`, UNI.jumper) + shape(`M-8 -110 l-10 30 l10 2 l8 -26 z`, UNI.jumper) // jumper tied round the waist
  if (adult) s += line('M0 -186 V-104', 2.4) + `<circle cx="-6" cy="-160" r="2.5" fill="#F2E3C6"/><circle cx="-6" cy="-140" r="2.5" fill="#F2E3C6"/><circle cx="-6" cy="-120" r="2.5" fill="#F2E3C6"/>`
  // collar
  s += shape(`M-20 -190 L0 -172 L20 -190 L12 -194 L0 -184 L-12 -194 Z`, UNI.polo, UNI.poloShade, 'M0 -200 h30 v40 h-30z')
  if (who === 'kofi') s += shape(`M-30 -104 l-4 14 h20 l2 -14 z`, UNI.polo) // untucked shirt
  // badges and props on the body
  if (who === 'maisie') s += `<circle cx="-28" cy="-160" r="8" fill="#FFF" stroke="${LINE}" stroke-width="2"/><path d="M-30 -166 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="#2FA36B"/>`
  if (adult) s += line('M-14 -190 C-20 -160 -12 -140 0 -130 C12 -140 20 -160 14 -190', 2, '#2E6BC4') + shape('M-10 -132 h20 v26 h-20z', '#FFF') + line('M-6 -124 h12 M-6 -118 h8', 1.6, '#888')
  // arms
  const sleeve = shorts ? UNI.polo : adult ? '#8C3F5C' : UNI.jumper
  const sleeveShade = shorts ? UNI.poloShade : adult ? '#73304A' : UNI.jumperShade
  const arms = {
    down: [[[-44, -178], [-56, -136], [-54, -100]], [[44, -178], [56, -136], [54, -100]]],
    ball: [[[-44, -178], [-56, -136], [-54, -100]], [[44, -178], [62, -140], [40, -118]]],
    book: [[[-44, -178], [-50, -140], [-20, -128]], [[44, -178], [50, -140], [20, -128]]],
    wave: [[[-44, -178], [-56, -136], [-54, -100]], [[44, -178], [70, -200], [72, -240]]],
    hips: [[[-44, -178], [-66, -144], [-42, -116]], [[44, -178], [66, -144], [42, -116]]],
    point: [[[-44, -178], [-56, -136], [-54, -100]], [[44, -178], [74, -168], [100, -176]]]
  }[pose]
  arms.forEach((a, i) => {
    const w = shorts ? [16, 13] : [24, 19]
    if (shorts) {
      s += shape(tube([a[0], [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2], a[1]], 24, 20), UNI.polo)
      s += shape(tube([a[1], [(a[1][0] + a[2][0]) / 2, (a[1][1] + a[2][1]) / 2], a[2]], 14, 12), p.skin)
    } else {
      s += shape(tube(a, w[0], w[1]), sleeve, sleeveShade, i ? 'M30 -260 h80 v200 h-80z' : 'M-200 -300 h0 v0z')
    }
    s += hand(a[2][0], a[2][1] + 7, p.skin, i ? 1 : -1)
  })
  // props in hand
  if (o.prop === 'ball') s += `<circle cx="58" cy="-116" r="22" fill="#FFF" stroke="${LINE}" stroke-width="${LW}"/><path d="M58 -124 l7 5 -3 8 h-8 l-3 -8 z" fill="${LINE}"/>` + line('M58 -124 v-14 M65 -119 l12 -4 M62 -111 l8 10 M54 -111 l-8 10 M51 -119 l-12 -4', 1.6)
  if (o.prop === 'notebook') s += shape('M-26 -144 h52 v34 h-52z', '#D9343F', '#B5262F', 'M0 -150 h40 v50 h-40z') + `<text x="0" y="-122" font-family="Comic Neue" font-weight="700" font-size="11" fill="#FFF" text-anchor="middle">WORDS</text>`
  if (o.prop === 'sketchbook') s += shape('M-30 -150 h60 v40 h-60z', '#F3E8CC', '#E2D3AE', 'M10 -160 h40 v60 h-40z') + line('M-20 -132 q10 -12 20 0 t20 0', 2, '#6E4427')
  if (o.prop === 'stethoscope') s += line('M-24 -186 C-30 -150 -10 -130 0 -136 C10 -130 30 -150 24 -186', 2.6, '#3E7BD8') + `<circle cx="0" cy="-132" r="6" fill="#C7D4E6" stroke="${LINE}" stroke-width="2"/>`
  // neck and head
  s += shape('M-10 -200 h20 v16 h-20z', p.skin, p.skinShade, 'M0 -200 h12 v8 h-12z')
  s += head(who, 0, hy, o.expr || 'happy', o.look || 0)
  const k = o.scale || 1
  return `<g transform="translate(${f(o.x || 0)} ${f(o.y || 0)}) scale(${k})">${s}</g>`
}

/** Maisie in her sports wheelchair */
function maisieChair (o = {}) {
  const p = CAST.maisie
  let s = ''
  // far wheel
  s += `<ellipse cx="-20" cy="-62" rx="48" ry="60" fill="none" stroke="${LINE}" stroke-width="7"/><ellipse cx="-20" cy="-62" rx="48" ry="60" fill="none" stroke="#5C6B80" stroke-width="3"/>`
  // seat and legs
  s += shape('M-48 -104 C-48 -116 30 -116 40 -108 L40 -92 L-48 -92 Z', UNI.trousers, UNI.trousersShade, 'M0 -120 h50 v30 h-50z') // thighs
  s += shape(tube([[34, -104], [40, -70], [42, -34]], 24, 20), UNI.trousers, UNI.trousersShade, 'M40 -110 h20 v80 h-20z')
  s += shape('M30 -20 C30 -32 42 -36 56 -34 L62 -34 L62 -20 Z', UNI.shoe)
  s += line('M-46 -92 L40 -92 L50 -20', 6, '#1D8E86') // frame
  s += `<circle cx="52" cy="-14" r="9" fill="#5C6B80" stroke="${LINE}" stroke-width="${LW}"/>`
  // torso, arms, head
  s += shape('M-44 -194 C-52 -190 -54 -178 -52 -166 L-48 -104 C-30 -100 30 -100 46 -104 L52 -166 C54 -178 52 -190 44 -194 C26 -202 -26 -202 -44 -194 Z', UNI.jumper, UNI.jumperShade, 'M18 -210 h50 v110 h-50z')
  s += line('M-46 -110 C-20 -106 20 -106 46 -110', 2, '#3A4E8A')
  s += `<circle cx="-28" cy="-170" r="8" fill="#FFF" stroke="${LINE}" stroke-width="2"/><path d="M-30 -176 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="#2FA36B"/>`
  s += shape('M-20 -200 L0 -182 L20 -200 L12 -204 L0 -194 L-12 -204 Z', UNI.polo, UNI.poloShade, 'M0 -210 h30 v40 h-30z')
  s += line('M-24 -196 C-30 -160 -10 -140 0 -146 C10 -140 30 -160 24 -196', 2.6, '#3E7BD8') + `<circle cx="0" cy="-142" r="6" fill="#C7D4E6" stroke="${LINE}" stroke-width="2"/>`
  s += shape(tube([[-44, -188], [-58, -146], [-44, -108]], 24, 19), UNI.jumper, UNI.jumperShade, 'M-200 0 h0z') + hand(-44, -100, p.skin, -1)
  s += shape(tube([[44, -188], [64, -150], [70, -196]], 24, 19), UNI.jumper, UNI.jumperShade, 'M30 -260 h80 v200 h-80z') + hand(70, -204, p.skin, 1)
  s += shape('M-10 -210 h20 v16 h-20z', p.skin, p.skinShade, 'M0 -210 h12 v8 h-12z')
  s += head('maisie', 0, -248, o.expr || 'laugh', o.look || 0)
  // near wheel with push rim
  s += `<ellipse cx="-6" cy="-58" rx="50" ry="58" fill="none" stroke="${LINE}" stroke-width="8"/><ellipse cx="-6" cy="-58" rx="50" ry="58" fill="none" stroke="#1D8E86" stroke-width="4"/><ellipse cx="-6" cy="-58" rx="42" ry="49" fill="none" stroke="#B9C2CF" stroke-width="3"/>`
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += line(`M-6 -58 L${f(-6 + Math.cos(a) * 40)} ${f(-58 + Math.sin(a) * 47)}`, 1.4, '#7D8899') }
  s += `<circle cx="-6" cy="-58" r="7" fill="#1D8E86" stroke="${LINE}" stroke-width="2"/>`
  return `<g transform="translate(${f(o.x || 0)} ${f(o.y || 0)}) scale(${o.scale || 1})">${s}</g>`
}

// ------------------------------------------------------------------ Margot (golden cockapoo)
const DOG = { fur: '#E2AE62', furShade: '#C98F45', ear: '#C27D3A', muzzle: '#F6DEB4', nose: '#2A1C16', bandana: '#D9343F' }

function curls (circles, fill) {
  // outline every curl, then fill over them: only the outside edge keeps a line
  return circles.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${LINE}" stroke-width="${LW * 2}"/>`).join('') +
    circles.map(([x, y, r]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"/>`).join('')
}

function margotHead (cx, cy, mood = 'smug', s = 1) {
  let g = ''
  // ears
  const ear = side => {
    const pts = []
    for (let i = 0; i < 5; i++) pts.push([side * (34 + (i % 2) * 4), -6 + i * 13, 11 - i * 0.6])
    return curls(pts, DOG.ear)
  }
  g += ear(-1) + ear(1)
  // head fluff
  const ring = []
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ring.push([Math.cos(a) * 30, Math.sin(a) * 28 - 2, 13]) }
  ring.push([0, -2, 28])
  g += curls(ring, DOG.fur)
  g += `<path d="M-10 -36 q10 -10 20 0" stroke="${DOG.furShade}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
  // muzzle and nose
  g += `<ellipse cx="0" cy="16" rx="20" ry="15" fill="${DOG.muzzle}" stroke="${LINE}" stroke-width="${LW}"/>`
  g += `<path d="M-8 8 Q0 2 8 8 Q6 16 0 17 Q-6 16 -8 8 Z" fill="${DOG.nose}"/><ellipse cx="-2" cy="8" rx="2.5" ry="1.5" fill="#FFF" fill-opacity=".6"/>`
  // eyes (Garfield-style: big, touching, with lids)
  const eyes = (lid, pupilDy = 0) => {
    let e = `<ellipse cx="-10" cy="-10" rx="11" ry="13" fill="#FFF" stroke="${LINE}" stroke-width="${LW}"/><ellipse cx="10" cy="-10" rx="11" ry="13" fill="#FFF" stroke="${LINE}" stroke-width="${LW}"/>`
    e += `<circle cx="-8" cy="${-6 + pupilDy}" r="4" fill="${LINE}"/><circle cx="8" cy="${-6 + pupilDy}" r="4" fill="${LINE}"/>`
    if (lid) e += `<path d="M-21 -10 C-21 -26 1 -26 1 -10 L1 ${-10 + lid} C-6 ${-6 + lid} -14 ${-6 + lid} -21 ${-10 + lid} Z" fill="${DOG.fur}" stroke="${LINE}" stroke-width="${LW}" stroke-linejoin="round"/><path d="M-1 -10 C-1 -26 21 -26 21 -10 L21 ${-10 + lid} C14 ${-6 + lid} 6 ${-6 + lid} -1 ${-10 + lid} Z" fill="${DOG.fur}" stroke="${LINE}" stroke-width="${LW}" stroke-linejoin="round"/>`
    return e
  }
  if (mood === 'smug') g += eyes(9) + `<path d="M-8 24 Q0 29 10 22" stroke="${LINE}" stroke-width="${LW}" fill="none" stroke-linecap="round"/>`
  else if (mood === 'excited') g += eyes(0, -3) + `<path d="M-9 22 Q0 34 9 22 Z" fill="#6B2430" stroke="${LINE}" stroke-width="2.2"/><path d="M-4 28 q4 8 8 0" fill="#E8707A" stroke="${LINE}" stroke-width="2"/>`
  else if (mood === 'sleepy') g += eyes(14) + `<path d="M-6 24 h12" stroke="${LINE}" stroke-width="${LW}" stroke-linecap="round"/>` + `<text x="30" y="-30" font-family="Comic Neue" font-weight="700" font-size="16" fill="${LINE}">z</text><text x="40" y="-44" font-family="Comic Neue" font-weight="700" font-size="12" fill="${LINE}">z</text>`
  else g += eyes(4, 2) + `<path d="M-8 24 Q0 20 8 24" stroke="${LINE}" stroke-width="${LW}" fill="none" stroke-linecap="round"/>` // guilty
  return `<g transform="translate(${f(cx)} ${f(cy)}) scale(${s})">${g}</g>`
}

function margot (o = {}) {
  let g = ''
  // tail pompom
  g += curls([[62, -70, 12], [70, -82, 10], [74, -66, 9]], DOG.fur)
  // body
  const body = [[-10, -60, 26], [14, -64, 26], [36, -58, 24], [52, -50, 20], [-20, -44, 20], [44, -36, 18], [0, -40, 22], [24, -40, 22]]
  g += curls(body, DOG.fur)
  // back leg
  g += curls([[48, -24, 14], [52, -10, 12]], DOG.fur) + `<ellipse cx="54" cy="-2" rx="13" ry="6" fill="${DOG.furShade}" stroke="${LINE}" stroke-width="${LW}"/>`
  // front legs
  g += curls([[-20, -26, 11], [-20, -12, 11]], DOG.fur) + curls([[2, -26, 11], [2, -12, 11]], DOG.fur)
  g += `<ellipse cx="-20" cy="-2" rx="12" ry="6" fill="${DOG.furShade}" stroke="${LINE}" stroke-width="${LW}"/><ellipse cx="2" cy="-2" rx="12" ry="6" fill="${DOG.furShade}" stroke="${LINE}" stroke-width="${LW}"/>`
  // bandana with READING DOG tag
  g += `<path d="M-34 -84 Q-8 -72 16 -84 L-6 -52 Z" fill="${DOG.bandana}" stroke="${LINE}" stroke-width="${LW}" stroke-linejoin="round"/>`
  ;[[-20, -76], [-8, -70], [2, -78], [-10, -62]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="2.2" fill="#FFF"/>` })
  g += `<rect x="-22" y="-60" width="34" height="14" rx="3" fill="#F2C230" stroke="${LINE}" stroke-width="2"/><text x="-5" y="-50" font-family="Comic Neue" font-weight="700" font-size="7.5" fill="${LINE}" text-anchor="middle">READING</text>`
  g += margotHead(-10, -118, o.mood || 'smug', 1)
  if (o.ball) g += `<circle cx="-10" cy="-96" r="14" fill="#FFF" stroke="${LINE}" stroke-width="${LW}"/><path d="M-10 -102 l5 4 -2 6 h-6 l-2 -6 z" fill="${LINE}"/>`
  return `<g transform="translate(${f(o.x || 0)} ${f(o.y || 0)}) scale(${o.scale || 1})">${g}</g>`
}

module.exports = { LINE, LW, CAST, UNI, DOG, standing, maisieChair, margot, margotHead, head, esc }
