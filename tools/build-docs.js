/*
 * Builds the documents that go out as Word and PDF, in one house style:
 *
 *   exports/SMART-onboarding-pack-schools.docx|pdf   welcome pack for schools   (content/onboarding.js)
 *   exports/SMART-onboarding-pack-parents.docx|pdf   welcome pack for families  (content/onboarding.js)
 *   exports/SMART-setting-up-your-childs-phone.docx|pdf
 *                                                    the guidance for parents   (content/guidance.js)
 *
 * The Word file is the source; the PDF is made from it by LibreOffice, so the
 * two always match. Links inside the guidance ("Skip to Step 3", "See what
 * changes if you skip it") are real links in both.
 *
 * House style (from the April 2027 packs and the design review): Nunito,
 * body 10.5pt, one heading hierarchy for every document, and a colour per
 * audience: navy and yellow for schools, coral for parents.
 * Words in [square brackets] are still to be confirmed and are highlighted.
 *
 * Needs: the phone screen PNGs from `npm run build:guides`, and LibreOffice
 * (soffice) for the PDFs. Nunito is embedded in the Word files and given to
 * LibreOffice from assets/fonts/ttf, so it needn't be installed.
 *
 * Run: npm run build:docs   (add --no-pdf to write the Word files only)
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  AlignmentType, LevelFormat, ImageRun, Header, Footer, PageNumber, TabStopType, PageBreak,
  ExternalHyperlink, InternalHyperlink, Bookmark, VerticalAlign, HighlightColor, CharacterSet, HeadingLevel, LineRuleType,
  HeightRule, SectionType
} = require('docx')
const AUTO = LineRuleType.AUTO

const ROOT = path.resolve(__dirname, '..')
const out = p => path.join(ROOT, p)
const R = require('../content/resources')
const O = require('../content/onboarding')
const G = require('../content/guidance')

// ------------------------------------------------------------------ house style
const C = { cream: 'FFFAF3', navy: '003A69', ink: '12263F', grey: '4A5B70', coral: 'C4412A', sun: 'FFC845', lemon: 'FFF1C9', mint: 'E6F7F1', teal: '0B7A67', sky: 'EEF6FD', peach: 'FDE7D3', line: 'DFE5EC', link: '1A5C9E', white: 'FFFFFF' }
// One colour per audience, so a school leader can tell the documents apart at a glance.
// band and label are the cover's top band and its "For …" line.
const ACCENT = {
  schools: { text: C.navy, mark: 'B88400', ask: C.lemon, rule: C.sun, band: C.navy, label: C.sun, tint: C.lemon },
  parents: { text: C.coral, mark: C.coral, ask: C.peach, rule: C.coral, band: C.coral, label: C.white, tint: C.peach },
  children: { text: C.teal, mark: C.teal, ask: C.mint, rule: '37C3A0', band: C.teal, label: C.white, tint: C.mint }
}
const FONT = 'Nunito'
const SIZE = { body: 21, small: 18, caption: 16, lead: 23, eyebrow: 17, title: 52, h1: 34, h2: 27, h3: 23 }
const PAGE = { w: 11906, h: 16838, x: 1134, top: 1300, bottom: 1134 }
const TW = PAGE.w - PAGE.x * 2 // text width
// The cover image, in pixels at 96 dpi: the text width, and nearly the text height
const COVER = { w: 642, h: 930 }

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none }
const lineB = { style: BorderStyle.SINGLE, size: 4, color: C.line }

// ------------------------------------------------------------------ text
// **bold**, [link](https://…), [link](#bookmark), [[step:key]] (a link to a step
// of the guide being written), [to be confirmed] (highlighted) and emails.
function tokens (s) {
  const list = []
  let buf = ''
  const flush = () => { if (buf) list.push({ t: 'text', v: buf }); buf = '' }
  let i = 0
  while (i < s.length) {
    if (s.startsWith('**', i)) {
      const j = s.indexOf('**', i + 2)
      if (j > i) { flush(); list.push({ t: 'bold', v: s.slice(i + 2, j) }); i = j + 2; continue }
    }
    if (s.startsWith('[[step:', i)) {
      const j = s.indexOf(']]', i)
      flush(); list.push({ t: 'step', v: s.slice(i + 7, j) }); i = j + 2; continue
    }
    if (s[i] === '[') {
      let depth = 0
      let j = i
      for (; j < s.length; j++) { if (s[j] === '[') depth++; else if (s[j] === ']' && --depth === 0) break }
      if (j < s.length) {
        flush()
        const inner = s.slice(i + 1, j)
        if (s[j + 1] === '(') {
          const k = s.indexOf(')', j)
          list.push({ t: 'link', v: inner, href: s.slice(j + 2, k) }); i = k + 1
        } else { list.push({ t: 'tbc', v: s.slice(i, j + 1) }); i = j + 1 }
        continue
      }
    }
    const m = /^[\w.+-]+@[\w-]+(?:\.[\w-]+)+/.exec(s.slice(i))
    if (m && (i === 0 || /[\s(,]/.test(s[i - 1]))) { flush(); list.push({ t: 'email', v: m[0] }); i += m[0].length; continue }
    buf += s[i++]
  }
  flush()
  return list
}

// Runs for a string. o: { bold, color, size, italics, ctx } where ctx.step(key) gives { text, anchor }
function runs (s, o = {}) {
  const base = { font: FONT, size: o.size || SIZE.body, color: o.color, italics: o.italics, bold: o.bold }
  const link = (text, extra = {}) => new TextRun({ ...base, ...extra, text, color: C.link, underline: {} })
  return tokens(String(s)).flatMap(tk => {
    if (tk.t === 'text') return [new TextRun({ ...base, text: tk.v })]
    if (tk.t === 'bold') return runs(tk.v, { ...o, bold: true })
    if (tk.t === 'tbc') return [new TextRun({ ...base, text: tk.v, highlight: HighlightColor.YELLOW })]
    if (tk.t === 'email') return [new ExternalHyperlink({ link: `mailto:${tk.v}`, children: [link(tk.v)] })]
    if (tk.t === 'link') {
      if (tk.href.startsWith('#')) return [new InternalHyperlink({ anchor: tk.href.slice(1), children: [link(tk.v)] })]
      return [new ExternalHyperlink({ link: tk.href, children: [link(tk.v)] })]
    }
    if (tk.t === 'step') {
      const st = o.ctx && o.ctx.step(tk.v)
      if (!st) return [new TextRun({ ...base, text: `[[step:${tk.v}]]` })]
      return [new InternalHyperlink({ anchor: st.anchor, children: [link(st.text)] })]
    }
    return []
  })
}

// ------------------------------------------------------------------ building blocks
function kit (accentName, docTitle, logo) {
  const A = ACCENT[accentName]
  const numbering = [
    { reference: 'bullets', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 340, hanging: 240 } }, run: { color: A.mark, bold: true } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 700, hanging: 240 } }, run: { color: A.mark } } }
    ] }
  ]
  let lists = 0
  const k = { A, numbering }

  k.P = (s, o = {}) => new Paragraph({
    children: runs(s, o),
    spacing: { before: o.before || 0, after: o.after ?? 100, line: o.line || 276, lineRule: AUTO },
    alignment: o.align,
    keepNext: o.keepNext,
    keepLines: o.keepLines,
    heading: o.heading
  })
  // Several paragraphs from one string, split at line breaks
  k.Ps = (s, o = {}) => String(s).split('\n').map((x, i, a) => k.P(x, { ...o, after: i === a.length - 1 ? (o.after ?? 100) : 60 }))
  k.space = (after = 120) => new Paragraph({ children: [], spacing: { after } })
  k.pageBreak = () => new Paragraph({ children: [new PageBreak()] })

  k.H1 = (s, anchor) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: anchored(anchor, [new TextRun({ text: s, font: FONT })]) })
  k.H2 = (s, anchor) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: anchored(anchor, [new TextRun({ text: s, font: FONT })]) })
  k.H3 = (children, anchor) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: anchored(anchor, children) })
  function anchored (anchor, children) { return anchor ? [new Bookmark({ id: anchor, children })] : children }

  k.bullets = (items, o = {}) => items.map(s => new Paragraph({ children: runs(s, o), numbering: { reference: 'bullets', level: 0 }, spacing: { after: 70, line: 276, lineRule: AUTO } }))
  k.numbered = (items, o = {}) => {
    const ref = 'list' + (++lists)
    numbering.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 380, hanging: 300 } }, run: { color: A.mark, bold: true } } }] })
    const ps = []
    items.forEach(it => {
      const text = typeof it === 'string' ? it : it.text
      ps.push(new Paragraph({ children: runs(text, o), numbering: { reference: ref, level: 0 }, spacing: { after: 70, line: 276, lineRule: AUTO } }))
      if (typeof it !== 'string') (it.sub || []).forEach(x => ps.push(new Paragraph({ children: runs(x, o), numbering: { reference: 'bullets', level: 1 }, spacing: { after: 60, line: 276, lineRule: AUTO } })))
    })
    return ps
  }

  // A tinted box. `children` are paragraphs (or tables).
  k.box = (children, fill, o = {}) => new Table({
    width: { size: o.w || TW, type: WidthType.DXA },
    columnWidths: [o.w || TW],
    borders: noBorders,
    rows: [new TableRow({ cantSplit: o.cantSplit !== false, children: [new TableCell({
      width: { size: o.w || TW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill },
      borders: o.bar ? { top: none, bottom: none, right: none, left: { style: BorderStyle.SINGLE, size: 24, color: o.bar } } : { top: none, bottom: none, left: none, right: none },
      margins: { top: 150, bottom: 110, left: 220, right: 220 },
      children
    })] })]
  })
  k.titledBox = (title, paras, fill, o = {}) => k.box([
    k.P(title, { bold: true, color: C.navy, size: SIZE.h3, after: 80, keepNext: true, ...o.titleOpts }),
    ...[].concat(paras).flatMap(p => typeof p === 'string' ? k.Ps(p, { after: 80, ctx: o.ctx }) : [p])
  ], fill, o)
  // Two boxes side by side
  k.pair = (a, b) => {
    const gap = 220
    const w = (TW - gap) / 2
    const cell = (x) => new TableCell({
      width: { size: w, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: x.fill },
      borders: { top: none, bottom: none, left: none, right: none },
      margins: { top: 150, bottom: 110, left: 200, right: 200 },
      children: [k.P(x.title, { bold: true, color: C.navy, size: SIZE.h3, after: 80 }), ...[].concat(x.paras).flatMap(p => typeof p === 'string' ? k.Ps(p, { after: 80, ctx: x.ctx }) : [p])]
    })
    return new Table({
      width: { size: TW, type: WidthType.DXA }, columnWidths: [w, gap, w], borders: noBorders,
      rows: [new TableRow({ cantSplit: true, children: [cell(a), new TableCell({ width: { size: gap, type: WidthType.DXA }, borders: { top: none, bottom: none, left: none, right: none }, children: [new Paragraph({ children: [] })] }), cell(b)] })]
    })
  }
  k.stats = items => {
    const gap = 160
    const w = (TW - gap * (items.length - 1)) / items.length
    const widths = items.flatMap((x, i) => i ? [gap, w] : [w])
    const cells = items.flatMap((x, i) => {
      const c = new TableCell({
        width: { size: w, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.sky },
        borders: { top: none, bottom: none, left: none, right: none }, margins: { top: 160, bottom: 140, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
        children: [k.P(x.n, { bold: true, color: C.navy, size: 40, align: AlignmentType.CENTER, after: 20 }), k.P(x.label, { color: C.grey, size: SIZE.small, align: AlignmentType.CENTER, after: 0 })]
      })
      return i ? [new TableCell({ width: { size: gap, type: WidthType.DXA }, borders: { top: none, bottom: none, left: none, right: none }, children: [new Paragraph({ children: [] })] }), c] : [c]
    })
    return new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: widths, borders: noBorders, rows: [new TableRow({ cantSplit: true, children: cells })] })
  }
  // A table with a navy header row. widths are fractions of the text width.
  k.table = (cols, rows, widths, o = {}) => {
    const ws = widths.map(f => Math.round(f * TW))
    ws[ws.length - 1] = TW - ws.slice(0, -1).reduce((a, b) => a + b, 0)
    const cell = (s, i, head) => new TableCell({
      width: { size: ws[i], type: WidthType.DXA },
      shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: C.navy } : (o.firstColFill && i === 0 ? { type: ShadingType.CLEAR, color: 'auto', fill: o.firstColFill } : undefined),
      borders: { top: lineB, bottom: lineB, left: lineB, right: lineB },
      margins: { top: 90, bottom: 70, left: 130, right: 130 },
      children: typeof s === 'string' ? k.Ps(s, { after: 30, size: o.size || SIZE.small + 1, color: head ? C.white : undefined, bold: head, ctx: o.ctx }) : s
    })
    return new Table({
      width: { size: TW, type: WidthType.DXA }, columnWidths: ws,
      rows: [
        new TableRow({ tableHeader: true, cantSplit: true, children: cols.map((s, i) => cell(s, i, true)) }),
        ...rows.map(r => new TableRow({ cantSplit: true, children: r.map((s, i) => cell(s, i)) }))
      ]
    })
  }

  k.titleBlock = (eyebrow, title, lead, anchor) => [
    new Paragraph({ children: [new TextRun({ text: eyebrow.toUpperCase(), bold: true, color: A.text, size: SIZE.eyebrow, font: FONT, characterSpacing: 20 })], spacing: { after: 80 } }),
    new Paragraph({ heading: HeadingLevel.TITLE, children: anchored(anchor, [new TextRun({ text: title, font: FONT })]), spacing: { before: 0, after: 100, line: 240, lineRule: AUTO } }),
    k.P(lead, { size: SIZE.lead, color: C.grey, after: 240 })
  ]

  // The cover: one image filling the first page (see coverImage). It's an image, not
  // a table, so it looks the same in Word, Google Docs and the PDF: Google Docs
  // ignores fixed row heights and breaks full-bleed table layouts.
  k.coverParagraph = cv => new Paragraph({
    spacing: { before: 0, after: 0, line: 240, lineRule: AUTO },
    children: [
      new ImageRun({ type: 'png', data: cv.image, transformation: { width: COVER.w, height: COVER.h }, altText: { title: cv.title, description: `${cv.audience}. ${cv.kind}: ${cv.title}. ${cv.what}`, name: 'cover' } }),
      new PageBreak()
    ]
  })

  k.pack = (body, meta) => Packer.toBuffer(new Document({
    creator: 'PUBLIC',
    title: meta.title,
    description: meta.description,
    fonts: [{ name: FONT, data: fs.readFileSync(out('assets/fonts/ttf/Nunito-Regular.ttf')), characterSet: CharacterSet.ANSI }],
    styles: {
      default: {
        document: { run: { font: FONT, size: SIZE.body, color: C.ink }, paragraph: { spacing: { line: 276, lineRule: AUTO } } },
        title: { run: { font: FONT, size: SIZE.title, bold: true, color: C.navy }, paragraph: { spacing: { before: 0, after: 100 }, keepNext: true } },
        heading1: { run: { font: FONT, size: SIZE.h1, bold: true, color: C.navy }, paragraph: { spacing: { before: 0, after: 140 }, keepNext: true } },
        heading2: { run: { font: FONT, size: SIZE.h2, bold: true, color: C.navy }, paragraph: { spacing: { before: 260, after: 100 }, keepNext: true } },
        heading3: { run: { font: FONT, size: SIZE.h3, bold: true, color: C.navy }, paragraph: { spacing: { before: 280, after: 60 }, keepNext: true } },
        hyperlink: { run: { color: C.link, underline: { type: 'single' } } }
      },
      paragraphStyles: [{ id: 'SmartFooter', name: 'SMART footer', basedOn: 'Normal', run: { font: FONT, size: SIZE.caption, color: C.grey }, paragraph: { spacing: { after: 0 } } }]
    },
    numbering: { config: numbering },
    sections: [{
      properties: { titlePage: !!meta.cover, page: { size: { width: PAGE.w, height: PAGE.h }, pageNumbers: { start: meta.cover ? 0 : 1 }, margin: { top: PAGE.top, bottom: PAGE.bottom, left: PAGE.x, right: PAGE.x, header: 520, footer: 520 } } },
      headers: { first: new Header({ children: [new Paragraph({ children: [] })] }), default: new Header({ children: [new Paragraph({
        children: [
          new ImageRun({ type: 'png', data: logo, transformation: { width: 22, height: 22 }, altText: { title: 'SMART Study logo', description: 'The SMART Study logo: a sun, a parent and a child', name: 'logo' } }),
          new TextRun({ text: '  THE SMART STUDY', bold: true, color: A.text, size: SIZE.eyebrow, font: FONT, characterSpacing: 20 }),
          new TextRun({ children: ['\t', meta.short], color: C.grey, size: SIZE.caption, font: FONT })
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TW }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: A.rule, space: 6 } }
      })] }) },
      footers: { first: new Footer({ children: [new Paragraph({ children: [] })] }), default: new Footer({ children: [new Paragraph({
        style: 'SmartFooter',
        children: [
          new TextRun({ text: meta.footer, color: C.grey, size: SIZE.caption, font: FONT }),
          new TextRun({ text: '\tPage ', color: C.grey, size: SIZE.caption, font: FONT }),
          new TextRun({ children: [PageNumber.CURRENT], color: C.grey, size: SIZE.caption, font: FONT }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TW }]
      })] }) },
      children: meta.cover ? [k.coverParagraph(meta.cover), ...body] : body
    }]
  }))
  return k
}

// ------------------------------------------------------------------ onboarding packs
function packBody (pack, k) {
  const body = [...k.titleBlock(pack.eyebrow, pack.title, pack.lead)]
  for (const b of pack.blocks) {
    if (b.type === 'ask') {
      const inner = [k.P(b.title, { bold: true, color: C.navy, size: SIZE.h2, after: 100 }), k.P(b.intro, { after: 100 })]
      if (b.items) inner.push(...k.numbered(b.items.map(it => `**${it.title}** ${it.text}`)))
      if (b.paras) b.paras.forEach(p => inner.push(k.P(p, { after: 100 })))
      if (b.outro) inner.push(k.P(b.outro, { color: C.grey, before: 60, after: 40 }))
      body.push(k.box(inner, k.A.ask, { cantSplit: false }), k.space(80))
    } else if (b.type === 'h2') body.push(k.H2(b.text))
    else if (b.type === 'p') body.push(k.P(b.text, { after: 140 }))
    else if (b.type === 'stats') body.push(k.space(40), k.stats(b.items), k.space(160))
    else if (b.type === 'table') body.push(k.table(b.cols, b.rows, b.widths), k.space(160))
    else if (b.type === 'bullets') body.push(...k.bullets(b.items), k.space(60))
    else if (b.type === 'steps') body.push(...k.numbered(b.items))
    else if (b.type === 'note') body.push(k.space(40), k.titledBox(b.title, b.text, C[b.tint]), k.space(120))
    else if (b.type === 'boxes') body.push(k.pair(...b.items.map(x => ({ title: x.title, paras: x.text, fill: C[x.tint] }))), k.space(160))
    else throw new Error('Unknown block type ' + b.type)
  }
  body.push(new Paragraph({ children: runs(pack.footer, { size: SIZE.small, color: C.grey }), spacing: { before: 160, after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.line, space: 8 } } }))
  return body
}

// ------------------------------------------------------------------ the guidance for parents
const GUIDE = {
  title: 'Setting up your child\'s phone',
  file: 'SMART-setting-up-your-childs-phone',
  cover: {
    audience: 'For parents and carers',
    kind: 'Step-by-step guide',
    title: 'Setting up your child\'s phone',
    what: 'How to set up an iPhone or Android phone so it only has a short list of apps and websites.',
    illustration: 'guide-iphone'
  }
}

// Phone screen PNGs written by build-guides.js, found by the screen's id, and
// scaled to 600px wide: sharp in print at the size they're shown, and half the file size
const SCREENS = new Map()
async function loadScreens () {
  const sharp = require('sharp')
  const files = fs.readdirSync(out('exports/png'))
  for (const g of G.guides) {
    for (const st of g.steps) {
      for (const sc of st.screens || []) {
        if (SCREENS.has(sc.id)) continue
        const f = files.find(n => new RegExp(`^\\d+-${sc.id}\\.png$`).test(n))
        if (!f) throw new Error(`No PNG for screen ${sc.id}: run npm run build:guides first`)
        const data = await sharp(out(`exports/png/${f}`)).resize({ width: 600, withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer()
        SCREENS.set(sc.id, { data, w: data.readUInt32BE(16), h: data.readUInt32BE(20) })
      }
    }
  }
}
const pngFor = id => SCREENS.get(id)

function screensTable (k, screens) {
  const cols = 4
  const w = Math.floor(TW / cols)
  const rows = []
  for (let i = 0; i < screens.length; i += cols) {
    const cells = []
    for (let j = 0; j < cols; j++) {
      const sc = screens[i + j]
      const children = []
      if (sc) {
        const img = pngFor(sc.id)
        const px = 128
        children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60, line: 240, lineRule: AUTO }, children: [new ImageRun({ type: 'png', data: img.data, transformation: { width: px, height: Math.round(px * img.h / img.w) }, altText: { title: sc.id, description: sc.alt || sc.id, name: sc.id } })] }))
        children.push(new Paragraph({ spacing: { after: 160, line: 240, lineRule: AUTO }, children: [
          new TextRun({ text: `${i + j + 1}. ${sc.device}. `, bold: true, size: SIZE.caption, font: FONT, color: C.navy }),
          new TextRun({ text: sc.alt || '', size: SIZE.caption, font: FONT, color: C.grey })
        ] }))
      } else children.push(new Paragraph({ children: [] }))
      cells.push(new TableCell({ width: { size: w, type: WidthType.DXA }, borders: { top: none, bottom: none, left: none, right: none }, verticalAlign: VerticalAlign.TOP, margins: { left: 80, right: 80 }, children }))
    }
    rows.push(new TableRow({ cantSplit: true, children: cells }))
  }
  return new Table({ width: { size: w * cols, type: WidthType.DXA }, columnWidths: Array(cols).fill(w), borders: noBorders, rows })
}

function guidanceBody (k) {
  const body = []
  const ctxFor = guide => {
    const nums = new Map(guide.steps.map((st, i) => [st.key, i + 1]))
    return { step: key => nums.has(key) ? { text: `Step ${nums.get(key)}`, anchor: `${guide.os}_step_${nums.get(key)}` } : null, nums }
  }
  const [ios, android] = G.guides
  const ask = G.intro.lead.replace(/^\*\*What we're asking you to do:\*\*\s*/, '')

  // ---- the first page: what this is, which guide, what to have ready
  body.push(...k.titleBlock('Guide for families', GUIDE.title, 'If your child has a smartphone, this guide shows you how to set it up so it only has a short list of apps and websites. Most families take 25 to 40 minutes.', 'start'))
  body.push(k.titledBox('What we\'re asking', [ask.charAt(0).toUpperCase() + ask.slice(1), ...G.intro.text], k.A.ask), k.space(80))

  body.push(k.H2('Which guide is yours?'))
  body.push(k.P('It depends only on your child\'s phone. Your own phone can be anything.', { after: 140 }))
  body.push(k.pair(
    { title: 'Your child has an iPhone', fill: C.sky, paras: [ios.time + '.', k.P('[Go to the iPhone guide](#ios_guide)', { bold: true, after: 40 })] },
    { title: 'Your child has an Android phone', fill: C.mint, paras: ['Samsung, Google Pixel, Motorola, Xiaomi and others. ' + android.time + '.', k.P('[Go to the Android guide](#android_guide)', { bold: true, after: 40 })] }
  ), k.space(80))

  body.push(k.H2('Before you start: four things to have ready'))
  body.push(...k.bullets(G.intro.before), k.space(40))
  body.push(k.box([k.P(G.intro.beforeWarn, { after: 40 })], C.lemon, { bar: 'E0A800' }), k.space(160))
  body.push(k.titledBox(G.yourself.title, G.yourself.text, C.peach), k.space(140))
  body.push(k.P(G.intro.moreDevices, { after: 100 }))
  body.push(k.P(`**Stuck at any point?** Email ${G.EMAIL}, or watch the how-to videos on the study website. There's more help [at the end of this guide](#good_to_know).`))

  // ---- each guide
  for (const guide of G.guides) {
    const ctx = ctxFor(guide)
    body.push(k.pageBreak())
    body.push(k.H1(guide.title, `${guide.os}_guide`))
    body.push(k.P(guide.lead, { size: SIZE.lead, color: C.grey, after: 60, ctx }))
    body.push(k.P(guide.time + '.', { color: C.grey, italics: true, after: 160 }))
    if (guide.os === 'android') body.push(k.box([k.P(G.intro.androidNote, { after: 40 })], C.sky), k.space(120))

    const sf = guide.startFrom
    body.push(k.H2(sf.title))
    body.push(k.P(sf.text, { after: 120 }))
    body.push(k.table(['Where you are', 'Start at'], sf.rows.map(r => [r.have, `**[[step:${r.go}]]**: ${guide.steps[ctx.nums.get(r.go) - 1].title}`]), [0.58, 0.42], { ctx }), k.space(100))
    body.push(k.P(sf.after, { after: 100, ctx }))

    const parts = [...new Set(guide.steps.map(s => s.part))]
    parts.forEach(p => {
      body.push(k.H2(guide.parts[p].title, `${guide.os}_part_${p}`))
      body.push(k.P(guide.parts[p].text, { color: C.grey, after: p === 'connect' && guide.partOneLink ? 40 : 100, ctx }))
      if (p === 'connect' && guide.partOneLink) body.push(k.P(`[${guide.partOneLink}](#${guide.os}_compare)`, { after: 100 }))
      guide.steps.forEach((st, i) => { if (st.part === p) body.push(...stepBlock(k, st, i + 1, guide, ctx)) })
    })
    body.push(k.space(120), k.titledBox('That\'s it. Thank you!', `In about a week, we'll ask you to share a screenshot of your child's screen time on the study website. Then once a month after that.`, C.mint))
    body.push(k.P(`[Back to the start](#start) · ${guide.os === 'ios' ? '[Go to the Android guide](#android_guide)' : '[Go to the iPhone guide](#ios_guide)'}`, { before: 120, size: SIZE.small }))
  }

  // ---- the end: the longer explanations, linked from Part 1
  body.push(k.pageBreak())
  body.push(k.H1('Good to know', 'good_to_know'))
  const c = ios.compare
  const ictx = ctxFor(ios)
  body.push(k.H2(`iPhone: ${c.title.charAt(0).toLowerCase() + c.title.slice(1)}`, 'ios_compare'))
  body.push(k.P(c.text, { after: 120 }))
  body.push(k.table(c.cols.map((x, i) => i ? x : ''), c.rows.map(r => [`**${r[0]}**`, r[1], r[2]]), [0.3, 0.35, 0.35], { ctx: ictx }), k.space(100))
  body.push(k.P('[Back to Part 1 of the iPhone guide](#ios_part_connect)', { size: SIZE.small }))

  const sc = android.shortcut
  const actx = ctxFor(android)
  body.push(k.H2(`Android: ${sc.title.charAt(0).toLowerCase() + sc.title.slice(1)}`, 'android_compare'))
  sc.text.forEach(t => body.push(k.P(t, { after: 100, ctx: actx })))
  body.push(k.P('[Back to Part 1 of the Android guide](#android_part_connect)', { size: SIZE.small }))

  body.push(k.H2(G.intro.optional.title))
  G.intro.optional.text.forEach(t => body.push(k.P(t, { after: 100 })))

  body.push(k.H2('If you get stuck'))
  body.push(...k.bullets([
    `**Email us** at ${G.EMAIL}. We reply within 5 working days.`,
    '**Watch the how-to videos** on the study website. They show every step on a real phone.',
    '**If a step doesn\'t match your phone**, it may have changed after an update. Tell us which step on the Help page of the study website, and we\'ll help you and fix the guide for everyone.',
    '**If your child gets round the settings**, or gets a new phone, it happens. Please stay in the study, let us know, and set it up again. It\'s quicker the second time.'
  ]))
  body.push(new Paragraph({ children: runs(R.RUN_BY, { size: SIZE.small, color: C.grey }), spacing: { before: 280 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.line, space: 8 } } }))
  return body
}

function stepBlock (k, st, n, guide, ctx) {
  const ch = []
  ch.push(k.H3([new TextRun({ text: `Step ${n}   `, font: FONT, color: k.A.text }), new TextRun({ text: st.title, font: FONT })], `${guide.os}_step_${n}`))
  ch.push(k.P(`${st.time} · on ${st.device}`, { color: C.grey, size: SIZE.small, after: 120, keepNext: true }))
  if (st.skip) {
    ch.push(k.box([
      k.P(st.skip.text, { after: 60, ctx }),
      k.P(`[${st.skip.button} →](#${guide.os}_step_${ctx.nums.get(st.skip.to)})`, { bold: true, after: 20 })
    ], C.sky, { bar: C.link }), k.space(100))
  }
  if (st.already) ch.push(k.box([k.P(st.already, { after: 20, ctx })], C.mint, { bar: C.teal }), k.space(120))
  if (st.intro) ch.push(k.P(st.intro, { after: 100, ctx }))
  ch.push(...k.numbered(st.items || [], { ctx }))
  ;(st.after || []).forEach(a => ch.push(k.P(a, { before: 60, after: 80, ctx })))
  if (st.list) {
    const d = G.allowlist.discretion
    ch.push(k.space(60), k.titledBox(d.title, d.text, C.sky, { ctx }), k.space(80))
  }
  if (st.warn) ch.push(k.space(40), k.box([k.P(st.warn, { after: 20, ctx })], C.lemon, { bar: 'E0A800' }), k.space(80))
  if (st.check) ch.push(k.space(40), k.box([k.P(st.check, { after: 20, ctx })], C.mint, { bar: C.teal }), k.space(80))
  if (st.screens && st.screens.length) ch.push(k.space(80), screensTable(k, st.screens))
  ch.push(k.P('☐  I\'ve done this step', { color: C.grey, size: SIZE.small, before: 40, after: 200 }))
  return ch
}

// ------------------------------------------------------------------ covers
// Each cover is drawn as a web page and saved as one image. A band in the audience's
// colour says who it's for; below it, the kind of document, its title, what it's
// about and an illustration; at the bottom, the dates and who runs the study.
async function coverImages (list) {
  const { chromium } = require('playwright')
  const font = w => `@font-face{font-family:Nunito;font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(require.resolve(`@fontsource/nunito/files/nunito-latin-${w}-normal.woff2`)).toString('base64')}) format('woff2')}`
  const svgData = f => 'data:image/svg+xml;base64,' + fs.readFileSync(out(f)).toString('base64')
  const hexc = c => '#' + c
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {})
  const page = await browser.newPage({ viewport: { width: COVER.w, height: COVER.h }, deviceScaleFactor: 3 })
  const images = new Map()
  for (const cv of list) {
    const A = ACCENT[cv.accent]
    const kind = A.text === C.navy ? C.coral : A.text
    await page.setContent(`<!doctype html><html><head><style>
      ${[400, 700, 800, 900].map(font).join('')}
      *{box-sizing:border-box;margin:0}
      body{width:${COVER.w}px;height:${COVER.h}px;font-family:Nunito;background:#fff}
      .card{height:100%;display:flex;flex-direction:column;border-radius:22px;overflow:hidden;background:${hexc(C.cream)}}
      .top{background:${hexc(A.band)};padding:34px 40px 38px}
      .brand{display:flex;align-items:center;gap:14px;color:#fff;font-weight:800;font-size:15px;letter-spacing:.14em}
      .disc{width:46px;height:46px;border-radius:50%;background:#fff;display:grid;place-items:center}
      .disc img{width:32px;height:32px}
      .for{margin-top:30px;color:${hexc(A.label)};font-weight:900;font-size:33px;letter-spacing:.05em;line-height:1.1}
      .body{flex:1;padding:52px 40px 0;display:flex;flex-direction:column}
      .kind{color:${hexc(kind)};font-weight:800;font-size:15px;letter-spacing:.16em}
      h1{margin-top:12px;color:${hexc(C.navy)};font-weight:900;font-size:50px;line-height:1.04;letter-spacing:-.01em}
      p{margin-top:18px;color:${hexc(C.grey)};font-size:19px;line-height:1.4;max-width:520px}
      .art{flex:1;display:grid;place-items:center;padding:20px 0 30px}
      .art img{width:430px;max-height:100%}
      .bottom{background:${hexc(A.band)};color:#fff;padding:22px 40px 24px}
      .bottom b{display:block;font-weight:800;font-size:16px}
      .bottom span{display:block;margin-top:4px;font-size:12px;opacity:.95}
    </style></head><body><div class="card">
      <div class="top"><div class="brand"><span class="disc"><img src="${svgData('assets/images/logo-mark.svg')}" alt=""></span>THE SMART STUDY</div><div class="for">${cv.audience.toUpperCase()}</div></div>
      <div class="body"><div class="kind">${cv.kind.toUpperCase()}</div><h1>${cv.title.replace(/'/g, '&rsquo;')}</h1><p>${cv.what.replace(/'/g, '&rsquo;')}</p>
        <div class="art"><img src="${svgData(`assets/images/illustrations/${cv.illustration}.svg`)}" alt=""></div></div>
      <div class="bottom"><b>${R.START} to ${R.END}</b><span>${R.RUN_BY}</span></div>
    </div></body></html>`, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    images.set(cv.title, await page.screenshot({ type: 'png', omitBackground: true }))
  }
  await browser.close()
  return images
}

// ------------------------------------------------------------------ PDF (LibreOffice, with Nunito from the repo)
function toPdf (docx) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'smart-docs-'))
  const conf = path.join(tmp, 'fonts.conf')
  fs.writeFileSync(conf, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${out('assets/fonts/ttf')}</dir><include ignore_missing="yes">/etc/fonts/fonts.conf</include><cachedir>${tmp}/cache</cachedir></fontconfig>`)
  const pdf = docx.replace(/\.docx$/, '.pdf')
  fs.rmSync(pdf, { force: true })
  execFileSync(process.env.SOFFICE || 'soffice', [`-env:UserInstallation=file://${tmp}/profile`, '--headless', '--convert-to', 'pdf', '--outdir', path.dirname(docx), docx], { env: { ...process.env, FONTCONFIG_FILE: conf }, stdio: 'pipe' })
  fs.rmSync(tmp, { recursive: true, force: true })
  // LibreOffice exits cleanly even when it can't read the file, so check for the PDF
  if (!fs.existsSync(pdf)) throw new Error(`LibreOffice couldn't convert ${path.basename(docx)}`)
}

// ------------------------------------------------------------------ run
;(async () => {
  const sharp = require('sharp')
  const logoSvg = fs.readFileSync(out('assets/images/logo-mark.svg'), 'utf8')
  const logo = await sharp(Buffer.from(logoSvg)).resize(192, 192).png().toBuffer()
  const covers = await coverImages([...O.packs.map(p => ({ ...p.cover, accent: p.accent })), { ...GUIDE.cover, accent: 'parents' }])
  const cover = cv => ({ ...cv, image: covers.get(cv.title) })
  await loadScreens()
  const docs = []
  for (const pack of O.packs) {
    const k = kit(pack.accent, pack.name, logo)
    // a bookmark at the top, for "Back to the start"
    docs.push({ file: `exports/SMART-onboarding-pack-${pack.id}.docx`, buf: await k.pack(packBody(pack, k), { title: `The SMART Study: ${pack.name.toLowerCase()}`, short: pack.name, footer: 'The SMART Study · ' + pack.name, description: pack.lead, cover: cover(pack.cover) }) })
  }
  {
    const k = kit('parents', GUIDE.title, logo)
    const body = guidanceBody(k)
    docs.push({ file: `exports/${GUIDE.file}.docx`, buf: await k.pack(body, { title: `The SMART Study: ${GUIDE.title.toLowerCase()}`, short: 'Guide for families', footer: 'The SMART Study · ' + GUIDE.title, description: 'How to set up your child\'s iPhone or Android phone for the SMART Study.', cover: cover(GUIDE.cover) }) })
  }
  // Drop the ZIP's folder entries: Word has refused files that have them when
  // opened through a cloud co-editing service
  const JSZip = require('jszip')
  for (const d of docs) {
    // (copy the files into a new archive: JSZip's remove() on a folder removes what's in it too)
    const src = await JSZip.loadAsync(d.buf)
    const zip = new JSZip()
    // the package's own parts first, as Word writes them
    const names = Object.keys(src.files).filter(n => !src.files[n].dir)
    const first = ['[Content_Types].xml', '_rels/.rels']
    for (const name of [...first.filter(n => names.includes(n)), ...names.filter(n => !first.includes(n))]) {
      let data = await src.files[name].async('nodebuffer')
      // docx gives every picture the inner id 0; give each the id of its drawing
      if (/^word\/(document|header\d+|footer\d+)\.xml$/.test(name)) {
        data = Buffer.from(data.toString('utf8').replace(/(<wp:docPr id="(\d+)"[^>]*\/>(?:(?!<wp:docPr).)*?)<pic:cNvPr id="0" name="" descr=""\/>/gs, (m, pre, id) => `${pre}<pic:cNvPr id="${id}" name="Picture ${id}"/>`), 'utf8')
      }
      zip.file(name, data, { createFolders: false })
    }
    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    if (!(await JSZip.loadAsync(buf)).file('word/document.xml')) throw new Error(`${d.file}: the Word file came out empty`)
    fs.writeFileSync(out(d.file), buf)
  }
  console.log(`${docs.length} Word documents written`)
  if (process.argv.includes('--no-pdf')) return
  for (const d of docs) toPdf(out(d.file))
  console.log(`${docs.length} PDFs written`)
})().catch(e => { console.error(e); process.exit(1) })
