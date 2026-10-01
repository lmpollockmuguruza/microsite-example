/*
 * "Where's Margot?" character sheet (draft 3).
 *
 *   assets/comic/character-sheet.png                  the site
 *   assets/comic/character-sheet.svg                  fonts linked, opens in a browser
 *   exports/figma/wheres-margot-character-sheet.svg   to drop into Figma
 *   exports/comic/wheres-margot-character-sheet.png   to share
 *
 * Run: npm run build:sheet
 */
const fs = require('fs')
const path = require('path')
const K = require('./margot-kit')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const { INK, PAPER, RISO } = K

const W = 2400
const H = 1600
const HEAD = 'Fredoka'
const BODY = 'Atkinson Hyperlegible'

function wrap (s, size, maxW) {
  const words = String(s).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? line + ' ' + w : w
    if (t.length * size * 0.52 > maxW && line) { lines.push(line); line = w } else line = t
  }
  if (line) lines.push(line)
  return lines
}
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || BODY}" font-size="${o.size || 20}" font-weight="${o.weight || 400}" fill="${o.fill || INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}>${esc(s)}</text>`
function chip (x, y, s, bg) {
  const w = s.length * 9.6 + 26
  return { svg: `<rect x="${x}" y="${y}" width="${w}" height="30" rx="15" fill="${bg}"/>` + T(x + 13, y + 21, s, { size: 16, weight: 700 }), w }
}

const cast = [
  { key: 'margot', name: 'Margot', tint: '#FBE3C2', chips: [['School dog', RISO.yellow], ['Cockapoo', '#FFFFFF']], about: 'Brookfield\'s reading dog. Looks innocent. Is not. Starts the whole adventure.', faces: [['smug', 'Smug'], ['excited', 'Ball!'], ['guilty', 'Who, me?']] },
  { key: 'stan', name: 'Stan', tint: '#FCEBB8', chips: [['Year 6', '#FFFFFF'], ['Football captain', RISO.yellow]], about: 'Confident, a bit bossy, secretly scared of the dark. Learns to share the lead.', faces: [['cheeky', 'Cheeky'], ['determined', 'In charge'], ['worried', 'In the dark']] },
  { key: 'maisie', name: 'Maisie', tint: '#FFD9CF', chips: [['Year 6', '#FFFFFF'], ['Artist', RISO.pink]], about: 'Draws everything, everywhere. Fastest wheels in school. She redraws the old map.', faces: [['happy', 'Sketching'], ['laugh', 'Winning'], ['surprised', 'Whoa']] },
  { key: 'priya', name: 'Priya', tint: '#E3DAF7', chips: [['Year 6', '#FFFFFF'], ['6 languages', RISO.lilac]], about: 'English, Gujarati, Hindi, French, Spanish and BSL. The planner, with a dry sense of humour.', faces: [['thinking', 'Planning'], ['happy', 'Got it'], ['surprised', 'Wait...']] },
  { key: 'kofi', name: 'Kofi', tint: '#D6E2FA', chips: [['Year 5', '#FFFFFF'], ['Football', RISO.sky]], about: 'The class joker. Brave without thinking. Kicked the ball through the window.', faces: [['laugh', '+1000 aura'], ['cheeky', 'Up to something'], ['surprised', 'Uh-oh']] },
  { key: 'tomasz', name: 'Tomasz', tint: '#CFEFE6', chips: [['Year 5', '#FFFFFF'], ['Future doctor', '#A8E2CF']], about: 'Quiet and careful. Knows every bone in the body. Always has plasters.', faces: [['happy', 'Calm'], ['determined', 'On it'], ['worried', 'Hmm...']] },
  { key: 'hargreaves', name: 'Mrs Hargreaves', tint: '#EDE4F7', chips: [['Deputy head', '#FFFFFF'], ['Strict, but kind', RISO.lilac]], about: 'Firm on rules, soft on children. Her secret: the 1977 time capsule.', faces: [['thinking', 'Hmm?'], ['kind', 'Proud'], ['surprised', 'Goodness!']] }
]

function lineup () {
  let s = '<g transform="translate(0 -70)">' + `<path d="M40 860 C400 790 800 810 1200 800 C1600 790 2000 812 2360 790 L2360 900 L40 900 Z" fill="#E7DCC4"/>`
  s += `<circle cx="2180" cy="470" r="80" fill="${RISO.yellow}" fill-opacity=".55"/>`
  s += `<g filter="url(#rough)">`
  s += K.standing('hargreaves', { x: 330, y: 840, pose: 'mug', prop: 'mug', expr: 'kind', scale: 1.15 })
  s += K.standing('priya', { x: 620, y: 846, pose: 'hold', prop: 'notebook', expr: 'happy', look: 1, scale: 1.15 })
  s += K.standing('stan', { x: 900, y: 846, pose: 'ball', prop: 'ball', expr: 'cheeky', scale: 1.15 })
  s += K.margot({ x: 1180, y: 850, mood: 'excited', scale: 1.55 })
  s += K.standing('kofi', { x: 1450, y: 852, pose: 'wave', expr: 'laugh', scale: 1.06 })
  s += K.standing('tomasz', { x: 1700, y: 852, pose: 'down', expr: 'happy', look: -1, scale: 1.06 })
  s += K.maisieChair({ x: 1990, y: 850, expr: 'happy', look: -1, scale: 1.12 })
  s += '</g>'
  ;[[330, 'Mrs Hargreaves'], [620, 'Priya'], [900, 'Stan'], [1180, 'Margot'], [1450, 'Kofi'], [1700, 'Tomasz'], [1990, 'Maisie']].forEach(([x, n]) => { s += T(x, 892, n, { font: HEAD, size: 28, weight: 600, anchor: 'middle' }) })
  return s + '</g>'
}

function card (c, i) {
  const cw = 316
  const x = 40 + i * (cw + 18)
  const y = 860
  const h = 700
  let s = `<rect x="${x}" y="${y}" width="${cw}" height="${h}" rx="28" fill="${c.tint}"/>`
  s += T(x + 24, y + 58, c.name, { font: HEAD, size: c.name.length > 8 ? 32 : 40, weight: 700 })
  let cx = x + 24
  let cy = y + 78
  c.chips.forEach(([t, bg]) => {
    let ch = chip(cx, cy, t, bg)
    if (cx + ch.w > x + cw - 16) { cx = x + 24; cy += 38; ch = chip(cx, cy, t, bg) }
    s += ch.svg
    cx += ch.w + 8
  })
  let ty = cy + 74
  wrap(c.about, 20, cw - 48).forEach(l => { s += T(x + 24, ty, l, { size: 20 }); ty += 28 })
  const fy0 = y + 290
  s += T(x + 24, fy0, 'Expressions', { font: HEAD, size: 20, weight: 600, fill: '#5A5E78' })
  const spots = [[x + 86, fy0 + 92], [x + cw - 86, fy0 + 92], [x + cw / 2, fy0 + 268]]
  c.faces.forEach(([expr, label], k) => {
    const [gx, gy] = spots[k]
    s += `<g filter="url(#rough)">` + (c.key === 'margot'
      ? K.margotHead(gx, gy, expr, 0.95)
      : `<g transform="translate(${gx} ${gy}) scale(0.76)">${K.head(c.key, 0, 0, expr, 0)}</g>`) + '</g>'
    s += T(gx, gy + (c.key === 'priya' ? 112 : 78), label, { size: 17, weight: 700, anchor: 'middle' })
  })
  return s
}

function notes () {
  const items = ['Soft, organic shapes. No outlines, no geometry.', 'Limited risograph palette on warm paper, with a light grain.', 'Dark ink only for faces and small details.', 'Text in Atkinson Hyperlegible, made for readability.', 'Same uniform; props tell them apart.']
  let s = T(1100, 112, 'Style notes', { font: HEAD, size: 24, weight: 600, fill: '#5A5E78' })
  items.forEach((it, i) => { s += `<circle cx="1110" cy="${146 + i * 32}" r="5" fill="${RISO.pink}"/>` + T(1126, 153 + i * 32, it, { size: 19 }) })
  const sw = [RISO.blue, '#FFFDF8', '#5A6275', RISO.yellow, RISO.pink, RISO.teal, RISO.lilac, '#E8B66A', RISO.red]
  s += T(1700, 112, 'Palette', { font: HEAD, size: 24, weight: 600, fill: '#5A5E78' })
  sw.forEach((c, i) => { s += `<circle cx="${1722 + (i % 5) * 54}" cy="${152 + Math.floor(i / 5) * 54}" r="21" fill="${c}"/>` })
  return s
}

function sheet () {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${K.filters()}</defs>`
  s += `<rect width="${W}" height="${H}" fill="${PAPER}"/>`
  s += T(60, 150, "Where's", { font: HEAD, size: 104, weight: 700 }) + T(470, 150, 'Margot?', { font: HEAD, size: 104, weight: 700, fill: RISO.red })
  s += `<g filter="url(#rough)">${K.margotHead(935, 108, 'smug', 1.1)}</g>`
  s += T(64, 206, 'Character sheet · draft 3 · a 12-issue comic for the SMART Study newsletter', { size: 26, weight: 700, fill: '#5A5E78' })
  s += T(64, 244, 'Five pupils, one school dog, and the longest lunch break in history.', { size: 26 })
  s += notes() + lineup()
  cast.forEach((c, i) => { s += card(c, i) })
  s += `<rect width="${W}" height="${H}" filter="url(#grain)" style="mix-blend-mode:multiply"/>`
  return s + '</svg>'
}

const FONTS = [['Fredoka', 'fredoka-latin-600-normal', 600], ['Fredoka', 'fredoka-latin-700-normal', 700], ['Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-400-normal', 400], ['Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-700-normal', 700]]
const faces = base => FONTS.map(([n, file, w]) => `@font-face{font-family:'${n}';font-weight:${w};src:url(${base(file)}) format('woff2')}`).join('')

;(async () => {
  const svg = sheet()
  for (const d of ['exports/figma', 'exports/comic', 'assets/comic']) fs.mkdirSync(out(d), { recursive: true })
  fs.writeFileSync(out('exports/figma/wheres-margot-character-sheet.svg'), svg + '\n')
  fs.writeFileSync(out('assets/comic/character-sheet.svg'), svg.replace('<defs>', `<style>${faces(f => `../fonts/${f}.woff2`)}</style><defs>`) + '\n')
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
