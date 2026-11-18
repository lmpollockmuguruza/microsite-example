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
 * replaced. Blocks: chapter (starts a new page), page, h2, p, bullets, lines,
 * fields, mood, photos, draw, log, checklist, facts, puzzle (anagram, code,
 * missing, oddone, answers), teaser, certificate.
 */
const { START, END } = require('./resources')

const MOOD = [
  { icon: 'laugh', label: 'Great' },
  { icon: 'smile', label: 'Good' },
  { icon: 'meh', label: 'OK' },
  { icon: 'frown', label: 'Not great' },
  { icon: 'annoyed', label: 'Fed up' }
]

// One chapter ("issue") for every three months; `due` is when the reminder goes out.
// Each issue has its own season: an introduction, a seasonal question, a science
// challenge, a different kind of puzzle, and a peek at the next issue. Special
// days are written so they fit every family: whatever you celebrate, or nothing.
const seasons = [
  {
    n: 1, name: 'Autumn', icon: 'leaf', months: ['September', 'October', 'November'], span: 'September to November 2027', due: 'December 2027',
    intro: '[Draft] Your first issue! A new school year, darker evenings and crunchy leaves. This is where your science begins.',
    prompt: { icon: 'backpack', title: 'A new school year', text: 'What\'s new this year? A new class, a new teacher, new friends, a new club? What are you looking forward to?' },
    challenge: {
      icon: 'moon', title: 'Science challenge: the sleep scientist',
      text: 'Scientists collect data. For one week, write down when you went to bed, when you woke up and how you felt in the morning.',
      log: { cols: ['Night', 'Went to bed', 'Woke up', 'In the morning I felt…'], rows: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], widths: [0.14, 0.2, 0.2, 0.46] }
    },
    puzzle: { kind: 'anagram', title: 'Brain break: anagrams', text: 'Unscramble the letters to find the words.', items: [['PELES', 'SLEEP'], ['DIFNERS', 'FRIENDS'], ['OBKO', 'BOOK'], ['LAPY', 'PLAY']] },
    next: 'In your next issue: a secret code to crack, and the winter break challenge.'
  },
  {
    n: 2, name: 'Winter', icon: 'snowflake', months: ['December', 'January', 'February'], span: 'December 2027 to February 2028', due: 'March 2028',
    intro: '[Draft] Cold mornings, cosy evenings and a break from school. Halfway to being a fully fledged Junior Scientist!',
    prompt: { icon: 'calendar-heart', title: 'Special days', text: 'Families do different things at this time of year: a festival, a birthday, a trip, or a quiet day at home. What did you do over the winter break?' },
    challenge: {
      icon: 'list-checks', title: 'Science challenge: the winter break challenge',
      text: 'Tick off the ones you try over the winter. Add your own at the end.',
      checklist: ['Build something: a den, a model, a snow sculpture', 'Play a board game or card game with someone', 'Help to cook or bake something', 'Make a card or a drawing for someone', 'Go for a walk and spot three things you\'ve never noticed', 'Learn a new game, a trick or a joke', 'Something my family likes to do at this time of year:']
    },
    puzzle: { kind: 'code', title: 'Brain break: crack the code', text: 'Each letter has a number: A = 1, B = 2, C = 3, and so on to Z = 26. What does the message say?', message: 'YOU ARE A STAR SCIENTIST' },
    next: 'In your next issue: a nature watch, and a missing-letters puzzle.'
  },
  {
    n: 3, name: 'Spring', icon: 'flower-2', months: ['March', 'April', 'May'], span: 'March to May 2028', due: 'June 2028',
    intro: '[Draft] Lighter evenings, things starting to grow, and maybe a spring break. What will you discover this time?',
    prompt: { icon: 'sprout', title: 'Growing', text: 'Plants grow in spring, and so do you! What\'s something you\'ve got better at since the start of the study?' },
    challenge: {
      icon: 'binoculars', title: 'Science challenge: nature watch',
      text: 'Spend 15 minutes outside: in a garden, a park, or on the way to school. Make a tally mark each time you spot one.',
      log: { cols: ['I spotted…', 'Tally', 'The most interesting one'], rows: ['Birds', 'Insects and bugs', 'Flowers', 'Trees with buds or blossom', 'Something else:'], widths: [0.3, 0.35, 0.35] }
    },
    puzzle: { kind: 'missing', title: 'Brain break: missing letters', text: 'Fill in the missing letters. Clue: they\'re all things you might see in spring.', items: [['F_O_E_', 'FLOWER'], ['_AI_', 'RAIN'], ['B_R_', 'BIRD'], ['S_E_D', 'SEED']] },
    next: 'In your next issue: the boredom experiment, and odd one out.'
  },
  {
    n: 4, name: 'Summer', icon: 'sun', months: ['June', 'July', 'August'], span: 'June to August 2028', due: 'September 2028',
    intro: '[Draft] Long days and the summer holidays. Your last issue before you become a fully fledged Junior Scientist!',
    prompt: { icon: 'house', title: 'The summer holidays', text: 'What did you do this summer? A trip away, days out, or time at home and in the park all count.' },
    challenge: {
      icon: 'hourglass', title: 'Science challenge: the boredom experiment',
      text: 'Some scientists think feeling bored can help us come up with new ideas. Next time you feel bored, wait ten minutes before doing anything. What did you end up doing?',
      log: { cols: ['When', 'What I ended up doing', 'Was it fun?'], rows: ['', '', ''], widths: [0.2, 0.55, 0.25] }
    },
    puzzle: { kind: 'oddone', title: 'Brain break: odd one out', text: 'Circle the word that doesn\'t belong in each row.', items: [[['beach', 'sandcastle', 'snowman', 'shells'], 'snowman'], [['apple', 'banana', 'carrot', 'pear'], 'carrot'], [['football', 'tennis', 'netball', 'chess'], 'chess'], [['cat', 'dog', 'rabbit', 'tulip'], 'tulip']] },
    next: 'Next: looking back over your year, and your Junior Scientist certificate!'
  }
]

const chapter = s => [
  { type: 'chapter', icon: s.icon, label: `Issue ${s.n}`, title: s.name, sub: `${s.span} · fill this in ${s.due}` },
  { type: 'p', text: s.intro },
  { type: 'h2', icon: 'heart', text: 'How I\'ve been feeling' },
  { type: 'p', text: 'Circle the face that fits best.' },
  { type: 'mood' },
  { type: 'lines', label: 'Because…', n: 2 },
  { type: 'h2', icon: s.prompt.icon, text: s.prompt.title },
  { type: 'p', text: s.prompt.text },
  { type: 'lines', n: 2 },
  { type: 'h2', icon: 'eye', text: 'My observations' },
  { type: 'p', text: 'What have you noticed about your sleep, your friends, school or how you spend your time?' },
  { type: 'lines', n: 3 },
  { type: 'page' },
  { type: 'h2', icon: s.challenge.icon, text: s.challenge.title },
  { type: 'p', text: s.challenge.text },
  s.challenge.log ? { type: 'log', ...s.challenge.log } : { type: 'checklist', items: s.challenge.checklist },
  { type: 'puzzle', ...s.puzzle },
  { type: 'page' },
  { type: 'h2', icon: 'camera', text: `Highlights of ${s.name.toLowerCase()}` },
  { type: 'p', text: 'Stick in a photo or draw something you did each month without a smartphone, with friends or family.' },
  { type: 'photos', months: s.months },
  { type: 'teaser', icon: 'mail-open', text: s.next }
]

// The first issue has a little more, so the next one is something to look forward to
const firstIssueExtras = [
  { type: 'page' },
  { type: 'h2', icon: 'brain', text: 'Junior Scientist facts' },
  { type: 'facts', items: [
    '**Scientists test ideas fairly.** This study compares lots of schools, just like a fair test in a science lesson.',
    '**Your brain is busy while you sleep.** It sorts out the things you learned and did that day.',
    '**Children your age need lots of sleep:** about 9 to 12 hours a night.',
    '**Every Junior Scientist counts.** The more children who take part, the more we can find out.'
  ] },
  { type: 'h2', icon: 'medal', text: 'Design your Junior Scientist badge' },
  { type: 'p', text: 'Real scientists often have a logo for their team. Draw a badge for yours.' },
  { type: 'draw', label: 'My badge', height: 4200 }
]

function puzzleAnswer (p) {
  if (p.kind === 'code') return p.message
  if (p.kind === 'oddone') return p.items.map(i => i[1]).join(', ')
  return p.items.map(i => i[1]).join(', ')
}

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
      'There\'s a new issue every three months, one for each season. We\'ll send your parent or carer a reminder when it\'s time to fill one in.',
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
    ...firstIssueExtras,
    ...seasons.flatMap(chapter),
    { type: 'chapter', icon: 'telescope', label: 'The end', title: 'Looking back', sub: `${END} · fill this in at the end of the study` },
    { type: 'h2', icon: 'lightbulb', text: 'Was my prediction right?' },
    { type: 'p', text: 'Look back at your prediction at the start of the journal. What happened?' },
    { type: 'lines', n: 4 },
    { type: 'h2', icon: 'sparkles', text: 'The best thing about this year' },
    { type: 'lines', n: 3 },
    { type: 'h2', icon: 'heart', text: 'How I feel now' },
    { type: 'mood' },
    { type: 'puzzle', kind: 'answers', title: 'Puzzle answers', answers: seasons.map(s => `**Issue ${s.n}:** ${puzzleAnswer(s.puzzle)}`) },
    { type: 'certificate', title: 'My Junior Scientist certificate', text: 'At the end of the study, you\'ll get a certificate to show you\'re a real Junior Scientist. Your parent or carer, or your school, can print it and stick it here.' }
  ],
  mood: MOOD
}
