/*
 * SMART Study – help desk guide and triage tool (single source)
 *
 * For the study team and its partners (the help desk rota, IFF, DfE and
 * school leaders): how questions from families and schools come in, how
 * they're prioritised and who answers them. Families never see this; they
 * just get the help.
 *
 * `npm run build:docs` turns it into exports/SMART-help-desk-guide.docx|pdf,
 * with a cover, and the cover as an SVG for Figma.
 * Words in [square brackets] are still to be confirmed.
 */
const { START, END, RUN_BY } = require('./resources')

module.exports = {
  id: 'help-desk',
  name: 'Help desk guide',
  accent: 'team',
  file: 'SMART-help-desk-guide',
  cover: {
    audience: 'For the study team and partners',
    kind: 'Guide and triage tool',
    title: 'The SMART Study help desk',
    what: 'How questions from families and schools are answered: who handles what, and how fast.',
    illustration: 'help'
  },
  eyebrow: 'Guide and triage tool',
  title: 'SMART Study Help Desk',
  lead: `The SMART Study help desk answers questions from families and schools from ${START} to ${END}. Every message comes in through one form, lands in one shared sheet, and is triaged, assigned and answered from there.`,
  blocks: [
    { type: 'h2', text: 'How it works' },
    { type: 'p', text: '[Draft: open to suggestions]' },
    {
      type: 'steps',
      items: [
        'A family or school fills in the help desk form on the study website. [TBC: a different form for the comparison group, for the main trial?]',
        'The team gets an email. Google Forms emails everyone on the help desk team when a new message arrives, and the message is added to the shared response sheet.',
        'The person on duty checks the sheet twice each working day. Coloured rows go first: red for a possible safeguarding concern, amber for P2.',
        'They decide who handles it and set the Assigned to column, using the triage table below.',
        'That person replies within the target time and sets Status to Done.',
        'Once a week, the team reviews what came in and adds any repeated questions to the FAQs.'
      ]
    },
    { type: 'note', tint: 'sky', title: 'Data privacy notice', text: 'Personal data collected through the form will be secured in our ISO 27001-certified environment, restricted to the named project team, and deleted at project close under UK GDPR and DfE data sharing agreements.' },

    { type: 'h2', text: 'Priorities' },
    { type: 'p', text: 'Every message gets two things: a priority (how fast) and a support level (how much help). The table by topic below sets both.' },
    {
      type: 'table',
      cols: ['Priority', 'What it means', 'Example', 'Reply within', 'Sorted or passed on within'],
      widths: [0.13, 0.27, 0.24, 0.15, 0.21],
      rows: [
        ['**P1 Urgent**', 'A child may be at risk, or a suspected data breach', '"Someone my son doesn\'t know is messaging him"', 'Same working day', 'Same working day'],
        ['**P2 High**', 'A family is stuck with no workaround, or wants to leave', '"I\'m locked out of the settings"', '2 working days', '3 working days'],
        ['**P3 Standard**', 'A how-to or study question with a known answer', '"Step 4 doesn\'t match my phone"', '3 working days', '5 working days'],
        ['**P4 Low**', 'Feedback or an idea, nothing to fix', '"The guide could explain this better"', '5 working days', 'Added to the next newsletter or FAQ']
      ]
    },
    { type: 'p', text: '**Support levels.** Starting low, and moving up only if it doesn\'t solve the problem:' },
    {
      type: 'steps',
      items: [
        '**Self-serve:** send the FAQ, guide or video.',
        '**Personal reply:** email about their specific issue.',
        '**Call or scheduled drop-in:** talk it through and fix it live. Calls offered freely in the pilot.'
      ]
    },
    { type: 'h2', text: 'Triage by topic' },
    {
      type: 'table',
      cols: ['Topic', 'Priority', 'Assigned to', 'Support'],
      widths: [0.27, 0.15, 0.18, 0.40],
      rows: [
        ['**Possible safeguarding concern**', 'P1', 'IFF', 'Handover, same day. Never a saved reply.'],
        ['**Data or privacy worry**', 'P1 if a breach, else P3', 'Data lead, else help desk', 'Breach: handover, same day. Otherwise: Level 1 (privacy notice).'],
        ['**My child can\'t reach me, or I can\'t get into the settings**', 'P2', 'Technical lead', 'Level 2 with recovery steps; offer Level 3.'],
        ['**Leaving the study**', 'P2', 'IFF', 'Handover; confirm receipt to the family.'],
        ['**Setting up the phone settings**', 'P3', 'Help desk', 'Level 1 (video guide), then Level 2 or 3.'],
        ['**My child has found a way round the settings**', 'P3', 'Help desk', 'Level 1 (fix steps in the guide).'],
        ['**A new or second phone**', 'P3', 'Help desk', 'Level 1 (set-up guide). If a waiting family got a phone: Level 2, to reassure them and ask them to stay in.'],
        ['**Adding an app or website to the list**', 'P3', 'App list owner', 'Level 2: decision within 5 working days.'],
        ['**Surveys, payments or logging in**', 'P3', 'IFF', 'Level 1, or handover to IFF.'],
        ['**Something else**', 'Read and decide', 'Help desk', 'Level 2; reassign if needed.'],
        ['**Sharing feedback or an idea**', 'P4', 'Help desk', 'Level 2: thank them, and add it to the newsletter or FAQ list.']
      ]
    },

    { type: 'h2', text: 'Roles' },
    {
      type: 'table',
      cols: ['Role', 'Responsible for', 'Who'],
      widths: [0.24, 0.6, 0.16],
      rows: [
        ['**Rota (help desk)**', 'Checking the sheet twice a day, triage, assigning, replying to P3 and P4', '[TBC]'],
        ['**Safeguarding lead**', 'Every possible safeguarding concern, same day', '[TBC]'],
        ['**Data lead**', 'Suspected data breaches; approving the form tool', '[TBC]'],
        ['**Technical lead**', 'Locked-out and cut-off cases; fixing guide steps after phone updates', '[TBC]'],
        ['**Research team**', 'Leaving the study, consent, surveys, payments, and the comparison group', '[TBC]'],
        ['**App list owner**', 'App and website requests, decided within 5 working days', '[TBC]']
      ]
    },
    { type: 'p', text: '**Weekly review**' },
    {
      type: 'bullets',
      items: [
        'Check response targets were met.',
        'Turn repeated questions into saved replies or FAQs.',
        'Flag guide steps that keep causing trouble.',
        'Pass themes to the newsletter, especially before birthdays, summer and Christmas, when volume rises.'
      ]
    },

    { type: 'h2', text: 'Resources and FAQs' },
    { type: 'p', text: 'These are what Level 1 sends.' },
    {
      type: 'table',
      cols: ['Resource', 'Send for'],
      widths: [0.4, 0.6],
      rows: [
        ['**Welcome pack for families**', 'What the study is, what we\'re asking, the timeline'],
        ['**Waiting for a first smartphone** guide', 'Waiting-route questions, pressure to get a phone'],
        ['**Setting up your child\'s phone** (written guide and video)', 'Set-up help, new or second phones, workarounds'],
        ['**Welcome pack for children**', 'Families struggling to explain the study at home'],
        ['**Approved apps and websites list**', '"Can my child use X?" before a new request'],
        ['**The study video and how-to videos**', 'Families who want the study explained, or a step shown on a real phone'],
        ['**Privacy notice**', 'Data and privacy questions']
      ]
    },
    { type: 'p', text: '**FAQs for the study website** (this will grow from the weekly review):' },
    {
      type: 'steps',
      items: [
        `**What are we being asked to do?** Just one thing, until ${END}: if your child doesn't have a smartphone yet, hold off on getting one. If they already have one, spend about 30 to 40 minutes turning on a few settings that are already built into the phone, and leave them running.`,
        '**Can my child still use a tablet, a computer or my phone?** Yes, absolutely. Only their own smartphone is on hold. Everything else carries on as normal.',
        '**Can the study see what my child does on their phone?** No, never. The settings are built into the phone by Apple and Google, and they send nothing to us. The only things we see are your survey answers and any screenshots you choose to share.',
        '**Do I need to install or pay for anything?** Not at all. The settings are free and already on every iPhone and Android phone.',
        '**The steps don\'t match what I see on my phone.** Don\'t worry, phones vary and update often. Try the video guide on the study website first. If it still doesn\'t match, send us a message through the help desk form with your phone\'s model, and we\'ll help you through it.',
        '**My child has found a way around the settings.** This happens more often than you\'d think, so you\'re not alone. The guide has steps to fix it, and changing your parent passcode afterwards usually stops it from happening again.',
        '**My child needs an app that isn\'t on the list.** Let us know through the help desk form, with the app\'s name and how your child uses it. We\'ll get back to you within five working days.',
        '**We got a phone anyway, or turned the settings off. Have we let the study down?** Not at all! Just let us know what changed. Your answers are still really valuable.',
        '**My child is getting a phone for Christmas or their birthday.** Lovely! Try to set up the settings before you hand it over. It\'s much easier than adding them afterwards, and the guide walks you through it.',
        '**How do I leave the study?** We\'d be sorry to see you go, but it\'s always your choice. Send us a message through the help desk form and choose "Leaving the study", and we\'ll take care of the rest.',
        `**What happens in ${END}?** The study ends and the decision is yours again. We'll share what we found, and thank you for helping other families with your answers.`
      ]
    }
  ],
  footer: RUN_BY
}
