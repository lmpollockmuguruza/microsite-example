/*
 * SMART Study – onboarding pack for schools (single source)
 *
 * The welcome pack for schools in the group trying the family plan (the
 * treatment group). Adapted from the April 2027 draft to the current design:
 * September 2027 to September 2028, children in Years 3 to 5, two reading
 * and maths assessments, one study website for every family, and the study
 * video and how-to videos in place of webinars.
 *
 * `npm run build:resources` turns this file into:
 *   - exports/SMART-onboarding-pack-schools.docx   Word, to edit
 *   - exports/SMART-onboarding-pack-schools.pdf    to print or send
 *   - exports/figma/onboarding-pack-schools.svg    A4 pages for Figma
 *
 * Text: **bold**, [link text](https://...). Words in [square brackets] are
 * still to be confirmed.
 */
const { EMAIL, START, END, YEARS } = require('./resources')

const ROUNDS = '[December 2027, April 2028 and September 2028]'

module.exports = {
  id: 'schools',
  eyebrow: 'Welcome pack for schools',
  title: 'Welcome to the SMART Study',
  lead: 'Thank you for taking part. This pack explains the study, what it asks of your school and your families, and the support available to you.',
  blocks: [
    {
      type: 'ask',
      title: 'What we\'re asking of your school',
      intro: `Four things, from **${START}** to **${END}**:`,
      items: [
        { title: 'Help families get started.', text: `Share our welcome message and posters with families in ${YEARS}, and point anyone with questions to us. [TBC: the school's role in sending out materials]` },
        { title: 'Tell us which apps and websites your pupils need for school,', text: 'such as homework platforms and your school website, so we can add them to the list that still works on restricted phones.' },
        { title: 'Run two short reading and maths assessments', text: 'in class, in the PIRA and PUMA format: one in the autumn term 2027 and one in the summer term 2028, about [45] minutes each. You get your pupils\' results.' },
        { title: 'Tell us how it\'s going.', text: `Three short rounds of feedback, in ${ROUNDS}. We'll pay your school [£XX] for each.` }
      ],
      outro: 'Families do the rest, and we support them directly.'
    },

    { type: 'h2', text: 'The study' },
    { type: 'p', text: `The SMART Study has been commissioned by the **Department for Education** to answer one question: **what is the effect of delaying the acquisition of smartphones for children in ${YEARS}?** Its findings will inform policy in England and further afield.` },
    { type: 'stats', items: [{ n: '80+', label: 'schools across England' }, { n: '[11,000+]', label: `children in ${YEARS}` }, { n: '12 months', label: `${START} to ${END}` }] },
    { type: 'p', text: 'Your school is in the **treatment group**. Families at your school are being asked to wait for a first smartphone or, if their child already has one, to set it up with a short list of apps, with guidance and support from us. Schools in the comparison group carry on as normal. Because schools were allocated at random, comparing the two groups tells us what difference the approach makes to children\'s mental health, sleep and learning.' },
    { type: 'p', text: 'The study is delivered by **IFF Research**, **PUBLIC** and the **University of Cambridge**.' },

    { type: 'h2', text: 'What families are being asked to do' },
    {
      type: 'table',
      cols: ['Child\'s situation', 'What we ask', 'Their guide'],
      widths: [0.22, 0.52, 0.26],
      rows: [
        ['No smartphone of their own', `Hold off getting one until ${END}. Nothing else changes: tablets, computers and borrowing a parent's phone are all fine. Most children in ${YEARS} are in this group.`, '**Waiting for a first smartphone** (one page)'],
        ['Has a smartphone', 'Spend 30 to 40 minutes turning on settings already built into the phone. Every app is blocked apart from a short list (calls, messages, maps, camera and a few others), and the web is limited to approved sites. Once a month, share a screenshot of the phone\'s screen time.', '**Set up your child\'s phone** (step by step, with videos)']
      ]
    },
    { type: 'p', text: `Every family uses the same study website. It shows the guide to waiting first, then the set-up guides for families whose child has a phone, so a family whose child gets a phone during the year already knows where to go. Nothing is installed on children's phones and nothing is collected from them. The list of apps and websites was built with parents and children, and families can ask for additions on the study website or by email. We reply within 5 working days.` },

    { type: 'h2', text: 'Why this study, and why now' },
    {
      type: 'bullets',
      items: [
        '**Smartphones are arriving earlier.** About ten years ago, roughly [a quarter of children this age](https://www.ofcom.org.uk/siteassets/resources/documents/research-and-data/media-literacy-research/children/children-parents-nov16/childrens-and-parents-media-use-and-attitudes-2016-executive-summary.pdf?v=335512) had their own smartphone. By 2025, [around 8 in 10 children aged 10 to 12](https://www.ofcom.org.uk/media-use-and-attitudes/media-habits-children/children-and-parents-media-use-and-attitudes-report-2025--interactive-data) did. Much of this is driven by peers: few families want their child to be the only one without a phone.',
        '**Coordination looks promising.** A [2026 study by the Institute for Fiscal Studies](https://ifs.org.uk/publications/smartphones-and-childrens-mental-health) found that where at least one in five families at a school pledged to delay smartphones, school-recorded social, emotional and mental health needs fell by around 8%, with larger falls where uptake was higher. A randomised trial can test whether that effect is real.',
        '**The policy context is moving.** From September 2026, all schools by default are mobile phone-free environments. The government has also announced plans to keep under-16s off social media. The question of the smartphone itself, and when children should have one, is still open.',
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
        '**Materials to keep families and pupils motivated:** a study video for children about why the study matters, comic books, and a newsletter [how often: TBC].',
        '**Resources to launch the study** with the wider school community: e-posters to print, show on screens or send with your newsletter.',
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
        ['Summer term 2027', 'Share our welcome message and posters. Send us your school\'s apps and websites. Book your autumn assessment session.', 'Receive their welcome message and their sign-in details for the study website.'],
        [START, 'The study starts.', 'Find their guide on the study website (one for iPhones, one for Android phones) and follow it. Watch the study video with their child.'],
        ['Autumn term 2027', 'Pupils do the first reading and maths assessment, in class.', 'Nothing extra: the assessment happens at school.'],
        ['Throughout the year', 'Newsletter updates. Contact us whenever you need to.', 'Newsletter, study website and support email. If their child has a phone, a screen time screenshot once a month.'],
        [ROUNDS, 'A short feedback round, paid at [£XX] each.', 'A short survey from IFF Research, paid at [£XX] each.'],
        ['Summer term 2028', 'Pupils do the second assessment.', 'Nothing extra.'],
        [END, 'The study ends. We share what we found.', 'The study ends, and the decision is theirs again.']
      ]
    },

    {
      type: 'boxes',
      items: [
        { tint: 'mint', title: 'If a parent asks you about it', text: `You don't need to be the expert. Point them to the study website or to ${EMAIL}, and we'll take it from there.` },
        { tint: 'peach', title: 'If a child gets a phone anyway, or gets round the restrictions', text: 'It happens. Encourage the family to stay in the study and let us know. If a child gets a phone, the family follows the set-up guide. Their answers are still really useful.' }
      ]
    },

    { type: 'h2', text: 'Data and privacy' },
    { type: 'p', text: 'We collect nothing from children\'s phones. The settings families use are built into the phone by Apple and Google and send nothing to us. The only information we receive is what schools and families choose to share: feedback rounds, surveys, the two assessments and, for families whose child has a phone, screenshots of screen time. Families\' survey answers are confidential and are not shared with the school. [Link to privacy notice: TBC]' },

    { type: 'h2', text: 'What to do now' },
    {
      type: 'steps',
      items: [
        `**Share our welcome message and posters** with families in ${YEARS}. The posters are on the school resources page of the study website.`,
        `**Send us your school's apps and websites** at ${EMAIL}.`,
        '**Book your first assessment session** for the autumn term 2027. [TBC: how sessions are arranged]',
        '**Sign in to the study website** with the details we\'ve emailed you.',
        `**Look out for the first feedback round** in [December 2027].`
      ]
    }
  ],
  footer: `Questions? Email ${EMAIL}.`
}
