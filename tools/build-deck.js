/*
 * Builds the study's slide template from one description of each layout:
 *
 *   exports/SMART-deck-template.pptx   layouts + example slides; open it in
 *                                      PowerPoint, or in Google Slides
 *                                      (File > Open > Upload, or Slides >
 *                                      Import theme to restyle another deck)
 *   exports/figma/deck-template.svg    the same layouts and examples as
 *                                      1920 × 1080 frames for Figma
 *   exports/png/deck/*.png             raster copies of the logo, icons and
 *                                      illustrations the deck uses
 *
 * Slides are 16:9 (10 × 5.625 in, Google Slides' default). Text is Nunito,
 * which Google Slides has built in; PowerPoint users need it installed
 * (free from Google Fonts) or they will see a fallback.
 *
 * Run: npm run build:deck
 */
const fs = require('fs')
const path = require('path')
const PptxGenJS = require('pptxgenjs')
const sharp = require('sharp')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const read = p => fs.readFileSync(out(p), 'utf8')
const mkdir = p => fs.mkdirSync(out(p), { recursive: true })

// ------------------------------------------------------------------ palette (from src/scss/site.scss)
const pal = {}
for (const m of read('src/scss/site.scss').matchAll(/^\$([a-z-]+):\s*#([0-9a-f]{6});/gim)) pal[m[1]] = m[2].toUpperCase()
const col = Object.assign({ white: 'FFFFFF', muted: '4A5B70', 'ink-soft': '3B4A5C', 'footer-muted': 'CFE0F0', link: '1A5C9E' }, pal)

// The pptx theme: what Google Slides and PowerPoint offer in their colour menus
const THEME = {
  name: 'SMART Study',
  headFontFace: 'Nunito',
  bodyFontFace: 'Nunito',
  colors: {
    dk1: col.ink, lt1: col.white, dk2: col.navy, lt2: col.cream,
    accent1: col.navy, accent2: col['coral-dark'], accent3: col.sun, accent4: col.mint, accent5: col.teal, accent6: col.coral,
    hlink: col.link, folHlink: col.navy
  }
}

const icons = {}
for (const m of read('assets/js/icons.js').matchAll(/<symbol id="i-([a-z-]+)" viewBox="0 0 24 24">(.*?)<\/symbol>/g)) icons[m[1]] = m[2]
const inner = svg => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
const viewBox = svg => svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number)

// Images by key: 'logo', 'illustration:<name>', 'icon:<name>:<colour>'
function imageSvg (key) {
  const [kind, name, colour] = key.split(':')
  if (kind === 'logo') return read('assets/images/logo-mark.svg')
  if (kind === 'illustration') return read(`assets/images/illustrations/${name}.svg`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#${col[colour]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`
}
const pngName = key => key.replace(/:/g, '-') + '.png'

// ------------------------------------------------------------------ shapes
// Every slide is a list of shapes in inches; both writers draw from it.
const W = 10
const H = 5.625
const rect = (name, x, y, w, h, fill, r, o = {}) => ({ kind: 'rect', name, x, y, w, h, fill, r, ...o })
const disc = (name, x, y, d, fill) => ({ kind: 'disc', name, x, y, w: d, h: d, fill })
const text = (name, x, y, w, h, runs, o = {}) => ({ kind: 'text', name, x, y, w, h, runs: [].concat(runs).map(r => typeof r === 'string' ? { text: r } : r), ...o })
const image = (name, x, y, w, h, key) => ({ kind: 'image', name, x, y, w, h, key })
const ph = (name, type, x, y, w, h, o) => ({ kind: 'ph', name, type, x, y, w, h, ...o })

// A figure from the logo: a disc for the head, a half-round body standing on the bottom edge
const figure = (name, x, headD, bodyW, fill, top) => [
  disc(`${name} head`, x + (bodyW - headD) / 2, top, headD, fill),
  disc(`${name} body`, x, top + headD + 0.12, bodyW, fill),
  rect(`${name} body base`, x, top + headD + 0.12 + bodyW / 2, bodyW, H - (top + headD + 0.12 + bodyW / 2) + 0.2, fill)
]
const motif = [
  rect('Sky block', 8.55, -0.35, 1.9, 1.45, 'sky-light', 0.3),
  disc('Sun', 7.35, 0.55, 1.3, 'sun'),
  ...figure('Parent', 5.95, 0.9, 1.7, 'coral', 2.2),
  ...figure('Child', 7.85, 0.62, 1.2, 'mint', 3.2)
]
const wordmark = (x, y, light) => [
  image('Logo mark', x, y, 0.5, 0.5, 'logo'),
  // Study starts where 'SMART ' ends in Nunito Bold at 20pt (1.06 in)
  text('Wordmark SMART', x + 0.62, y + 0.04, 1, 0.42, 'SMART', { size: 20, bold: true, color: light ? 'white' : 'navy', valign: 'middle' }),
  text('Wordmark Study', x + 1.68, y + 0.04, 1, 0.42, 'Study', { size: 20, bold: true, color: light ? 'sun' : 'coral-dark', valign: 'middle' })
]
const footer = [
  image('Footer mark', 0.5, 5.14, 0.24, 0.24, 'logo'),
  text('Footer', 0.84, 5.14, 3, 0.24, 'The SMART Study', { size: 9, bold: true, color: 'muted', valign: 'middle' }),
  { kind: 'number', name: 'Slide number', x: 8.5, y: 5.14, w: 1, h: 0.24, size: 9, color: 'muted' }
]
const titlePh = (w = 9) => ph('title', 'title', 0.5, 0.42, w, 0.8, { size: 30, bold: true, color: 'navy', valign: 'top', prompt: 'Slide title in sentence case' })

// ------------------------------------------------------------------ layouts
const LAYOUTS = [
  {
    name: 'Title', bg: 'navy', use: 'The first slide. One per deck.',
    shapes: [
      ...motif, ...wordmark(0.5, 0.45, true),
      ph('title', 'title', 0.5, 1.55, 5.2, 1.6, { size: 40, bold: true, color: 'white', valign: 'bottom', prompt: 'Deck title' }),
      ph('subtitle', 'body', 0.5, 3.3, 5.2, 0.8, { size: 18, color: 'footer-muted', valign: 'top', prompt: 'Who it is for · month year' })
    ]
  },
  {
    name: 'Section', bg: 'sky-light', use: 'Opens each part of the deck. Number the sections.',
    shapes: [
      rect('Number tile', 0.5, 1.3, 0.85, 0.85, 'sun', 0.2),
      ph('number', 'body', 0.5, 1.3, 0.85, 0.85, { size: 30, bold: true, color: 'navy', align: 'center', valign: 'middle', prompt: '1' }),
      ph('title', 'title', 0.5, 2.4, 5.4, 1.3, { size: 36, bold: true, color: 'navy', valign: 'top', prompt: 'Section title' }),
      ph('subtitle', 'body', 0.5, 3.75, 5.4, 0.9, { size: 18, color: 'ink', valign: 'top', prompt: 'One line on what this section covers' }),
      ph('picture', 'pic', 5.9, 0.6, 3.6, 4.2, { prompt: 'Illustration' }),
      ...footer
    ]
  },
  {
    name: 'Title and body', bg: 'cream', use: 'Plain points. Five bullets at most, one line each where possible.',
    shapes: [titlePh(), ph('body', 'body', 0.5, 1.45, 9, 3.4, { size: 18, color: 'ink', valign: 'top', prompt: 'Points, one idea each', bullets: true }), ...footer]
  },
  {
    name: 'Text and picture', bg: 'cream', use: 'A point with an illustration or a screenshot beside it.',
    shapes: [
      { ...titlePh(4.6), h: 1.15 },
      ph('body', 'body', 0.5, 1.8, 4.4, 3.05, { size: 18, color: 'ink', valign: 'top', prompt: 'Two or three short points', bullets: true }),
      rect('Picture panel', 5.4, 0.42, 4.1, 4.45, 'sky-light', 0.3),
      ph('picture', 'pic', 5.65, 0.75, 3.6, 3.8, { prompt: 'Illustration or screenshot' }),
      ...footer
    ]
  },
  {
    name: 'Title only', bg: 'cream', use: 'For cards, steps, tables and charts composed on the slide.',
    shapes: [titlePh(), ...footer]
  },
  {
    name: 'Big number', bg: 'cream', use: 'One number that matters, with what it means.',
    shapes: [
      disc('Sun', 6.7, 0.75, 2.5, 'sun'),
      disc('Mint', 8.55, 3.15, 0.95, 'mint'),
      disc('Coral', 6.25, 3.55, 0.6, 'coral'),
      ph('number', 'body', 0.5, 0.75, 5.8, 1.7, { size: 96, bold: true, color: 'navy', valign: 'bottom', prompt: '80' }),
      ph('label', 'body', 0.5, 2.55, 5.6, 0.55, { size: 24, bold: true, color: 'navy', valign: 'top', prompt: 'What the number counts' }),
      ph('body', 'body', 0.5, 3.2, 5.4, 1.4, { size: 16, color: 'ink', valign: 'top', prompt: 'One or two sentences of context' }),
      ...footer
    ]
  },
  {
    name: 'Quote', bg: 'peach', use: 'A quotation, always with who said it.',
    shapes: [
      text('Quote mark', 0.45, 0.3, 1.2, 1.2, '\u201C', { size: 96, bold: true, color: 'coral-dark' }),
      ph('quote', 'body', 0.5, 1.45, 7.8, 2.4, { size: 28, bold: true, color: 'navy', valign: 'top', prompt: 'The quotation, without quote marks' }),
      ph('attribution', 'body', 0.5, 4.0, 7, 0.5, { size: 16, bold: true, color: 'muted', valign: 'top', prompt: 'Who said it, and where' }),
      ...footer
    ]
  },
  {
    name: 'Closing', bg: 'navy', use: 'The last slide: the ask, or how to get in touch.',
    shapes: [
      ...motif, ...wordmark(0.5, 0.45, true),
      ph('title', 'title', 0.5, 1.55, 5.2, 1.6, { size: 40, bold: true, color: 'white', valign: 'bottom', prompt: 'Thank you' }),
      ph('body', 'body', 0.5, 3.3, 5.2, 1.0, { size: 18, color: 'footer-muted', valign: 'top', prompt: 'How to get in touch' })
    ]
  }
]
const layout = name => LAYOUTS.find(l => l.name === name)

// ------------------------------------------------------------------ composed pieces for example slides
const ACCENT = { sky: 'sky', coral: 'peach', mint: 'mint-light', sun: 'lemon', lilac: 'lilac-light' }
const card = (i, n, icon, accent, title, body) => {
  const gap = 0.3
  const w = (9 - gap * (n - 1)) / n
  const x = 0.5 + i * (w + gap)
  return [
    rect(`Card ${i + 1}`, x, 1.55, w, 2.9, 'white', 0.22, { shadow: true }),
    rect(`Card ${i + 1} icon tile`, x + 0.25, 1.8, 0.6, 0.6, ACCENT[accent], 0.16),
    image(`Card ${i + 1} icon`, x + 0.4, 1.95, 0.3, 0.3, `icon:${icon}:navy`),
    text(`Card ${i + 1} title`, x + 0.25, 2.6, w - 0.5, 0.4, title, { size: 18, bold: true, color: 'navy' }),
    text(`Card ${i + 1} text`, x + 0.25, 3.05, w - 0.5, 1.2, body, { size: 14, color: 'ink-soft' })
  ]
}
const step = (i, title, hint) => {
  const w = 2.8
  const x = 0.5 + i * (w + 0.3)
  return [
    rect(`Step ${i + 1}`, x, 1.55, w, 2.9, 'white', 0.25, { shadow: true }),
    rect(`Step ${i + 1} number tile`, x + 0.25, 1.8, 0.55, 0.55, 'sun', 0.16),
    text(`Step ${i + 1} number`, x + 0.25, 1.8, 0.55, 0.55, String(i + 1), { size: 20, bold: true, color: 'navy', align: 'center', valign: 'middle' }),
    text(`Step ${i + 1} title`, x + 0.25, 2.6, w - 0.5, 0.75, title, { size: 18, bold: true, color: 'navy' }),
    image(`Step ${i + 1} clock`, x + 0.25, 3.62, 0.22, 0.22, 'icon:clock:muted'),
    text(`Step ${i + 1} time`, x + 0.55, 3.6, w - 0.8, 0.6, hint, { size: 14, bold: true, color: 'muted' })
  ]
}

// ------------------------------------------------------------------ example deck
const SLIDES = [
  { section: 'Opening', layout: 'Title', fill: { title: 'The SMART Study microsite', subtitle: 'Design review · October 2026' }, notes: 'Title layout. Deck title in sentence case; the subtitle says who it is for and when.' },
  { layout: 'Section', fill: { number: '1', title: 'What families see', subtitle: 'The signed-in pages for the restrict and delay groups', picture: 'illustration:family' }, notes: 'Section layout. Number every section; pick the illustration that matches it.' },
  { section: 'Content', layout: 'Text and picture', fill: { title: 'Three things for every family', body: ['Watch the welcome webinar', "Set up their child's phone, or read the guide to waiting", 'Share a screen time screenshot once a month'], picture: 'illustration:guide-iphone' }, notes: 'Text and picture layout. Keep points short enough to read at a glance.' },
  {
    layout: 'Title only',
    fill: { title: 'Help is never more than one click away' },
    extra: [
      ...card(0, 3, 'book-open', 'sky', 'Set-up guides', 'Step by step, with a picture of every screen.'),
      ...card(1, 3, 'circle-play', 'coral', 'Videos', 'The welcome webinar and a video for children.'),
      ...card(2, 3, 'life-buoy', 'mint', 'Get help', 'Common questions, or email us directly.')
    ],
    notes: 'Title only layout with cards: white, rounded, soft shadow, an icon in a tinted tile. Three or four cards, rotating the tints.'
  },
  { layout: 'Big number', fill: { number: '80', label: 'primary schools in England', body: 'Families take part through their child\'s school, from April 2027 to April 2028.' }, notes: 'Big number layout. One number per slide, in numerals.' },
  {
    layout: 'Title only',
    fill: { title: 'How a restrict family gets set up' },
    extra: [...step(0, 'Watch the welcome webinar', '40 minutes'), ...step(1, "Set up your child's phone", '30 to 40 minutes'), ...step(2, 'Share a screen time screenshot', '2 minutes, monthly')],
    notes: 'Title only layout with steps: the sun number tile from the guides. Three or four steps.'
  },
  { layout: 'Title and body', fill: { title: 'What we still need to decide', body: ['Whether the name "SMART" appears on public pages (A4)', 'Which platform the real build uses (B2)', 'Whether to keep these illustrations or commission new ones (B5)'] }, notes: 'Title and body layout. Five points at most.' },
  { layout: 'Quote', fill: { quote: 'A study identity of its own, with GOV.UK components underneath for accessible forms.', attribution: 'Decision B1, look and feel' }, notes: 'Quote layout. Always say who said it.' },
  { section: 'Close', layout: 'Closing', fill: { title: 'Questions?', body: 'smartphonestudy@public.io' }, notes: 'Closing layout. The ask or the contact route.' }
]

// ------------------------------------------------------------------ pptx writer
async function writePptx (files) {
  const pres = new PptxGenJS()
  pres.layout = 'LAYOUT_16x9'
  pres.title = 'SMART Study deck template'
  pres.author = 'The SMART Study'
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace }
  const C = pres.SchemeColor
  const SCHEME = { ink: C.text1, white: C.background1, navy: C.text2, cream: C.background2, 'coral-dark': C.accent2, sun: C.accent3, mint: C.accent4, teal: C.accent5, coral: C.accent6 }
  const pc = name => SCHEME[name] || col[name]

  function shapeObjects (shapes) {
    const objs = []
    for (const s of shapes) {
      const box = { x: s.x, y: s.y, w: s.w, h: s.h }
      if (s.kind === 'rect') {
        objs.push({ text: { text: '', options: { ...box, shape: s.r ? pres.ShapeType.roundRect : pres.ShapeType.rect, rectRadius: s.r, fill: { color: pc(s.fill) }, objectName: s.name, ...(s.shadow ? { shadow: { type: 'outer', color: col.ink, opacity: 0.1, blur: 8, offset: 2, angle: 90 } } : {}) } } })
      } else if (s.kind === 'disc') {
        objs.push({ text: { text: '', options: { ...box, shape: pres.ShapeType.ellipse, fill: { color: pc(s.fill) }, objectName: s.name } } })
      } else if (s.kind === 'text') {
        objs.push({ text: { text: s.runs.map(r => r.text).join(''), options: { ...box, color: pc(s.runs[0].color || s.color || 'ink'), fontSize: s.size, bold: !!s.bold, align: s.align || 'left', valign: s.valign || 'top', margin: 0, isTextBox: true, objectName: s.name } } })
      } else if (s.kind === 'image') {
        objs.push({ image: { ...box, path: files[s.key], objectName: s.name } })
      } else if (s.kind === 'ph') {
        objs.push({ placeholder: { options: { name: s.name, type: s.type, ...box, fontSize: s.size, bold: !!s.bold, color: pc(s.color || 'ink'), align: s.align || 'left', valign: s.valign || 'top', margin: 0, ...(s.bullets ? { bullet: true, paraSpaceAfter: 8 } : {}) }, text: s.prompt } })
      }
    }
    return objs
  }
  const fit = (key, s) => {
    const [vw, vh] = viewBox(imageSvg(key))
    const k = Math.min(s.w / vw, s.h / vh)
    return { x: s.x + (s.w - vw * k) / 2, y: s.y + (s.h - vh * k) / 2, w: vw * k, h: vh * k }
  }

  for (const l of LAYOUTS) {
    const num = l.shapes.find(s => s.kind === 'number')
    pres.defineSlideMaster({
      title: l.name,
      background: { color: pc(l.bg) },
      objects: shapeObjects(l.shapes.filter(s => s.kind !== 'number')),
      ...(num ? { slideNumber: { x: num.x, y: num.y, w: num.w, h: num.h, fontSize: num.size, color: pc(num.color), align: 'right', valign: 'middle', margin: 0 } } : {})
    })
  }

  let section
  for (const s of SLIDES) {
    if (s.section) { section = s.section; pres.addSection({ title: section }) }
    const slide = pres.addSlide({ masterName: s.layout, sectionTitle: section })
    for (const p of layout(s.layout).shapes.filter(x => x.kind === 'ph')) {
      const v = s.fill[p.name]
      if (v === undefined) continue
      if (p.type === 'pic') slide.addImage({ placeholder: p.name, path: files[v], ...fit(v, p) })
      else if (Array.isArray(v)) slide.addText(v.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < v.length - 1 } })), { placeholder: p.name })
      else slide.addText(v, { placeholder: p.name })
    }
    for (const o of shapeObjects(s.extra || [])) {
      if (o.text) slide.addText(o.text.text, o.text.options)
      else if (o.image) slide.addImage(o.image)
    }
    slide.addNotes(s.notes)
  }

  const file = out('exports/SMART-deck-template.pptx')
  await pres.writeFile({ fileName: file })
  await applyTheme(file)
}

// Writes THEME's colours and name into the deck's theme part (pptxgenjs can't)
async function applyTheme (file) {
  const JSZip = require('jszip')
  const zip = await JSZip.loadAsync(fs.readFileSync(file))
  const part = 'ppt/theme/theme1.xml'
  let xml = await zip.file(part).async('string')
  xml = xml.replace(/<a:theme([^>]*) name="[^"]*"/, `<a:theme$1 name="${THEME.name}"`)
  xml = xml.replace(/<a:clrScheme name="[^"]*">[\s\S]*?<\/a:clrScheme>/, () => {
    const c = THEME.colors
    const sys = (tag, v) => `<a:${tag}><a:srgbClr val="${v}"/></a:${tag}>`
    return `<a:clrScheme name="${THEME.name}">${['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'].map(k => sys(k, c[k])).join('')}</a:clrScheme>`
  })
  zip.file(part, xml)
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
}

// ------------------------------------------------------------------ svg writer (Figma)
const K = 192 // px per inch: a 10 in slide is a 1920 px frame
const PT = K / 72
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const g = (name, body, at) => `<g id="${esc(name)}"${at ? ` transform="translate(${at[0]} ${at[1]})"` : ''}>${body}</g>`
// Nunito's average advance, so wrapping roughly matches the real font
const charW = (size, bold) => size * PT * (bold ? 0.53 : 0.5)

function wrap (str, maxPx, size, bold) {
  const lines = []
  for (const para of String(str).split('\n')) {
    let line = ''
    for (const word of para.split(' ')) {
      const test = line ? line + ' ' + word : word
      if (test.length * charW(size, bold) > maxPx && line) { lines.push(line); line = word } else line = test
    }
    lines.push(line)
  }
  return lines
}

function svgText (name, s, runs, o = {}) {
  const size = s.size
  const px = size * PT
  const lh = px * 1.2
  const x0 = s.x * K
  const wPx = s.w * K
  const paras = o.bullets ? runs.map(r => [r]) : [runs]
  let lines = []
  for (const para of paras) {
    const str = para.map(r => r.text).join('')
    const indent = o.bullets ? 0.3 * K : 0
    wrap(str, wPx - indent, size, s.bold).forEach((l, i) => lines.push({ text: l, bullet: o.bullets && i === 0, indent, gapAfter: false }))
    if (o.bullets) lines[lines.length - 1].gapAfter = true
  }
  const total = lines.length * lh + lines.filter(l => l.gapAfter).length * 8 * PT
  let y = s.y * K + (s.valign === 'middle' ? (s.h * K - total) / 2 : s.valign === 'bottom' ? s.h * K - total : 0)
  const anchor = s.align === 'center' ? 'middle' : s.align === 'right' ? 'end' : 'start'
  const ax = s.align === 'center' ? x0 + wPx / 2 : s.align === 'right' ? x0 + wPx : x0
  let body = ''
  for (const l of lines) {
    y += lh
    const base = y - lh * 0.22
    const content = esc(l.text)
    if (l.bullet) body += `<circle cx="${x0 + 0.1 * K}" cy="${base - px * 0.32}" r="${px * 0.12}" fill="#${col[s.color]}"/>`
    body += `<text x="${ax + l.indent}" y="${base}" font-family="Nunito" font-size="${+px.toFixed(1)}" font-weight="${s.bold ? 800 : 400}" fill="#${col[runs[0].color || s.color || 'ink']}"${anchor !== 'start' ? ` text-anchor="${anchor}"` : ''}>${content}</text>`
    if (l.gapAfter) y += 8 * PT
  }
  return g(name, body)
}

function svgImage (name, key, box) {
  const svg = imageSvg(key)
  const [vw, vh] = viewBox(svg)
  const k = Math.min(box.w * K / vw, box.h * K / vh)
  const x = box.x * K + (box.w * K - vw * k) / 2
  const y = box.y * K + (box.h * K - vh * k) / 2
  const strokeAttrs = key.startsWith('icon:') ? (svg.match(/<svg[^>]*?( fill="none"[^>]*?)>/) || ['', ''])[1].replace(/ (viewBox|width|height|xmlns)="[^"]*"/g, '') : ''
  return g(name, `<g transform="translate(${+x.toFixed(2)} ${+y.toFixed(2)}) scale(${+k.toFixed(4)})"${strokeAttrs}>${inner(svg)}</g>`)
}

function svgShape (s, fill, number) {
  const box = { x: s.x * K, y: s.y * K, w: s.w * K, h: s.h * K }
  if (s.kind === 'rect') return g(s.name, `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"${s.r ? ` rx="${s.r * K}"` : ''} fill="#${col[s.fill]}"${s.shadow ? ' filter="url(#card-shadow)"' : ''}/>`)
  if (s.kind === 'disc') return g(s.name, `<circle cx="${box.x + box.w / 2}" cy="${box.y + box.h / 2}" r="${box.w / 2}" fill="#${col[s.fill]}"/>`)
  if (s.kind === 'text') return svgText(s.name, s, s.runs)
  if (s.kind === 'image') return svgImage(s.name, s.key, s)
  if (s.kind === 'number') return svgText(s.name, { ...s, align: 'right', valign: 'middle' }, [{ text: String(number) }])
  if (s.kind === 'ph') {
    const v = fill ? fill[s.name] : undefined
    if (s.type === 'pic') {
      if (v) return svgImage(`Picture: ${s.name}`, v, s)
      return g(`Placeholder: ${s.name}`, `<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="24" fill="none" stroke="#${col.navy}" stroke-width="3" stroke-dasharray="14 10"/>` + svgText('Prompt', { ...s, size: 14, color: 'navy', align: 'center', valign: 'middle', bold: true }, [{ text: s.prompt }]))
    }
    const value = v === undefined ? (s.bullets ? [s.prompt, 'Second point'] : s.prompt) : v
    const runsFor = [].concat(value).map(t => ({ text: t }))
    return svgText(fill ? s.name : `Placeholder: ${s.name}`, s, runsFor, { bullets: Array.isArray(value) })
  }
  return ''
}

function svgSlide (name, l, fill, extra, number) {
  const body = `<rect width="${W * K}" height="${H * K}" fill="#${col[l.bg]}"/>` +
    l.shapes.map(s => svgShape(s, fill, number)).join('') + (extra || []).map(s => svgShape(s, fill, number)).join('')
  return g(name, `<clipPath id="clip-${name.replace(/[^a-z0-9]/gi, '')}"><rect width="${W * K}" height="${H * K}"/></clipPath><g clip-path="url(#clip-${name.replace(/[^a-z0-9]/gi, '')})">${body}</g>`)
}

function writeSvg () {
  const SW = W * K
  const SH = H * K
  const GAP = 120
  const COLS = 3
  const PAD = 160
  const boardW = PAD * 2 + COLS * SW + (COLS - 1) * GAP
  const heading = (str, sub, y) => `<text x="${PAD}" y="${y}" font-family="Nunito" font-size="72" font-weight="900" fill="#${col.navy}">${esc(str)}</text><text x="${PAD}" y="${y + 56}" font-family="Nunito" font-size="32" fill="#${col.muted}">${esc(sub)}</text>`
  const grid = (items, top) => items.map((it, i) => {
    const x = PAD + (i % COLS) * (SW + GAP)
    const y = top + Math.floor(i / COLS) * (SH + GAP + 70)
    return g(it.name, `<text x="0" y="-24" font-family="Nunito" font-size="32" font-weight="800" fill="#${col.navy}">${esc(it.label)}</text>` + it.svg, [x, y])
  })
  let y = 220
  let body = heading('SMART Study slide template', 'Layouts for Google Slides and PowerPoint (exports/SMART-deck-template.pptx), drawn as 1920 × 1080 frames. Select a slide group and choose Frame selection to make it a Figma frame.', y)
  y += 220
  body += heading('Layouts', 'The frames every slide is built on. Text in placeholders is a prompt.', y)
  y += 180
  const layouts = LAYOUTS.map(l => ({ name: `Layout / ${l.name}`, label: `${l.name} · ${l.use}`, svg: svgSlide(`Slide / ${l.name}`, l, null, null, '#') }))
  body += g('Layouts', grid(layouts, y).join(''))
  y += Math.ceil(layouts.length / COLS) * (SH + GAP + 70) + 60
  body += heading('Example deck', 'The layouts filled in, with cards and steps composed on Title only.', y)
  y += 180
  const examples = SLIDES.map((s, i) => ({ name: `Example / ${String(i + 1).padStart(2, '0')} ${s.layout}`, label: `${i + 1}. ${s.layout}`, svg: svgSlide(`Slide / ${i + 1}`, layout(s.layout), s.fill, s.extra, i + 1) }))
  body += g('Example deck', grid(examples, y).join(''))
  y += Math.ceil(examples.length / COLS) * (SH + GAP + 70)
  const defs = '<defs><filter id="card-shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#12263f" flood-opacity="0.1"/></filter></defs>'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boardW} ${y}" width="${boardW}" height="${y}">${defs}${g('SMART Study slide template', `<rect width="${boardW}" height="${y}" fill="#${col.white}"/>` + body)}</svg>\n`
  mkdir('exports/figma')
  fs.writeFileSync(out('exports/figma/deck-template.svg'), svg)
}

// ------------------------------------------------------------------ run
;(async () => {
  // Google Slides can't place SVG, so the pptx gets PNGs
  const keys = new Set()
  const collect = s => { if (s.kind === 'image') keys.add(s.key) }
  LAYOUTS.forEach(l => l.shapes.forEach(collect))
  SLIDES.forEach(s => { (s.extra || []).forEach(collect); Object.values(s.fill).forEach(v => { if (typeof v === 'string' && /^(illustration|icon|logo)/.test(v)) keys.add(v) }) })
  mkdir('exports/png/deck')
  const files = {}
  for (const key of keys) {
    const svg = imageSvg(key)
    const [vw] = viewBox(svg)
    const file = out(`exports/png/deck/${pngName(key)}`)
    await sharp(Buffer.from(svg), { density: 72 * Math.max(1, (key.startsWith('illustration') ? 1600 : 256) / vw) }).png().toFile(file)
    files[key] = file
  }
  await writePptx(files)
  writeSvg()
  console.log(`${LAYOUTS.length} layouts, ${SLIDES.length} example slides, ${keys.size} images`)
})()
