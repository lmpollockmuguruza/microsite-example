/*
 * "Where's Margot?" Issue 1: The ball goes through the window.
 * An opener ("rules of the game") plus 4 story pages, drawn with margot-kit.
 *
 *   assets/comic/issue-1/*.png             the site (2x)
 *   assets/comic/issue-1/*.svg             fonts linked
 *   exports/figma/wheres-margot-issue-1.svg   all pages on one board, for Figma
 *
 * The newsletter page's comic section (between the <!-- comic --> markers)
 * is regenerated too. Run: npm run build:issue
 */
const fs = require('fs')
const path = require('path')
const K = require('./margot-kit')
const { INK, PAPER, RISO, standing, maisieChair, margot, margotRun, margotHead, paw, smooth, blob, fill, ink } = K

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const f = n => Math.round(n * 10) / 10
const PW = 800
const PH = 1200
const HEAD = 'Fredoka'
const BODY = 'Atkinson Hyperlegible'
let uid = 0

// ------------------------------------------------------------------ lettering
function wrap (s, size, maxW, k = 0.53) {
  const words = String(s).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (t.length * size * k > maxW && line) { lines.push(line); line = w } else line = t
  }
  if (line) lines.push(line)
  return lines
}
const T = (x, y, s, o = {}) => `<text x="${f(x)}" y="${f(y)}" font-family="${o.font || BODY}" font-size="${o.size || 19}" font-weight="${o.weight || 700}" fill="${o.fill || INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.rotate ? ` transform="rotate(${o.rotate} ${f(x)} ${f(y)})"` : ''}>${esc(s)}</text>`

/** Speech bubble: soft white shape, small tail, mixed-case lettering */
function bubble (x, y, w, s, tail, o = {}) {
  const size = o.size || 19
  const lines = wrap(s, size, w - 34)
  const lh = size * 1.25
  const h = lines.length * lh + 26
  const bg = o.fill || '#FFFDF8'
  let g = ''
  if (tail) {
    const [tx, ty] = tail
    const bx = Math.max(x + 30, Math.min(x + w - 30, tx))
    const by = ty > y + h / 2 ? y + h - 6 : y + 6
    g += `<path d="M${f(bx - 12)} ${f(by)} Q${f((bx + tx) / 2 - 2)} ${f((by + ty) / 2)} ${f(tx)} ${f(ty)} Q${f((bx + tx) / 2 + 6)} ${f((by + ty) / 2)} ${f(bx + 12)} ${f(by)} Z" fill="${bg}"/>`
  }
  g = `<rect x="${f(x + 3)}" y="${f(y + 4)}" width="${f(w)}" height="${f(h)}" rx="22" fill="${INK}" fill-opacity=".12"/>` + g
  g += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="22" fill="${bg}"/>`
  lines.forEach((l, i) => { g += T(x + w / 2, y + 16 + size + i * lh - 3, l, { size, anchor: 'middle', fill: o.color || INK }) })
  return g
}
function caption (x, y, w, s, o = {}) {
  const size = o.size || 17
  const lines = wrap(s, size, w - 28)
  const h = lines.length * size * 1.3 + 18
  let g = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="12" fill="${o.fill || RISO.yellow}"/>`
  lines.forEach((l, i) => { g += T(x + 14, y + 10 + size + i * size * 1.3 - 2, l, { size, fill: o.color || INK }) })
  return g
}
/** Sound effect with a riso-style offset shadow */
function sfx (x, y, s, o = {}) {
  const size = o.size || 60
  const r = o.rotate || -6
  return T(x + 4, y + 4, s, { font: HEAD, size, anchor: 'middle', rotate: r, fill: INK, weight: 700 }).replace('<text', '<text fill-opacity=".85"') +
    T(x, y, s, { font: HEAD, size, anchor: 'middle', rotate: r, fill: o.fill || RISO.pink, weight: 700 })
}

/** Panel: rounded, clipped. Art gets the hand-cut wobble; lettering stays crisp. */
function panel (x, y, w, h, art, letters = '', bg = RISO.sky) {
  const id = `pn${++uid}`
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/></clipPath>` +
    `<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/><g filter="url(#rough)">${art}</g>${letters}</g>`
}

// ------------------------------------------------------------------ scenery
const BRICK = '#D9785A'
const BRICK_OLD = '#A85E4E'
function sky (x, y, w, h, c = '#BFE3F5') { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>` }
function cloud (x, y, s = 1) { return fill(smooth([[x - 50 * s, y], [x - 40 * s, y - 20 * s], [x - 12 * s, y - 26 * s], [x + 8 * s, y - 40 * s], [x + 36 * s, y - 28 * s], [x + 56 * s, y - 6 * s], [x + 40 * s, y + 6 * s], [x - 30 * s, y + 8 * s]]), '#FFFDF8') }
function tree (x, y, s = 1, c = RISO.green) {
  return fill(smooth([[x - 7 * s, y], [x - 6 * s, y - 60 * s], [x + 6 * s, y - 60 * s], [x + 8 * s, y]]), '#8A6248') +
    fill(blob(x, y - 92 * s, 48 * s, 44 * s, { wobble: 0.08, seed: x }), c) + fill(blob(x - 16 * s, y - 78 * s, 26 * s, 22 * s, { wobble: 0.1 }), '#47A365')
}
function tarmac (x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#9AA0B2"/>` + ink(`M${x} ${y + 30} H${x + w}`, 3, '#FFFDF8') + ink(`M${x + w * 0.4} ${y + 30} q60 50 0 ${h}`, 3, '#FFFDF8')
}
function school (x, y, w, h) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${BRICK}"/>`
  s += `<rect x="${x - 6}" y="${y - 14}" width="${w + 12}" height="18" rx="6" fill="#6E4A58"/>`
  for (let i = 0; i < Math.floor((w - 20) / 70); i++) s += `<rect x="${x + 20 + i * 70}" y="${y + 26}" width="44" height="50" rx="6" fill="#E9F3F7"/><rect x="${x + 41 + i * 70}" y="${y + 26}" width="2" height="50" fill="#9AAAB8"/>`
  return s
}
/** The old wing: older brick, a sign, and one window left open */
function oldWing (x, y, w, h, o = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${BRICK_OLD}"/>`
  s += fill(`M${x - 10} ${y + 2} L${x + w / 2} ${y - 56} L${x + w + 10} ${y + 2} Z`, '#5D3F4E')
  ;[[x + 24, y + 30], [x + w - 84, y + 30]].forEach(([wx, wy], i) => {
    const open = i === (o.openSide || 1)
    s += `<rect x="${wx}" y="${wy}" width="60" height="64" rx="6" fill="${open ? '#2B2A44' : '#C7D1DB'}"/>`
    if (open && !o.shut) s += fill(`M${wx + 60} ${wy} L${wx + 84} ${wy - 8} L${wx + 84} ${wy + 58} L${wx + 60} ${wy + 64} Z`, '#E9F3F7') // window swung open
    else s += `<rect x="${wx + 29}" y="${wy}" width="2" height="64" fill="#8A97A6"/>`
  })
  if (o.sign !== false) s += `<rect x="${x + w / 2 - 70}" y="${y + h - 52}" width="140" height="36" rx="6" fill="${RISO.yellow}"/>` + T(x + w / 2, y + h - 38, 'OLD WING', { size: 12, anchor: 'middle' }) + T(x + w / 2, y + h - 24, 'Closed for repairs', { size: 11, anchor: 'middle', weight: 400 })
  return s
}
function corridor (x, y, w, h) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#3E4170"/>`
  s += fill(`M${x} ${y + h * 0.66} H${x + w} V${y + h} H${x} Z`, '#5B4E6E')
  s += fill(`M${x + w * 0.1} ${y} L${x + w * 0.3} ${y} L${x + w * 0.52} ${y + h} L${x + w * 0.18} ${y + h} Z`, RISO.yellow, 0.18) // sunbeam
  ;[[0.42, 0.18, RISO.pink, 'CLASS OF 1977'], [0.66, 0.22, RISO.teal, 'SPORTS DAY'], [0.84, 0.16, RISO.lilac, 'BOOK FAIR']].forEach(([px, py, c, t]) => {
    s += `<rect x="${x + w * px}" y="${y + h * py}" width="${w * 0.12}" height="${h * 0.24}" rx="4" fill="${c}" fill-opacity=".75"/>` + T(x + w * px + w * 0.06, y + h * py + 20, t, { size: 10, anchor: 'middle', fill: INK })
  })
  for (let i = 0; i < 26; i++) s += `<circle cx="${f(x + ((i * 97) % w))}" cy="${f(y + ((i * 53) % (h * 0.6)))}" r="1.6" fill="#FFF" fill-opacity=".35"/>`
  return s
}
function ball (x, y, r = 16) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFDF8"/>` + fill(smooth([[x, y - r * 0.4], [x + r * 0.38, y - r * 0.1], [x + r * 0.24, y + r * 0.34], [x - r * 0.24, y + r * 0.34], [x - r * 0.38, y - r * 0.1]]), INK) }

// ------------------------------------------------------------------ pages
const M = 30
const GW = PW - 2 * M

function pageOpener () {
  let s = ''
  s += T(M + 4, 112, "Where's", { font: HEAD, size: 84 }) + T(M + 336, 112, 'Margot?', { font: HEAD, size: 84, fill: RISO.red })
  s += `<g filter="url(#rough)">${margotHead(742, 78, 'smug', 0.8)}</g>`
  s += T(M + 6, 156, 'Issue 1 of 12 · The ball goes through the window', { size: 22, fill: '#5A5E78' })
  // cast line-up
  let cast = `<g transform="translate(0 -96)"><path d="M${M} 520 C200 490 600 500 ${PW - M} 486 L${PW - M} 560 L${M} 560 Z" fill="#E7DCC4"/>`
  const lu = [
    () => standing('hargreaves', { x: 92, y: 520, pose: 'mug', prop: 'mug', expr: 'kind', scale: 0.62 }),
    () => standing('priya', { x: 196, y: 522, pose: 'hold', prop: 'notebook', expr: 'happy', scale: 0.62 }),
    () => standing('stan', { x: 294, y: 522, pose: 'ball', prop: 'ball', expr: 'cheeky', scale: 0.62 }),
    () => margot({ x: 400, y: 524, mood: 'excited', scale: 0.86 }),
    () => standing('kofi', { x: 506, y: 524, pose: 'wave', expr: 'laugh', scale: 0.58 }),
    () => standing('tomasz', { x: 602, y: 524, expr: 'happy', scale: 0.58 }),
    () => maisieChair({ x: 704, y: 524, expr: 'happy', scale: 0.6 })
  ]
  cast += `<g filter="url(#rough)">${lu.map(d => d()).join('')}</g>`
  ;[[92, 'Mrs Hargreaves'], [196, 'Priya'], [294, 'Stan'], [400, 'Margot'], [506, 'Kofi'], [602, 'Tomasz'], [704, 'Maisie']].forEach(([x, n]) => { cast += T(x, 552, n, { font: HEAD, size: 17, weight: 600, anchor: 'middle' }) })
  s += cast + '</g>'
  // rules
  const rules = [
    'This story lasts 12 months, just like the study.',
    'Every newsletter unlocks 4 new pages. Ask your grown-up!',
    'Find Margot\'s paw print hidden on every page.',
    'Keep an eye on Maisie\'s map. You might spot the way out before they do.'
  ]
  s += `<rect x="${M}" y="510" width="${GW}" height="460" rx="28" fill="#FCEBB8"/>`
  s += T(M + 36, 576, 'Rules of the game', { font: HEAD, size: 40 })
  let y = 632
  rules.forEach((r, i) => {
    s += `<circle cx="${M + 58}" cy="${y + 8}" r="22" fill="${[RISO.pink, RISO.teal, RISO.blue, RISO.orange][i]}"/>` + T(M + 58, y + 17, String(i + 1), { font: HEAD, size: 26, anchor: 'middle', fill: '#FFFDF8' })
    const ls = wrap(r, 23, 600, 0.47)
    ls.forEach((l, k) => { s += T(M + 96, y + 16 + k * 30, l, { size: 23, weight: 400 }) })
    y += ls.length > 1 ? 96 : 74
  })
  s += T(PW - M - 10, 1030, 'Turn the page to start →', { font: HEAD, size: 24, weight: 600, anchor: 'end', fill: RISO.red })
  s += `<g filter="url(#rough)">${paw(M + 26, 1022, 1.3, RISO.pink)}</g>` + T(M + 52, 1030, 'Like this one!', { size: 18, weight: 400, fill: '#5A5E78' })
  return s
}

function page1 () {
  let s = ''
  // P1: lunchtime football
  let a = sky(M, M, GW, 420) + cloud(150, 110, 1) + cloud(560, 80, 0.7)
  a += school(M + 20, 150, 380, 200) + oldWing(M + 420, 180, 300, 170, { openSide: 1 })
  a += tarmac(M, 340, GW, 120) + tree(M + 6, 345, 0.9)
  a += maisieChair({ x: 150, y: 430, pose: 'cheer', expr: 'laugh', scale: 0.72 })
  a += standing('priya', { x: 300, y: 432, pose: 'run', legs: 'run', expr: 'happy', scale: 0.72 })
  a += standing('stan', { x: 470, y: 432, pose: 'run', legs: 'kick', expr: 'determined', scale: 0.78 }) + ball(536, 380, 14)
  a += paw(735, 432, 0.7, RISO.pink)
  let l = caption(M + 14, M + 14, 360, 'Brookfield Primary. Monday. 12:31pm. Lunch.')
  l += bubble(M + 386, M + 22, 220, 'Mine! Stan Archer, on the ball!', [480, 196])
  l += bubble(M + 120, 186, 170, 'Pass it, Stan!', [300, 268], { size: 17 })
  s += panel(M, M, GW, 420, a, l, '#BFE3F5')
  // P2: Margot appears
  const y2 = M + 436
  a = tarmac(M, y2, 362, 330) + `<rect x="${M}" y="${y2}" width="362" height="120" fill="#BFE3F5"/>` + margotRun({ x: 220, y: y2 + 290, ball: false, mood: 'excited', scale: 1.1 })
  l = sfx(110, y2 + 110, 'ZOOM!', { size: 50, fill: RISO.orange, rotate: -8 }) + bubble(M + 150, y2 + 20, 196, 'Is that... the school dog?', [200, y2 + 170], { size: 17 })
  s += panel(M, y2, 362, 330, a, l, '#BFE3F5')
  // P3: Margot with the ball
  a = `<rect x="${M + 378}" y="${y2}" width="362" height="330" fill="#FBE3C2"/>` + margotHead(M + 560, y2 + 192, 'smug', 2) + ball(M + 560, y2 + 246, 28)
  l = bubble(M + 394, y2 + 16, 200, 'Margot! Drop it!', [M + 480, y2 + 120]) + caption(M + 392, y2 + 284, 250, 'Margot did not drop it.', { fill: '#FFFDF8' })
  s += panel(M + 378, y2, 362, 330, a, l, '#FBE3C2')
  // P4: the chase
  const y4 = y2 + 346
  a = sky(M, y4, GW, 90) + tarmac(M, y4 + 90, GW, 300)
  a += margotRun({ x: 380, y: y4 + 256, ball: true, mood: 'smug', scale: 0.85 })
  a += standing('stan', { x: 600, y: y4 + 280, pose: 'reach', legs: 'run', expr: 'surprised', scale: 0.7, flip: true })
  a += maisieChair({ x: 700, y: y4 + 280, pose: 'point', expr: 'surprised', scale: 0.62, flip: true })
  a += standing('kofi', { x: 110, y: y4 + 280, pose: 'down', expr: 'surprised', scale: 0.62 }) + standing('tomasz', { x: 190, y: y4 + 280, pose: 'down', expr: 'happy', look: 1, scale: 0.6 })
  l = bubble(M + 470, y4 + 16, 250, 'Come back with my ball!', [620, y4 + 120]) + sfx(400, y4 + 90, 'WOOF!', { size: 52, fill: RISO.yellow })
  l += caption(M + 14, y4 + 16, 210, 'Meanwhile, two Year 5s...', { fill: '#FFFDF8', size: 15 })
  s += panel(M, y4, GW, 296, a, l, '#BFE3F5')
  return s
}

function page2 () {
  let s = ''
  // P1: Margot drops the ball at Kofi's feet
  let a = sky(M, M, GW, 110) + tarmac(M, M + 110, GW, 230)
  a += standing('kofi', { x: 300, y: M + 320, pose: 'down', expr: 'happy', look: 1, scale: 0.86 })
  a += standing('tomasz', { x: 420, y: M + 320, pose: 'down', expr: 'worried', look: -1, scale: 0.84 })
  a += margot({ x: 560, y: M + 322, mood: 'excited', scale: 0.95, flip: true }) + ball(370, M + 306, 15)
  a += paw(70, M + 300, 0.7, RISO.pink)
  let l = bubble(M + 20, M + 20, 250, 'Oh, hello! You want me to kick it?', [282, M + 120])
  l += bubble(M + 430, M + 24, 260, 'Kofi... that\'s Stan\'s ball. Year 6 Stan.', [420, M + 130])
  s += panel(M, M, GW, 340, a, l, '#BFE3F5')
  // P2: the kick
  const y2 = M + 356
  a = `<rect x="${M}" y="${y2}" width="362" height="370" fill="#D6E2FA"/>`
  for (let i = 0; i < 12; i++) a += ink(`M${M + 180} ${y2 + 200} L${f(M + 180 + Math.cos(i / 12 * 6.28) * 300)} ${f(y2 + 200 + Math.sin(i / 12 * 6.28) * 300)}`, 10, '#FFFDF8')
  a += standing('kofi', { x: M + 170, y: y2 + 360, pose: 'run', legs: 'kick', expr: 'laugh', scale: 1.05 }) + ball(M + 262, y2 + 250, 20)
  l = sfx(M + 250, y2 + 330, 'THWACK!', { size: 52, fill: RISO.pink, rotate: -10 }) + bubble(M + 16, y2 + 16, 230, 'Watch this. Pure skill.', [M + 150, y2 + 120])
  s += panel(M, y2, 362, 370, a, l, '#D6E2FA')
  // P3: the ball flies
  a = sky(M + 378, y2, 362, 370, '#BFE3F5') + cloud(M + 470, y2 + 90, 0.8) + ink(`M${M + 400} ${y2 + 340} Q${M + 560} ${y2 + 30} ${M + 700} ${y2 + 210}`, 4, '#FFFDF8') + ball(M + 646, y2 + 120, 18)
  a += oldWing(M + 560, y2 + 250, 220, 140, { openSide: 0, sign: false })
  l = bubble(M + 394, y2 + 220, 170, 'Not pure... aim.', [M + 430, y2 + 330], { size: 18 }) + caption(M + 394, y2 + 16, 150, 'Up...', { fill: '#FFFDF8' }) + caption(M + 560, y2 + 170, 160, 'and up...', { fill: '#FFFDF8' })
  s += panel(M + 378, y2, 362, 370, a, l, '#BFE3F5')
  // P4: through the window, Margot after it
  const y4 = y2 + 386
  a = sky(M, y4, GW, 100) + oldWing(M + 140, y4 + 110, 520, 220, { openSide: 1, sign: false }) + tarmac(M, y4 + 300, GW, 30)
  a += margotRun({ x: 430, y: y4 + 250, mood: 'excited', scale: 0.8, rotate: -16, flip: true }) + ball(M + 590, y4 + 168, 11)
  a += paw(720, y4 + 300, 0.7, RISO.yellow)
  l = sfx(560, y4 + 84, 'WHOOSH!', { size: 56, fill: RISO.yellow, rotate: -4 }) + sfx(160, y4 + 270, 'WOOF!', { size: 44, fill: RISO.pink })
  l += caption(M + 14, y4 + 14, 280, '...and straight through the old wing\'s open window.', { size: 16 })
  s += panel(M, y4, GW, 324, a, l, '#BFE3F5')
  return s
}

function page3 () {
  let s = ''
  // P1: the Year 6s arrive
  let a = sky(M, M, GW, 90) + tarmac(M, M + 90, GW, 260)
  a += standing('stan', { x: 200, y: M + 336, pose: 'hips', expr: 'determined', scale: 0.86 })
  a += standing('priya', { x: 90, y: M + 336, pose: 'down', expr: 'thinking', look: 1, scale: 0.8 })
  a += maisieChair({ x: 320, y: M + 336, expr: 'surprised', look: 1, scale: 0.74 })
  a += standing('kofi', { x: 560, y: M + 336, pose: 'shrug', expr: 'cheeky', look: -1, scale: 0.8 })
  a += standing('tomasz', { x: 670, y: M + 336, pose: 'down', expr: 'worried', look: -1, scale: 0.78 })
  let l = bubble(M + 120, M + 16, 300, 'You kicked MY ball into the OLD WING?', [220, M + 110])
  l += bubble(M + 450, M + 40, 250, 'Technically, the dog started it.', [560, M + 130])
  s += panel(M, M, GW, 350, a, l, '#BFE3F5')
  // P2: +1000 aura
  const y2 = M + 366
  a = `<rect x="${M}" y="${y2}" width="362" height="330" fill="#D6E2FA"/>` + `<g transform="translate(${M + 120} ${y2 + 210}) scale(1.6)">${K.head('kofi', 0, 0, 'laugh', 0)}</g>` + `<g transform="translate(${M + 290} ${y2 + 256}) scale(1.2)">${K.head('priya', 0, 0, 'thinking', -1)}</g>`
  l = bubble(M + 14, y2 + 16, 220, 'But that kick? +1000 aura.', [M + 110, y2 + 120]) + bubble(M + 160, y2 + 112, 190, 'Minus 1000 for where it went.', [M + 270, y2 + 186], { size: 17 })
  s += panel(M, y2, 362, 330, a, l, '#D6E2FA')
  // P3: Margot isn't coming back
  a = `<rect x="${M + 378}" y="${y2}" width="362" height="330" fill="#FFD9CF"/>` + oldWing(M + 470, y2 + 70, 300, 260, { openSide: 0, sign: false })
  a += maisieChair({ x: M + 460, y: y2 + 326, expr: 'worried', look: 1, scale: 0.64 }) + standing('tomasz', { x: M + 640, y: y2 + 326, expr: 'worried', look: -1, scale: 0.6 })
  a += paw(M + 712, y2 + 300, 0.7, RISO.yellow)
  l = bubble(M + 394, y2 + 16, 230, 'Guys... Margot\'s not coming back out.', [M + 450, y2 + 160], { size: 17 }) + bubble(M + 566, y2 + 100, 160, 'What if she\'s stuck?', [M + 650, y2 + 186], { size: 16 })
  s += panel(M + 378, y2, 362, 330, a, l, '#FFD9CF')
  // P4: Stan's plan
  const y4 = y2 + 346
  a = sky(M, y4, GW, 90) + tarmac(M, y4 + 90, GW, 300)
  a += standing('stan', { x: 200, y: y4 + 340, pose: 'point', expr: 'determined', scale: 0.86 })
  a += standing('priya', { x: 90, y: y4 + 340, pose: 'hold', prop: 'notebook', expr: 'happy', look: 1, scale: 0.76 })
  a += standing('kofi', { x: 520, y: y4 + 340, pose: 'cheer', expr: 'surprised', look: -1, scale: 0.76 }) + standing('tomasz', { x: 640, y: y4 + 340, expr: 'surprised', look: -1, scale: 0.74 })
  l = bubble(M + 14, y4 + 16, 360, 'Right. We go in, we find Margot, we get the ball, we get out. Five minutes.', [200, y4 + 140], { size: 17 })
  l += bubble(M + 390, y4 + 20, 220, 'And you two are coming with us.', [300, y4 + 130], { size: 17 }) + bubble(M + 560, y4 + 120, 150, 'Wait... us?', [560, y4 + 190], { size: 17 })
  s += panel(M, y4, GW, 380, a, l, '#BFE3F5')
  return s
}

function page4 () {
  let s = ''
  // P1: getting in
  let a = sky(M, M, GW, 300) + oldWing(M + 60, M + 70, 620, 200, { openSide: 0 }) + tarmac(M, M + 270, GW, 40)
  a += standing('stan', { x: 200, y: M + 296, pose: 'cheer', legs: 'jump', expr: 'determined', scale: 0.62 })
  a += standing('priya', { x: 120, y: M + 296, pose: 'down', expr: 'thinking', scale: 0.6 })
  a += maisieChair({ x: 640, y: M + 296, pose: 'point', expr: 'happy', look: -1, scale: 0.58, flip: true })
  l = caption(M + 14, M + 14, 300, 'The open window was on the ground floor.')
  l += bubble(M + 420, M + 30, 280, 'There\'s a side door with a ramp. It\'s unlocked!', [650, M + 108], { size: 17 })
  s += panel(M, M, GW, 300, a, l, '#BFE3F5')
  // P2: inside
  const y2 = M + 316
  a = corridor(M, y2, GW, 330)
  a += standing('priya', { x: 150, y: y2 + 320, expr: 'thinking', look: 1, scale: 0.72 }) + standing('stan', { x: 250, y: y2 + 320, expr: 'worried', scale: 0.74 })
  a += maisieChair({ x: 380, y: y2 + 320, expr: 'surprised', scale: 0.66 }) + standing('kofi', { x: 500, y: y2 + 320, expr: 'happy', look: 1, scale: 0.68 }) + standing('tomasz', { x: 590, y: y2 + 320, expr: 'thinking', scale: 0.66 })
  a += paw(735, y2 + 40, 0.6, RISO.yellow)
  l = bubble(M + 14, y2 + 16, 200, 'Margot? Here, girl!', [150, y2 + 100], { size: 17 }) + bubble(M + 470, y2 + 20, 240, 'It smells like old crayons in here.', [500, y2 + 110], { size: 17 })
  s += panel(M, y2, GW, 330, a, l, '#3E4170')
  // P3: paw prints in the dust
  const y3 = y2 + 346
  a = `<rect x="${M}" y="${y3}" width="362" height="300" fill="#5B4E6E"/>`
  for (let i = 0; i < 5; i++) a += paw(M + 150 + i * 42, y3 + 262 - i * 34, 1.2, '#8E7FA3')
  a += `<g transform="translate(${M + 74} ${y3 + 262}) scale(0.7)">${K.head('maisie', 0, 0, 'surprised', 1)}</g>`
  l = bubble(M + 120, y3 + 16, 220, 'Paw prints! This way.', [M + 90, y3 + 196])
  s += panel(M, y3, 362, 300, a, l, '#5B4E6E')
  // P4: SLAM!
  a = `<rect x="${M + 378}" y="${y3}" width="362" height="300" fill="#2B2A44"/>`
  a += `<rect x="${M + 470}" y="${y3 + 50}" width="180" height="190" rx="10" fill="#C7D1DB"/><rect x="${M + 557}" y="${y3 + 50}" width="6" height="190" fill="#8A97A6"/>`
  for (let i = 0; i < 8; i++) a += ink(`M${M + 560} ${y3 + 145} L${f(M + 560 + Math.cos(i / 8 * 6.28) * 200)} ${f(y3 + 145 + Math.sin(i / 8 * 6.28) * 200)}`, 4, RISO.yellow)
  l = sfx(M + 560, y3 + 170, 'SLAM!', { size: 80, fill: RISO.red, rotate: -6 })
  s += panel(M + 378, y3, 362, 300, a, l, '#2B2A44')
  // P5: cliffhanger
  const y5 = y3 + 316
  a = `<rect x="${M}" y="${y5}" width="${GW}" height="${PH - M - y5}" fill="#1F2440"/>`
  ;[[150, 'kofi', 'surprised'], [260, 'priya', 'surprised'], [370, 'stan', 'worried'], [480, 'tomasz', 'surprised'], [590, 'maisie', 'surprised']].forEach(([x, who, e]) => { a += `<g transform="translate(${x} ${y5 + 120}) scale(0.62)">${K.head(who, 0, 0, e, 0)}</g>` })
  l = bubble(M + 20, y5 + 10, 400, '...Please tell me someone left that open on purpose?', [150, y5 + 70], { size: 16 })
  l += caption(PW - M - 250, y5 + 14, 236, 'To be continued in next month\'s newsletter!', { fill: RISO.pink, size: 15 })
  s += panel(M, y5, GW, PH - M - y5, a, l, '#1F2440')
  return s
}

const pages = [
  { id: 'opener', title: 'Rules of the game', draw: pageOpener, text: [
    'Where\'s Margot? Issue 1 of 12: The ball goes through the window.',
    'Meet the cast: Mrs Hargreaves, the deputy head, with her cup of tea. Priya, with her languages notebook. Stan, with his football. Margot, the school dog. Kofi, waving. Tomasz. And Maisie, in her wheelchair.',
    'Rules of the game. 1: This story lasts 12 months, just like the study. 2: Every newsletter unlocks 4 new pages. Ask your grown-up! 3: Find Margot\'s paw print hidden on every page. 4: Keep an eye on Maisie\'s map. You might spot the way out before they do.'
  ] },
  { id: 'page-1', title: 'Page 1', draw: page1, text: [
    'Brookfield Primary. Monday. 12:31pm. Lunch. Stan, Priya and Maisie are playing football. Stan: "Mine! Stan Archer, on the ball!" Maisie: "Pass it, Stan!" Behind them is the old wing, closed for repairs, with one window open.',
    'Something zooms across the playground. Priya: "Is that... the school dog?"',
    'Margot, looking very pleased with herself, has the ball. Maisie: "Margot! Drop it!" Margot did not drop it.',
    'Margot runs off with the ball. WOOF! Stan chases her: "Come back with my ball!" Meanwhile, two Year 5s, Kofi and Tomasz, watch her run straight towards them.'
  ] },
  { id: 'page-2', title: 'Page 2', draw: page2, text: [
    'Margot drops the ball at Kofi\'s feet. Kofi: "Oh, hello! You want me to kick it?" Tomasz: "Kofi... that\'s Stan\'s ball. Year 6 Stan."',
    'Kofi kicks it. THWACK! Kofi: "Watch this. Pure skill."',
    'The ball flies up... and up... Tomasz: "Not pure... aim."',
    '...and straight through the old wing\'s open window. WHOOSH! Margot leaps in after it. WOOF!'
  ] },
  { id: 'page-3', title: 'Page 3', draw: page3, text: [
    'The Year 6s arrive. Stan, hands on hips: "You kicked MY ball into the OLD WING?" Kofi shrugs: "Technically, the dog started it."',
    'Kofi grins: "But that kick? +1000 aura." Priya: "Minus 1000 for where it went."',
    'Maisie looks at the old wing: "Guys... Margot\'s not coming back out." Tomasz: "What if she\'s stuck?"',
    'Stan points at the old wing: "Right. We go in, we find Margot, we get the ball, we get out. Five minutes. And you two are coming with us." Kofi: "Wait... us?"'
  ] },
  { id: 'page-4', title: 'Page 4', draw: page4, text: [
    'The open window was on the ground floor. Stan climbs in. Maisie: "There\'s a side door with a ramp. It\'s unlocked!"',
    'Inside the old wing: a dusty corridor with old posters ("Class of 1977"). Priya: "Margot? Here, girl!" Kofi: "It smells like old crayons in here."',
    'Paw prints in the dust lead into the dark. Maisie: "Paw prints! This way."',
    'Behind them, the window slams shut. SLAM!',
    'Five shocked faces. Kofi: "...Please tell me someone left that open on purpose?" To be continued in next month\'s newsletter!'
  ] }
]

function renderPage (pg, i) {
  uid = i * 100
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" width="${PW}" height="${PH}"><defs>${K.filters()}</defs>` +
    `<rect width="${PW}" height="${PH}" fill="${PAPER}"/>${pg.draw()}` +
    T(PW - M, PH - 10, `Where's Margot? · Issue 1 · ${pg.title}`, { size: 11, weight: 400, anchor: 'end', fill: '#8A8DA3' }) +
    `<rect width="${PW}" height="${PH}" filter="url(#grain)" style="mix-blend-mode:multiply"/></svg>`
}

const FONTS = [['Fredoka', 'fredoka-latin-600-normal', 600], ['Fredoka', 'fredoka-latin-700-normal', 700], ['Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-400-normal', 400], ['Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-700-normal', 700]]
const faces = base => FONTS.map(([n, file, w]) => `@font-face{font-family:'${n}';font-weight:${w};src:url(${base(file)}) format('woff2')}`).join('')

function readerHtml () {
  const pagesHtml = pages.map((pg, i) => `
            <section class="smart-comic__page${i === 0 ? '' : ' smart-hide'}" data-comic-page="${i}" aria-label="${esc(pg.title)}">
              <img class="smart-comic__img" src="assets/comic/issue-1/${String(i).padStart(2, '0')}-${pg.id}.png?v=1" width="${PW * 2}" height="${PH * 2}" alt="Where's Margot? Issue 1, ${esc(pg.title)}. The text version is below.">
              <details class="govuk-details smart-comic__text">
                <summary class="govuk-details__summary"><span class="govuk-details__summary-text">Read this page as text</span></summary>
                <div class="govuk-details__text">${pg.text.map(t => `<p class="govuk-body">${esc(t)}</p>`).join('')}</div>
              </details>
            </section>`).join('')
  return `<!-- comic:start (generated by tools/build-issue-1.js) -->
          <div class="smart-comic" data-comic tabindex="-1">
            <div class="smart-comic__bar">
              <button type="button" class="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" data-comic-prev disabled><svg class="smart-icon smart-icon--flip" aria-hidden="true"><use href="#i-arrow-right"></use></svg><span>Previous</span></button>
              <p class="smart-comic__count" aria-live="polite" data-comic-count>Rules of the game</p>
              <button type="button" class="govuk-button govuk-!-margin-bottom-0" data-comic-next><span>Next page</span><svg class="smart-icon" aria-hidden="true"><use href="#i-arrow-right"></use></svg></button>
            </div>
            <div class="smart-comic__dots" aria-hidden="true">${pages.map((p, i) => `<span${i === 0 ? ' class="is-on"' : ''}></span>`).join('')}</div>${pagesHtml}
          </div>
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
              root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1) })
            })()
          </script>
          <!-- comic:end -->`
}

;(async () => {
  for (const d of ['assets/comic/issue-1', 'exports/figma']) fs.mkdirSync(out(d), { recursive: true })
  const svgs = pages.map((pg, i) => renderPage(pg, i))
  svgs.forEach((svg, i) => fs.writeFileSync(out(`assets/comic/issue-1/${String(i).padStart(2, '0')}-${pages[i].id}.svg`), svg.replace('<defs>', `<style>${faces(f => `../../fonts/${f}.woff2`)}</style><defs>`) + '\n'))
  // Figma board
  const gap = 80
  const BW = pages.length * PW + (pages.length + 1) * gap
  let board = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BW} ${PH + 2 * gap + 60}" width="${BW}" height="${PH + 2 * gap + 60}"><rect width="100%" height="100%" fill="#EDEBE4"/>` + T(gap, gap, "Where's Margot? · Issue 1", { font: HEAD, size: 44 })
  svgs.forEach((svg, i) => { board += `<g transform="translate(${gap + i * (PW + gap)} ${gap + 50})">${svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/id="(pn\d+|rough|grain|k\d+|e\d+)"/g, `id="b${i}$1"`).replace(/url\(#(pn\d+|rough|grain|k\d+|e\d+)\)/g, `url(#b${i}$1)`)}</g>` })
  fs.writeFileSync(out('exports/figma/wheres-margot-issue-1.svg'), board + '</svg>\n')
  // PNGs
  let chromium
  try { chromium = require('playwright').chromium } catch (e) { chromium = require(path.join(process.env.PW || '', 'index.js')).chromium }
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: PW, height: PH }, deviceScaleFactor: 2 })
  const ff = faces(f => `data:font/woff2;base64,${fs.readFileSync(out(`assets/fonts/${f}.woff2`)).toString('base64')}`)
  for (const [i, svg] of svgs.entries()) {
    await page.setContent(`<html><head><style>${ff} body{margin:0}</style></head><body>${svg}</body></html>`)
    await page.evaluate(() => document.fonts.ready)
    await (await page.$('svg')).screenshot({ path: out(`assets/comic/issue-1/${String(i).padStart(2, '0')}-${pages[i].id}.png`) })
  }
  await browser.close()
  // newsletter page
  const nl = out('newsletter.html')
  let html = fs.readFileSync(nl, 'utf8')
  if (html.includes('<!-- comic:start')) html = html.replace(/<!-- comic:start[\s\S]*?<!-- comic:end -->/, readerHtml())
  fs.writeFileSync(nl, html)
  console.log(`${pages.length} pages written`)
})().catch(e => { console.error(e); process.exit(1) })
