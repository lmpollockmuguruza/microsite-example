/*
 * Draws the study's design system as one board for Figma:
 *
 *   exports/figma/design-system.svg   colours, type, spacing, radii, shadows,
 *                                     icons, logo, illustrations, components
 *
 * Drag the file into Figma (or copy it and paste onto the canvas). Every
 * section, swatch, style and component is a named group, so the layers
 * panel reads like the system ("Colours / Accents / sun", "Components /
 * Button / Primary") and reviewers can comment on each piece. Text stays
 * editable and is set in Nunito (Inter for phone-screen styles), both on
 * Google Fonts and so available in Figma.
 *
 * Colours are read from src/scss/site.scss, so the board follows the site.
 *
 * Run: npm run build:design-system
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const read = p => fs.readFileSync(out(p), 'utf8')

// ------------------------------------------------------------------ sources
const scss = read('src/scss/site.scss')
const pal = {}
for (const m of scss.matchAll(/^\$([a-z-]+):\s*(#[0-9a-f]{3,6});/gim)) pal[m[1]] = m[2].toLowerCase()

const icons = {}
for (const m of read('assets/js/icons.js').matchAll(/<symbol id="i-([a-z-]+)" viewBox="0 0 24 24">(.*?)<\/symbol>/g)) icons[m[1]] = m[2]

const inner = svg => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
const viewBox = svg => svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number)
const logo = read('assets/images/logo-mark.svg')

// Values the SCSS writes inline rather than as variables
const lit = {
  'navy-hover': '#0b4d85',
  muted: '#4a5b70',
  'ink-soft': '#3b4a5c',
  subtle: '#6b7a8c',
  white: '#ffffff',
  'partner-dash': '#b8c4d2',
  'coral-hover': '#a93520',
  'coral-edge': '#8e2c1b',
  'footer-muted': '#cfe0f0',
  link: '#1a5c9e',
  focus: '#ffdd00',
  'focus-ink': '#0b0c0c',
  error: '#d4351c',
  review: '#4c2c92',
  'review-light': '#f4f0fa',
  'mock-banner': '#fff0b3'
}
const c = name => pal[name] || lit[name]

// GOV.UK Frontend's own tag colours
const TAGS = { purple: ['#491644', '#efdfed'], blue: ['#0c2d4a', '#bbd4ea'], yellow: ['#594d00', '#fff7bf'], green: ['#005a30', '#cce2d8'] }

// ------------------------------------------------------------------ helpers
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const g = (name, body, at) => `<g id="${esc(name)}"${at ? ` transform="translate(${at[0]} ${at[1]})"` : ''}>${body}</g>`
const rect = (x, y, w, h, fill, rx, extra) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ''} fill="${fill}"${extra || ''}/>`
const text = (x, y, str, o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || 'Nunito'}" font-size="${o.size || 16}" font-weight="${o.weight || 400}" fill="${o.fill || c('ink')}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${esc(str)}</text>`
const icon = (name, x, y, size, stroke) => g(`icon ${name}`, `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</g>`)
// Text widths are estimates (Figma lays out the real font); pills centre their label so a small error only changes padding
const textW = (s, size, weight) => s.length * size * (weight >= 800 ? 0.54 : weight >= 700 ? 0.51 : 0.47)

function lum (hex) {
  const [r, gg, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * r + 0.7152 * gg + 0.0722 * b
}
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

const W = 1920
const PAD = 80
const SHADOW = 'filter="url(#shadow-card)"'

// A section is a white board with a title; returns [svg, height]
function section (name, title, intro, bodyFn) {
  const [body, h] = bodyFn()
  const H = h + 150
  const svg = g(name,
    g('Background', rect(0, 0, W - PAD * 2, H, '#ffffff', 32)) +
    g('Title', text(48, 72, title, { size: 36, weight: 900, fill: c('navy'), ls: '-0.36' }) + text(48, 104, intro, { size: 16, fill: c('muted') })) +
    g('Content', body, [48, 140]))
  return [svg, H]
}

// ------------------------------------------------------------------ 1. Colours
const COLOURS = [
  ['Brand and text', [
    ['navy', 'Headings, primary buttons, nav, footer'], ['navy-dark', 'Primary button edge'], ['navy-hover', 'Primary button hover'],
    ['ink', 'Body text'], ['muted', 'Hints, captions, tagline'], ['ink-soft', 'Card text'], ['subtle', 'Partner sub-labels']]],
  ['Surfaces and lines', [
    ['cream', 'Page background'], ['white', 'Cards, tasks, steps, header'], ['line', 'Hairlines and dividers'], ['partner-dash', 'Placeholder dashes']]],
  ['Accents', [
    ['sun', 'Step numbers, active nav icon'], ['coral', 'Shapes and markers, never text'], ['coral-dark', 'The one call to action, nav icons'],
    ['coral-hover', 'Coral button hover'], ['coral-edge', 'Coral button edge'], ['mint', 'Progress, done'], ['teal', 'Success text and icons']]],
  ['Tints', [
    ['sky', 'Card icon tile'], ['sky-light', 'Default hero, inset, hovers'], ['peach', 'Peach hero, coral accent'],
    ['lemon', 'Warnings, to be confirmed'], ['mint-light', 'Friendly inset, help'], ['lilac-light', 'Lilac hero, video']]],
  ['GOV.UK and footer', [
    ['link', 'Links'], ['focus', 'Focus ground and outline'], ['focus-ink', 'Text on focus'], ['error', 'Errors, tap-here outline'], ['footer-muted', 'Labels on the navy footer']]],
  ['Mock-up only (not for the live service)', [
    ['review', 'Design notes, review tools'], ['review-light', 'Design-note ground'], ['mock-banner', 'Mock-up banner']]]
]
function colours () {
  let y = 0
  let s = ''
  const SW = 210
  const GAP = 20
  for (const [group, list] of COLOURS) {
    let row = text(0, 20, group, { size: 19, weight: 800, fill: c('navy') })
    list.forEach(([name, use], i) => {
      const hex = c(name)
      const x = i * (SW + GAP)
      const onWhite = contrast(hex, '#ffffff')
      const best = contrast(hex, c('ink')) > contrast(hex, '#ffffff') ? c('ink') : '#ffffff'
      row += g(name,
        g('Swatch', rect(x, 40, SW, 110, hex, 20, hex === '#ffffff' || lum(hex) > 0.85 ? ` stroke="${c('line')}" stroke-width="1"` : '')) +
        g('Sample', text(x + 18, 132, 'Aa', { size: 22, weight: 900, fill: best })) +
        g('Name', text(x, 178, name, { size: 16, weight: 800, fill: c('navy') })) +
        g('Value', text(x, 200, hex.toUpperCase(), { size: 14, weight: 700, fill: c('muted') })) +
        g('Usage', text(x, 222, use, { size: 13, fill: c('ink-soft') })) +
        g('Contrast', text(x, 242, `${onWhite.toFixed(1)}:1 on white`, { size: 12, fill: c('muted') })))
    })
    s += g(group, row, [0, y])
    y += 290
  }
  return [s, y - 30]
}

// ------------------------------------------------------------------ 2. Type
const TYPE = [
  ['Headings', [
    ['heading-xl', 48, 50, 900, 'Welcome to the SMART Study', 'navy', '-0.01em'],
    ['heading-l', 36, 40, 900, 'Who is running the study', 'navy', '-0.01em'],
    ['heading-m', 24, 30, 800, 'If you have been given sign-in details', 'navy', '-0.01em'],
    ['heading-s', 19, 25, 800, 'Before you start', 'navy', '-0.01em'],
    ['card-title', 19, 25, 900, "Set up your child's phone", 'navy'],
    ['wordmark', 26, 26, 900, 'SMART Study', 'navy', '-0.02em'],
    ['step-number', 22, 46, 900, '3', 'navy']]],
  ['Body', [
    ['body-l', 24, 30, 400, 'A research study with primary schools and families.', 'ink'],
    ['body', 19, 25, 400, "If your child's school is taking part, the school will have sent you a letter.", 'ink'],
    ['body-s', 16, 20, 400, 'Card descriptions, hints and footer text.', 'ink-soft'],
    ['label-bold', 16, 20, 700, 'Guides', 'navy'],
    ['button', 19, 19, 800, 'Sign in', 'navy'],
    ['eyebrow', 15, 20, 800, 'Around 80 primary schools in England', 'navy'],
    ['caption', 14, 20, 700, 'A study with primary schools and families', 'muted'],
    ['badge', 13, 18, 800, 'Draft', 'coral-dark']]],
  ['Phone screens (Inter)', [
    ['screen-title', 18, 23, 700, 'Screen Time', 'ink'],
    ['screen-row', 12, 16, 400, 'App Limits', 'ink'],
    ['screen-status', 10, 13, 600, '9:41', 'ink']]]
]
function type () {
  let y = 0
  let s = ''
  for (const [group, styles] of TYPE) {
    let block = text(0, 20, group, { size: 19, weight: 800, fill: c('navy') })
    let yy = 50
    for (const [name, size, lh, weight, sample, fill, ls] of styles) {
      const font = group.startsWith('Phone') ? 'Inter' : 'Nunito'
      const lsPx = ls ? (parseFloat(ls) * size).toFixed(2) : undefined
      const sampleSvg = name === 'wordmark'
        ? `<text x="420" y="${yy + Math.max(lh, size)}" font-family="Nunito" font-size="26" font-weight="900" letter-spacing="${lsPx}" fill="${c('navy')}">SMART <tspan fill="${c('coral-dark')}">Study</tspan></text>`
        : text(420, yy + Math.max(lh, size) * 0.85, sample, { size, weight, fill: c(fill), font, ls: lsPx })
      block += g(name,
        g('Name', text(0, yy + 18, name, { size: 16, weight: 800, fill: c('navy') })) +
        g('Spec', text(0, yy + 40, `${font} ${weight} · ${size}/${lh}px${ls ? ' · ' + ls : ''}`, { size: 13, fill: c('muted') })) +
        g('Sample', sampleSvg))
      yy += Math.max(lh, size) + 34
    }
    s += g(group, block, [0, y])
    y += yy + 30
  }
  return [s, y - 30]
}

// ------------------------------------------------------------------ 3. Spacing, radii, shadows
const SPACE = [6, 8, 10, 12, 14, 16, 20, 22, 24, 28, 36, 40]
const RADII = [['radius-pill', 999], ['radius-hero', 32], ['radius-phone', 30], ['radius-panel', 28], ['radius-step', 24], ['radius-phone-screen', 22], ['radius-card', 20], ['radius-icon-lg', 18], ['radius-tile', 16], ['radius-inset', 14], ['radius-input', 10], ['radius-badge', 9]]
const SHADOWS = [
  ['shadow-card', 'Every white surface', 'url(#shadow-card)'],
  ['shadow-card-hover', 'Card and task hover', 'url(#shadow-card-hover)'],
  ['shadow-phone', 'Phone mock-up', 'url(#shadow-phone)']
]
function scales () {
  let s = ''
  let sp = text(0, 20, 'Spacing', { size: 19, weight: 800, fill: c('navy') })
  SPACE.forEach((v, i) => {
    const y = 44 + i * 34
    sp += g(`space-${v}`, text(0, y + 17, `space-${v}`, { size: 14, weight: 800, fill: c('navy') }) + rect(110, y + 4, v * 4, 16, c('coral'), 4) + text(120 + v * 4, y + 17, `${v}px`, { size: 13, fill: c('muted') }))
  })
  s += g('Spacing', sp, [0, 0])

  let rd = text(0, 20, 'Radius', { size: 19, weight: 800, fill: c('navy') })
  RADII.forEach(([name, v], i) => {
    const x = (i % 6) * 120
    const y = 44 + Math.floor(i / 6) * 160
    const size = 96
    rd += g(name, rect(x, y, size, size, c('sky-light'), Math.min(v, size / 2), ` stroke="${c('navy')}" stroke-width="2"`) + text(x, y + 122, name.replace('radius-', ''), { size: 14, weight: 800, fill: c('navy') }) + text(x, y + 140, `${v}px`, { size: 13, fill: c('muted') }))
  })
  s += g('Radius', rd, [560, 0])

  let sh = text(0, 20, 'Shadows', { size: 19, weight: 800, fill: c('navy') })
  SHADOWS.forEach(([name, use, f], i) => {
    const y = 44 + i * 140
    sh += g(name, `<rect x="0" y="${y}" width="260" height="96" rx="20" fill="#ffffff" filter="${f}"/>` + text(20, y + 40, name, { size: 16, weight: 800, fill: c('navy') }) + text(20, y + 64, use, { size: 13, fill: c('muted') }))
  })
  const btnY = 44 + 3 * 140
  sh += g('shadow-button', rect(0, btnY + 3, 200, 44, c('navy-dark'), 22) + rect(0, btnY, 200, 44, c('navy'), 22) + text(100, btnY + 28, 'shadow-button', { size: 14, weight: 800, fill: '#ffffff', anchor: 'middle' }))
  sh += g('shadow-button-coral', rect(0, btnY + 63, 200, 44, c('coral-edge'), 22) + rect(0, btnY + 60, 200, 44, c('coral-dark'), 22) + text(100, btnY + 88, 'shadow-button-coral', { size: 14, weight: 800, fill: '#ffffff', anchor: 'middle' }))
  s += g('Shadows', sh, [1340, 0])
  return [s, 590]
}

// ------------------------------------------------------------------ 4. Icons
function iconSheet () {
  const names = Object.keys(icons)
  const COLS = 12
  let s = ''
  names.forEach((n, i) => {
    const x = (i % COLS) * 140
    const y = Math.floor(i / COLS) * 110
    s += g(n, rect(x, y, 56, 56, c('sky-light'), 16) + icon(n, x + 14, y + 14, 28, c('navy')).replace(`id="icon ${n}"`, 'id="Icon"') + text(x, y + 80, n, { size: 12, weight: 700, fill: c('muted') }))
  })
  return [s, Math.ceil(names.length / COLS) * 110 - 20]
}

// ------------------------------------------------------------------ 5. Logo and illustrations
function brand () {
  let s = ''
  const logoBlock = (fillName, fillStudy, tagFill, bg, at, name) => g(name,
    rect(0, 0, 520, 120, bg, 24) +
    g('Mark', `<g transform="translate(28 36) scale(1)">${inner(logo)}</g>`) +
    g('Wordmark', `<text x="92" y="66" font-family="Nunito" font-size="26" font-weight="900" letter-spacing="-0.52" fill="${fillName}">SMART <tspan fill="${fillStudy}">Study</tspan></text>`) +
    g('Tagline', text(92, 88, 'A study with primary schools and families', { size: 14, weight: 700, fill: tagFill })), at)
  s += logoBlock(c('navy'), c('coral-dark'), c('muted'), c('cream'), [0, 0], 'Logo / On light')
  s += logoBlock('#ffffff', c('sun'), c('footer-muted'), c('navy'), [0, 140], 'Logo / On navy')
  s += g('Mark / 96px', `<g transform="scale(2)">${inner(logo)}</g>`, [560, 0])
  s += g('Favicon', `<g transform="scale(2)">${inner(read('assets/images/favicon.svg'))}</g>`, [700, 0])

  const files = fs.readdirSync(out('assets/images/illustrations')).filter(f => f.endsWith('.svg')).sort()
  let x = 0
  let y = 300
  files.forEach(f => {
    const svg = read(`assets/images/illustrations/${f}`)
    const [vw, vh] = viewBox(svg)
    const k = 200 / vh
    const w = vw * k
    if (x + w > W - PAD * 2 - 96) { x = 0; y += 250 }
    s += g(`Illustration / ${f.replace('.svg', '')}`, rect(0, 0, w, 200, c('sky-light'), 20) + `<g transform="scale(${k.toFixed(4)})">${inner(svg)}</g>` + text(0, 226, f.replace('.svg', ''), { size: 13, weight: 700, fill: c('muted') }), [x, y])
    x += w + 24
  })
  return [s, y + 230]
}

// ------------------------------------------------------------------ 6. Components
function pill (name, x, y, label, o) {
  const size = o.size || 16
  const weight = o.weight || 700
  const w = o.w || Math.round(textW(label, size, weight) + (o.icon ? 30 : 0) + (o.padX || 14) * 2)
  const h = o.h || 36
  let body = ''
  if (o.edge) body += g('Edge', rect(0, 3, w, h, o.edge, h / 2))
  body += g('Fill', rect(0, 0, w, h, o.bg, h / 2, (o.stroke ? ` stroke="${o.stroke}" stroke-width="2"` : '') + (o.shadow ? ` ${SHADOW}` : '')))
  if (o.icon) {
    body += icon(o.icon, (o.padX || 14), (h - 20) / 2, 20, o.iconFill || o.fill)
    body += text((o.padX || 14) + 28, h / 2 + size * 0.36, label, { size, weight, fill: o.fill })
  } else {
    body += text(w / 2, h / 2 + size * 0.36, label, { size, weight, fill: o.fill, anchor: 'middle' })
  }
  return [g(name, body, [x, y]), w]
}

function components () {
  let s = ''
  let y = 0
  const label = (str, yy) => text(0, yy, str, { size: 19, weight: 800, fill: c('navy') })

  // Buttons
  let row = label('Button', 20)
  let x = 0
  for (const [name, lbl, o] of [
    ['Primary', 'Continue', { bg: c('navy'), edge: c('navy-dark'), fill: '#ffffff' }],
    ['Primary / Hover', 'Continue', { bg: c('navy-hover'), edge: c('navy-dark'), fill: '#ffffff' }],
    ['Secondary', 'Read the guide', { bg: '#ffffff', edge: c('navy'), stroke: c('navy'), fill: c('navy') }],
    ['Coral (one per page)', 'Sign in', { bg: c('coral-dark'), edge: c('coral-edge'), fill: '#ffffff' }],
    ['Coral / Hover', 'Sign in', { bg: c('coral-hover'), edge: c('coral-edge'), fill: '#ffffff' }]
  ]) {
    const [svg, w] = pill(name, x, 44, lbl, { ...o, size: 19, weight: 800, h: 46, padX: 23 })
    row += svg
    x += w + 24
  }
  row += g('Inverse', rect(0, 0, 200, 76, c('navy'), 16) + pill('Button', 24, 15, 'Contact us', { bg: '#ffffff', fill: c('navy'), size: 19, weight: 800, h: 46, padX: 23 })[0], [x, 29])
  row += g('Focus', rect(0, 0, 150, 46, c('focus'), 23) + rect(0, 42, 150, 4, c('focus-ink'), 0) + text(75, 31, 'Continue', { size: 19, weight: 800, fill: c('focus-ink'), anchor: 'middle' }), [x + 224, 44])
  s += g('Button', row, [0, y]); y += 130

  // Tags
  row = label('Tag', 20); x = 0
  for (const [lbl, t] of [['Recommended', 'purple'], ['Not started', 'blue'], ['Due soon', 'yellow'], ['Done', 'green']]) {
    const [svg, w] = pill(`${t} · ${lbl}`, x, 40, lbl, { bg: TAGS[t][1], fill: TAGS[t][0], size: 16, weight: 800, h: 30, padX: 14 })
    row += svg; x += w + 12
  }
  s += g('Tag', row, [0, y])

  // Chips
  row = label('Chip', 20); x = 0
  for (const [lbl, o] of [['Phone', {}], ['Messages', {}], ['Maps', {}], ['WhatsApp (to be confirmed)', { tbc: true }]]) {
    const [svg, w] = pill(o.tbc ? 'Chip / To be confirmed' : `Chip / ${lbl}`, x, 40, lbl, { bg: o.tbc ? c('lemon') : '#ffffff', shadow: !o.tbc, fill: c('navy'), icon: o.tbc ? 'circle-help' : 'check', iconFill: c('teal'), size: 16, weight: 700, h: 38 })
    row += svg; x += w + 10
  }
  s += g('Chip', row, [760, y]); y += 110

  // Nav
  row = label('Navigation', 20)
  row += rect(0, 40, 1160, 60, '#ffffff', 0) + rect(0, 99, 1160, 1, c('line'))
  x = 16
  for (const [lbl, ic, cur] of [['Home', 'house', true], ['Guides', 'book-open'], ['Videos', 'circle-play'], ['Share screen time', 'upload'], ['Help', 'life-buoy']]) {
    const [svg, w] = pill(cur ? `Nav item / Current · ${lbl}` : `Nav item / ${lbl}`, x, 52, lbl, { bg: cur ? c('navy') : '#ffffff', fill: cur ? '#ffffff' : c('navy'), icon: ic, iconFill: cur ? c('sun') : c('coral-dark'), size: 16, weight: 700, h: 36 })
    row += svg; x += w + 8
  }
  row += pill('Sign out', 1036, 52, 'Sign out', { bg: c('sky-light'), fill: c('navy'), icon: 'log-out', size: 16, weight: 700, h: 36, padX: 16 })[0]
  s += g('Navigation', row, [0, y]); y += 140

  // Hero
  const hero = read('assets/images/illustrations/school.svg')
  const [hw, hh] = viewBox(hero)
  const hk = 260 / hh
  row = label('Hero', 20)
  row += g('Hero / Sky', rect(0, 0, 1200, 340, c('sky-light'), 32) +
    pill('Eyebrow', 40, 50, 'Around 80 primary schools in England', { bg: '#ffffff', fill: c('navy'), icon: 'school', size: 15, weight: 800, h: 30, padX: 12 })[0] +
    g('Heading', text(40, 140, 'Welcome to the SMART Study', { size: 48, weight: 900, fill: c('navy'), ls: '-0.48' })) +
    g('Lead', text(40, 190, 'A research study with primary schools and families,', { size: 24, fill: c('ink') }) + text(40, 220, 'running from April 2027 to April 2028.', { size: 24, fill: c('ink') })) +
    g('Illustration', `<g transform="translate(${1200 - 40 - hw * hk} 40) scale(${hk.toFixed(4)})">${inner(hero)}</g>`), [0, 40])
  x = 1240
  for (const [n, t] of [['Sky (default)', 'sky-light'], ['Peach', 'peach'], ['Mint', 'mint-light'], ['Lemon', 'lemon'], ['Lilac', 'lilac-light']]) {
    row += g(`Hero tint / ${n}`, rect(0, 0, 140, 56, c(t), 20) + text(16, 34, n, { size: 14, weight: 800, fill: c('navy') }), [x + ((['Sky (default)', 'Mint', 'Lilac'].indexOf(n) >= 0) ? 0 : 160), 40 + Math.floor(['Sky (default)', 'Peach', 'Mint', 'Lemon', 'Lilac'].indexOf(n) / 2) * 76])
  }
  s += g('Hero', row, [0, y]); y += 410

  // Cards
  row = label('Card', 20)
  ;[['Set-up guides', 'Step-by-step, with pictures.', 'book-open', 'sky', 'Default'], ['Videos', 'The webinar and a video for children.', 'circle-play', 'peach', 'Coral'], ['Get help', 'Common questions, or ask us.', 'life-buoy', 'mint-light', 'Mint'], ['Posters', 'Print or share with parents.', 'printer', 'lemon', 'Sun'], ['Talk to your child', 'Ideas for what to say.', 'message-circle', 'lilac-light', 'Lilac']].forEach(([t, d, ic, acc, v], i) => {
    row += g(`Card / ${v}`,
      g('Surface', `<rect width="300" height="190" rx="20" fill="#ffffff" ${SHADOW}/>`) +
      g('Icon tile', rect(22, 22, 52, 52, c(acc), 16) + icon(ic, 35, 35, 26, c('navy'))) +
      g('Title', text(22, 112, t, { size: 19, weight: 900, fill: c('navy') })) +
      g('Text', text(22, 140, d, { size: 16, fill: c('ink-soft') })), [i * 320, 40])
  })
  s += g('Card', row, [0, y]); y += 260

  // Task list
  row = label('Task', 20)
  ;[['Watch the welcome webinar', 'About 40 minutes. Watch the recording whenever suits you.', 'circle-play', 'lilac-light', 'Recommended', 'purple'],
    ["Set up your child's phone", "About 30 to 40 minutes. We'll help you pick the right guide.", 'shield-check', 'sky-light', 'Not started', 'blue'],
    ['Share a screen time screenshot', 'About 2 minutes, once a month. Next one by 30 November 2026.', 'upload', 'mint-light', 'Due soon', 'yellow']].forEach(([t, h, ic, acc, tag, tc], i) => {
    const tw = Math.round(textW(tag, 16, 800) + 28)
    row += g(`Task / ${t}`,
      g('Surface', `<rect width="900" height="92" rx="20" fill="#ffffff" ${SHADOW}/>`) +
      g('Icon tile', rect(20, 18, 56, 56, c(acc), 18) + icon(ic, 34, 32, 28, c('navy'))) +
      g('Title', text(92, 42, t, { size: 19, weight: 900, fill: c('navy') })) +
      g('Hint', text(92, 66, h, { size: 16, fill: c('muted') })) +
      pill(`Tag / ${tag}`, 900 - 20 - tw, 31, tag, { bg: TAGS[tc][1], fill: TAGS[tc][0], size: 16, weight: 800, h: 30, w: tw })[0], [0, 40 + i * 106])
  })
  // Callout and insets beside the tasks
  row += g('Callout', rect(0, 0, 700, 100, c('mint-light'), 20) + g('Icon', `<circle cx="52" cy="50" r="30" fill="#ffffff"/>` + icon('hand-heart', 37, 35, 30, c('teal'))) +
    text(104, 42, "Stuck? You're not on your own.", { size: 19, weight: 700 }) + text(104, 70, "Email us and we'll help within 5 working days.", { size: 19 }), [960, 40])
  s += g('Task', row, [0, y]); y += 380

  // Insets
  row = label('Inset and callouts', 20)
  ;[['Inset', 'sky-light', 'You can change these settings later from your own phone.'], ['Inset / Friendly', 'mint-light', 'Most families finish this in one evening.'], ['Warning', 'lemon', "Write the passcode down. You'll need it to change anything."]].forEach(([n, bg, t], i) => {
    let body = rect(0, 0, 560, 64, c(bg), 14)
    if (n === 'Warning') body += `<circle cx="30" cy="32" r="17" fill="${c('ink')}"/>` + text(30, 41, '!', { size: 26, weight: 900, fill: '#ffffff', anchor: 'middle' }) + text(60, 38, t, { size: 17, weight: 700 })
    else body += text(20, 38, t, { size: 17 })
    row += g(n, body, [i < 2 ? i * 580 : 0, i < 2 ? 40 : 124])
  })
  row += g('Check', rect(0, 0, 560, 64, c('mint-light'), 14) + icon('circle-check', 16, 19, 26, c('teal')) + `<text x="54" y="38" font-family="Nunito" font-size="16" fill="${c('ink')}"><tspan font-weight="700">Check:</tspan> the Screen Time icon shows your child's name.</text>`, [580, 124])
  s += g('Inset', row, [0, y]); y += 220

  // Steps and progress
  row = label('Guide step', 20)
  row += g('Progress', rect(0, 0, 1160, 12, c('sky-light'), 6) + rect(0, 0, 464, 12, c('mint'), 6), [0, 40])
  const step = (name, at, n, done, title, meta, lines) => g(name,
    g('Surface', `<rect width="1160" height="${done ? 104 : 220}" rx="24" fill="#ffffff" ${SHADOW}${done ? ` stroke="${c('mint')}" stroke-width="3"` : ''}/>`) +
    g('Number', rect(24, 22, 46, 46, done ? c('mint') : c('sun'), 16) + (done ? icon('check', 35, 33, 24, '#ffffff') : text(47, 53, n, { size: 22, weight: 900, fill: c('navy'), anchor: 'middle' }))) +
    g('Heading', text(88, 52, title, { size: 24, weight: 800, fill: c('navy') })) +
    g('Meta', icon('clock', 88, 66, 18, c('muted')) + text(112, 81, meta[0], { size: 16, weight: 700, fill: c('muted') }) + icon('smartphone', 128 + textW(meta[0], 16, 700), 66, 18, c('muted')) + text(152 + textW(meta[0], 16, 700), 81, meta[1], { size: 16, weight: 700, fill: c('muted') })) +
    lines.map((l, i) => text(88, 120 + i * 28, `${i + 1}. ${l}`, { size: 19 })).join('') +
    (done ? '' : pill('Mark as done', 88, 160, 'Mark as done', { bg: '#ffffff', edge: c('navy'), stroke: c('navy'), fill: c('navy'), size: 16, weight: 800, h: 34, padX: 18 })[0]), at)
  row += step('Step / Done', [0, 72], '1', true, 'Put your child in your family group', ['5 minutes', 'On your phone'], [])
  row += step('Step / Open', [0, 198], '2', false, 'Turn on Screen Time', ['10 minutes', "On your child's phone"], ['Open Settings and tap Screen Time.'])
  // Choice tiles beside
  row += g('Choice tiles', text(0, 0, 'What phone does your child have?', { size: 24, weight: 800, fill: c('navy') }) +
    g('Tile / Selected', `<rect y="24" width="480" height="58" rx="16" fill="${c('sky-light')}" stroke="${c('navy')}" stroke-width="2"/>` + `<circle cx="32" cy="53" r="14" fill="#ffffff" stroke="${c('ink')}" stroke-width="2"/><circle cx="32" cy="53" r="7" fill="${c('ink')}"/>` + text(58, 60, 'An iPhone', { size: 19, weight: 800 })) +
    g('Tile', `<rect y="96" width="480" height="58" rx="16" fill="#ffffff" ${SHADOW}/>` + `<circle cx="32" cy="125" r="14" fill="#ffffff" stroke="${c('ink')}" stroke-width="2"/>` + text(58, 132, 'An Android phone', { size: 19, weight: 800 })) +
    g('Input', text(0, 200, 'Family ID', { size: 19, weight: 800 }) + `<rect y="214" width="240" height="40" rx="10" fill="#ffffff" stroke="${c('ink')}" stroke-width="2"/>` + text(10, 241, 'SMART-R-4821', { size: 19 })), [1220, 92])
  s += g('Guide step', row, [0, y]); y += 450

  // News, chapters, partners
  row = label("What's new, chapters, partners", 20)
  ;[['4 November 2026', 'The welcome webinar recording is online.', 'video'], ['2 November 2026', 'The iPhone guides now match iOS 26.1.', 'refresh-cw']].forEach(([d, t, ic], i) => {
    row += g(`News item / ${d}`, rect(0, 0, 44, 44, c('lemon'), 14) + icon(ic, 11, 11, 22, c('navy')) + text(58, 18, d, { size: 16, weight: 800, fill: c('navy') }) + text(58, 40, t, { size: 16 }) + rect(0, 60, 420, 1, c('line')), [0, 44 + i * 76])
  })
  ;[['0:00', 'Welcome and who we are'], ['6:40', 'Why delay or restrict phones'], ['18:15', 'Setting up the phone']].forEach(([t, l], i) => {
    row += g(`Chapter / ${t}`, `<rect width="420" height="44" rx="14" fill="#ffffff" ${SHADOW}/>` + rect(14, 10, 58, 24, c('lemon'), 12) + text(43, 27, t, { size: 15, weight: 700, fill: c('navy'), anchor: 'middle' }) + text(86, 28, l, { size: 16, weight: 700, fill: c('navy') }), [480, 44 + i * 52])
  })
  ;[['[DfE logo]', 'Commissioned by'], ['[IFF Research logo]', 'Lead partner'], ['[PUBLIC logo]', 'Delivery partner']].forEach(([n, r], i) => {
    row += g(`Partner placeholder / ${n}`, `<rect width="180" height="84" rx="16" fill="#ffffff" stroke="${c('partner-dash')}" stroke-width="2" stroke-dasharray="6 4"/>` + text(90, 38, n, { size: 14, weight: 700, fill: c('muted'), anchor: 'middle' }) + text(90, 58, r, { size: 14, fill: c('subtle'), anchor: 'middle' }), [960 + i * 196, 44])
  })
  s += g('Lists', row, [0, y]); y += 220

  return [s, y]
}

// ------------------------------------------------------------------ build
const defs = `<defs>
<filter id="shadow-card" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#12263f" flood-opacity="0.06"/><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#12263f" flood-opacity="0.07"/></filter>
<filter id="shadow-card-hover" x="-20%" y="-20%" width="140%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#12263f" flood-opacity="0.12"/></filter>
<filter id="shadow-phone" x="-20%" y="-20%" width="140%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#12263f" flood-opacity="0.18"/></filter>
</defs>`

const sections = [
  ['Colours', 'Colour', 'Read from src/scss/site.scss. Contrast is against white; text pairs and gaps are in the design system README.', colours],
  ['Typography', 'Typography', 'Nunito 400, 700, 800 and 900 on the GOV.UK type scale (desktop sizes). Inter only inside drawn phone screens.', type],
  ['Spacing, radius and shadows', 'Spacing, radius and shadows', 'Whole pixels from the code. Everything is rounded; one soft shadow lifts white surfaces off the cream page.', scales],
  ['Icons', 'Icons', 'Lucide, 2px stroke, round caps and joins, 24px grid. Navy in pastel tiles, coral-dark in the nav, teal for success.', iconSheet],
  ['Logo and illustrations', 'Logo and illustrations', 'A sun, a parent and a child, with no phone. Illustrations reuse the same circles and arches.', brand],
  ['Components', 'Components', 'GOV.UK Frontend underneath, restyled with the study identity. Hover, focus and done states are shown where they differ.', components]
]

let y = 240
let body = ''
for (const [name, title, intro, fn] of sections) {
  const [svg, h] = section(name, title, intro, fn)
  body += g(name, svg.replace(/^<g id="[^"]*">/, '').replace(/<\/g>$/, ''), [PAD, y])
  y += h + 48
}
const header = g('Header',
  g('Mark', `<g transform="scale(2)">${inner(logo)}</g>`, [PAD, 64]) +
  `<text x="${PAD + 120}" y="122" font-family="Nunito" font-size="56" font-weight="900" letter-spacing="-1.12" fill="${c('navy')}">SMART <tspan fill="${c('coral-dark')}">Study</tspan> design system</text>` +
  text(PAD + 120, 160, 'The study microsite\'s look and feel, for review. Comment on any layer.', { size: 19, fill: c('muted') }))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${y + 32}" width="${W}" height="${y + 32}">${defs}${g('SMART Study design system', g('Page', rect(0, 0, W, y + 32, c('cream'))) + header + body)}</svg>\n`
fs.mkdirSync(out('exports/figma'), { recursive: true })
fs.writeFileSync(out('exports/figma/design-system.svg'), svg)
console.log(`exports/figma/design-system.svg ${W}×${y + 32}, ${Object.keys(pal).length} palette colours, ${Object.keys(icons).length} icons`)
