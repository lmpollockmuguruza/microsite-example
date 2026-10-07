/*
 * SMART Study – the delay guide and the school e-posters (single source)
 *
 * `npm run build:resources` turns this file into:
 *   - guide-delay.html, the delay group's guide on the microsite
 *   - exports/SMART-delay-guide.docx, the same guide as a one-page Word document
 *   - exports/figma/delay-guide.svg, an A4 frame for Figma
 *   - exports/posters/: each e-poster as Word, PDF and PNG
 *   - exports/figma/poster-*.svg, each e-poster as an A4 frame for Figma
 *
 * Text: **bold** marks the words that matter most.
 * Words in [square brackets] are for the school to fill in.
 */

const EMAIL = 'smartphonestudy@public.io'
const RUN_BY = 'Run by IFF Research, PUBLIC and the University of Cambridge for the Department for Education.'

// ------------------------------------------------------------------ delay group guide (one page)
const delay = {
  title: 'Waiting for a first smartphone',
  eyebrow: 'The SMART Study · guide for families',
  lead: 'Thank you for taking part. This is everything we\'re asking, on one page.',
  ask: {
    title: 'What we\'re asking',
    text: 'Until **April 2028**, please hold off getting your child their own smartphone.',
    still: 'Nothing else needs to change. Your child can still:',
    chips: [
      { icon: 'tablet-smartphone', text: 'Use a family tablet or computer' },
      { icon: 'phone', text: 'Borrow your phone, with you' },
      { icon: 'monitor-play', text: 'Play games and watch TV, as now' }
    ]
  },
  why: {
    title: 'Why it matters',
    text: 'Nobody knows yet the best age for a first smartphone. By waiting a little longer, your family is helping to answer that question for parents everywhere. Other families at your child\'s school are taking part too, so your child won\'t be the only one waiting.'
  },
  tips: {
    title: 'Five things that make it easier',
    items: [
      { id: 'talking', title: 'Tell your child together, and say why.', text: 'Children find waiting easier when they know the reason, and know it isn\'t forever.', quote: 'Our school is helping with a big study about children and phones. We\'re one of the families waiting a bit longer for a phone. It\'s until April 2028, and it helps grown-ups work out what\'s best for children.' },
      { id: 'date', title: 'Put the date on the calendar.', text: 'Mark April 2028 somewhere your child can see it. A clear end date makes waiting feel fair.' },
      { id: 'family', title: 'Tell family and friends early.', text: 'Phones are a common birthday or Christmas present. Let grandparents and others know about the study now, so nobody is caught out.' },
      { id: 'touch', title: 'Agree how you\'ll stay in touch.', text: `For trips and clubs, your child can borrow a family phone. If you think your child needs a phone of their own for safety, email ${EMAIL} first and we'll talk it through.` },
      { id: 'secondary', title: 'Plan ahead for secondary school.', text: 'Starting Year 7 is when many children get a phone. If your child moves up during the study, plan the journey to school, and how you\'ll keep in touch, before the summer.' }
    ]
  },
  everyone: {
    title: 'If you hear "Everyone else has one"',
    text: 'It\'s normal for children to say this. Listen, agree that waiting can feel hard, and remind them of the date and the reason.'
  },
  gotOne: {
    title: 'If your child does get a smartphone',
    text: `It happens, and it's fine to tell us. Please stay in the study and let us know at ${EMAIL}. Your answers are still really useful.`
  },
  video: 'There\'s also a 3-minute video about the study that you can watch with your child.',
  footer: `Questions? Email ${EMAIL}. ${RUN_BY}`
}

// ------------------------------------------------------------------ e-posters for schools
// One poster per situation. Each asks for one thing, from the school, and
// leaves the choice with the family. See the behavioural notes below.
const plans = {
  delay: { colour: 'lemon', icon: 'sun', title: 'Waiting for a first smartphone', text: 'If your child doesn\'t have a smartphone yet, hold off until **April 2028**. Your guide has ideas for making it easier.' },
  restrict: { colour: 'mint', icon: 'shield-check', title: 'Setting up the phone together', text: 'If your child already has one, use our step-by-step guide to keep it to **a short list of apps and websites**.' }
}

const posterCommon = {
  eyebrow: '[School name] is taking part',
  intro: 'Around 80 primary schools in England are part of the SMART Study, from April 2027 to April 2028. Thank you for being one of them.',
  signoff: '[Headteacher name], Headteacher',
  stepsTitle: 'Three steps this week',
  steps: [
    'Find your **welcome pack** and family sign-in.',
    'Sit down with your child for **10 minutes** and talk it through.',
    'Go to **[web address]** and follow your guide.'
  ],
  qr: 'QR code',
  children: { title: 'Children: thank you!', text: 'You\'re helping grown-ups everywhere work out what\'s best for children.' },
  contact: `Questions? Ask [staff name] at school, or email ${EMAIL}.`,
  runBy: RUN_BY
}

const posters = [
  {
    id: 'both', name: 'Both plans',
    use: 'For a school where some families are waiting and some are setting up phones.',
    headline: 'We\'re finding out what\'s best for children and phones',
    plansTitle: 'Families taking part follow one of two plans. Your welcome pack says which is yours:',
    plans: [plans.delay, plans.restrict]
  },
  {
    id: 'delay', name: 'Waiting for a first smartphone',
    use: 'For a school where families are waiting for a first smartphone.',
    headline: 'Together, we\'re waiting a little longer for smartphones',
    plansTitle: 'What we\'re asking families taking part:',
    plans: [plans.delay]
  },
  {
    id: 'restrict', name: 'Setting up the phone together',
    use: 'For a school where families are setting up their child\'s phone.',
    headline: 'Together, we\'re giving children a safer start with phones',
    plansTitle: 'What we\'re asking families taking part:',
    plans: [plans.restrict]
  }
].map(p => ({ ...posterCommon, ...p }))

// How the posters apply behavioural science (shown to school leaders, not families)
const posterPrinciples = [
  { title: 'From the school, not from us', text: 'Families trust their school. The poster is signed by the headteacher, and names a member of staff to ask.' },
  { title: 'One clear ask, and an easy first step', text: 'Each poster asks for one thing and gives three small steps, so families know exactly what to do this week.' },
  { title: 'The family\'s choice, not an order', text: 'No "must" or "ban". Warnings and pressure make some families, and many children, do the opposite.' },
  { title: 'What families are doing, not what they\'re not', text: 'It says that families across 80 schools are taking part. It never says how many children have phones, which would make having one seem normal.' },
  { title: 'Thanks, not blame', text: 'It thanks families and children for helping, and doesn\'t make anyone feel judged for the phone they have.' }
]

const sharingTips = [
  'Send it from the school\'s usual account or newsletter, so families recognise it.',
  'Share it at a natural moment: the start of term, or before birthdays and Christmas.',
  'Put printed copies where parents wait, such as by the school gate or reception.'
]

module.exports = { EMAIL, delay, posters, posterPrinciples, sharingTips }
