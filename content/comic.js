/*
 * "The Off-Grid Gang": chapter 1 (opener + 3 pages).
 *
 * Each page is a function that returns SVG, drawn with tools/comic-kit.js.
 * Each page also has a plain-text version, shown on the site for screen
 * readers and for reading aloud together.
 *
 * Built by `npm run build:comic`.
 */
const K = require('../tools/comic-kit')
const { C, INK, txt, bubble, caption, sfx, panel, fill, speedLines, burst, figure, maisie, bit, hiddenPixel, school, tree, bench, cloud, skyline, scrollBeast, head } = K

const W = 800
const H = 1200

const series = {
  title: 'The Off-Grid Gang',
  chapters: 12,
  pagesPerChapter: 3
}

// ------------------------------------------------------------------ opener: rules of the game
function opener () {
  let s = ''
  // Header
  s += panel(28, 28, 744, 300,
    fill(28, 28, 744, 300, C.skyDeep) + speedLines(400, 178, 60, 520, 40, '#FFF', 0.25) + burst(400, 178, 210, C.coral, 18) +
    txt(400, 128, 'THE', { font: 'Bangers', size: 44, fill: '#FFF', stroke: INK, sw: 8, anchor: 'middle', ls: 4 }) +
    txt(400, 214, 'OFF-GRID GANG', { font: 'Bangers', size: 104, fill: C.yellow, stroke: INK, sw: 12, anchor: 'middle', ls: 3, rotate: -3 }) +
    caption(200, 262, 400, 'A SMART Study story in 12 chapters', { size: 18 }) +
    bit(690, 96, { scale: 0.8, mood: 'happy', arms: 'up' }) + hiddenPixel(60, 300))
  // Meet the gang
  const cast = [
    ['KOFI', 'Joke machine. Says "6-7" a LOT.', x => figure('kofi', x, 690, { scale: 0.86, pose: 'six7', expr: 'grin' })],
    ['PRIYA', 'Inventor. No phone yet, and no plans to rush.', x => figure('priya', x, 690, { scale: 0.86, pose: 'hips', expr: 'smirk', prop: 'notebook' })],
    ['MAISIE', 'Fastest wheels in Year 6.', x => maisie(x, 690, { scale: 0.86, pose: 'cheer', expr: 'grin' })],
    ['TOMASZ', 'Draws everything. Says very little.', x => figure('tomasz', x, 690, { scale: 0.86, pose: 'down', expr: 'happy', prop: 'sketchbook' })],
    ['BIT', 'A lost pixel. Hungry for adventure.', x => bit(x, 590, { scale: 0.95, mood: 'happy', arms: 'up' })]
  ]
  let inner = fill(28, 342, 744, 458, '#BDF0DE') + txt(400, 398, 'MEET THE GANG', { font: 'Bangers', size: 44, fill: '#FFF', stroke: INK, sw: 8, anchor: 'middle', ls: 3 })
  cast.forEach(([name, line, draw], i) => {
    const x = 100 + i * 150
    inner += draw(x)
    inner += `<rect x="${x - 66}" y="702" width="132" height="86" rx="8" fill="#FFF" stroke="${INK}" stroke-width="3.5"/>`
    inner += txt(x, 730, name, { font: 'Bangers', size: 26, anchor: 'middle', ls: 1.5, fill: [C.coral, C.purple, C.teal, '#3E6FB0', '#B06BFF'][i] })
    K.wrap(line, 13.5, 118).forEach((l, k) => { inner += txt(x, 750 + k * 15, l, { size: 13.5, anchor: 'middle', weight: 700 }) })
  })
  s += panel(28, 342, 744, 458, inner)
  // Rules
  const rules = [
    'This story lasts 12 months, the same as the SMART Study.',
    'Every newsletter unlocks 3 new pages. Ask your grown-up to show you!',
    'Keep your phone settings on. No phone yet? Keep it that way! The Gang is counting on you.',
    'Bit has lost a pixel. Spot it hiding on every page!'
  ]
  let r = fill(28, 814, 744, 358, C.yellow) + txt(400, 868, 'RULES OF THE GAME', { font: 'Bangers', size: 46, fill: C.coral, stroke: INK, sw: 8, anchor: 'middle', ls: 3 })
  let y = 900
  rules.forEach((rule, i) => {
    r += burst(78, y + 22, 26, ['#FFF', '#BDF0DE', '#D9CCFF', '#FFD1C7'][i], 10) + txt(78, y + 32, String(i + 1), { font: 'Bangers', size: 30, anchor: 'middle' })
    const lines = K.wrap(rule, 20, 600)
    lines.forEach((l, k) => { r += txt(122, y + 22 + k * 24 - (lines.length - 1) * 10, l, { size: 20 }) })
    y += 62
  })
  r += `<rect x="${738 - 9}" y="1150" width="9" height="9" fill="#FF4FD8" stroke="${INK}" stroke-width="1.6"/>`
  r += txt(712, 1152, 'Chapter 1 starts on the next page →', { size: 16, anchor: 'end' })
  s += panel(28, 814, 744, 358, r)
  return s
}

// ------------------------------------------------------------------ page 1
function page1 () {
  let s = ''
  // P1: playground
  let p = fill(28, 28, 744, 470, 'url(#skyDay)', 'dotsLight') + cloud(90, 150, 0.9) + cloud(560, 110, 0.7)
  p += school(110, 230, 560)
  p += `<rect x="28" y="380" width="744" height="120" fill="${C.tarmac}" stroke="${INK}" stroke-width="3.5"/>`
  p += `<path d="M120 470 h50 v-30 h-50 z M170 470 h50 v-30 h-50 z M145 440 h50 v-30 h-50 z" fill="none" stroke="#FFF" stroke-width="4"/>`
  p += speedLines(820, 360, 120, 330, 22, '#FFF', 0.65)
  p += figure('priya', 200, 488, { scale: 0.95, look: 1, expr: 'happy' })
  p += maisie(330, 488, { scale: 0.9, look: 1, expr: 'happy' })
  p += figure('tomasz', 460, 488, { scale: 0.95, look: 1, expr: 'happy', prop: 'sketchbook' })
  p += figure('kofi', 650, 492, { scale: 1.05, look: -1, expr: 'grin', pose: 'wave', prop: 'phone' })
  p += `<rect x="40" y="40" width="430" height="52" fill="${C.yellow}" stroke="${INK}" stroke-width="3.5"/>` + txt(56, 80, 'CHAPTER 1: SIX... SEVEN?!', { font: 'Bangers', size: 38, ls: 1.5 })
  p += caption(40, 100, 330, 'Brookfield Primary. Monday, 8:52am.', { fill: '#FFF' })
  p += bubble(436, 118, 280, 'Guys! GUYS!! My mum set up my phone last night!', [640, 270], { shout: true }).svg
  p += hiddenPixel(735, 470)
  s += panel(28, 28, 744, 470, p)
  // P2: Priya close-up
  p = fill(28, 512, 365, 330, '#D9CCFF') + figure('priya', 210, 1046, { scale: 1.9, look: 1, expr: 'smirk' })
  p += bubble(44, 528, 200, 'Let me guess. Restrictions?', [170, 650]).svg
  s += panel(28, 512, 365, 330, p)
  // P3: Kofi close-up with phone
  p = fill(407, 512, 365, 330, '#FFC9A8') + figure('kofi', 610, 1046, { scale: 1.9, look: -1, expr: 'talk', pose: 'hold', prop: 'phone' })
  p += bubble(420, 528, 230, 'Yep. Now I\'ve only got, like... 6-7 apps.', [560, 660]).svg
  s += panel(407, 512, 365, 330, p)
  // P4: SIX SEVEN!
  p = fill(28, 856, 744, 316, '#FF9EB5') + speedLines(400, 1010, 40, 500, 36, '#FFF', 0.5)
  p += maisie(110, 1210, { scale: 0.92, pose: 'cheer', expr: 'grin' })
  p += figure('tomasz', 260, 1205, { scale: 0.92, pose: 'cheer', expr: 'grin', look: 1 })
  p += figure('kofi', 470, 1205, { scale: 0.95, pose: 'six7', expr: 'grin' })
  p += figure('priya', 660, 1205, { scale: 0.92, pose: 'facepalm', expr: 'sheepish', look: -1 })
  p += sfx(215, 940, 'SIX SEVEN!!', { size: 74, rotate: -8 })
  p += bubble(548, 868, 210, 'It\'s literally seven. I counted.', [500, 990]).svg
  s += panel(28, 856, 744, 316, p)
  return s
}

// ------------------------------------------------------------------ page 2
function page2 () {
  let s = ''
  // P1: park after school
  let p = fill(28, 28, 744, 360, 'url(#skySunset)', 'dotsLight')
  p += `<circle cx="640" cy="120" r="46" fill="${C.yellow}" stroke="${INK}" stroke-width="3.5"/>`
  p += tree(90, 300, 60) + tree(720, 290, 52)
  p += `<rect x="28" y="300" width="744" height="90" fill="${C.grass}" stroke="${INK}" stroke-width="3.5"/>`
  p += bench(300, 332, 200)
  p += maisie(150, 382, { scale: 0.78, look: 1, expr: 'happy' })
  p += figure('priya', 300, 380, { scale: 0.8, look: 1, expr: 'talk' })
  p += figure('kofi', 450, 380, { scale: 0.82, look: -1, expr: 'worried', pose: 'hold', prop: 'phone' })
  p += figure('tomasz', 610, 380, { scale: 0.8, look: -1, expr: 'happy', prop: 'sketchbook' })
  p += caption(40, 40, 300, 'After school. Brookfield Park.')
  p += bubble(360, 40, 210, 'Everything else is just... locked.', [452, 212]).svg
  p += bubble(60, 104, 230, 'I don\'t even HAVE a phone yet. Waiting till secondary.', [290, 222]).svg
  p += bubble(586, 100, 172, 'Lucky. Zero apps, zero drama.', [478, 222]).svg
  p += hiddenPixel(740, 360)
  s += panel(28, 28, 744, 360, p)
  // P2: phone glitch close-up
  p = fill(28, 402, 300, 330, '#3B3570')
  p += `<path d="M70 740 Q80 650 130 640 L220 640 Q262 650 270 740 Z" fill="${K.CAST.kofi.top}" stroke="${INK}" stroke-width="3.5"/>`
  p += `<rect x="108" y="460" width="128" height="230" rx="18" fill="#2B2B3A" stroke="${INK}" stroke-width="4"/><rect x="118" y="476" width="108" height="196" rx="8" fill="#8FE9FF"/>`
  ;[[130, 500], [180, 540], [150, 600], [200, 620], [140, 640]].forEach(([x, y], i) => { p += `<rect x="${x}" y="${y}" width="${14 + i * 2}" height="${14 + i * 2}" fill="${['#FF4FD8', '#5EF2FF', '#B06BFF', '#FFD23F', '#5EF2FF'][i]}" stroke="${INK}" stroke-width="2"/>` })
  ;[560, 592, 624].forEach(y => { p += `<rect x="222" y="${y}" width="30" height="24" rx="12" fill="${K.CAST.kofi.skin}" stroke="${INK}" stroke-width="3.5"/>` })
  p += `<rect x="92" y="600" width="30" height="62" rx="15" fill="${K.CAST.kofi.skin}" stroke="${INK}" stroke-width="3.5" transform="rotate(-18 107 631)"/>`
  p += `<path d="M118 690 Q170 724 226 690 L230 660 L110 660 Z" fill="${K.CAST.kofi.skin}" stroke="${INK}" stroke-width="3.5"/>`
  p += sfx(90, 470, 'bzzt', { size: 44, fill: '#5EF2FF', rotate: -12 })
  s += panel(28, 402, 300, 330, p)
  // P3: screen bursts
  p = fill(342, 402, 430, 330, '#FFF3B0') + speedLines(560, 580, 30, 360, 30, '#FFB000', 0.6)
  p += burst(560, 580, 120, '#FFFFFF', 16)
  ;[[480, 500], [620, 520], [520, 640], [650, 640], [600, 470], [470, 600]].forEach(([x, y], i) => { p += `<rect x="${x}" y="${y}" width="22" height="22" fill="${['#FF4FD8', '#5EF2FF', '#B06BFF', '#FFD23F', '#5EF2FF', '#FF4FD8'][i]}" stroke="${INK}" stroke-width="2.5" transform="rotate(${i * 17} ${x + 11} ${y + 11})"/>` })
  p += head('kofi', 380, 690, 46, 'shock', 1) + head('priya', 735, 690, 46, 'shock', -1)
  p += sfx(560, 600, 'BZZZZT!', { size: 66, fill: C.coral, rotate: 6 })
  s += panel(342, 402, 430, 330, p)
  // P4: Bit appears
  p = fill(28, 746, 744, 426, '#C9F4FF') + speedLines(400, 920, 70, 560, 48, '#FFF', 0.85)
  p += figure('kofi', 110, 1230, { scale: 1.05, look: 1, expr: 'shock', pose: 'shrug' })
  p += figure('priya', 250, 1250, { scale: 1, look: 1, expr: 'shock' })
  p += maisie(560, 1250, { scale: 1, look: -1, expr: 'shock', flip: true })
  p += figure('tomasz', 700, 1240, { scale: 1.02, look: -1, expr: 'shock', prop: 'sketchbook' })
  p += bit(400, 930, { scale: 1.7, mood: 'happy', arms: 'up' })
  p += bubble(220, 762, 360, 'FINALLY!! Do you know how long I\'ve been stuck in there?!', [380, 860], { shout: true }).svg
  p += bubble(586, 950, 176, 'Did your phone just... sneeze?', [580, 1030]).svg
  p += hiddenPixel(44, 1150)
  s += panel(28, 746, 744, 426, p)
  return s
}

// ------------------------------------------------------------------ page 3
function page3 () {
  let s = ''
  // P1: Bit explains the Endless Scroll
  let p = fill(28, 28, 430, 340, '#E8DDFF') + bit(110, 290, { scale: 1.1, mood: 'talk' })
  p += `<circle cx="300" cy="230" r="98" fill="#FFF" stroke="${INK}" stroke-width="3.5"/><circle cx="185" cy="292" r="10" fill="#FFF" stroke="${INK}" stroke-width="3"/><circle cx="168" cy="310" r="6" fill="#FFF" stroke="${INK}" stroke-width="3"/>`
  p += scrollBeast(300, 236, 70, 'sleepy')
  p += bubble(44, 40, 300, 'I\'m Bit! I got lost in the Endless Scroll. Videos, then more videos, then MORE videos...', [100, 230]).svg
  p += sfx(330, 352, '6-7 HOURS A DAY!', { size: 34, fill: '#FF9EB5', rotate: -4 })
  s += panel(28, 28, 430, 340, p)
  // P2: Kofi sheepish
  p = fill(472, 28, 300, 340, '#FFC9A8') + figure('kofi', 622, 600, { scale: 1.7, look: -1, expr: 'sheepish' })
  p += bubble(486, 44, 220, 'Okay... that\'s a bit close to home.', [600, 170]).svg
  s += panel(472, 28, 300, 340, p)
  // P3: Bit is weak
  p = fill(28, 382, 365, 320, '#C9D6DD') + bit(210, 590, { scale: 1.3, mood: 'weak' })
  p += bubble(44, 398, 330, 'When your apps got locked, a door opened and I escaped. But my glow is nearly gone...', [200, 530]).svg
  p += txt(300, 660, 'flicker', { font: 'Bangers', size: 26, fill: '#FFF', stroke: INK, sw: 5, rotate: 10 })
  s += panel(28, 382, 365, 320, p)
  // P4: Priya: recharge?
  p = fill(407, 382, 365, 320, '#BDF0DE') + figure('priya', 560, 900, { scale: 1.7, look: 1, expr: 'talk', prop: 'notebook' })
  p += bit(712, 640, { scale: 0.6, mood: 'shock' })
  p += bubble(420, 398, 220, 'So how do we recharge you? Plug you in?', [540, 520]).svg
  p += bubble(640, 520, 110, 'NO!!', [700, 600], { shout: true, size: 22 }).svg
  s += panel(407, 382, 365, 320, p)
  // P5: real stuff
  p = fill(28, 716, 744, 270, C.yellow) + speedLines(400, 870, 40, 460, 34, '#FFF', 0.6)
  p += figure('tomasz', 120, 1080, { scale: 1.05, look: 1, expr: 'smirk', prop: 'sketchbook' })
  p += figure('kofi', 680, 1080, { scale: 1.05, look: -1, expr: 'shock', pose: 'shrug' })
  p += bit(400, 900, { scale: 1.1, mood: 'happy', arms: 'up' })
  p += bubble(240, 736, 330, 'I need REAL stuff! Adventures! Friends! Fresh air! Jokes that aren\'t memes!', [400, 860], { shout: true, size: 18 }).svg
  p += bubble(196, 896, 150, 'That last one\'ll be tough for Kofi.', [160, 900], { size: 16 }).svg
  p += bubble(560, 900, 84, 'HEY!', [640, 900], { size: 22 }).svg
  s += panel(28, 716, 744, 270, p)
  // P6: meanwhile...
  p = fill(28, 1000, 744, 172, 'url(#skyNight)', 'dotsLight')
  ;[[80, 1030], [200, 1060], [330, 1020], [700, 1040], [620, 1080]].forEach(([x, y]) => { p += `<circle cx="${x}" cy="${y}" r="2.5" fill="#FFF"/>` })
  p += skyline(28, 1180, 744)
  p += scrollBeast(560, 1070, 90, 'awake')
  p += caption(40, 1012, 330, 'Meanwhile, deep in the Endless Scroll, something noticed the door was open...', { fill: '#FFF' })
  p += `<rect x="40" y="1112" width="300" height="48" fill="${C.coral}" stroke="${INK}" stroke-width="3.5"/>` + txt(190, 1146, 'TO BE CONTINUED!', { font: 'Bangers', size: 32, fill: '#FFF', stroke: INK, sw: 6, anchor: 'middle', ls: 2 })
  p += hiddenPixel(745, 1158)
  s += panel(28, 1000, 744, 172, p)
  return s
}

const pages = [
  {
    id: 'opener', title: 'How this comic works', draw: opener,
    text: [
      'Title: The Off-Grid Gang. A SMART Study story in 12 chapters. Bit, a small pixel creature, waves from the corner.',
      'Meet the gang. Kofi: joke machine, says "6-7" a lot. Priya: inventor, no phone yet, and no plans to rush. Maisie: fastest wheels in Year 6. Tomasz: draws everything, says very little. Bit: a lost pixel, hungry for adventure.',
      'Rules of the game. 1: This story lasts 12 months, the same as the SMART Study. 2: Every newsletter unlocks 3 new pages. Ask your grown-up to show you! 3: Keep your phone settings on. No phone yet? Keep it that way! The Gang is counting on you. 4: Bit has lost a pixel. Spot it hiding on every page!'
    ]
  },
  {
    id: 'page-1', title: 'Page 1', draw: page1,
    text: [
      'Chapter 1: Six... Seven?! Brookfield Primary, Monday, 8:52am. Priya, Maisie and Tomasz are in the playground. Kofi runs in, waving his phone. Kofi: "Guys! GUYS!! My mum set up my phone last night!"',
      'Priya, with a knowing smile: "Let me guess. Restrictions?"',
      'Kofi, holding up his phone: "Yep. Now I\'ve only got, like... 6-7 apps."',
      'Maisie and Tomasz throw their arms in the air: "SIX SEVEN!!" Kofi does the 6-7 hands. Priya facepalms. Kofi: "It\'s literally seven. I counted."'
    ]
  },
  {
    id: 'page-2', title: 'Page 2', draw: page2,
    text: [
      'After school, Brookfield Park. Kofi stares at his phone: "Everything else is just... locked." Priya: "I don\'t even HAVE a phone yet. Waiting till secondary." Kofi: "Lucky. Zero apps, zero drama."',
      'Close-up: Kofi\'s phone screen starts to glitch. Bzzt.',
      'The screen bursts with light and pixels. BZZZZT! Kofi and Priya jump back.',
      'A small glowing pixel creature, Bit, bursts out of the phone. Bit: "FINALLY!! Do you know how long I\'ve been stuck in there?!" Maisie: "Did your phone just... sneeze?"'
    ]
  },
  {
    id: 'page-3', title: 'Page 3', draw: page3,
    text: [
      'Bit, showing a swirl of video screens: "I\'m Bit! I got lost in the Endless Scroll. Videos, then more videos, then MORE videos... 6-7 HOURS A DAY!"',
      'Kofi, looking sheepish: "Okay... that\'s a bit close to home."',
      'Bit, grey and dim: "When your apps got locked, a door opened and I escaped. But my glow is nearly gone..."',
      'Priya, with her notebook: "So how do we recharge you? Plug you in?" Bit: "NO!!"',
      'Bit, arms up: "I need REAL stuff! Adventures! Friends! Fresh air! Jokes that aren\'t memes!" Tomasz: "That last one\'ll be tough for Kofi." Kofi: "HEY!"',
      'Night over the town. In the sky, the Endless Scroll swirls and opens its eyes. "Meanwhile, deep in the Endless Scroll, something noticed the door was open..." To be continued!'
    ]
  }
]

function renderPage (pg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${K.defs()}<rect width="${W}" height="${H}" fill="${C.paper}"/>${pg.draw()}` +
    txt(W - 30, H - 8, series.title + ' · Chapter 1 · ' + pg.title, { size: 11, anchor: 'end', fill: '#8A8A99', weight: 400 }) + '</svg>'
}

module.exports = { series, pages, renderPage, W, H }
