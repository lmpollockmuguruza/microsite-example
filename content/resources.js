/*
 * SMART Study – the delay guide and the school e-posters (single source)
 *
 * `npm run build:resources` turns this file into:
 *   - guide-delay.html, the microsite guide for families whose child has no phone yet
 *   - exports/SMART-delay-guide.docx, the same guide as a one-page Word document
 *   - exports/figma/delay-guide.svg, an A4 frame for Figma
 *   - exports/posters/: each e-poster as Word, PDF and PNG
 *   - exports/figma/poster-*.svg, each e-poster as an A4 frame for Figma
 *
 * Text: **bold** marks the words that matter most.
 * Words in [square brackets] are for the school to fill in.
 */

const EMAIL = 'smartphonestudy@public.io'
// The study dates and year groups, used everywhere below
const START = 'September 2027'
const END = 'September 2028'
const YEARS = 'Years 3 to 5'
const RUN_BY = 'Run by IFF Research, PUBLIC and the University of Cambridge for the Department for Education.'

// ------------------------------------------------------------------ guide to waiting (one page), for families whose child has no phone yet
const delay = {
  title: 'Waiting for a first smartphone',
  eyebrow: 'The SMART Study · guide for families',
  lead: 'Thank you for taking part. This is everything we\'re asking, on one page.',
  ask: {
    title: 'What we\'re asking',
    text: `Until **${END}**, please hold off getting your child their own smartphone.`,
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
      { id: 'talking', title: 'Tell your child together, and say why.', text: 'Children find waiting easier when they know the reason, and know it isn\'t forever.', quote: `Our school is helping with a big study about children and phones. We're one of the families waiting a bit longer for a phone. It's until ${END}, and it helps grown-ups work out what's best for children.` },
      { id: 'date', title: 'Put the date on the calendar.', text: `Mark ${END} somewhere your child can see it. A clear end date makes waiting feel fair.` },
      { id: 'family', title: 'Tell family and friends early.', text: 'Phones are a common birthday or Christmas present. Let grandparents and others know about the study now, so nobody is caught out.' },
      { id: 'touch', title: 'Agree how you\'ll stay in touch.', text: `For trips and clubs, your child can borrow a family phone. If you think your child needs a phone of their own for safety, email ${EMAIL} first and we'll talk it through.` },
      { id: 'summer', title: 'Plan ahead for the summer holidays.', text: `The summer before a new school year is when many children get a first phone. Agree before the holidays how your child will keep in touch, so the plan holds until ${END}.` }
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
  delay: { colour: 'lemon', icon: 'sun', title: 'Waiting for a first smartphone', text: `If your child doesn't have a smartphone yet, hold off until **${END}**. Your guide has ideas for making it easier.` },
  restrict: { colour: 'mint', icon: 'shield-check', title: 'Setting up the phone together', text: 'If your child already has one, use our step-by-step guide to keep it to **a short list of apps and websites**.' }
}

const posterCommon = {
  eyebrow: '[School name] is taking part',
  intro: `Around 80 primary schools in England are part of the SMART Study, from ${START} to ${END}. Thank you for being one of them.`,
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
    use: 'The one most schools need: it covers families whose child has a smartphone and families whose child doesn\'t.',
    headline: 'We\'re finding out what\'s best for children and phones',
    plansTitle: 'Families taking part follow one of two plans, depending on whether their child has a smartphone:',
    plans: [plans.delay, plans.restrict]
  },
  {
    id: 'delay', name: 'Waiting for a first smartphone',
    use: 'To focus on families whose child doesn\'t have a smartphone yet, for example before birthdays.',
    headline: 'Together, we\'re waiting a little longer for smartphones',
    plansTitle: 'What we\'re asking families taking part:',
    plans: [plans.delay]
  },
  {
    id: 'restrict', name: 'Setting up the phone together',
    use: 'To focus on families whose child already has a smartphone.',
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

// ------------------------------------------------------------------ invitations to take part
// The first thing school leaders and parents get from us. One page each:
// a single ask, what taking part involves, and what everyone gets.
// It goes to everyone before schools are put into groups, so it describes
// both groups plainly and promises the same thanks to both.
// Words in [square brackets] are still to be confirmed.
const TERM1 = 'Autumn term 2027'
const TERM3 = 'Summer term 2028'
const ASSESS = 'reading and maths assessments (in the PIRA and PUMA format many schools already use)'

const invitationCommon = {
  qr: 'QR code',
  groupsTitle: 'Two groups, chosen by chance',
  getTitle: 'What you get, whichever group you\'re in',
  runBy: RUN_BY
}

const invitations = [
  {
    id: 'schools', name: 'School leaders',
    use: 'For headteachers and school leaders: the first invitation to take part.',
    eyebrow: 'Invitation for school leaders',
    headline: 'Will your school help find out what\'s best for children and phones?',
    intro: `Nobody knows yet the best age for a first smartphone, or how best to set one up. The SMART Study will help find out, for the Department for Education. We're inviting around 80 primary schools in England, with their pupils in **${YEARS}**, from **${START}** to **${END}**.`,
    ask: {
      title: 'Will your school take part?',
      text: 'Sign up by **[date]** at **[web address]**, or reply to this email. It takes about 5 minutes.'
    },
    involvesTitle: 'What taking part involves for your school',
    timeline: [
      { when: 'Summer term 2027', text: 'Sign up and name a contact. Share our invitation with families in ' + YEARS + ': we give you everything you need.' },
      { when: TERM1, text: `Pupils do the first of two short ${ASSESS} in class, about **[45] minutes**.` },
      { when: 'During the year', text: 'Pass on our messages and posters to families now and then, and give us short feedback three times. No extra teaching.' },
      { when: TERM3, text: 'Pupils do the second assessment. The study ends in ' + END + '.' }
    ],
    groups: `To make it a fair test, schools are split into two groups by chance. In one, families follow a simple plan until ${END}: if their child has no smartphone, they wait; if they have one, they set it up with a short list of apps. In the other, families carry on as usual. Every school does the same assessments and surveys.`,
    gets: [
      { icon: 'school', title: '£500 for your school', text: 'For taking part, plus [£XX] for each feedback round.' },
      { icon: 'chart-column', title: 'Your pupils\' results', text: 'Reading and maths scores from both assessments.' },
      { icon: 'sparkles', title: 'Resources for families', text: 'Motivational videos, comic books and a newsletter.' },
      { icon: 'mail', title: 'What we find', text: 'A summary of the findings, shared with you first.' }
    ],
    choice: 'Taking part is your school\'s choice, and you can stop at any time.',
    contact: `Questions? Email ${EMAIL}, or call [phone number].`
  },
  {
    id: 'parents', name: 'Parents and carers',
    use: 'For parents and carers of children in ' + YEARS + ', sent through the school.',
    eyebrow: 'Invitation for parents and carers',
    headline: 'Will your family help find out what\'s best for children and phones?',
    intro: `Nobody knows yet the best age for a first smartphone, or how best to set one up. **[School name]** is helping to find out, as one of around 80 primary schools in the SMART Study. It runs from **${START}** to **${END}**, for children in **${YEARS}**, and we'd love your family to take part.`,
    ask: {
      title: 'Will you take part?',
      text: 'Say yes by **[date]**: scan the QR code or go to **[web address]**. It takes about 5 minutes.'
    },
    involvesTitle: 'What taking part involves for your family',
    timeline: [
      { when: 'Summer term 2027', text: 'Say yes. That\'s all until the study starts in ' + START + '.' },
      { when: TERM1, text: `Your child does the first of two short ${ASSESS} at school. There's nothing to prepare.` },
      { when: 'Three times', text: 'A short online survey about how your family is getting on (about **[10] minutes**), in [December 2027, April 2028 and September 2028].' },
      { when: TERM3, text: 'Your child does the second assessment. The study ends in ' + END + '.' }
    ],
    groups: `To make it a fair test, schools are split into two groups by chance. In one, families follow a simple plan until ${END}: if their child has no smartphone, they wait; if they have one, they set it up with a short list of apps and share a screen time screenshot once a month, with our step-by-step help. In the other, families carry on as usual. Everyone does the same surveys and assessments.`,
    gets: [
      { icon: 'gift', title: 'A [£X] voucher', text: 'After each survey you fill in.' },
      { icon: 'sparkles', title: 'Fun things for your child', text: 'Motivational videos, comic books and a newsletter.' },
      { icon: 'mail', title: 'What we find', text: 'A summary of what your family helped to find out.' }
    ],
    choice: 'Taking part is your choice. You can stop at any time, without giving a reason.',
    contact: `Questions? Ask [staff name] at school, or email ${EMAIL}.`
  }
].map(i => ({ ...invitationCommon, ...i }))

module.exports = { EMAIL, RUN_BY, START, END, YEARS, invitations, delay, posters, posterPrinciples, sharingTips }
