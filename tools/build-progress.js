/*
 * Progress bars for the bottom of each page of the guidance for parents
 * ("Setting up your child's phone"), as SVGs for Figma:
 *
 *   exports/figma/progress/progress-start.svg      before you start
 *   exports/figma/progress/progress-step-1.svg     … to step 8 (both guides have 8 steps)
 *   exports/figma/progress/progress-done.svg       all done
 *   exports/figma/progress/progress-all.svg        every bar on one board, as named groups
 *
 * Each bar is 482 wide: the guide's text width on an A4 page (595 × 842) in
 * Figma. Eight rounded segments: done (green), now (yellow), to come (soft
 * grey), never red. An upbeat line grows as the parent goes, and a party
 * popper at the end turns coral when they finish. Text is Nunito, so it stays
 * editable in Figma.
 *
 * Run: npm run build:progress
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const C = { navy: '#003A69', grey: '#4A5B70', mint: '#37C3A0', teal: '#0B7A67', sun: '#FFC845', track: '#E4EAF1', coral: '#C4412A', cream: '#FFFAF3' }
const STEPS = 8
const W = 482
const H = 40

// What each bar says: on the left, where they are; on the right, a cheer
const BARS = [
  { id: 'start', done: 0, now: 0, where: 'Before you start', cheer: 'Ready when you are' },
  { id: 'step-1', done: 0, now: 1, where: 'Step 1 of 8', cheer: 'Off you go!' },
  { id: 'step-2', done: 1, now: 2, where: 'Step 2 of 8', cheer: 'Great start' },
  { id: 'step-3', done: 2, now: 3, where: 'Step 3 of 8', cheer: 'You\'re on a roll' },
  { id: 'step-4', done: 3, now: 4, where: 'Step 4 of 8', cheer: 'Halfway there!' },
  { id: 'step-5', done: 4, now: 5, where: 'Step 5 of 8', cheer: 'Over halfway!' },
  { id: 'step-6', done: 5, now: 6, where: 'Step 6 of 8', cheer: 'Nearly there' },
  { id: 'step-7', done: 6, now: 7, where: 'Step 7 of 8', cheer: 'Almost done' },
  { id: 'step-8', done: 7, now: 8, where: 'Step 8 of 8', cheer: 'Last step!' },
  { id: 'done', done: 8, now: 0, where: 'All 8 steps done', cheer: 'Thank you!' }
]

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;')
const popper = colour => {
  const svg = fs.readFileSync(require.resolve('lucide-static/icons/party-popper.svg'), 'utf8')
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim()
    .replace(/<path /g, `<path stroke="${colour}" `).replace(/<circle /g, `<circle stroke="${colour}" `)
}

// One bar, drawn at (x, y)
function bar (b, x = 0, y = 0) {
  const iconW = 22
  const gap = 4
  const trackW = W - iconW - 8
  const segW = (trackW - gap * (STEPS - 1)) / STEPS
  const finished = b.done === STEPS
  let s = `<g id="Progress: ${esc(b.where)}" transform="translate(${x} ${y})">`
  s += `<text x="0" y="12" font-family="Nunito" font-size="10" font-weight="800" fill="${C.navy}">${esc(b.where)}</text>`
  s += `<text x="${trackW}" y="12" text-anchor="end" font-family="Nunito" font-size="10" font-weight="800" fill="${finished ? C.coral : C.teal}">${esc(b.cheer)}</text>`
  s += '<g id="Segments">'
  for (let i = 0; i < STEPS; i++) {
    const fill = i < b.done ? C.mint : i === b.now - 1 ? C.sun : C.track
    s += `<rect x="${(i * (segW + gap)).toFixed(2)}" y="20" width="${segW.toFixed(2)}" height="10" rx="5" fill="${fill}"/>`
  }
  s += '</g>'
  // the finish: a party popper, grey until they get there
  s += `<g id="Finish" transform="translate(${trackW + 8} 14) scale(0.92)" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${popper(finished ? C.coral : '#A9B6C4')}</g>`
  return s + '</g>'
}

const doc = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>\n`

fs.mkdirSync(out('exports/figma/progress'), { recursive: true })
for (const b of BARS) fs.writeFileSync(out(`exports/figma/progress/progress-${b.id}.svg`), doc(W, H, bar(b)))
// every bar on one board, on the cream page colour, to copy from
const pad = 24
const row = H + 22
fs.writeFileSync(out('exports/figma/progress/progress-all.svg'), doc(W + pad * 2, BARS.length * row + pad * 2 - 22,
  `<rect width="100%" height="100%" fill="${C.cream}"/>` + BARS.map((b, i) => bar(b, pad, pad + i * row)).join('')))
console.log(`${BARS.length} progress bars written`)
