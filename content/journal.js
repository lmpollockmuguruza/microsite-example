/*
 * SMART Study – the Junior Scientist Journal (single source)
 *
 * A journal for children taking part, who we call Junior Scientists. They log
 * their feelings, thoughts and observations over the 12 months, stick in photos
 * of the month's highlights without a smartphone, and do the odd puzzle. One
 * chapter every three months, each sent with a reminder. At the end there's a
 * page for the Junior Scientist certificate (emailed, or printed by parents or
 * schools).
 *
 * `npm run build:docs` turns it into exports/SMART-junior-scientist-journal.docx|pdf
 * with a cover, and the cover as an SVG for Figma.
 *
 * Draft placeholder material for now: the words are short and meant to be
 * replaced. Blocks: chapter (starts a new page), h2, p, lines, fields, mood,
 * photos, draw, puzzle, certificate, note.
 */
const { START, END } = require('./resources')

const MOOD = [
  { icon: 'laugh', label: 'Great' },
  { icon: 'smile', label: 'Good' },
  { icon: 'meh', label: 'OK' },
  { icon: 'frown', label: 'Not great' },
  { icon: 'annoyed', label: 'Fed up' }
]

// One chapter for every three months; `due` is when the reminder goes out
const seasons = [
  { n: 1, name: 'Autumn', icon: 'leaf', months: ['September', 'October', 'November'], span: 'September to November 2027', due: 'December 2027',
    puzzle: [['PELES', 'SLEEP'], ['DIFNERS', 'FRIENDS'], ['OBKO', 'BOOK'], ['LAPY', 'PLAY']] },
  { n: 2, name: 'Winter', icon: 'snowflake', months: ['December', 'January', 'February'], span: 'December 2027 to February 2028', due: 'March 2028',
    puzzle: [['WONS', 'SNOW'], ['LIMAFY', 'FAMILY'], ['AGEM', 'GAME'], ['TEIK', 'KITE']] },
  { n: 3, name: 'Spring', icon: 'flower-2', months: ['March', 'April', 'May'], span: 'March to May 2028', due: 'June 2028',
    puzzle: [['WOLFER', 'FLOWER'], ['KRAP', 'PARK'], ['SEECCIN', 'SCIENCE'], ['DRIB', 'BIRD']] },
  { n: 4, name: 'Summer', icon: 'sun', months: ['June', 'July', 'August'], span: 'June to August 2028', due: 'September 2028',
    puzzle: [['HABEC', 'BEACH'], ['MIWS', 'SWIM'], ['CINIPC', 'PICNIC'], ['HITSCEST', 'SCIENTIST']] }
]

const chapter = s => [
  { type: 'chapter', icon: s.icon, label: `Chapter ${s.n}`, title: s.name, sub: `${s.span} · fill this in ${s.due}` },
  { type: 'p', text: '[Draft] Three months of being a Junior Scientist! Take ten minutes with your parent or carer to look back at what you\'ve noticed.' },
  { type: 'h2', icon: 'heart', text: 'How I\'ve been feeling' },
  { type: 'p', text: 'Circle the face that fits best.' },
  { type: 'mood' },
  { type: 'lines', label: 'Because…', n: 2 },
  { type: 'h2', icon: 'eye', text: 'My observations' },
  { type: 'p', text: 'Scientists write down what they notice. What have you noticed about your sleep, your friends, school or how you spend your time?' },
  { type: 'lines', n: 5 },
  { type: 'page' },
  { type: 'h2', icon: 'camera', text: 'Highlights of the season' },
  { type: 'p', text: 'Stick in a photo or draw something you did each month without a smartphone, with friends or family.' },
  { type: 'photos', months: s.months },
  { type: 'puzzle', title: 'Brain break: anagrams', text: 'Unscramble the letters to find the words. The answers are at the back.', words: s.puzzle.map(p => p[0]) }
]

module.exports = {
  id: 'junior-scientist-journal',
  name: 'Junior Scientist Journal',
  accent: 'children',
  sizes: 'children',
  file: 'SMART-junior-scientist-journal',
  cover: {
    audience: 'For Junior Scientists',
    kind: 'Journal',
    title: 'My Junior Scientist Journal',
    what: `Your feelings, thoughts and discoveries, from ${START} to ${END}.`,
    illustration: 'guide-delay',
    owner: 'This journal belongs to'
  },
  eyebrow: 'Junior Scientist Journal',
  title: 'Welcome, Junior Scientist!',
  lead: '[Draft] You\'re part of a real science study about children and phones. Scientists keep a journal to write down what they notice. This one is yours.',
  blocks: [
    { type: 'h2', icon: 'notebook-pen', text: 'How to use your journal' },
    { type: 'bullets', items: [
      'There\'s one chapter for every three months. We\'ll send your parent or carer a reminder when it\'s time to fill one in.',
      'Write, draw or stick things in. There are no right or wrong answers.',
      'Keep your journal somewhere safe. At the end, your Junior Scientist certificate goes on the last page.'
    ] },
    { type: 'h2', icon: 'flask-conical', text: 'About me' },
    { type: 'fields', items: ['My name', 'My school and class', 'My favourite thing to do'] },
    { type: 'draw', label: 'Draw yourself as a scientist', height: 3400 },
    { type: 'page' },
    { type: 'h2', icon: 'lightbulb', text: 'My prediction' },
    { type: 'p', text: 'Scientists make a guess before they start. It\'s called a prediction, or a hypothesis. What do you think the study will find? What might change for you this year?' },
    { type: 'lines', n: 5 },
    { type: 'h2', icon: 'heart', text: 'How I feel at the start' },
    { type: 'p', text: 'Circle the face that fits best.' },
    { type: 'mood' },
    { type: 'lines', label: 'Because…', n: 2 },
    ...seasons.flatMap(chapter),
    { type: 'chapter', icon: 'telescope', label: 'The end', title: 'Looking back', sub: `${END} · fill this in at the end of the study` },
    { type: 'h2', icon: 'lightbulb', text: 'Was my prediction right?' },
    { type: 'p', text: 'Look back at your prediction at the start of the journal. What happened?' },
    { type: 'lines', n: 4 },
    { type: 'h2', icon: 'sparkles', text: 'The best thing about this year' },
    { type: 'lines', n: 3 },
    { type: 'h2', icon: 'heart', text: 'How I feel now' },
    { type: 'mood' },
    { type: 'puzzle', title: 'Puzzle answers', answers: seasons.map(s => `**Chapter ${s.n}:** ${s.puzzle.map(p => p[1]).join(', ')}`) },
    { type: 'certificate', title: 'My Junior Scientist certificate', text: 'At the end of the study, you\'ll get a certificate to show you\'re a real Junior Scientist. Your parent or carer, or your school, can print it and stick it here.' }
  ],
  mood: MOOD
}
