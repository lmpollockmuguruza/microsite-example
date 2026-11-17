/*
 * Builds the slide decks and narration for the video guides (content/video.js
 * and content/guidance.js), one per phone:
 *
 *   exports/video/SMART-video-{iphone,android}.pptx
 *   exports/video/SMART-video-narration-{iphone,android}.txt
 *
 * Made for Google Vids: upload the .pptx to Google Slides, then create the video
 * from the presentation. Each slide's speaker notes are its narration, and the
 * .txt has the same words as one script, slide by slide, with the chapters.
 *
 * Slides are 16:9 (10 × 5.625 in), in the study's style: cream background,
 * Nunito, navy headings, coral for parents (the video is for parents), the
 * logo, the illustrations, Lucide icons on coral discs, and every phone screen
 * from the guides, in order.
 *
 * Needs the screen PNGs from `npm run build:guides`.
 * Run: npm run build:video
 */
const fs = require('fs')
const path = require('path')
const PptxGenJS = require('pptxgenjs')
const sharp = require('sharp')
const G = require('../content/guidance')
const V = require('../content/video')

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)

const C = { cream: 'FFFAF3', navy: '003A69', ink: '12263F', grey: '4A5B70', coral: 'C4412A', sun: 'FFC845', lemon: 'FFF1C9', peach: 'FDE7D3', sky: 'EEF6FD', mint: 'E6F7F1', white: 'FFFFFF', line: 'DFE5EC' }
const FONT = 'Nunito'
const W = 10
const H = 5.625
const plain = s => String(s).replace(/\*\*/g, '').replace(/\[\[step:(\w+)\]\]/g, 'the step')
// The start of a screen's description: its first sentence, or two if the first is very short ("Choose Apps.")
const firstSentence = s => {
  const parts = String(s).match(/[^.!?]+[.!?]+(\s|$)/g) || [String(s)]
  return (parts[0].trim().length < 25 && parts[1] ? parts[0] + parts[1] : parts[0]).trim()
}

// ------------------------------------------------------------------ images
const dataUri = buf => 'image/png;base64,' + buf.toString('base64')
const pngSize = buf => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) })
async function svgPng (svg, width) { return sharp(Buffer.from(svg), { density: 300 }).resize(width).png().toBuffer() }
async function iconBadge (name, bg = C.coral) {
  const svg = fs.readFileSync(require.resolve(`lucide-static/icons/${name}.svg`), 'utf8')
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  return svgPng(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="#${bg}"/><g transform="translate(24 24) scale(2)" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`, 192)
}
function screenPng (id) {
  const f = fs.readdirSync(out('exports/png')).find(n => new RegExp(`^\\d+-${id}\\.png$`).test(n))
  if (!f) throw new Error(`No PNG for screen ${id}: run npm run build:guides first`)
  return fs.readFileSync(out(`exports/png/${f}`))
}

// ------------------------------------------------------------------ slides
function deck (guide, video, art) {
  const pres = new PptxGenJS()
  pres.layout = 'LAYOUT_16x9'
  pres.author = 'PUBLIC'
  pres.title = `The SMART Study: ${video.title}`
  pres.theme = { headFontFace: FONT, bodyFontFace: FONT }
  const script = [] // { chapter, label, say }
  const chapters = [] // { name, slide }

  const chrome = (slide, label) => {
    slide.background = { color: C.cream }
    slide.addImage({ data: art.logo, x: 0.4, y: 0.24, w: 0.32, h: 0.32 })
    slide.addText('THE SMART STUDY · VIDEO GUIDE', { x: 0.8, y: 0.22, w: 5, h: 0.36, fontFace: FONT, fontSize: 9, bold: true, color: C.coral, charSpacing: 1.5, margin: 0, valign: 'middle' })
    if (label) slide.addText(label, { x: 5.2, y: 0.22, w: 4.4, h: 0.36, fontFace: FONT, fontSize: 9, color: C.grey, align: 'right', margin: 0, valign: 'middle' })
    slide.addShape(pres.shapes.LINE, { x: 0.4, y: 0.68, w: W - 0.8, h: 0, line: { color: C.coral, width: 1 } })
  }
  const add = (label, say, opts = {}) => {
    const slide = pres.addSlide()
    if (opts.chapter) chapters.push({ name: opts.chapter, slide: script.length + 1 })
    script.push({ label, say, chapter: opts.chapter })
    slide.addNotes(say)
    return slide
  }
  const title = (slide, text, y = 0.95) => slide.addText(text, { x: 0.4, y, w: W - 0.8, h: 0.7, fontFace: FONT, fontSize: 28, bold: true, color: C.navy, margin: 0, valign: 'top' })
  // rows of icon + words
  const iconRows = (slide, rows, y0, opts = {}) => {
    const gap = opts.gap || 0.78
    rows.forEach((r, i) => {
      const y = y0 + i * gap
      slide.addImage({ data: art.icons[r.icon], x: 0.6, y, w: 0.5, h: 0.5 })
      slide.addText(r.text, { x: 1.3, y: y - 0.05, w: opts.w || 7.6, h: 0.6, fontFace: FONT, fontSize: opts.size || 18, color: C.ink, margin: 0, valign: 'middle' })
    })
  }

  // 1. Title
  {
    const s = add('Title', `${video.intro} Let's get started.`, { chapter: 'Introduction' })
    s.background = { color: C.cream }
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.5, fill: { color: C.coral }, line: { color: C.coral } })
    s.addImage({ data: art.logoDisc, x: 0.4, y: 0.95, w: 0.55, h: 0.55 })
    s.addText('THE SMART STUDY', { x: 1.1, y: 0.95, w: 4, h: 0.55, fontFace: FONT, fontSize: 13, bold: true, color: C.coral, charSpacing: 2, margin: 0, valign: 'middle' })
    s.addText('VIDEO GUIDE FOR PARENTS AND CARERS', { x: 0.4, y: 1.85, w: 5, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: C.coral, charSpacing: 1.5, margin: 0 })
    s.addText(video.title, { x: 0.4, y: 2.2, w: 5.2, h: 1.5, fontFace: FONT, fontSize: 36, bold: true, color: C.navy, margin: 0, valign: 'top' })
    s.addText('Step by step, with what you\'ll see on the phone', { x: 0.4, y: 3.75, w: 5, h: 0.5, fontFace: FONT, fontSize: 16, color: C.grey, margin: 0 })
    const ill = art.illustration
    const iw = 4.1
    s.addImage({ data: ill.data, x: 5.6, y: 1.3, w: iw, h: iw * ill.h / ill.w })
    s.addText(guide.time, { x: 0.4, y: 4.75, w: 6, h: 0.4, fontFace: FONT, fontSize: 12, bold: true, color: C.navy, margin: 0 })
  }

  // 2. How to use this video
  {
    const h = V.common.howTo
    const s = add(h.title, h.say)
    chrome(s, h.title)
    title(s, h.title)
    iconRows(s, h.points, 1.95, { gap: 0.95 })
  }

  // 3. Chapters (the list is filled in at the end, once every chapter is known)
  const chapterSlide = add(V.common.chapters.title, V.common.chapters.say)

  // 4. Before you start
  {
    const b = V.common.before
    const s = add(b.title, b.say, { chapter: 'Before you start' })
    chrome(s, b.title)
    title(s, b.title)
    iconRows(s, b.points, 1.75, { gap: 0.68, size: 17 })
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 4.55, w: W - 0.8, h: 0.62, fill: { color: C.peach }, line: { color: C.peach }, rectRadius: 0.12 })
    s.addText(b.note, { x: 0.6, y: 4.55, w: W - 1.2, h: 0.62, fontFace: FONT, fontSize: 14, bold: true, color: C.navy, margin: 0, valign: 'middle' })
  }

  // Parts and steps
  let part = null
  guide.steps.forEach((st, i) => {
    const n = i + 1
    const v = video.steps[st.key]
    if (!v) throw new Error(`No video words for ${guide.id} step ${st.key}`)
    if (st.part !== part) {
      part = st.part
      const p = guide.parts[part]
      const [label, name] = p.title.split(': ')
      const s = add(p.title, video.parts[part])
      s.background = { color: C.navy }
      s.addImage({ data: art.logoDisc, x: 0.4, y: 0.3, w: 0.42, h: 0.42 })
      s.addText(label.toUpperCase(), { x: 0.6, y: 1.6, w: 8, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: C.sun, charSpacing: 2, margin: 0 })
      s.addText(name, { x: 0.6, y: 2.05, w: 8.8, h: 1.2, fontFace: FONT, fontSize: 34, bold: true, color: C.white, margin: 0, valign: 'top' })
      s.addText(plain(p.text), { x: 0.6, y: 3.3, w: 8.8, h: 0.6, fontFace: FONT, fontSize: 16, color: 'CFE0F0', margin: 0 })
      const skip = part === 'connect' ? (guide.os === 'ios' ? 'No iPhone or iPad, or short of time? Skip to Step 3' : 'Already use Family Link with this child? Skip to Step 4') : null
      if (skip) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.2, w: 6.4, h: 0.55, fill: { color: C.sun }, line: { color: C.sun }, rectRadius: 0.27 })
        s.addText(`${skip}  [0:00]`, { x: 0.8, y: 4.2, w: 6.1, h: 0.55, fontFace: FONT, fontSize: 14, bold: true, color: C.navy, margin: 0, valign: 'middle' })
      }
    }

    // the step: number, title, where, and a few words
    {
      const s = add(`Step ${n}: ${st.title}`, v.say, { chapter: `Step ${n}: ${st.title.split(',')[0]}` })
      chrome(s, `Step ${n} of ${guide.steps.length}`)
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.4, y: 1.0, w: 0.9, h: 0.9, fill: { color: C.sun }, line: { color: C.sun }, rectRadius: 0.2 })
      s.addText(String(n), { x: 0.4, y: 1.0, w: 0.9, h: 0.9, fontFace: FONT, fontSize: 34, bold: true, color: C.navy, align: 'center', valign: 'middle', margin: 0 })
      s.addText(st.title, { x: 1.55, y: 0.95, w: 8.1, h: 0.75, fontFace: FONT, fontSize: st.title.length > 38 ? 22 : 28, bold: true, color: C.navy, margin: 0, valign: 'middle' })
      s.addText(`${st.time} · on ${st.device}`, { x: 1.55, y: 1.65, w: 8, h: 0.35, fontFace: FONT, fontSize: 13, color: C.grey, margin: 0 })
      v.points.forEach((pt, j) => {
        const y = 2.4 + j * 0.62
        s.addShape(pres.shapes.OVAL, { x: 0.62, y: y + 0.13, w: 0.2, h: 0.2, fill: { color: C.coral }, line: { color: C.coral } })
        s.addText(pt, { x: 1.0, y, w: 8.6, h: 0.46, fontFace: FONT, fontSize: 18, color: C.ink, margin: 0, valign: 'middle' })
      })
      s.addText('Pause the video while you do this step.', { x: 0.4, y: 5.05, w: 9.2, h: 0.35, fontFace: FONT, fontSize: 12, italic: true, color: C.grey, margin: 0 })
    }

    // its screens, two or three a slide, in order
    const screens = st.screens || []
    const slides = Math.ceil(screens.length / 3)
    let k = 0
    for (let j = 0; j < slides; j++) {
      const count = Math.ceil((screens.length - k) / (slides - j))
      const group = screens.slice(k, k + count)
      const say = group.map(sc => firstSentence(sc.alt)).join(' ')
      const s = add(`Step ${n} screens ${j + 1}`, say)
      chrome(s, `Step ${n}: ${st.title}`)
      const boxW = 2.75
      const boxH = 3.75
      const gap = 0.35
      const x0 = (W - (group.length * boxW + (group.length - 1) * gap)) / 2
      group.forEach((sc, m) => {
        const buf = screenPng(sc.id)
        const { w, h } = pngSize(buf)
        const scale = Math.min(boxW / w, boxH / h)
        const iw = w * scale
        const ih = h * scale
        const x = x0 + m * (boxW + gap)
        s.addImage({ data: dataUri(buf), x: x + (boxW - iw) / 2, y: 0.85 + (boxH - ih) / 2, w: iw, h: ih, altText: sc.alt })
        s.addShape(pres.shapes.OVAL, { x, y: 4.72, w: 0.32, h: 0.32, fill: { color: C.sun }, line: { color: C.sun } })
        s.addText(String(k + m + 1), { x, y: 4.72, w: 0.32, h: 0.32, fontFace: FONT, fontSize: 11, bold: true, color: C.navy, align: 'center', valign: 'middle', margin: 0 })
        s.addText(firstSentence(sc.alt), { x: x + 0.4, y: 4.66, w: boxW - 0.4, h: 0.8, fontFace: FONT, fontSize: 10, color: C.grey, margin: 0, valign: 'top' })
      })
      k += count
    }
  })

  // The end
  {
    const e = V.common.end
    const s = add(e.title, e.say, { chapter: 'If you get stuck' })
    chrome(s, 'The end')
    title(s, e.title)
    iconRows(s, e.points, 2.0, { gap: 0.95 })
  }

  // The chapter list, now that every chapter is known
  {
    const s = chapterSlide
    chrome(s, 'Chapters')
    title(s, 'Chapters')
    const half = Math.ceil(chapters.length / 2)
    ;[chapters.slice(0, half), chapters.slice(half)].forEach((col, c) => {
      col.forEach((ch, i) => {
        s.addText([
          { text: '[0:00]  ', options: { bold: true, color: C.coral } },
          { text: ch.name, options: { color: C.ink } }
        ], { x: 0.5 + c * 4.6, y: 1.75 + i * 0.5, w: 4.5, h: 0.45, fontFace: FONT, fontSize: 13, margin: 0, valign: 'middle' })
      })
    })
  }

  // The script, slide by slide
  const lines = [
    `THE SMART STUDY · VIDEO GUIDE: ${video.title.toUpperCase()}`,
    '',
    'Narration for Google Vids. One block per slide, in order. The same words are in each slide\'s speaker notes.',
    'Parents are told at the start to pause after each step, do it, and carry on.',
    '',
    'CHAPTERS (put the times in once the video is made, here, on slide 3 and in the video description)',
    ...chapters.map(ch => `[0:00]  ${ch.name}  (slide ${ch.slide})`),
    '',
    ...script.flatMap((s, i) => [`--- Slide ${i + 1}: ${s.label}${s.chapter ? `  [chapter: ${s.chapter}]` : ''}`, s.say, ''])
  ]
  return { pres, script: lines.join('\n'), slides: script.length, chapters: chapters.length }
}

// ------------------------------------------------------------------ run
;(async () => {
  fs.mkdirSync(out('exports/video'), { recursive: true })
  const logoSvg = fs.readFileSync(out('assets/images/logo-mark.svg'), 'utf8')
  const logoInner = logoSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  const icons = {}
  for (const name of new Set(['pause', 'skip-forward', 'book-open', 'smartphone', 'key-round', 'pencil', 'credit-card', 'upload', 'mail'])) icons[name] = dataUri(await iconBadge(name))
  const base = {
    logo: dataUri(await svgPng(logoSvg, 192)),
    logoDisc: dataUri(await svgPng(`<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><circle cx="96" cy="96" r="96" fill="#FFFFFF"/><g transform="translate(36 36) scale(2.5)">${logoInner}</g></svg>`, 192)),
    icons
  }
  for (const guide of G.guides) {
    const video = V.guides[guide.id]
    const illBuf = await svgPng(fs.readFileSync(out(`assets/images/illustrations/${guide.illus}`), 'utf8'), 1200)
    const art = { ...base, illustration: { data: dataUri(illBuf), ...pngSize(illBuf) } }
    const d = deck(guide, video, art)
    await d.pres.writeFile({ fileName: out(`exports/video/SMART-video-${video.file}.pptx`) })
    fs.writeFileSync(out(`exports/video/SMART-video-narration-${video.file}.txt`), d.script + '\n')
    console.log(`${video.file}: ${d.slides} slides, ${d.chapters} chapters`)
  }
})().catch(e => { console.error(e); process.exit(1) })
