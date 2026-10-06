/*
 * SMART Study – restrictions guidance (single source)
 *
 * Everything the set-up guides say lives here: the routes, the steps, the
 * allowed-apps list and a description of every phone screen.
 * `npm run build:guides` turns this file into:
 *   - the three guide pages on the microsite
 *   - one SVG per screen (assets/guides/screens/)
 *   - an editable Word version (exports/SMART-restrictions-guidance.docx)
 *   - one board per route for Figma (exports/figma/)
 *
 * Text: **bold** marks the words to look for on the phone.
 * Screens: see tools/screens.js for what each field does.
 */

const EMAIL = 'smartphonestudy@public.io'

// ------------------------------------------------------------------ the allowlist
const allowlist = {
  apps: [
    { name: 'Phone', for: 'Calls', icon: 'phone', colour: '#34C759' },
    { name: 'Messages', for: 'Texts', icon: 'message-circle', colour: '#34C759' },
    { name: 'WhatsApp', for: 'Family and friends', icon: 'message-square', colour: '#25D366' },
    { name: 'Maps', for: 'Getting around', icon: 'map', colour: '#30B0C7' },
    { name: 'Life360', for: 'Location', icon: 'map-pin', colour: '#7B61FF', tbc: true },
    { name: 'Weather', for: 'Weather', icon: 'cloud-sun', colour: '#1E90FF' },
    { name: 'Moodle', for: 'Schoolwork', icon: 'graduation-cap', colour: '#F98012', tbc: true },
    { name: 'School app', for: 'Timetable and notices', icon: 'school', colour: '#003A69', tbc: true },
    { name: 'Camera', for: 'Photos', icon: 'camera', colour: '#8E8E93' },
    { name: 'Clock', for: 'Alarms', icon: 'clock', colour: '#1C1C1E' }
  ],
  websites: '[PLACEHOLDER: [SCHOOL DOMAIN], [Moodle], [BBC Bitesize], [others agreed with parents]]',
  placeholder: '[PLACEHOLDER: replace with the co-designed list.]'
}

// ------------------------------------------------------------------ reusable screen parts
const ios = {
  screenTime: { icon: 'hourglass', colour: '#5E5CE6' },
  appLimits: { icon: 'hourglass', colour: '#FF9500' },
  downtime: { icon: 'moon', colour: '#5E5CE6' },
  alwaysAllowed: { icon: 'circle-check', colour: '#34C759' },
  screenDistance: { icon: 'scan-eye', colour: '#007AFF' },
  restrictions: { icon: 'ban', colour: '#FF3B30' },
  commLimits: { icon: 'message-circle', colour: '#34C759' },
  notifications: { icon: 'bell', colour: '#FF3B30' },
  sounds: { icon: 'volume-2', colour: '#FF2D55' },
  focus: { icon: 'moon', colour: '#5E5CE6' },
  homeScreen: { icon: 'layout-grid', colour: '#007AFF' },
  search: { icon: 'search', colour: '#8E8E93' },
  family: { icon: 'users', colour: '#007AFF' },
  icloud: { icon: 'cloud', colour: '#1E90FF' },
  personal: { icon: 'user', colour: '#8E8E93' },
  security: { icon: 'shield', colour: '#8E8E93' },
  payment: { icon: 'credit-card', colour: '#8E8E93' },
  subs: { icon: 'repeat', colour: '#8E8E93' },
  faceId: { icon: 'scan-eye', colour: '#34C759' },
  privacy: { icon: 'shield-check', colour: '#007AFF' }
}

// Screens that more than one route uses
const S = {}

// Screen Time page with one row highlighted (used in several steps)
function screenTimePage (id, hlRow, device, note) {
  const rows = [
    { ...ios.downtime, label: 'Downtime', sub: 'Schedule time away from the screen' },
    { ...ios.appLimits, label: 'App Limits', sub: 'Set time limits for apps' },
    { ...ios.alwaysAllowed, label: 'Always Allowed', sub: 'Choose apps to allow at all times' },
    { ...ios.screenDistance, label: 'Screen Distance', sub: 'Reduce eye strain' }
  ]
  const rows2 = [
    { ...ios.commLimits, label: 'Communication Limits', sub: 'Set limits for calling and messaging' },
    { ...ios.restrictions, label: 'Content & Privacy Restrictions', sub: 'Manage content, apps and settings' }
  ]
  ;[...rows, ...rows2].forEach(r => { if (r.label === hlRow) r.hl = 'Tap' })
  return {
    id, os: 'ios', device: device || "Your child's phone",
    bar: { back: 'Settings', title: 'Screen Time' },
    blocks: [
      { type: 'group', header: 'Limit Usage', rows: rows.map(r => ({ ...r, chevron: true })) },
      { type: 'group', header: 'Restrictions', rows: rows2.map(r => ({ ...r, chevron: true })) }
    ],
    alt: note
  }
}

// Settings list, as on the child's phone, with Screen Time highlighted
S.settingsScreenTime = {
  id: 'ios-settings-screen-time', os: 'ios', device: "Your child's phone",
  bar: { largeTitle: 'Settings' },
  blocks: [
    { type: 'group', rows: [
      { ...ios.notifications, label: 'Notifications', chevron: true },
      { ...ios.sounds, label: 'Sounds & Haptics', chevron: true },
      { ...ios.focus, label: 'Focus', chevron: true },
      { ...ios.screenTime, label: 'Screen Time', chevron: true, hl: 'Tap' }
    ] },
    { type: 'group', rows: [
      { ...ios.faceId, label: 'Face ID & Passcode', chevron: true },
      { ...ios.privacy, label: 'Privacy & Security', chevron: true }
    ] }
  ],
  cut: true,
  alt: 'The Settings app. Screen Time is in the list, below Focus.'
}

S.activitySheet = {
  id: 'ios-activity-sheet', os: 'ios', device: "Your child's phone",
  bar: { close: true },
  blocks: [
    { type: 'hero', icon: 'hourglass', colour: '#007AFF', title: 'App & Website Activity', text: 'Get insights about your screen time and set limits for what you want to manage.' },
    { type: 'features', items: [
      { icon: 'sparkles', title: 'Weekly Reports', text: 'Get a weekly report with insights about your screen time.' },
      { icon: 'moon', title: 'Downtime', text: 'Set a schedule for time away from the screen.' },
      { icon: 'hourglass', title: 'App Limits', text: 'Set daily time limits for app categories.' }
    ] },
    { type: 'button', text: 'Turn on App & Website Activity', style: 'filled', hl: 'Tap' },
    { type: 'button', text: 'Not Now', style: 'plain' }
  ],
  alt: 'A pop-up called App & Website Activity, with a blue button at the bottom to turn it on.'
}

S.lockSettings = {
  id: 'ios-lock-screen-time', os: 'ios', device: "Your child's phone",
  bar: { back: 'Settings', title: 'Screen Time' },
  blocks: [
    { type: 'group', header: 'Limit Usage', rows: [
      { ...ios.downtime, label: 'Downtime', sub: 'Off', chevron: true },
      { ...ios.appLimits, label: 'App Limits', sub: 'Set time limits for apps', chevron: true },
      { ...ios.alwaysAllowed, label: 'Always Allowed', sub: 'Choose apps to allow at all times', chevron: true }
    ] },
    { type: 'group', rows: [
      { label: 'Lock Screen Time Settings', blue: true, hl: 'Tap' }
    ], footer: 'Use a passcode to secure Screen Time settings.' }
  ],
  alt: 'Further down the Screen Time page there is a blue link: Lock Screen Time Settings.'
}

S.passcodeRecovery = {
  id: 'ios-passcode-recovery', os: 'ios', device: "Your child's phone",
  bar: {},
  blocks: [
    { type: 'text', style: 'title', text: 'Screen Time Passcode Recovery' },
    { type: 'text', style: 'body', text: 'If you forget the Screen Time passcode, you can use your Apple Account to reset it.' },
    { type: 'field', placeholder: 'Email or Phone Number', hl: 'Your account' },
    { type: 'link', text: 'Forgot password?' },
    { type: 'button', text: 'OK', style: 'filled' },
    { type: 'button', text: 'Cancel', style: 'grey' }
  ],
  alt: 'Screen Time Passcode Recovery asks for an Apple Account email. Enter your own.'
}

// ------------------------------------------------------------------ shared settings: iPhone
S.appLimitsRow = screenTimePage('ios-st-app-limits', 'App Limits', null, 'The Screen Time page. App Limits is the second option under Limit Usage.')
S.alwaysRow = screenTimePage('ios-st-always-allowed', 'Always Allowed', null, 'The Screen Time page. Always Allowed is the third option under Limit Usage.')
S.restrictionsRow = screenTimePage('ios-st-restrictions', 'Content & Privacy Restrictions', null, 'The Screen Time page. Content & Privacy Restrictions is under Restrictions, lower down.')

S.addLimit = {
  id: 'ios-add-limit', os: 'ios', device: "Your child's phone",
  bar: { back: 'Screen Time', title: 'App Limits' },
  blocks: [
    { type: 'note', text: 'Set daily time limits for app categories you want to manage. Limits reset every day at midnight.' },
    { type: 'group', rows: [{ label: 'Add Limit', blue: true, hl: 'Tap' }] }
  ],
  alt: 'The App Limits page with a blue Add Limit button.'
}

S.chooseApps = {
  id: 'ios-choose-apps', os: 'ios', device: "Your child's phone",
  bar: { close: true, title: 'Choose Apps', right: 'Next', rightHl: 'Then tap' },
  blocks: [
    { type: 'caption', text: 'Most Used Apps, Categories and Websites' },
    { type: 'group', rows: [
      { select: 'off', icon: 'layout-grid', colour: '#5E5CE6', label: 'All Apps & Categories', avoid: "Don't tick" },
      { select: 'on', icon: 'users-round', colour: '#FF2D55', label: 'Social', value: 'All', chevron: true, hl: 'Tick every category', span: 12 },
      { select: 'on', icon: 'gamepad-2', colour: '#007AFF', label: 'Games', value: 'All', chevron: true },
      { select: 'on', icon: 'clapperboard', colour: '#FF3B30', label: 'Entertainment', value: 'All', chevron: true },
      { select: 'on', icon: 'palette', colour: '#FF9500', label: 'Creativity', value: 'All', chevron: true },
      { select: 'on', icon: 'briefcase', colour: '#007AFF', label: 'Productivity & Finance', value: 'All', chevron: true },
      { select: 'on', icon: 'graduation-cap', colour: '#34C759', label: 'Education', value: 'All', chevron: true },
      { select: 'on', icon: 'book-open', colour: '#5AC8FA', label: 'Information & Reading', value: 'All', chevron: true },
      { select: 'on', icon: 'heart-pulse', colour: '#FF2D55', label: 'Health & Fitness', value: 'All', chevron: true },
      { select: 'on', icon: 'wrench', colour: '#8E8E93', label: 'Utilities', value: 'All', chevron: true },
      { select: 'on', icon: 'shopping-cart', colour: '#FF9500', label: 'Shopping & Food', value: 'All', chevron: true },
      { select: 'on', icon: 'plane', colour: '#34C759', label: 'Travel', value: 'All', chevron: true },
      { select: 'on', icon: 'ellipsis', colour: '#8E8E93', label: 'Other', value: 'All', chevron: true },
      { select: 'off', icon: 'globe', colour: '#8E8E93', label: 'Websites', chevron: true, avoid: "Don't tick" }
    ] }
  ],
  alt: 'Choose Apps. Every category from Social to Other is ticked. All Apps & Categories at the top and Websites at the bottom are not ticked. Next is at the top right.'
}

S.timePicker = {
  id: 'ios-time-picker', os: 'ios', device: "Your child's phone",
  bar: { back: 'Choose Apps', title: '12 Categories', right: 'Add' },
  blocks: [
    { type: 'group', rows: [{ label: 'Time', value: '0 min, Every Day' }] },
    { type: 'picker', values: ['0 hours', '0 min'], hl: 'Set to 0' }
  ],
  alt: 'A time picker, set to 0 hours and 0 minutes.'
}

S.blockAtEnd = {
  id: 'ios-block-at-end', os: 'ios', device: "Your child's phone",
  bar: { back: 'App Limits', title: '12 Categories' },
  blocks: [
    { type: 'group', rows: [{ label: 'App Limit', toggle: 'on' }] },
    { type: 'group', rows: [{ label: 'Time', value: '0 min, Every Day', chevron: true }] },
    { type: 'group', rows: [{ label: 'Block at End of Limit', toggle: 'on', hl: 'Turn on' }], footer: 'Turn on to block the app when the limit expires.' },
    { type: 'group', header: 'Categories, Apps and Websites', rows: [
      { icon: 'users-round', colour: '#FF2D55', label: 'Social, Games, Entertainment and 9 more' },
      { label: 'Edit List', blue: true }
    ] }
  ],
  alt: 'The limit you just made. App Limit is on, Time is 0 minutes every day, and Block at End of Limit is switched on.'
}

S.alwaysAllowedList = {
  id: 'ios-always-allowed', os: 'ios', device: "Your child's phone",
  bar: { back: 'Screen Time', title: 'Always Allowed' },
  blocks: [
    { type: 'group', header: 'Allowed Apps', rows: [
      { icon: 'phone', colour: '#34C759', label: 'Phone', app: true },
      { minus: true, icon: 'message-circle', colour: '#34C759', label: 'Messages', app: true },
      { minus: true, icon: 'map', colour: '#30B0C7', label: 'Maps', app: true },
      { minus: true, icon: 'play', colour: '#34C759', label: 'FaceTime', app: true, hl: 'Remove if not on the list' }
    ] },
    { type: 'group', header: 'Choose Apps', rows: [
      { plus: true, icon: 'message-square', colour: '#25D366', label: 'WhatsApp', app: true, hl: 'Add each app on the list' },
      { plus: true, icon: 'cloud-sun', colour: '#1E90FF', label: 'Weather', app: true },
      { plus: true, icon: 'camera', colour: '#8E8E93', label: 'Camera', app: true },
      { plus: true, icon: 'play', colour: '#FF0000', label: 'YouTube', app: true }
    ] }
  ],
  cut: true,
  alt: 'Always Allowed. The top section lists the allowed apps, each with a red minus. The lower section lists other apps, each with a green plus.'
}

S.restrictionsOn = {
  id: 'ios-restrictions-on', os: 'ios', device: "Your child's phone",
  bar: { back: 'Screen Time', title: 'Content & Privacy Restrictions' },
  blocks: [
    { type: 'group', rows: [{ label: 'Content & Privacy Restrictions', toggle: 'on', hl: 'Turn on' }] },
    { type: 'group', rows: [
      { label: 'iTunes & App Store Purchases', chevron: true },
      { label: 'Allowed Apps & Features', chevron: true },
      { label: 'App Store, Media, Web & Games', chevron: true },
      { label: 'Intelligence & Siri', chevron: true }
    ] }
  ],
  alt: 'Content & Privacy Restrictions, with the switch at the top turned on.'
}

S.allowedFeatures = {
  id: 'ios-allowed-features', os: 'ios', draft: true, device: "Your child's phone",
  bar: { back: 'Content & Privacy', title: 'Allowed Apps & Features' },
  blocks: [
    { type: 'group', rows: [
      { label: 'Mail', toggle: 'on' },
      { label: 'Safari', toggle: 'on', hl: 'Make sure it is on' },
      { label: 'FaceTime', toggle: 'on' },
      { label: 'Camera', toggle: 'on' },
      { label: 'Wallet', toggle: 'on' }
    ] }
  ],
  cut: true,
  alt: 'Allowed Apps & Features. The switch next to Safari is on.'
}

S.mediaWeb = {
  id: 'ios-media-web', os: 'ios', device: "Your child's phone",
  bar: { back: 'Content & Privacy', title: 'App Store, Media, Web & Games' },
  blocks: [
    { type: 'group', header: 'Allowed Media Services Content', rows: [
      { label: 'Music, Podcasts, News, Fitness', value: 'Explicit', chevron: true },
      { label: 'Movies', value: 'Allow All', chevron: true },
      { label: 'Apps', value: '18+', chevron: true }
    ] },
    { type: 'group', header: 'Web Content', rows: [
      { label: 'Web Content', value: 'Unrestricted', chevron: true, hl: 'Tap' }
    ] }
  ],
  alt: 'App Store, Media, Web & Games. Web Content is near the bottom, set to Unrestricted.'
}

S.approvedSites = {
  id: 'ios-approved-sites', os: 'ios', device: "Your child's phone",
  bar: { back: 'Back', title: 'Web Content' },
  blocks: [
    { type: 'group', header: 'Web Content', rows: [
      { label: 'Unrestricted' },
      { label: 'Limit Adult Websites' },
      { label: 'Only Approved Websites', check: true, hl: 'Choose this' }
    ] },
    { type: 'group', header: 'Only Allow These Websites', rows: [
      { label: 'Apple — Start' },
      { label: 'Discovery Kids' },
      { label: 'Add Website', blue: true, hl: 'Then add each site' }
    ] }
  ],
  alt: 'Web Content set to Only Approved Websites, with a list of websites and an Add Website button.'
}

S.addWebsite = {
  id: 'ios-add-website', os: 'ios', device: "Your child's phone",
  bar: { back: 'Back', title: 'Add Website' },
  blocks: [
    { type: 'group', rows: [
      { label: 'Title', value: 'BBC Bitesize', valueDark: true },
      { label: 'URL', value: 'www.bbc.co.uk/bitesize', valueDark: true, hl: 'Type it exactly' }
    ] }
  ],
  alt: 'Add Website, with a Title and a URL field.'
}

S.safariBlocked = {
  id: 'ios-safari-blocked', os: 'ios', draft: true, device: "Your child's phone",
  bar: {},
  blocks: [
    { type: 'urlbar', text: 'youtube.com' },
    { type: 'message', icon: 'lock', title: 'Restricted Site', text: 'You cannot browse this page at "youtube.com" because it is restricted.', button: 'Allow Website' }
  ],
  alt: 'Safari showing Restricted Site for youtube.com. This is what you want to see.'
}

S.purchasesRow = {
  id: 'ios-purchases-row', os: 'ios', device: "Your child's phone",
  bar: { back: 'Screen Time', title: 'Content & Privacy Restrictions' },
  blocks: [
    { type: 'group', rows: [{ label: 'Content & Privacy Restrictions', toggle: 'on' }] },
    { type: 'group', rows: [
      { label: 'iTunes & App Store Purchases', chevron: true, hl: 'Tap' },
      { label: 'Allowed Apps & Features', chevron: true },
      { label: 'App Store, Media, Web & Games', chevron: true }
    ] }
  ],
  alt: 'Content & Privacy Restrictions. iTunes & App Store Purchases is the first option below the switch.'
}

S.purchases = {
  id: 'ios-purchases', os: 'ios', device: "Your child's phone",
  bar: { back: 'Back', title: 'iTunes & App Store Purchases' },
  blocks: [
    { type: 'group', header: 'Store Purchases & Re-Downloads', rows: [
      { label: 'Installing Apps', value: "Don't Allow", chevron: true, hl: "Set all 3 to Don't Allow", span: 3 },
      { label: 'Deleting Apps', value: "Don't Allow", chevron: true },
      { label: 'In-app Purchases', value: "Don't Allow", chevron: true }
    ] }
  ],
  alt: "iTunes & App Store Purchases, with Installing Apps, Deleting Apps and In-app Purchases all set to Don't Allow."
}

S.allowChanges = {
  id: 'ios-allow-changes', os: 'ios', device: "Your child's phone",
  bar: { back: 'Screen Time', title: 'Content & Privacy Restrictions' },
  blocks: [
    { type: 'group', rows: [
      { label: 'Speech Recognition', value: 'Allow', chevron: true },
      { label: 'Allow Apps to Request to Track', value: 'Allow', chevron: true }
    ], cutTop: true },
    { type: 'group', header: 'Allow Changes', rows: [
      { label: 'Passcode & Face ID', value: "Don't Allow", chevron: true, hl: "Set both to Don't Allow", span: 2 },
      { label: 'Accounts', value: "Don't Allow", chevron: true }
    ] }
  ],
  alt: "Near the bottom of Content & Privacy Restrictions, under Allow Changes: Passcode & Face ID and Accounts, both set to Don't Allow."
}

S.timeLimitScreen = {
  id: 'ios-time-limit', os: 'ios', draft: true, device: "Your child's phone",
  bar: {},
  blocks: [
    { type: 'message', icon: 'hourglass', title: 'Time Limit', text: "You've reached your limit on YouTube.", button: 'Ask For More Time', dark: true }
  ],
  alt: "What your child sees when they open an app that isn't on the list: Time Limit."
}

// ------------------------------------------------------------------ shared settings: Android (Family Link)
const fl = { device: 'Your phone (Family Link)' }

// Family Link on your phone, open at your child. Screen time is on this page.
S.flHome = {
  id: 'fl-home', os: 'android', ...fl,
  bar: { back: true, title: 'Alex' },
  blocks: [
    { type: 'device', name: 'SM-S901B', sub: "Your child's phone (model name)" },
    { type: 'list', rows: [
      { icon: 'hourglass', label: 'Screen time', sub: 'Schedules, time limits, allowed apps', hl: 'Tap' },
      { icon: 'shield', label: 'Controls', sub: 'Google Play, Chrome and Web, YouTube' },
      { icon: 'map-pin', label: 'Location' }
    ] }
  ],
  draft: true,
  alt: "Family Link on your phone, open at your child. Their phone is shown by its model name (here SM-S901B). Tap Screen time: you don't need to go into Controls."
}

// Controls page in Family Link, with one row highlighted
function flControlsPage (id, hlRow, note) {
  const rows = [
    { icon: 'store', label: 'Google Play', sub: 'Download approvals, content ratings' },
    { icon: 'globe', label: 'Google Chrome and Web', sub: 'Which websites your child can visit' },
    { icon: 'play', label: 'YouTube', sub: 'Blocked' },
    { icon: 'search', label: 'Google Search', sub: 'SafeSearch on' }
  ]
  rows.forEach(r => { if (r.label === hlRow) r.hl = 'Tap' })
  return { id, os: 'android', ...fl, bar: { back: true, title: 'Controls' }, blocks: [{ type: 'list', rows }], draft: true, alt: note }
}
S.flControlsChrome = flControlsPage('fl-controls-chrome', 'Google Chrome and Web', 'Controls in Family Link. Google Chrome and Web is in the list straight away, with no Content restrictions page in between.')
S.flControlsPlay = flControlsPage('fl-controls-play', 'Google Play', 'Controls in Family Link, with Google Play highlighted.')

S.flDowntime = {
  id: 'fl-downtime', os: 'android', ...fl,
  bar: { back: true, title: 'Screen time' },
  blocks: [
    { type: 'header', text: 'Schedules' },
    { type: 'list', rows: [
      { icon: 'moon', label: 'Downtime', sub: 'Every day, all day', switch: 'on', hl: 'Turn on Downtime' },
      { icon: 'school', label: 'School time', sub: 'Off', switch: 'off' }
    ] },
    { type: 'header', text: 'Limits' },
    { type: 'list', rows: [
      { icon: 'timer', label: 'Time limits', sub: 'Daily limit and limits for each app' },
      { icon: 'circle-check', label: 'Allowed apps', sub: 'Apps that work during downtime' }
    ] }
  ],
  draft: true,
  alt: 'Screen time in Family Link. Under Schedules there are two: Downtime and School time. Turn on Downtime.'
}

S.flSchedule = {
  id: 'fl-schedule', os: 'android', ...fl,
  bar: { back: true, title: 'Weekly schedule' },
  blocks: [
    { type: 'days', items: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], active: 0 },
    { type: 'list', rows: [
      { label: 'Start', value: '12:00 AM', hl: 'Set these times', span: 2 },
      { label: 'End', value: '11:59 PM' }
    ] },
    { type: 'mbutton', text: 'Apply to all days of the week', hl: 'Then tap' }
  ],
  draft: true,
  alt: 'Downtime schedule: start 12:00 AM, end 11:59 PM, then Apply to all days of the week.'
}

S.flAllowed = {
  id: 'fl-allowed-apps', os: 'android', ...fl,
  bar: { back: true, title: 'Allowed apps' },
  blocks: [
    { type: 'header', text: 'Apps on your list' },
    { type: 'list', rows: [
      { app: true, icon: 'phone', colour: '#34C759', label: 'Phone', value: 'Unlimited time', hl: 'One app at a time', span: 3 },
      { app: true, icon: 'message-circle', colour: '#1A73E8', label: 'Messages', value: 'Unlimited time' },
      { app: true, icon: 'message-square', colour: '#25D366', label: 'WhatsApp', value: 'Unlimited time' }
    ] },
    { type: 'header', text: 'Everything else' },
    { type: 'list', rows: [
      { app: true, icon: 'play', colour: '#FF0000', label: 'YouTube', value: 'Not allowed', muted: true }
    ] }
  ],
  draft: true,
  alt: 'Allowed apps in Family Link. There is no switch for all of them: set each app on the list to Unlimited time, one at a time.'
}

S.flChrome = {
  id: 'fl-chrome', os: 'android', ...fl,
  bar: { back: true, title: 'Google Chrome and Web' },
  blocks: [
    { type: 'list', rows: [
      { radio: 'off', label: 'Allow all sites' },
      { radio: 'off', label: 'Try to block explicit sites' },
      { radio: 'on', label: 'Only allow approved sites', hl: 'Choose this' }
    ] },
    { type: 'header', text: 'Manage sites' },
    { type: 'list', rows: [
      { icon: 'check', label: 'Approved sites', sub: '3 sites', hl: 'Add the sites on the list' },
      { icon: 'ban', label: 'Blocked sites', sub: '0 sites' }
    ] }
  ],
  draft: true,
  alt: 'Google Chrome and Web in Family Link, set to Only allow approved sites.'
}

S.flPlay = {
  id: 'fl-play', os: 'android', ...fl,
  bar: { back: true, title: 'Google Play' },
  blocks: [
    { type: 'header', text: 'Purchases & download approvals' },
    { type: 'list', rows: [
      { radio: 'on', label: 'All content', sub: 'Approval needed for free and paid downloads', hl: 'Choose this' },
      { radio: 'off', label: 'Only paid content' },
      { radio: 'off', label: 'No approval required' }
    ] }
  ],
  draft: true,
  alt: 'Google Play settings in Family Link, with approval needed for all content.'
}

// ------------------------------------------------------------------ screens for steps with no reference screenshot
S.passcodeEntry = {
  id: 'ios-passcode-entry', os: 'ios', draft: true, device: "Your child's phone",
  bar: {},
  blocks: [{ type: 'passcode', title: 'Screen Time Passcode', text: 'Enter a passcode', filled: 2, hl: '4 digits only you know' }],
  alt: 'The Screen Time Passcode keypad. Type a four-digit code your child does not know, then type it again.'
}

S.weeklyReport = {
  id: 'ios-weekly-report', os: 'ios', draft: true, device: "Your child's phone",
  bar: { back: 'Settings', title: 'Screen Time' },
  blocks: [
    { type: 'caption', text: "Alex's iPhone" },
    { type: 'chart', value: '0h 48m', bars: [34, 52, 28, 40, 46, 60, 22], hl: 'Look at this together' },
    { type: 'group', rows: [{ label: 'See All App & Website Activity', chevron: true }] }
  ],
  alt: "The top of Screen Time on your child's phone, with the daily average and a chart for the week."
}

S.parentChildSettings = {
  id: 'ios-parent-child-settings', os: 'ios', draft: true, device: 'Your phone',
  bar: { back: 'Screen Time', title: 'Alex' },
  blocks: [
    { type: 'group', header: 'Limit Usage', rows: [
      { ...ios.downtime, label: 'Downtime', sub: 'Off', chevron: true },
      { ...ios.appLimits, label: 'App Limits', sub: '12 categories, 0 min', chevron: true, hl: 'The settings you made', span: 3 },
      { ...ios.alwaysAllowed, label: 'Always Allowed', sub: 'Phone, Messages, WhatsApp and 5 more', chevron: true },
      { ...ios.restrictions, label: 'Content & Privacy Restrictions', sub: 'On', chevron: true }
    ] }
  ],
  alt: "Your child's Screen Time settings, seen from your own phone: App Limits, Always Allowed and Content & Privacy Restrictions, as you set them."
}

S.swipeDelete = {
  id: 'ios-swipe-delete', os: 'ios', draft: true, device: "Your child's phone",
  bar: { back: 'Back', title: 'Web Content' },
  blocks: [
    { type: 'group', header: 'Only Allow These Websites', rows: [
      { label: 'Apple — Start' },
      { label: 'Discovery Kids' },
      { label: 'Disney', swipe: true, hl: 'Swipe left, tap Delete' },
      { label: 'PBS Kids' },
      { label: 'Add Website', blue: true }
    ] }
  ],
  alt: 'The approved websites list. Swipe left on a website you don\'t want, then tap the red Delete.'
}

S.safariAllowed = {
  id: 'ios-safari-allowed', os: 'ios', draft: true, device: "Your child's phone",
  bar: {},
  blocks: [
    { type: 'urlbar', text: 'bbc.co.uk/bitesize' },
    { type: 'page', title: 'Bitesize', heading: 'Maths: fractions', colour: '#1A1A1A', tint: '#FFF1C9', hl: 'An approved site opens' }
  ],
  alt: 'Safari opening an approved website, BBC Bitesize, as normal.'
}

S.flSignIn = {
  id: 'fl-sign-in', os: 'android', device: 'Your phone',
  bar: {},
  blocks: [
    { type: 'ahero', icon: 'shield-check', title: 'Welcome to Family Link', text: "Sign in with your own Google Account to manage your child's phone." },
    { type: 'list', rows: [{ letter: 'S', colour: '#7B61FF', label: 'Sam Parent', sub: 'sam.parent@gmail.com', hl: 'Your own account' }] },
    { type: 'actions', right: 'Get started' }
  ],
  draft: true,
  alt: 'Family Link asking you to choose an account. Use your own Google Account, not your child\'s.'
}

S.andSettingsGoogle = {
  id: 'and-settings-google', os: 'android', device: "Your child's phone",
  bar: { title: 'Settings' },
  blocks: [
    { type: 'list', rows: [
      { app: true, icon: 'globe', colour: '#1A73E8', label: 'Connections' },
      { app: true, icon: 'bell', colour: '#FF7043', label: 'Notifications' },
      { app: true, icon: 'lock', colour: '#5E35B1', label: 'Security and privacy' },
      { letter: 'G', colour: '#4285F4', label: 'Google', sub: 'Google services', hl: 'Tap' },
      { app: true, icon: 'user', colour: '#00897B', label: 'Accounts and backup' }
    ] }
  ],
  draft: true,
  alt: "The Settings app on your child's phone. Google (on some phones Google services) is in the list; its place varies by brand."
}

S.andSettingsSearch = {
  id: 'and-settings-search', os: 'android', device: "Your child's phone",
  bar: { search: 'parental controls' },
  blocks: [
    { type: 'list', rows: [
      { icon: 'shield-check', label: 'Parental controls', sub: 'Google', hl: 'Tap the result' },
      { icon: 'hourglass', label: 'Digital Wellbeing & parental controls', sub: 'Settings' }
    ] }
  ],
  draft: true,
  alt: "Can't find it? Search Settings for parental controls and tap the result."
}

S.andParentalIntro = {
  id: 'and-parental-intro', os: 'android', device: "Your child's phone",
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'users', title: 'Parental controls', text: 'Set up Family Link to supervise this phone: set screen time limits, manage apps and filter websites.' },
    { type: 'actions', right: 'Get started', hl: "Tap (or Let's do this)" }
  ],
  draft: true,
  alt: 'The start of parental controls set-up, with a Get started button.'
}

S.andWho = {
  id: 'and-who', os: 'android', device: "Your child's phone",
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'user', title: 'Who will use this phone?', text: 'Choose who you are setting up parental controls for.' },
    { type: 'list', rows: [
      { radio: 'on', label: 'Child or teen', sub: "Your child's Google Account", hl: 'Choose this' },
      { radio: 'off', label: 'Parent' }
    ] },
    { type: 'actions', right: 'Next' }
  ],
  draft: true,
  alt: 'A question asking who will use the phone. Choose Child or teen.'
}

S.andParentSignIn = {
  id: 'and-parent-sign-in', os: 'android', device: "Your child's phone",
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'lock', title: 'Parent sign-in', text: 'A parent needs to sign in to supervise this account.' },
    { type: 'afield', label: 'Email or phone', value: 'sam.parent@gmail.com', focus: true, hl: 'Your own Google Account' },
    { type: 'actions', left: 'Forgot email?', right: 'Next' }
  ],
  draft: true,
  alt: "On your child's phone, Family Link asks a parent to sign in. Enter your own Google Account. This only confirms it's you."
}

S.andPin = {
  id: 'and-pin', os: 'android', device: "Your child's phone",
  bar: { back: true },
  blocks: [{ type: 'pin', title: 'Parental controls PIN', text: 'Create a 4-digit PIN', filled: 2, hl: '4 digits only you know' }],
  draft: true,
  alt: 'Set a parental controls PIN: four digits your child does not know. Write it down with your other codes.'
}

S.andAccounts = {
  id: 'and-accounts', os: 'android', device: "Your child's phone",
  bar: { back: true, title: 'Manage accounts' },
  blocks: [
    { type: 'list', rows: [
      { letter: 'G', colour: '#4285F4', label: 'Google', sub: 'alex.child@gmail.com', hl: "Only your child's Google Account" },
      { letter: 'S', colour: '#1428A0', label: 'Samsung account', sub: 'sam.parent@example.com' }
    ] },
    { type: 'mbutton', text: 'Add account' }
  ],
  draft: true,
  alt: "The accounts on your child's phone. The only Google Account is your child's. On a Samsung phone, your own Samsung account can be there too."
}

S.andAgree = {
  id: 'and-child-agree', os: 'android', device: "Your child's phone",
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'shield-check', title: 'Allow supervision', text: "Your parent will be able to manage apps, set screen time limits and see this phone's location." },
    { type: 'afield', label: "Alex's password", value: '••••••••', hl: 'Your child types their password' },
    { type: 'actions', left: 'Cancel', right: 'Agree', hl: 'Then Agree' }
  ],
  draft: true,
  alt: 'Your child agrees to supervision by entering their own password and tapping Agree.'
}

S.flAddSite = {
  id: 'fl-add-site', os: 'android', device: 'Your phone (Family Link)',
  bar: { back: true, title: 'Approved sites' },
  blocks: [
    { type: 'list', rows: [
      { icon: 'globe', label: 'school.example.sch.uk' },
      { icon: 'globe', label: 'moodle.example.org' }
    ] },
    { type: 'dialog', title: 'Add a website', label: 'Website', value: 'bbc.co.uk', hl: 'Main address only', okHl: 'Then Add' }
  ],
  draft: true,
  alt: 'Adding an approved site in Family Link: type the main web address (bbc.co.uk, not bbc.co.uk/bitesize), then tap Add.'
}

// ------------------------------------------------------------------ the shared settings, as steps
const sharedIntro = {
  title: 'The settings we\'re asking you to apply',
  text: [
    'Block everything, then allow back a short list of apps and a short list of websites. You don\'t need to set limits app by app.',
    'Everything else is off: games, social media, video, shopping, and every website not on the list. Anything installed later is blocked automatically, because it isn\'t on the list.',
    `If your child needs an app or a site that isn't here, email ${EMAIL}. We'll answer within five working days: either it goes on the list for everyone, or we tell you why not. Parents built this list and it's still changing.`
  ]
}

const shared = {
  ios: [
    {
      key: 'apps', title: 'Allow only the apps on the list', time: '10 minutes', device: "your child's phone",
      items: [
        'Open **Settings** → **Screen Time** → **App Limits** → **Add Limit**.',
        'Tick **every category in the list, one by one**: Social, Games, Entertainment, Creativity, Productivity & Finance, Education, Information & Reading, Health & Fitness, Utilities, Shopping & Food, Travel and Other. **Do not tick Websites.** Work down the list so you don\'t miss one.',
        '**Do not tick "All Apps & Categories"** at the top. It looks like a shortcut, but it also cuts off web access, which undoes the websites step.',
        'Tap **Next** and set the limit to **0 minutes**.',
        'Turn on **Block at End of Limit**. Without it there\'s an "Ignore Limit" button and nothing holds.',
        'Go back to **Screen Time** → **Always Allowed**.',
        'The top section is what\'s allowed now: Phone, Messages, FaceTime, Maps. Tap the red **−** on anything that isn\'t on your list. Phone can\'t be removed.',
        'The lower section lists everything else installed. Tap the green **+** on each app on your list.'
      ],
      after: ['Apps on the list work normally. Everything else shows a Time Limit screen.'],
      warn: `**If an app on the list is blocked**, check it's in the **top** section of Always Allowed, not the lower one. If it still won't open, email ${EMAIL}. Don't remove the category limit.`,
      screens: [S.appLimitsRow, S.addLimit, S.chooseApps, S.timePicker, S.blockAtEnd, S.alwaysRow, S.alwaysAllowedList, S.timeLimitScreen]
    },
    {
      key: 'web', title: 'Allow only the websites they need', time: '5 minutes', device: "your child's phone",
      intro: 'Blocking an app doesn\'t block its website. This step makes the web work the same way as the apps: only what\'s on the list.',
      items: [
        'Open **Settings** → **Screen Time** → **Content & Privacy Restrictions** and turn it on.',
        'Tap **Allowed Apps & Features** and make sure **Safari** is on.',
        'Go back, then tap **App Store, Media, Web & Games** → **Web Content**.',
        'Choose **Only Approved Websites**.',
        'Swipe left to delete anything on the starter list you don\'t want.',
        'Tap **Add Website** and enter each site from the list, **exactly as written**. A typo stops it working.'
      ],
      check: `**Check it works before you finish.** Open Safari and load one of the approved sites: it should open. Then type in a site that isn't on the list, like youtube.com: it should be blocked. **If the blocked site loads, stop and email ${EMAIL}.** Don't leave it as it is, because your child would have an unrestricted browser, where they could also reach the apps you just blocked.`,
      screens: [S.restrictionsRow, S.restrictionsOn, S.allowedFeatures, S.mediaWeb, S.approvedSites, S.swipeDelete, S.addWebsite, S.safariAllowed, S.safariBlocked]
    },
    {
      key: 'lock', title: 'Lock the settings', time: '3 minutes', device: "your child's phone",
      items: [
        'In **Settings** → **Screen Time** → **Content & Privacy Restrictions** (already on from the last step), tap **iTunes & App Store Purchases**.',
        'Set **Installing Apps**, **Deleting Apps** and **In-app Purchases** to **Don\'t Allow**.',
        'Go back and scroll down to **Allow Changes**. Set **Passcode & Face ID** and **Accounts** to **Don\'t Allow**.'
      ],
      screens: [S.purchasesRow, S.purchases, S.allowChanges]
    }
  ],
  android: [
    {
      key: 'apps', title: 'Allow only the apps on the list', time: '10 minutes', device: 'your phone, in Family Link',
      items: [
        { text: 'Open **Family Link** and tap **Screen time**. You don\'t need to go into Controls.', sub: [
          'If it asks you to **Add device**, your child\'s phone isn\'t linked yet. Follow the instructions it shows: they\'re the same as in **Link your child\'s phone**.',
          'Otherwise you\'ll see your child\'s phone, shown by its model name (for example SM-S901B).'
        ] },
        'Under **Schedules** there are two options, **Downtime** and **School time**. Turn on **Downtime**.',
        'Tap **Weekly schedule** → choose a day → **Start 12:00 AM**, **End 11:59 PM** → **Apply to all days of the week**.',
        'Tap **Allowed apps**. There\'s no switch to allow them all at once, so go through **the apps on the list** one at a time and set each one to **Unlimited time**.'
      ],
      after: ['To block one app outright rather than by schedule: **Screen time** → **Time limits** → tap the app → turn **Allowed** off. Some system apps can\'t be blocked.'],
      screens: [S.flHome, S.flDowntime, S.flSchedule, S.flAllowed]
    },
    {
      key: 'web', title: 'Allow only the websites they need', time: '5 minutes', device: 'your phone, in Family Link',
      intro: 'Blocking an app doesn\'t block its website. This step makes the web work the same way as the apps: only what\'s on the list.',
      items: [
        'In Family Link, go to **Controls** → **Google Chrome and Web**.',
        'Choose **Only allow approved sites**.',
        'Tap **Approved sites** and add each site on the list. **Use the main web address only**, such as bbc.co.uk. Family Link won\'t accept a page within a site, such as bbc.co.uk/bitesize.',
        '**If other browsers aren\'t already blocked**, block them: **Screen time** → **Time limits** → tap each browser → turn **Allowed** off.'
      ],
      warn: `If a homework site won't load, don't switch the filter off. Email ${EMAIL} and we'll add it to the shared list.`,
      screens: [S.flControlsChrome, S.flChrome, S.flAddSite]
    },
    {
      key: 'lock', title: 'Lock the settings', time: '3 minutes', device: 'your phone, in Family Link',
      items: [
        'In Family Link, go to **Controls** → **Google Play**.',
        'Under download approvals, choose **All content**, so nothing new can be installed without your approval.'
      ],
      screens: [S.flControlsPlay, S.flPlay]
    }
  ]
}

// ------------------------------------------------------------------ route-specific screens
S.parentSettingsRoot = {
  id: 'ios-settings-account', os: 'ios', device: 'Your phone',
  bar: { largeTitle: 'Settings' },
  blocks: [
    { type: 'search' },
    { type: 'profile', initials: 'SP', name: 'Sam Parent', sub: 'Apple Account, iCloud and more', hl: 'Tap your name' },
    { type: 'group', rows: [
      { ...ios.family, label: 'Family', chevron: true }
    ] }
  ],
  cut: true,
  alt: 'The top of Settings on your phone. Your name and photo are at the top.'
}

S.appleAccount = {
  id: 'ios-apple-account', os: 'ios', device: 'Your phone',
  bar: { back: 'Settings', title: 'Apple Account' },
  blocks: [
    { type: 'avatar', initials: 'SP', name: 'Sam Parent', sub: 'sam.parent@example.com' },
    { type: 'group', rows: [
      { ...ios.personal, label: 'Personal Information', chevron: true },
      { ...ios.security, label: 'Sign-In & Security', chevron: true },
      { ...ios.payment, label: 'Payment & Shipping', chevron: true },
      { ...ios.subs, label: 'Subscriptions', chevron: true }
    ] },
    { type: 'group', rows: [
      { ...ios.icloud, label: 'iCloud', value: '5 GB', chevron: true },
      { ...ios.family, label: 'Family', value: 'Set Up', chevron: true, hl: 'Tap' }
    ] }
  ],
  alt: 'Your Apple Account page. Family is at the bottom.'
}

S.inviteFamily = {
  id: 'ios-invite-family', os: 'ios', device: 'Your phone',
  bar: { close: true },
  blocks: [
    { type: 'hero', icon: 'users', colour: '#007AFF', title: 'Invite Family', text: 'You can add up to five more people to your family.' },
    { type: 'group', rows: [
      { icon: 'plus', plainIcon: true, label: 'Invite Others', blue: true, hl: 'Child has an account' },
      { icon: 'baby', plainIcon: true, label: 'Create Child Account', blue: true, hl: 'No account yet' }
    ], footer: 'Child accounts can be created by a parent or legal guardian for children aged 12 or younger.' }
  ],
  alt: 'Invite Family, with two options: Invite Others, or Create Child Account.'
}

S.createChild = {
  id: 'ios-create-child', os: 'ios', device: 'Your phone',
  bar: { close: true },
  blocks: [
    { type: 'hero', icon: 'baby', colour: '#007AFF', title: 'Create a Child Account', text: 'Child accounts can only be created by a parent or guardian.' },
    { type: 'group', rows: [
      { label: 'First name', placeholder: true },
      { label: 'Last name', placeholder: true },
      { label: 'Date of birth', value: 'Add', hl: 'Check it is correct' }
    ] },
    { type: 'note', text: "Your child's date of birth is used to set up age-appropriate services and parental controls." }
  ],
  alt: 'Create a Child Account, with fields for first name, last name and date of birth.'
}

S.parentScreenTime = {
  id: 'ios-parent-screen-time', os: 'ios', draft: true, device: 'Your phone',
  bar: { back: 'Settings', title: 'Screen Time' },
  blocks: [
    { type: 'group', header: 'Sam Parent', rows: [
      { label: 'See All App & Website Activity', chevron: true }
    ] },
    { type: 'group', header: 'Family', rows: [
      { icon: 'user', colour: '#FF9500', label: 'Alex', chevron: true, hl: "Your child's name" }
    ] }
  ],
  alt: "Screen Time on your phone. Your child's name is listed under Family."
}

S.familyLinkStore = {
  id: 'store-family-link', os: 'android', device: 'Your phone',
  bar: { search: 'family link' },
  blocks: [
    { type: 'storeitem', icon: 'shield-check', name: 'Google Family Link', sub: 'Google LLC · Parental control', button: 'Install', hl: 'Install' }
  ],
  alt: 'The app store, showing Google Family Link with an Install button.'
}

S.androidParental = {
  id: 'and-parental-controls', os: 'android', device: "Your child's phone",
  bar: { back: true, title: 'Google' },
  blocks: [
    { type: 'header', text: 'Kids & family' },
    { type: 'list', rows: [
      { icon: 'shield-check', label: 'Parental controls', sub: 'Set up Family Link', hl: 'Tap' },
      { icon: 'users', label: 'Family group' }
    ] },
    { type: 'header', text: 'Account & security' },
    { type: 'list', rows: [
      { icon: 'lock', label: 'Security' }
    ] }
  ],
  draft: true,
  alt: "On your child's phone: Settings, Google. Parental controls is under Kids & family (on Samsung phones: Children and family)."
}

// Family Link on your phone: adding your child's account
S.flHasAccount = {
  id: 'fl-has-account', os: 'android', device: 'Your phone',
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'user-plus', title: 'Does your child have a Google Account?', text: 'You need one for your child to supervise their phone.' },
    { type: 'list', rows: [
      { radio: 'off', label: 'Yes', sub: 'Add their account' },
      { radio: 'on', label: 'No', sub: 'Create an account for them', hl: 'No account yet' }
    ] },
    { type: 'actions', right: 'Next' }
  ],
  draft: true,
  alt: "Family Link asks whether your child has a Google Account. If they don't, choose No and create one."
}

S.flCreateAccount = {
  id: 'fl-create-account', os: 'android', device: 'Your phone',
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'user', title: 'Create an account for your child', text: "Enter your child's details." },
    { type: 'afield', label: 'First name', value: 'Alex' },
    { type: 'afield', label: 'Date of birth', value: '14 March 2014', focus: true, hl: 'Check it is correct' },
    { type: 'afield', label: 'Gmail address', value: 'alex.child@gmail.com' },
    { type: 'actions', right: 'Next' }
  ],
  draft: true,
  alt: "Creating your child's Google Account: name, date of birth and a Gmail address, then a password. Check the date of birth is correct."
}

S.flChooseSettings = {
  id: 'fl-choose-settings', os: 'android', device: 'Your phone',
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'settings', title: 'Choose settings for Alex', text: 'You can change these at any time.' },
    { type: 'list', rows: [
      { radio: 'on', label: 'In fewer steps', sub: 'Start with recommended settings', hl: 'Choose this' },
      { radio: 'off', label: 'In more steps', sub: 'Go through each setting' }
    ] },
    { type: 'actions', right: 'Next' }
  ],
  draft: true,
  alt: 'Choose settings for your child. Choose fewer steps: you make the study settings later in this guide.'
}

S.flPersonalise = {
  id: 'fl-personalise', os: 'android', device: 'Your phone',
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'cookie', title: 'Personalisation', text: "Choose whether Google uses Alex's activity to personalise what they see." },
    { type: 'actions', left: 'Reject all', leftButton: true, leftHl: 'You can tap this', right: 'Accept all' }
  ],
  draft: true,
  alt: 'Family Link asks about personalising your data. You can tap Reject all.'
}

S.flProfile = {
  id: 'fl-profile', os: 'android', device: 'Your phone (Family Link)',
  bar: { back: true, title: 'Alex' },
  blocks: [
    { type: 'device', name: 'SM-S901B', sub: 'Last active 5 minutes ago', hl: 'This means it worked' },
    { type: 'list', rows: [
      { icon: 'hourglass', label: 'Screen time today', value: '1 hr 4 min' },
      { icon: 'phone', label: 'Most used', value: 'Phone, Messages' }
    ] }
  ],
  draft: true,
  alt: "Your child's profile in Family Link, showing their phone and recent activity."
}

// ------------------------------------------------------------------ before you start, routes
const intro = {
  title: 'Setting up the restrictions on your child\'s phone',
  lead: '**What we\'re asking you to do:** spend about 30 to 40 minutes setting up a small number of settings on your child\'s phone, then leave them running.',
  text: [
    'Everything you need is already built into the phone. There is nothing to buy, nothing to download, and no separate app to learn.',
    '**Start here:** find your child\'s phone, sit down with it for 40 minutes, and work through the one route below that matches your situation.'
  ],
  before: [
    '**Your child\'s phone, physically in your hands.** You\'ll need it for part of this, even if you manage it from your own phone afterwards.',
    '**The password for the account on your child\'s phone**: their Apple Account password (iPhone) or their Google Account password (Android). If your child set the phone up themselves, they will know it and you may not. Ask for it now rather than halfway through.',
    '**Somewhere to write down a new passcode.** You are about to create a four-digit code that locks these settings. If you forget it, you may need to erase the phone completely. Write it where you keep other passwords, not in a note on your child\'s phone.'
  ],
  beforeWarn: '**Don\'t use your child\'s birthday, your PIN, or a code your child already knows.** The settings only hold if the code does.',
  moreDevices: `**If your child has more than one device**, such as an old or second phone, do the main phone first and tell us about the others at ${EMAIL}.`,
  androidNote: '**A note on Android phones.** Samsung, Google Pixel, Xiaomi, Motorola and the rest all arrange their Settings menu slightly differently. Rather than describe a menu that might not match yours, we give you the name of the setting. **Open Settings, tap the search box or magnifying glass at the top, and type the name.** It will find it whatever your phone.',
  optional: {
    title: 'Optional: time caps on apps on the list',
    text: [
      'This isn\'t part of what we\'re asking. Skip it if you\'re happy as things stand.',
      `The list works by exempting apps from limits, so an app on the list will ignore a time limit you set on it, on both iPhone and Android. If you want a cap on one of them, email ${EMAIL} and we'll sort out the set-up for your phone.`
    ]
  }
}

const routes = [
  {
    id: 'A', slug: 'guide-iphone-parent', os: 'ios', illus: 'guide-iphone.svg', hero: '',
    title: 'Your child has an iPhone, and you have an iPhone or iPad',
    short: 'iPhone, managed from your iPhone or iPad',
    lead: 'This is the fullest version. You set the restrictions once, then you can see and change them from your own phone without asking for theirs.',
    time: 'About 30 minutes',
    steps: [
      {
        title: 'Put your child in your family group', time: '5 minutes', device: 'your phone',
        intro: 'Skip this step if your child is already in your Family Sharing group.',
        items: [
          'On **your** phone, open **Settings** and tap **your name** at the very top.',
          'Tap **Family**.',
          { text: 'Tap **Add Member** (or the **+**), then follow the prompts to add your child.', sub: [
            'If your child already has their own Apple Account, choose **Invite Others** and invite that account.',
            'If they don\'t have one, choose **Create Child Account**.'
          ] },
          '**Check the date of birth is correct.** The phone uses your child\'s age to decide which protections apply automatically. A wrong birth year quietly switches off protections you think you have.',
          'To confirm you\'re an adult, you\'ll be asked for the security code (CVV) of the card on your Apple Account. **You won\'t be charged.** If that card has expired, update it first in **Settings** → your name → **Payment & Shipping**.'
        ],
        after: ['If your child\'s Apple Account was set up with an adult\'s age, you can now correct it and convert it to a child account from this same screen. It\'s worth doing.'],
        screens: [S.parentSettingsRoot, S.appleAccount, S.inviteFamily, S.createChild]
      },
      {
        title: 'Turn on Screen Time and set your code', time: '5 minutes', device: "your child's phone",
        items: [
          'On **your child\'s** phone, open **Settings** and tap **Screen Time**.',
          'If Screen Time isn\'t on yet, turn it on.',
          'Tap **Lock Screen Time Settings** (on some phones: **Use Screen Time Passcode**).',
          'Enter a **four-digit code that your child does not know**, then enter it again.',
          'When asked for an Apple Account for recovery, **enter your own**, not your child\'s. This is how you get back in if you forget the code.'
        ],
        warn: 'This is the step people skip, and it\'s the reason restrictions come off a fortnight later. Without a code, your child can undo everything in about four taps.',
        screens: [S.settingsScreenTime, S.activitySheet, S.lockSettings, S.passcodeEntry, S.passcodeRecovery]
      },
      { shared: 'apps' },
      { shared: 'web' },
      { shared: 'lock' },
      {
        title: 'Check it reached your phone', time: '2 minutes', device: 'your phone',
        items: [
          'On **your** phone, open **Settings** → **Screen Time**.',
          'Your child\'s name should appear. Tap it.',
          'You should see the settings you just made. If you don\'t, check both phones are signed into the right accounts and both are up to date.'
        ],
        after: ['From now on you can change any of these from your own phone, and you\'ll be told if your child tries to get around the code.'],
        screens: [S.parentScreenTime, S.parentChildSettings]
      }
    ]
  },
  {
    id: 'B', slug: 'guide-iphone-child', os: 'ios', illus: 'guide-iphone.svg', hero: 'smart-hero--lemon',
    title: 'Your child has an iPhone, and you have an Android phone',
    short: 'iPhone, set up on your child\'s phone',
    lead: 'Apple\'s remote controls only work from one Apple device to another. That doesn\'t stop you doing any of this: you set it up directly on your child\'s phone and lock it with a code only you know. The restrictions are exactly as strong. The only thing you lose is being able to change them later from your own phone.',
    time: 'About 25 minutes',
    steps: [
      {
        title: 'Turn on Screen Time and set your code', time: '5 minutes', device: "your child's phone",
        items: [
          'On **your child\'s** phone, open **Settings** and tap **Screen Time**.',
          'Turn Screen Time on if it isn\'t already. A screen like the one shown will pop up.',
          'Tap **Lock Screen Time Settings** (on some phones: **Use Screen Time Passcode**).',
          'Enter a **four-digit code your child does not know**. Enter it again to confirm.',
          { text: 'You\'ll be asked for an Apple Account so the code can be recovered.', sub: [
            '**If you have an Apple Account of your own**, even an old one from an iPad or an old phone, use it. Do not use your child\'s.',
            '**If you don\'t have one**, you can skip this. But then a forgotten code means erasing the phone, so write the code down properly first.'
          ] }
        ],
        screens: [S.settingsScreenTime, S.activitySheet, S.lockSettings, S.passcodeEntry, S.passcodeRecovery]
      },
      { shared: 'apps' },
      { shared: 'web' },
      { shared: 'lock' },
      {
        title: 'Agree how you\'ll check in', time: '2 minutes', device: "your child's phone, together",
        items: [
          'Because you can\'t see these settings from your own phone, agree a moment with your child, say Sunday evening, when you\'ll look at the phone together for two minutes.',
          'Doing it openly and on a schedule works far better than checking without telling them.'
        ],
        screens: [S.weeklyReport]
      }
    ]
  },
  {
    id: 'C', slug: 'guide-android', os: 'android', illus: 'guide-android.svg', hero: 'smart-hero--mint',
    title: 'Your child has an Android phone, and you have an Android or iPhone',
    short: 'Android phone, managed with Family Link',
    lead: 'Google\'s Family Link works whichever phone you have, including an iPhone. Your child\'s phone needs to be an Android.',
    time: 'About 40 minutes',
    steps: [
      {
        title: 'Get the Family Link app', time: '2 minutes', device: 'your phone',
        items: [
          'Open the **Play Store** (Android) or the **App Store** (iPhone).',
          'Search for **Family Link** and install it.',
          'Open it and sign in with **your own** Google Account (often ending in @gmail.com).'
        ],
        screens: [S.familyLinkStore, S.flSignIn]
      },
      {
        title: 'Add your child\'s Google Account', time: '10 minutes', device: 'your phone, in Family Link',
        intro: 'Once you\'ve signed in, Family Link asks whether your child has a Google Account.',
        items: [
          { text: '**If they don\'t have one**, choose **No** and follow the prompts to create one: their name, date of birth, a Gmail address and a password.', sub: [
            '**Check the date of birth is correct.** Google uses your child\'s age to decide which protections apply. A wrong birth year quietly switches off protections you think you have.',
            'Write down the new address and password. You\'ll need them on your child\'s phone in the next step.'
          ] },
          '**If they already have one**, choose **Yes** and follow the prompts. Check the date of birth on their account is correct too.',
          'After you set the password, read what Google shows you and tap to agree.',
          'Google then checks it\'s you. You may get a code by text message, and you may be asked for a card\'s details to confirm you\'re over 18. **You won\'t be charged.**',
          'Family Link shows you what it can do. Tap through to the end.',
          'At **Choose settings for** your child, choose **fewer steps**. You\'ll make the study\'s settings later in this guide.',
          'When asked about personalising your data, you can tap **Reject all**.'
        ],
        after: ['You\'ll then reach Family Link\'s main screen.'],
        screens: [S.flHasAccount, S.flCreateAccount, S.flChooseSettings, S.flPersonalise]
      },
      {
        title: 'Link your child\'s phone', time: '10 minutes', device: "your child's phone",
        intro: '**Before you start, check the accounts on your child\'s phone.** The only Google Account on it must be your child\'s. If your own Google Account is signed in on their phone, remove it first (search Settings for **Accounts**), or set-up won\'t let you continue.',
        items: [
          'On your **child\'s** phone, open **Settings** and tap **Google** (on some phones: **Google services**). You don\'t need anything called **All services**.',
          'Tap **Parental controls**. It\'s under **Kids & family** (on Samsung phones: **Children and family**).',
          'Tap **Get started**, choose **Child or teen**, then choose your child\'s account.',
          'When asked for a parent, sign in with **your own** Google Account. This only confirms it\'s you.',
          'If asked, set a **parental controls PIN**: four digits your child doesn\'t know. Write it down with your other codes, and don\'t let your child see you type it.',
          'You\'ll be asked about lots of other settings along the way. Go straight through: accepting them all or saying no to them all are both fine, because you\'ll make the study\'s settings next.',
          'Your child enters their own password and taps **Agree**.',
          { text: '**On a Samsung phone**, you may also be asked to set up parental controls with a Samsung account. If so:', sub: [
            'Sign in on their phone with **your own** Samsung account. If you don\'t have one, you can create one there, even if your own phone isn\'t a Samsung.',
            'Go to **Family** → **Invite new members** → **Create child account**, and use your child\'s Google (Gmail) address.',
            'Your Samsung account can stay on their phone. Your Google Account must not.'
          ] }
        ],
        after: ['That\'s the link made. From now on you manage everything from Family Link on your phone, which now shows your child\'s phone.', 'Can\'t find Parental controls? Search Settings for **parental controls**.'],
        screens: [S.andAccounts, S.andSettingsGoogle, S.androidParental, S.andParentalIntro, S.andWho, S.andParentSignIn, S.andPin, S.andAgree, S.andSettingsSearch]
      },
      { shared: 'apps' },
      { shared: 'web' },
      { shared: 'lock' },
      {
        title: 'Check it worked', time: '2 minutes', device: 'your phone',
        items: [
          'In Family Link, open your child\'s profile.',
          'If it shows their phone and recent activity, the link is live.',
          'If it shows nothing after a few hours, check the phone is switched on, connected, and signed into the supervised account.'
        ],
        screens: [S.flProfile]
      }
    ]
  }
]

// ------------------------------------------------------------------ review notes (for the team, not families)
const review = [
  { area: 'Route A, where to set it up', note: 'When a child is in Family Sharing, their Screen Time is usually managed from the parent\'s phone (Settings, Screen Time, the child\'s name), and the passcode recovery screen may not appear. Test whether steps 2 to 5 of Route A should happen on the parent\'s phone instead. That would also make Route A simpler.' },
  { area: 'Route A, linking the new account', note: 'Creating a child account on your phone doesn\'t sign your child\'s iPhone into it, and the passcode recovery step may also lead on to linking the child\'s account. The guide needs a step for signing their iPhone in, and an answer for a child whose iPhone already uses another account: sign out and start again, or carry on if it is already a child account in your family. Test on an iPhone, with screenshots from the child\'s phone.' },
  { area: 'Route A, card check', note: 'Creating a child account asks for the CVV of the card on the parent\'s Apple Account. This is now in step 1. Not yet tested to the end, because the test account\'s card had expired.' },
  { area: 'iPhone categories', note: 'Review suggestion: tell parents to leave unticked any category they want their child to use, in an app or on the web, such as Education or Information & Reading. That would allow every app in that category, not just the ones on the list, so it changes what we\'re asking. Decide before changing the guide.' },
  { area: 'Android, tested on a phone', note: 'Route C was tested on a Samsung Galaxy S22 (SM-S901B) with a new test child account, and the guide now follows those notes: creating the child\'s account in Family Link, Settings, Google (not All services), Children and family on Samsung, the parental controls PIN, Screen time without Controls, Schedules (Downtime or School time), Time limits (not App limits), Google Chrome and Web, and Google Play straight from Controls. The screens are redrawn from the notes, not from screenshots, so they stay marked as drafts. Take screenshots on the next test.' },
  { area: 'Android, Samsung account', note: 'On the Samsung, parental controls also asked for a Samsung account (the parent\'s own, with a child account created inside it), plus a card check. It isn\'t clear whether Family Link needs this, or whether other brands ask for something similar. Test on a Pixel and one other brand, then decide whether the Samsung part of Route C step 3 stays.' },
  { area: 'Android, websites', note: 'Family Link only accepts a whole site (bbc.co.uk), not a page within it (bbc.co.uk/bitesize). Allowing bbc.co.uk also allows the rest of the BBC, including iPlayer. Write the website list as whole sites, and check what else each one opens up.' },
  { area: 'Android, allowed apps', note: 'Apps are allowed one at a time. The test note said "Go to allowlist": check the exact label Family Link uses on this screen and update the step and the drawing.' },
  { area: 'Android, existing account', note: 'Only the "create a new account" path was tested. Test a child who already has a Google Account, including one with the wrong date of birth.' },
  { area: 'Software versions', note: 'All iPhone screens follow your screenshots (iOS 18 and 26). iOS 27 changes parental controls. Check every screen on the version families will have in April 2027.' }
]

module.exports = { EMAIL, allowlist, sharedIntro, shared, intro, routes, review }
