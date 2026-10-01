/*
 * "Where's Margot?" character sheet.
 *
 *   assets/comic/character-sheet.svg              for the site (fonts linked)
 *   exports/figma/wheres-margot-character-sheet.svg   to drop into Figma
 *   exports/comic/wheres-margot-character-sheet.png   2x image, to share
 *
 * Run: npm run build:sheet
 */
const fs = require('fs')
const path = require('path')
const K = require('./margot-kit')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const INK = K.LINE

const W = 2400
const H = 1660
const CW = 560
const CH = 660
const GAP = 26
const X0 = 40
const Y0 = 236

function wrap (s, size, maxW) {
  const words = String(s).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (t.length * size * 0.5 > maxW && line) { lines.push(line); line = w } else line = t
  }
  if (line) lines.push(line)
  return lines
}
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || 'Comic Neue'}" font-size="${o.size || 20}" font-weight="${o.weight || 700}" fill="${o.fill || INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 8}" stroke-linejoin="round" paint-order="stroke"` : ''}>${esc(s)}</text>`

const cards = [
  {
    key: 'margot', name: 'MARGOT', role: 'The school dog (golden cockapoo)', accent: '#D9343F',
    into: 'Footballs, crisps, chaos',
    about: 'Brookfield\'s reading dog. Looks innocent. Is not. Starts the whole adventure, then goes missing in the old wing.',
    figure: (x, y) => K.margot({ x: x - 4, y: y - 10, mood: 'smug', scale: 1.38 }),
    faces: [['smug', 'Smug'], ['excited', 'Excited'], ['guilty', 'Guilty']]
  },
  {
    key: 'stan', name: 'STAN', role: 'Year 6 · football captain', accent: '#E0A21F',
    into: 'Football (the ball is his)',
    about: 'Confident and a bit bossy. Secretly scared of the dark. Learns to share the lead.',
    figure: (x, y) => K.standing('stan', { x, y, pose: 'ball', prop: 'ball', expr: 'cheeky', scale: 1.1 }),
    faces: [['cheeky', 'Cheeky'], ['determined', 'In charge'], ['worried', 'In the dark']]
  },
  {
    key: 'maisie', name: 'MAISIE', role: 'Year 6 · future doctor', accent: '#2FA36B',
    into: 'Medicine, bones, speed',
    about: 'Calm in a crisis. Knows every bone in the body. Fastest wheels in the school.',
    figure: (x, y) => K.maisieChair({ x, y, expr: 'laugh', scale: 1.1 }),
    faces: [['happy', 'Calm'], ['laugh', 'Winning'], ['surprised', 'Spooked']]
  },
  {
    key: 'priya', name: 'PRIYA', role: 'Year 6 · speaks 6 languages', accent: '#D9343F',
    into: 'English, Gujarati, Hindi, French, Spanish and BSL',
    about: 'The planner. Dry humour. Her sign language lets the group talk silently.',
    figure: (x, y) => K.standing('priya', { x, y, pose: 'book', prop: 'notebook', expr: 'happy', look: 1, scale: 1.1 }),
    faces: [['cheeky', 'Unimpressed'], ['happy', 'Got it'], ['surprised', 'Whoa']]
  },
  {
    key: 'kofi', name: 'KOFI', role: 'Year 5 · class joker', accent: '#3E7BD8',
    into: 'Football, jokes, memes',
    about: 'Loud, funny, brave without thinking. Kicked the ball through the window. Wants Stan\'s respect.',
    figure: (x, y) => K.standing('kofi', { x, y, pose: 'wave', expr: 'laugh', scale: 1.04 }),
    faces: [['laugh', '+1000 aura'], ['cheeky', 'Up to something'], ['surprised', 'Uh-oh']]
  },
  {
    key: 'tomasz', name: 'TOMASZ', role: 'Year 5 · the artist', accent: '#8A5A36',
    into: 'Drawing everything',
    about: 'Quiet and observant. Redraws the 1977 map and keeps it up to date.',
    figure: (x, y) => K.standing('tomasz', { x, y, pose: 'book', prop: 'sketchbook', expr: 'happy', look: -1, scale: 1.04 }),
    faces: [['happy', 'Drawing'], ['determined', 'Found it'], ['worried', 'Not again']]
  },
  {
    key: 'hargreaves', name: 'MRS HARGREAVES', role: 'Deputy head', accent: '#8C3F5C',
    into: 'Rules. Order. Secretly, the 1970s.',
    about: 'The strictest teacher in Brookfield. The children hide from her all year. Twist: she buried the time capsule.',
    figure: (x, y) => K.standing('hargreaves', { x, y, pose: 'hips', expr: 'determined', scale: 1.12 }),
    faces: [['determined', 'Hmm'], ['surprised', 'WHAT?'], ['happy', 'Soft side']]
  }
]

function card (c, i) {
  const col = i % 4
  const row = Math.floor(i / 4)
  const x = X0 + col * (CW + GAP)
  const y = Y0 + row * (CH + GAP)
  let s = `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="22" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>`
  s += `<rect x="${x}" y="${y}" width="${CW}" height="12" rx="6" fill="${c.accent}"/>`
  s += `<rect x="${x + 16}" y="${y + 28}" width="240" height="390" rx="16" fill="#F4EFE4"/>`
  s += c.figure(x + 136, y + 400)
  // text column
  const tx = x + 276
  s += T(tx, y + 70, c.name, { font: 'Bangers', size: c.name.length > 10 ? 34 : 44, fill: c.accent, ls: 1.5 })
  s += T(tx, y + 100, c.role, { size: 17, weight: 700 })
  s += T(tx, y + 140, 'INTO', { size: 13, fill: '#7A7A88', ls: 1.5 })
  let ty = y + 162
  wrap(c.into, 17, 250).forEach(l => { s += T(tx, ty, l, { size: 17, weight: 400 }); ty += 22 })
  ty += 16
  s += T(tx, ty, 'PERSONALITY', { size: 13, fill: '#7A7A88', ls: 1.5 })
  ty += 22
  wrap(c.about, 17, 250).forEach(l => { s += T(tx, ty, l, { size: 17, weight: 400 }); ty += 22 })
  // expressions
  s += `<line x1="${x + 20}" y1="${y + 444}" x2="${x + CW - 20}" y2="${y + 444}" stroke="#E2DDD2" stroke-width="2"/>`
  s += T(x + 24, y + 472, 'EXPRESSIONS', { size: 13, fill: '#7A7A88', ls: 1.5 })
  c.faces.forEach(([expr, label], k) => {
    const fx = x + 100 + k * 180
    const fy = y + 548
    s += c.key === 'margot'
      ? K.margotHead(fx, fy - 4, expr, 1.05)
      : `<g transform="translate(${fx} ${fy}) scale(0.76)">${K.head(c.key, 0, 0, expr, k === 1 ? 1 : 0)}</g>`
    s += T(fx, y + 646, label, { size: 16, anchor: 'middle' })
  })
  return s
}

function styleCard () {
  const x = X0 + 3 * (CW + GAP)
  const y = Y0 + CH + GAP
  let s = `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="22" fill="#26386B" stroke="${INK}" stroke-width="3"/>`
  s += T(x + 30, y + 64, 'STYLE NOTES', { font: 'Bangers', size: 40, fill: '#F2C230', ls: 1.5 })
  const notes = [
    'Clean, even outlines (after Tintin\'s "ligne claire").',
    'Flat colour with one soft shadow tone. No gradients.',
    'Dot eyes and small noses for the children; big, droopy-lidded eyes for Margot (after Garfield).',
    'Same Brookfield uniform for everyone. Props tell them apart: ball, stethoscope, notebook, sketchbook.',
    'Year 6 drawn slightly taller than Year 5.'
  ]
  let ty = y + 108
  notes.forEach(n => {
    s += `<circle cx="${x + 38}" cy="${ty - 6}" r="5" fill="#F2C230"/>`
    wrap(n, 17, 470).forEach(l => { s += T(x + 54, ty, l, { size: 17, weight: 400, fill: '#FFFFFF' }); ty += 22 })
    ty += 10
  })
  ty += 6
  s += T(x + 30, ty, 'PALETTE', { size: 13, fill: '#C9D3EA', ls: 1.5 })
  const sw = [['#26386B', 'Jumper'], ['#FFFFFF', 'Polo'], ['#6E7480', 'Trousers'], ['#F2C230', 'Badge'], ['#E2AE62', 'Margot'], ['#D9343F', 'Bandana'], ['#1D8E86', 'Chair']]
  sw.forEach(([c, l], k) => {
    const sx = x + 30 + k * 72
    s += `<rect x="${sx}" y="${ty + 14}" width="56" height="44" rx="10" fill="${c}" stroke="#FFFFFF" stroke-width="2"/>`
    s += T(sx + 28, ty + 80, l, { size: 13, fill: '#FFFFFF', anchor: 'middle', weight: 400 })
  })
  return s
}

function sheet () {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`
  s += `<rect width="${W}" height="${H}" fill="#FBF7EE"/>`
  // header
  s += `<rect x="${X0}" y="40" width="${W - 2 * X0}" height="170" rx="26" fill="#8FD3FF" stroke="${INK}" stroke-width="3"/>`
  s += T(X0 + 50, 160, "WHERE'S MARGOT?", { font: 'Bangers', size: 112, fill: '#F2C230', stroke: INK, sw: 12, ls: 3 })
  s += K.margotHead(X0 + 860, 128, 'smug', 1.25)
  s += T(X0 + 960, 112, 'Character sheet · draft 2', { size: 34 })
  s += T(X0 + 960, 152, 'A 12-issue comic for the SMART Study newsletter · 4 pages per issue', { size: 22, weight: 400 })
  s += T(X0 + 960, 186, 'Style: clean line (after Tintin), expressive eyes for Margot (after Garfield)', { size: 22, weight: 400 })
  cards.forEach((c, i) => { s += card(c, i) })
  s += styleCard()
  return s + '</svg>'
}

const FONTS = [['Bangers', 'bangers-latin-400-normal', 400], ['Comic Neue', 'comic-neue-latin-700-normal', 700], ['Comic Neue', 'comic-neue-latin-400-normal', 400]]
const faces = base => FONTS.map(([n, file, w]) => `@font-face{font-family:'${n}';font-weight:${w};src:url(${base(file)}) format('woff2')}`).join('')

;(async () => {
  const svg = sheet()
  fs.mkdirSync(out('exports/figma'), { recursive: true })
  fs.mkdirSync(out('exports/comic'), { recursive: true })
  fs.writeFileSync(out('exports/figma/wheres-margot-character-sheet.svg'), svg + '\n')
  fs.writeFileSync(out('assets/comic/character-sheet.svg'), svg.replace('<rect', `<style>${faces(f => `../fonts/${f}.woff2`)}</style><rect`) + '\n')
  let chromium
  try { chromium = require('playwright').chromium } catch (e) { chromium = require(path.join(process.env.PW || '', 'index.js')).chromium }
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 })
  await page.setContent(`<html><head><style>${faces(f => `data:font/woff2;base64,${fs.readFileSync(out(`assets/fonts/${f}.woff2`)).toString('base64')}`)} body{margin:0}</style></head><body>${svg}</body></html>`)
  await page.evaluate(() => document.fonts.ready)
  await (await page.$('svg')).screenshot({ path: out('exports/comic/wheres-margot-character-sheet.png') })
  fs.copyFileSync(out('exports/comic/wheres-margot-character-sheet.png'), out('assets/comic/character-sheet.png'))
  await browser.close()
  console.log('Character sheet written')
})().catch(e => { console.error(e); process.exit(1) })
