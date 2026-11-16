/*
 * SMART Study – onboarding packs (single source)
 *
 * The welcome packs for schools and for families in the group trying the
 * family plan. Adapted from the April 2027 drafts to the current design:
 * September 2027 to September 2028, children in Years 3 to 5, two reading
 * and maths assessments, one study website for every family, a screen time
 * screenshot once a month, and the study video and how-to videos in place
 * of webinars.
 *
 * `npm run build:docs` turns each pack into Word (to edit) and PDF (to send):
 *   exports/SMART-onboarding-pack-schools.docx|pdf
 *   exports/SMART-onboarding-pack-parents.docx|pdf
 *
 * Text: **bold**, [link text](https://...). Words in [square brackets] are
 * still to be confirmed, and are highlighted in the documents.
 *
 * Blocks: ask (the main box), h2, p, stats, table, bullets, boxes (two side
 * by side), note (one box), steps (numbered).
 */
const { EMAIL, START, END, YEARS, RUN_BY } = require('./resources')

const ROUNDS = '[December 2027, April 2028 and September 2028]'
const ASSESS = 'reading and maths assessments, in the PIRA and PUMA format'

const ofcom2016 = 'https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/media-literacy-research/children/children-parents-nov16/childrens-and-parents-media-use-and-attitudes-2016-executive-summary.pdf?v=335512'
const ofcom2025 = 'https://www.ofcom.org.uk/media-use-and-attitudes/media-habits-children/children-and-parents-media-use-and-attitudes-report-2025--interactive-data'
const ifs = 'https://ifs.org.uk/publications/smartphones-and-childrens-mental-health'

// ------------------------------------------------------------------ schools
const schools = {
  id: 'schools',
  name: 'Welcome pack for schools',
  accent: 'schools',
  // The cover: who it's for and what it is, at a glance (the colour comes from `accent`)
  cover: {
    audience: 'For school leaders',
    kind: 'Welcome pack',
    title: 'Welcome pack for schools',
    what: 'What the study asks of your school, the year ahead, and the support you\'ll have.',
    illustration: 'school'
  },
  eyebrow: 'Welcome pack for schools',
  title: 'Welcome to the SMART Study',
  lead: 'Thank you for taking part. This pack explains the study, what it asks of your school and your families, and the support available to you.',
  blocks: [
    {
      type: 'ask',
      title: 'What we\'re asking of your school',
      intro: `Four things, from **${START}** to **${END}**:`,
      items: [
        { title: 'Help families get started.', text: `Share the welcome pack for families, our welcome message and the posters with families in ${YEARS}, and point anyone with questions to us. [TBC: the school's role in sending out materials]` },
        { title: 'Tell us which apps and websites your pupils need for school,', text: 'such as homework platforms and your school website, so they keep working on phones that families have set up.' },
        { title: 'Run two short reading and maths assessments', text: `in class, in the PIRA and PUMA format: one in the autumn term 2027 and one in the summer term 2028, about [45] minutes each. You get your pupils' results.` },
        { title: 'Tell us how it\'s going.', text: `Three short rounds of feedback, in ${ROUNDS}. We'll pay your school [£XX] for each.` }
      ],
      outro: 'Families do the rest, and we support them directly.'
    },

    { type: 'h2', text: 'The study' },
    { type: 'p', text: `The SMART Study has been commissioned by the **Department for Education** to answer one question: **what is the effect of delaying the acquisition of smartphones for children in ${YEARS}?** Its findings will inform policy in England and further afield.` },
    { type: 'stats', items: [{ n: '80+', label: 'schools across England' }, { n: '[11,000+]', label: `children in ${YEARS}` }, { n: '12 months', label: `${START} to ${END}` }] },
    { type: 'p', text: 'Your school is in the group trying the **family plan**. Families at your school are being asked to wait for a first smartphone or, if their child already has one, to set it up with a short list of apps, with guidance and support from us. Schools in the comparison group carry on as normal. Because schools were put into the two groups at random, comparing them tells us what difference the plan makes to children\'s mental health, sleep and learning.' },
    { type: 'p', text: 'The study is delivered by **IFF Research**, **PUBLIC** and the **University of Cambridge**.' },

    { type: 'h2', text: 'What families are being asked to do' },
    {
      type: 'table',
      cols: ['Child\'s situation', 'What we ask', 'Their guide'],
      widths: [0.22, 0.52, 0.26],
      rows: [
        ['**No smartphone of their own**', `Hold off getting one until ${END}. Nothing else changes: tablets, computers and borrowing a parent's phone are all fine. Most children in ${YEARS} are in this group.`, '**Waiting for a first smartphone** (one page)'],
        ['**Has a smartphone**', 'Spend 30 to 40 minutes turning on settings already built into the phone. Every app is blocked apart from a short list (calls, messages, maps, camera and a few others), and the web is limited to a few sites. Once a month, share a screenshot of the phone\'s screen time.', '**Setting up your child\'s phone** (step by step, with videos)']
      ]
    },
    { type: 'p', text: `Every family uses the same study website. It shows the guide to waiting first, then the set-up guides, so a family whose child gets a phone during the year already knows where to go. Nothing is installed on children's phones and nothing is collected from them. The apps and websites that still work were chosen with parents and children, and families can ask for more on the study website or by email. We reply within 5 working days.` },
    { type: 'note', tint: 'sky', title: 'Tablets, computers and other devices are expected', text: 'Some parents worry that a child using a family tablet, a games console or a parent\'s phone counts as not keeping to the plan. It doesn\'t. The study is about a smartphone of the child\'s own, and use of other devices is expected and built into the study\'s design. If a parent raises it, please reassure them: we\'d much rather they stay in the study.' },

    { type: 'h2', text: 'Why this study, and why now' },
    {
      type: 'bullets',
      items: [
        `**Smartphones are arriving earlier.** About ten years ago, roughly [a quarter of children this age](${ofcom2016}) had their own smartphone. By 2025, [around 8 in 10 children aged 10 to 12](${ofcom2025}) did. Much of this is driven by peers: few families want their child to be the only one without a phone.`,
        `**Coordination looks promising.** A [2026 study by the Institute for Fiscal Studies](${ifs}) found that where at least one in five families at a school pledged to delay smartphones, school-recorded social, emotional and mental health needs fell by around 8%, with larger falls where uptake was higher. A randomised trial can test whether that effect is real.`,
        '**The policy context is moving.** From September 2026, all schools are mobile phone-free environments by default, and the government has announced plans to keep under-16s off social media. The question of the smartphone itself, and when children should have one, is still open.',
        `**Timing.** Phone ownership jumps around birthdays, Christmas and the summer holidays. Starting in September gives families a plan before all three, and a full year to see it through. Working with children in ${YEARS}, before most have a phone of their own, puts the focus on waiting rather than on restricting a phone a child already has.`
      ]
    },

    { type: 'h2', text: 'What your school receives' },
    {
      type: 'bullets',
      items: [
        '**£500** for taking part, plus **[£XX] for each round of feedback**.',
        '**Your pupils\' reading and maths results** from both assessments, to use as you wish.',
        '**The study website**, with the guidance for families in writing and on video, and a school resources area for you. Only schools and families taking part can sign in.',
        '**Materials to keep families and pupils motivated:** a study video for children about why the study matters, [comic books], and a newsletter [how often: TBC].',
        '**Resources to launch the study** with your school community: e-posters to print, show on screens or send with your newsletter.',
        `**A direct line to the research team** at ${EMAIL}.`,
        '**A summary of what we find**, shared with you first.'
      ]
    },

    { type: 'h2', text: 'Over the year' },
    {
      type: 'table',
      cols: ['When', 'Your school', 'Families'],
      widths: [0.22, 0.39, 0.39],
      rows: [
        ['**Summer term 2027**', 'Share the welcome pack for families, our welcome message and the posters. Send us your school\'s apps and websites. Book your autumn assessment session.', 'Receive their welcome pack and their sign-in details for the study website.'],
        [`**${START}**`, 'The study starts.', 'Follow their guide on the study website (one for waiting, one for setting up a phone), and watch the study video with their child.'],
        ['**Autumn term 2027**', 'Pupils do the first reading and maths assessment, in class.', 'Nothing extra: the assessment happens at school.'],
        ['**Throughout the year**', 'Newsletter updates. Contact us whenever you need to.', 'Newsletter, study website and support email. If their child has a phone, a screen time screenshot once a month.'],
        [`**${ROUNDS}**`, 'A short feedback round, paid at [£XX] each.', 'A short survey from IFF Research, with a [£X] voucher each time.'],
        ['**Summer term 2028**', 'Pupils do the second assessment.', 'Nothing extra.'],
        [`**${END}**`, 'The study ends. We share what we found.', 'The study ends, and the decision is theirs again.']
      ]
    },

    {
      type: 'boxes',
      items: [
        { tint: 'mint', title: 'If a parent asks you about it', text: `You don't need to be the expert. Point them to the study website or to ${EMAIL}, and we'll take it from there.` },
        { tint: 'peach', title: 'If a child gets a phone anyway, or gets round the settings', text: 'It happens. Encourage the family to stay in the study and let us know. If a child gets a phone, the family follows the set-up guide. Their answers are still really useful.' }
      ]
    },

    { type: 'h2', text: 'Data and privacy' },
    { type: 'p', text: 'We collect nothing from children\'s phones. The settings families use are built into the phone by Apple and Google and send nothing to us. The only information we receive is what schools and families choose to share: feedback rounds, surveys, the two assessments and, for families whose child has a phone, screenshots of screen time. Families\' survey answers are confidential and are not shared with the school. [Link to privacy notice: TBC]' },

    { type: 'h2', text: 'What to do now' },
    {
      type: 'steps',
      items: [
        `**Share the welcome pack for families, our welcome message and the posters** with families in ${YEARS}. They're all on the school resources page of the study website.`,
        `**Send us your school's apps and websites** at ${EMAIL}.`,
        '**Book your first assessment session** for the autumn term 2027. [TBC: how sessions are arranged]',
        '**Sign in to the study website** with the details we\'ve emailed you.',
        '**Look out for the first feedback round** in [December 2027].'
      ]
    }
  ],
  footer: `Questions? Email ${EMAIL}. ${RUN_BY}`
}

// ------------------------------------------------------------------ families
const parents = {
  id: 'parents',
  name: 'Welcome pack for families',
  accent: 'parents',
  cover: {
    audience: 'For parents and carers',
    kind: 'Welcome pack',
    title: 'Welcome pack for families',
    what: 'What the study is, what we\'re asking of your family, and the help you\'ll have along the way.',
    illustration: 'family'
  },
  eyebrow: 'Welcome pack for families',
  title: 'Welcome to the SMART Study',
  lead: 'Thank you for taking part. This explains what the study is, what we\'re asking of your family, and the help you\'ll have along the way.',
  blocks: [
    {
      type: 'ask',
      title: 'What we\'re asking',
      intro: `Until **${END}**, one of two things, depending on your child:`,
      paras: [
        '**If your child doesn\'t have a smartphone:** please hold off getting them one. Your guide is **Waiting for a first smartphone** (one page).',
        '**If your child already has a smartphone:** spend 30 to 40 minutes turning on a few settings that are already built into the phone, so it only has a short list of apps and websites. Then leave them running, and once a month share a screenshot of its screen time. Your guide is **Setting up your child\'s phone**.'
      ],
      outro: 'Both guides come with this pack and are on the study website. Everything else here is to help you do it.'
    },

    { type: 'h2', text: 'What the study is' },
    { type: 'p', text: 'Most children now get their own smartphone before they leave primary school. Nobody yet knows what difference that makes, or the best age for a first phone. The Department for Education has commissioned the SMART Study to find out what difference it makes when children wait longer for a smartphone of their own, or have one set up with a short list of apps.' },
    { type: 'stats', items: [{ n: '80+', label: 'schools across England' }, { n: '[11,000+]', label: `children in ${YEARS}` }, { n: '12 months', label: `${START} to ${END}` }] },
    { type: 'p', text: 'Your child\'s school is one of the schools where families are being asked to try this. **Other families at your child\'s school are taking part too**, so your child won\'t be the only one. Other schools are carrying on as normal. Comparing the two is how we\'ll see what difference it makes to children\'s wellbeing, sleep and learning.' },
    { type: 'p', text: 'The study is delivered by IFF Research, PUBLIC and the University of Cambridge. What we learn will shape the advice given to families across the country, and further afield.' },
    { type: 'note', tint: 'mint', title: 'Tablets, computers and borrowing your phone are fine', text: 'This study is about your child having a smartphone of their own. Using a family tablet or computer, playing on a games console, or borrowing your phone with you are all expected, and are part of how the study is designed. None of them counts against you.' },

    { type: 'h2', text: 'Why this matters, and why now' },
    {
      type: 'bullets',
      items: [
        `**Smartphones are arriving earlier.** About ten years ago, roughly [a quarter of children this age](${ofcom2016}) had their own smartphone. By 2025, [around 8 in 10 children aged 10 to 12](${ofcom2025}) did.`,
        '**Timing is hard to get right alone.** Some parents would like to wait but worry about their child being the only one without a phone. For these families, waiting feels easier when others are doing the same.',
        '**Parents have good reasons either way.** Many families give their child a smartphone because, on balance, it\'s the right choice for them. They may want to stay in touch on the journey to and from school, help their child build digital skills, or make sure they don\'t miss out socially. This study isn\'t about whether smartphones are good or bad. It aims to give parents better evidence for deciding when the time is right for their child.',
        `**Early signs are encouraging.** A [2026 study by the Institute for Fiscal Studies](${ifs}) looked at schools where families agreed together to hold off on smartphones. Where at least one in five families signed up, the social, emotional and mental health needs recorded by schools fell by around 8%, and by more where more families took part. This study will test that properly.`,
        '**The rules are changing.** The government has announced plans to keep under-16s off social media. That still leaves the question of the phone itself, which is where this study comes in.'
      ]
    },

    { type: 'h2', text: 'What happens over the year' },
    {
      type: 'table',
      cols: ['When', 'What happens'],
      widths: [0.24, 0.76],
      rows: [
        ['**Summer term 2027**', 'You receive this pack, and your sign-in details for the study website by email.'],
        [`**${START}**`, 'The study starts. Follow your guide, and watch the study video with your child.'],
        ['**Autumn term 2027**', 'Your child does the first of two short reading and maths assessments, in class at school. There\'s nothing to prepare.'],
        ['**Throughout the year**', 'A short newsletter by email [how often: TBC], with tips from other parents and reminders before the moments phones tend to arrive, such as birthdays and Christmas.\nIf your child has a phone, share a screenshot of its screen time on the study website once a month. It takes about a minute.'],
        [`**${ROUNDS}**`, 'A short online survey from IFF Research about how your child and your family are getting on, about [10] minutes. We\'ll send you a [£X] voucher each time.'],
        ['**Summer term 2028**', 'Your child does the second assessment at school.'],
        [`**${END}**`, 'The study ends, and the decision is yours again. We\'ll let you know what the study found. [TBC: how and when]']
      ]
    },

    { type: 'h2', text: 'Help along the way' },
    {
      type: 'bullets',
      items: [
        '**The study website**, at [web address]. Both guides in writing and on video, kept up to date when phones update. Sign in with the details we email you.',
        '**The study video**, for your child: a few minutes on why the study matters. It\'s worth watching together.',
        '**How-to videos** that show you each step of setting up an iPhone or an Android phone.',
        `**The support email**, ${EMAIL}. For help with the set-up, an app that won't open, a second phone, or any question about the study.`,
        '**The newsletter.** Short updates, what has worked for other parents, and a nudge before the busy moments.'
      ]
    },
    { type: 'note', tint: 'sky', title: 'Need an app or website that isn\'t allowed?', text: `The apps and websites that still work on a set-up phone were chosen with parents and children, and the list is still changing. If your child needs one that isn't there, ask on the study website or email ${EMAIL}. We'll answer within five working days: either we add it for everyone, or we tell you why not.` },

    { type: 'h2', text: 'Your child\'s phone and your data' },
    { type: 'p', text: 'The settings in the set-up guide are built into every iPhone and Android phone by Apple and Google. They\'re free, there\'s nothing to install, and they send nothing to us. **We never see your child\'s phone or what they do on it.** The only information we receive is what you choose to share with us: your survey answers and your screen time screenshots. Your survey answers are confidential and aren\'t shared with your child\'s school. [Link to privacy notice: TBC]' },

    { type: 'h2', text: 'Before you start' },
    {
      type: 'boxes',
      items: [
        { tint: 'mint', title: 'What your family gets', text: 'Clear, tested guidance, and someone to ask when you\'re stuck. Other families at your school doing the same. A voucher for each survey. And a say in what children\'s phones should look like, here and beyond.' },
        { tint: 'sky', title: 'Why together works', text: 'Few parents hold off on their own, because no one wants their child left out. When families at the same school do it together, waiting stops being the odd choice. That\'s what this study puts in place.' }
      ]
    },
    {
      type: 'boxes',
      items: [
        { tint: 'lemon', title: 'The hard part', text: 'Setting up a phone takes 30 to 40 minutes, and your child may push back, whichever guide you\'re following. Both are normal. The guides walk you through every step, and the newsletter shares what has worked for other parents.' },
        { tint: 'peach', title: 'If things don\'t go to plan', text: `It happens, and it's fine to tell us. Please stay in the study and let us know at ${EMAIL}. Your answers are still really useful.` }
      ]
    },

    { type: 'h2', text: 'What to do now' },
    {
      type: 'steps',
      items: [
        '**Find your guide.** No smartphone: read **Waiting for a first smartphone** (one page). Already has one: set aside 30 to 40 minutes for **Setting up your child\'s phone**.',
        `**Put ${END} on the calendar,** somewhere your child can see it.`,
        `**Sign in to the study website,** and save our email address, ${EMAIL}.`,
        '**Watch the study video with your child,** and talk it through together.',
        '**Tell grandparents and friends about the study,** so nobody gives your child a phone as a present.'
      ]
    }
  ],
  footer: `Questions? Email ${EMAIL}. ${RUN_BY}`
}

module.exports = { schools, parents, packs: [schools, parents] }
