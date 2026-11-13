/*
 * SMART Study – restrictions guidance (single source)
 *
 * Everything the set-up guides say lives here: the two guides (iPhone and
 * Android), their steps, the versions of the "Block apps" step we're testing,
 * the allowed-apps list and a description of every phone screen.
 * `npm run build:guides` turns this file into:
 *   - the two guide pages on the microsite, and guide-versions.html (the
 *     versions of the "Block apps" step side by side, for the team)
 *   - one SVG per screen (assets/guides/screens/)
 *   - an editable Word version (exports/SMART-restrictions-guidance.docx)
 *   - one board per guide, and one of the versions, for Figma (exports/figma/)
 *
 * Text: **bold** marks the words to look for on the phone.
 * Screens: see tools/screens.js for what each field does.
 */

const EMAIL = 'smartphonestudy@public.io'

// ------------------------------------------------------------------ the allowlist
const allowlist = {
  apps: [
    { name: 'Phone', for: 'Calls', icon: 'phone', colour: '#34C759', iosDefault: true, androidAlways: true },
    { name: 'Messages', for: 'Texts', icon: 'message-circle', colour: '#34C759', iosDefault: true },
    { name: 'WhatsApp', for: 'Family and friends', icon: 'message-square', colour: '#25D366' },
    { name: 'Maps', android: 'Google Maps', for: 'Getting around', icon: 'map', colour: '#30B0C7', iosDefault: true },
    { name: 'Life360', for: 'Location', icon: 'map-pin', colour: '#7B61FF', tbc: true },
    { name: 'Weather', for: 'Weather', icon: 'cloud-sun', colour: '#1E90FF' },
    { name: 'Moodle', for: 'Schoolwork', icon: 'graduation-cap', colour: '#F98012', tbc: true },
    { name: 'School app', label: "your child's school app", for: 'Timetable and notices', icon: 'school', colour: '#003A69', tbc: true },
    { name: 'Camera', for: 'Photos', icon: 'camera', colour: '#8E8E93' },
    { name: 'Clock', for: 'Alarms', icon: 'clock', colour: '#1C1C1E' }
  ],
  websites: '[PLACEHOLDER: [SCHOOL DOMAIN], [Moodle], [BBC Bitesize], [others agreed with parents]]',
  placeholder: '[PLACEHOLDER: replace with the co-designed list.]'
}

// The apps, as words for the steps: "**WhatsApp**, **Weather** and **Camera**".
// Apps still to be confirmed are in [square brackets].
const andList = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]
const appWords = (apps, os) => andList(apps.map(a => {
  const n = (os === 'android' && a.android) || a.label || a.name
  return a.tbc ? `**[${n}]**` : `**${n}**`
}))
const APPS = {
  iosKeep: appWords(allowlist.apps.filter(a => a.iosDefault)),
  iosAdd: appWords(allowlist.apps.filter(a => !a.iosDefault)),
  android: appWords(allowlist.apps.filter(a => !a.androidAlways), 'android')
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

// Choose Apps, the list of app categories. `ticked` is the categories with a tick;
// `marks` adds outlines to rows by name ({ hl, avoid, span }).
const CATEGORIES = [
  { icon: 'users-round', colour: '#FF2D55', label: 'Social' },
  { icon: 'gamepad-2', colour: '#007AFF', label: 'Games' },
  { icon: 'clapperboard', colour: '#FF3B30', label: 'Entertainment' },
  { icon: 'palette', colour: '#FF9500', label: 'Creativity' },
  { icon: 'briefcase', colour: '#007AFF', label: 'Productivity & Finance' },
  { icon: 'graduation-cap', colour: '#34C759', label: 'Education' },
  { icon: 'book-open', colour: '#5AC8FA', label: 'Information & Reading' },
  { icon: 'heart-pulse', colour: '#FF2D55', label: 'Health & Fitness' },
  { icon: 'wrench', colour: '#8E8E93', label: 'Utilities' },
  { icon: 'shopping-cart', colour: '#FF9500', label: 'Shopping & Food' },
  { icon: 'plane', colour: '#34C759', label: 'Travel' },
  { icon: 'ellipsis', colour: '#8E8E93', label: 'Other' }
]
const TEN = CATEGORIES.map(c => c.label).filter(l => l !== 'Information & Reading' && l !== 'Utilities')
const TOP3 = ['Social', 'Games', 'Entertainment']

function chooseAppsScreen (id, ticked, marks, alt) {
  return {
    id, os: 'ios', device: "Your child's phone",
    bar: { close: true, title: 'Choose Apps', right: 'Next', rightHl: 'Then tap' },
    blocks: [
      { type: 'caption', text: 'Most Used Apps, Categories and Websites' },
      { type: 'group', rows: [
        { select: 'off', icon: 'layout-grid', colour: '#5E5CE6', label: 'All Apps & Categories', avoid: "Don't tick" },
        ...CATEGORIES.map(c => ({ select: ticked.includes(c.label) ? 'on' : 'off', ...c, value: 'All', chevron: true, ...(marks[c.label] || {}) })),
        { select: 'off', icon: 'globe', colour: '#8E8E93', label: 'Websites', chevron: true, avoid: "Don't tick" }
      ] }
    ],
    alt
  }
}

S.chooseApps = chooseAppsScreen('ios-choose-apps', TEN, {
  Social: { hl: 'Tick', span: 6 },
  'Information & Reading': { avoid: 'Leave unticked' },
  'Health & Fitness': { hl: 'Tick' },
  Utilities: { avoid: 'Leave unticked' },
  'Shopping & Food': { hl: 'Tick', span: 3 }
}, 'Choose Apps. Every category from Social to Other is ticked except Information & Reading and Utilities. All Apps & Categories at the top and Websites at the bottom are not ticked either. Next is at the top right.')

S.timePicker = {
  id: 'ios-time-picker', os: 'ios', device: "Your child's phone",
  bar: { back: 'Choose Apps', title: '10 Categories', right: 'Add' },
  blocks: [
    { type: 'group', rows: [{ label: 'Time', value: '0 min, Every Day' }] },
    { type: 'picker', values: ['0 hours', '0 min'], hl: 'Set to 0' }
  ],
  alt: 'A time picker, set to 0 hours and 0 minutes.'
}

S.blockAtEnd = {
  id: 'ios-block-at-end', os: 'ios', device: "Your child's phone",
  bar: { back: 'App Limits', title: '10 Categories' },
  blocks: [
    { type: 'group', rows: [{ label: 'App Limit', toggle: 'on' }] },
    { type: 'group', rows: [{ label: 'Time', value: '0 min, Every Day', chevron: true }] },
    { type: 'group', rows: [{ label: 'Block at End of Limit', toggle: 'on', hl: 'Turn on' }], footer: 'Turn on to block the app when the limit expires.' },
    { type: 'group', header: 'Categories, Apps and Websites', rows: [
      { icon: 'users-round', colour: '#FF2D55', label: 'Social, Games, Entertainment and 7 more' },
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
      { minus: true, icon: 'play', colour: '#34C759', label: 'FaceTime', app: true, hl: 'Remove anything else' }
    ] },
    { type: 'group', header: 'Choose Apps', rows: [
      { plus: true, icon: 'message-square', colour: '#25D366', label: 'WhatsApp', app: true, hl: 'Add the apps in the guide' },
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
  id: 'ios-allowed-features', os: 'ios', device: "Your child's phone",
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
  id: 'ios-safari-blocked', os: 'ios', device: "Your child's phone",
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
  id: 'ios-time-limit', os: 'ios', device: "Your child's phone",
  bar: {},
  blocks: [
    { type: 'message', icon: 'hourglass', title: 'Time Limit', text: "You've reached your limit on YouTube.", button: 'Ask For More Time', dark: true }
  ],
  alt: "What your child sees when they open an app that's blocked: Time Limit."
}

// ------------------------------------------------------------------ shared settings: Android (Family Link)
const fl = { device: 'Your phone (Family Link)' }

// Family Link on your phone (drawn from screenshots of Family Link on an iPhone)
const FL_BG = '#EEF2F8'
const flNav = active => ({ type: 'navbar', active, items: [
  { icon: 'chart-no-axes-column', label: 'Screen time' },
  { icon: 'user-round', label: 'Controls' },
  { icon: 'map-pin', label: 'Location' }
] })

// The Screen time tab, where Family Link opens
function flScreenTime (id, hl, note) {
  return {
    id, os: 'android', ...fl, bg: FL_BG,
    bar: { none: true },
    blocks: [
      { type: 'flheader', name: 'Alex', parent: 'S' },
      { type: 'stat', value: '0 min', text: 'Time spent today' },
      { type: 'fldevice', name: 'SM-S901B', status: 'Downtime until 11:59', hl: hl.device },
      { type: 'list', card: true, rows: [
        { bubble: '#D3E3FD', colour: '#0B57D0', icon: 'hourglass', label: 'Time limits', sub: 'Daily limit off · App limits set', hl: hl.timeLimits },
        { bubble: '#F9DEDC', colour: '#B3261E', icon: 'calendar', label: 'Schedules', sub: 'In downtime · School time off', hl: hl.schedules }
      ] },
      flNav(0)
    ],
    alt: note
  }
}

// The Controls tab, with one row highlighted
function flControlsPage (id, hlRow, note) {
  const rows = [
    { icon: 'store', label: 'Google Play', sub: 'App approvals and restrictions' },
    { icon: 'play', label: 'YouTube', sub: 'Tools for parents, children and teens' },
    { icon: 'globe', label: 'Google Chrome and web', sub: 'Website and browser restrictions' },
    { icon: 'search', label: 'Google search', sub: 'SafeSearch and personalisation' }
  ]
  rows.forEach(r => { if (r.label === hlRow) r.hl = 'Tap' })
  const nav = flNav(1)
  nav.items[1].hl = 'Controls'
  return {
    id, os: 'android', ...fl, bg: FL_BG,
    bar: { none: true },
    blocks: [
      { type: 'flheader', name: 'Alex', parent: 'S' },
      { type: 'account', name: 'Alex', email: 'alex.child@gmail.com' },
      { type: 'list', card: true, rows },
      nav
    ],
    alt: note
  }
}
S.flControlsChrome = flControlsPage('fl-controls-chrome', 'Google Chrome and web', 'The Controls tab in Family Link (at the bottom). Google Chrome and web is the third option.')
S.flControlsPlay = flControlsPage('fl-controls-play', 'Google Play', 'The Controls tab in Family Link (at the bottom). Google Play is the first option.')

S.flTimeLimits = {
  id: 'fl-time-limits', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'Time limits', center: true },
  blocks: [
    { type: 'fcard', icon: 'timer', title: 'Daily limit', text: 'Set the total time that Alex can spend on their devices daily', switch: 'off', hl: 'Leave off', hlSwitch: true },
    { type: 'fcard', icon: 'grip', title: 'App limits', text: 'Block, set time limits or choose unlimited time for individual apps', chevron: true, hl: 'Tap', rows: [
      { label: 'Unlimited time', apps: [{ icon: 'message-square', colour: '#25D366' }, { icon: 'phone', colour: '#34C759' }] }
    ] },
    { type: 'footnote', text: 'Eligible devices will lock when daily limit is reached. Calls and apps set to unlimited will still be available.' }
  ],
  alt: 'Time limits in Family Link. Leave Daily limit off and tap App limits. Apps set to Unlimited time are shown underneath.'
}

S.flAppLimits = {
  id: 'fl-app-limits', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'App limits', center: true },
  blocks: [
    { type: 'list', card: true, rows: [
      { app: true, icon: 'globe', colour: '#4285F4', label: 'Google Chrome', sub: '0 min', badge: 'infinity', badgeHl: 'Unlimited' },
      { app: true, icon: 'map', colour: '#34A853', label: 'Google Maps', sub: '0 min', badge: 'infinity' },
      { app: true, icon: 'message-circle', colour: '#1A73E8', label: 'Google Messages', sub: '0 min', badge: 'infinity' },
      { app: true, icon: 'play', colour: '#FF0000', label: 'YouTube', sub: '0 min' },
      { app: true, icon: 'message-square', colour: '#25D366', label: 'WhatsApp', sub: '0 min', badge: 'infinity' }
    ] }
  ],
  cut: true,
  alt: 'App limits in Family Link. Each app your child needs, and Google Chrome, is set to Unlimited time and shows an infinity sign. The others have no sign.'
}

const WEEK = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
S.flSchedule = {
  id: 'fl-schedule', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'Weekly schedule', center: true },
  blocks: [{ type: 'weekdays', items: WEEK, value: '12:00–11:59', hl: 'Tap a day' }],
  alt: 'The weekly schedule. Once it is set, every day shows 12:00–11:59.'
}

S.flScheduleDay = {
  id: 'fl-schedule-day', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'Weekly schedule', center: true },
  blocks: [
    { type: 'weekdays', items: WEEK.slice(0, 3), value: '12:00–11:59' },
    { type: 'sheet', title: 'Mondays', overlap: 30 },
    { type: 'fcard', rows: [{ label: 'Downtime ON', bold: true, switch: 'on' }] },
    { type: 'fcard', rows: [
      { label: 'Start time', value: '12:00', hl: 'Set these times' },
      { label: 'End time', value: '11:59' }
    ] },
    { type: 'fcard', rows: [{ label: 'Apply to all days of the week', checkbox: 'on', hl: 'Tick this' }] },
    { type: 'buttons', left: 'Cancel', right: 'Done', hl: 'Then Done' }
  ],
  alt: 'One day of the weekly schedule. Downtime ON is switched on, start time 12:00, end time 11:59, and Apply to all days of the week is ticked. Then tap Done.'
}

S.flAllowed = {
  id: 'fl-allowed-apps', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'Allowed apps', center: true },
  blocks: [
    { type: 'fcard', icon: 'infinity', title: 'Unlimited apps', text: 'Allow Alex to access unlimited apps during downtime', switch: 'on', hl: 'Turn on', hlSwitch: true, rows: [
      { label: '9 apps selected', chevron: true }
    ] },
    { type: 'footnote', text: 'Alex can always call during downtime. You can select if unlimited apps can be used too.' }
  ],
  alt: 'Allowed apps in Family Link. Turn on Unlimited apps, so the apps you set to Unlimited time still work during downtime.'
}

S.flChrome = {
  id: 'fl-chrome', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'Google Chrome and web', center: true },
  blocks: [
    { type: 'para', text: 'You can control which sites Alex visits when signed in to Chrome, as well as in some Android apps. Alex can ask to visit blocked sites too.' },
    { type: 'fcard', rows: [
      { radio: 'off', label: 'Allow all sites' },
      { radio: 'off', label: 'Try to block explicit sites', sub: 'No filter is perfect, but this should help' },
      { radio: 'on', label: 'Only allow approved sites', sub: 'Customise your own list and approve requests', hl: 'Choose this' }
    ] },
    { type: 'fcard', title: 'Manage sites', text: "Allow specific sites for Alex and block sites that you don't want them visiting", rows: [
      { label: 'Approved sites', sub: '2 sites', chevron: true, hl: 'Add the sites in the guide' },
      { label: 'Blocked sites', sub: '0 sites', chevron: true }
    ] }
  ],
  alt: 'Google Chrome and web in Family Link, set to Only allow approved sites. Add the sites in the guide under Approved sites.'
}

S.flPlay = {
  id: 'fl-play', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'Google Play', center: true },
  blocks: [
    { type: 'fcard', title: 'Purchases and download approvals', text: 'Manage what Alex can purchase and download on Google Play', rows: [
      { label: 'Require approval for', sub: 'All content', chevron: true, hl: 'Set to All content' }
    ] },
    { type: 'fcard', title: 'Content restrictions', text: 'Choose what Alex can browse on Google Play', rows: [
      { label: 'Apps and games', sub: 'PEGI 12', chevron: true },
      { label: 'Films', sub: '12', chevron: true },
      { label: 'TV', sub: '12', chevron: true }
    ] }
  ],
  cut: true,
  alt: 'Google Play in Family Link. Require approval for is set to All content.'
}

// ------------------------------------------------------------------ screens for steps with no reference screenshot
S.passcodeEntry = {
  id: 'ios-passcode-entry', os: 'ios', device: "Your child's phone",
  bar: {},
  blocks: [{ type: 'passcode', title: 'Screen Time Passcode', text: 'Enter a passcode', filled: 2, hl: '4 digits only you know' }],
  alt: 'The Screen Time Passcode keypad. Type a four-digit code your child does not know, then type it again.'
}

S.weeklyReport = {
  id: 'ios-weekly-report', os: 'ios', device: "Your child's phone",
  bar: { back: 'Settings', title: 'Screen Time' },
  blocks: [
    { type: 'caption', text: "Alex's iPhone" },
    { type: 'chart', value: '0h 48m', bars: [34, 52, 28, 40, 46, 60, 22], hl: 'Look at this together' },
    { type: 'group', rows: [{ label: 'See All App & Website Activity', chevron: true }] }
  ],
  alt: "The top of Screen Time on your child's phone, with the daily average and a chart for the week."
}

S.parentChildSettings = {
  id: 'ios-parent-child-settings', os: 'ios', device: 'Your phone',
  bar: { back: 'Screen Time', title: 'Alex' },
  blocks: [
    { type: 'group', header: 'Limit Usage', rows: [
      { ...ios.downtime, label: 'Downtime', sub: 'Off', chevron: true },
      { ...ios.appLimits, label: 'App Limits', sub: '10 categories, 0 min', chevron: true, hl: 'The settings you made', span: 3 },
      { ...ios.alwaysAllowed, label: 'Always Allowed', sub: 'Phone, Messages, WhatsApp and 5 more', chevron: true },
      { ...ios.restrictions, label: 'Content & Privacy Restrictions', sub: 'On', chevron: true }
    ] }
  ],
  alt: "Your child's Screen Time settings, seen from your own phone: App Limits, Always Allowed and Content & Privacy Restrictions, as you set them."
}

S.swipeDelete = {
  id: 'ios-swipe-delete', os: 'ios', device: "Your child's phone",
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
  id: 'ios-safari-allowed', os: 'ios', device: "Your child's phone",
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
  alt: "Can't find it? Search Settings for parental controls and tap the result."
}

S.andParentalIntro = {
  id: 'and-parental-intro', os: 'android', device: "Your child's phone",
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'users', title: 'Parental controls', text: 'Set up Family Link to supervise this phone: set screen time limits, manage apps and filter websites.' },
    { type: 'actions', right: 'Get started', hl: "Tap (or Let's do this)" }
  ],
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
  alt: "On your child's phone, Family Link asks a parent to sign in. Enter your own Google Account. This only confirms it's you."
}

S.andPin = {
  id: 'and-pin', os: 'android', device: "Your child's phone",
  bar: { back: true },
  blocks: [{ type: 'pin', title: 'Parental controls PIN', text: 'Create a 4-digit PIN', filled: 2, hl: '4 digits only you know' }],
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
  alt: 'Your child agrees to supervision by entering their own password and tapping Agree.'
}

const SITES = [
  { tile: '▪▪▪', label: 'bbc.co.uk', remove: true },
  { tile: 'W', label: 'wikipedia.org', remove: true }
]
S.flApprovedSites = {
  id: 'fl-approved-sites', os: 'android', device: 'Your phone (Family Link)', bg: FL_BG,
  bar: { back: true, title: 'Approved sites (2)', center: true },
  blocks: [
    { type: 'addbutton', text: 'Add site', hl: 'Tap' },
    { type: 'list', card: true, rows: SITES }
  ],
  alt: 'Approved sites in Family Link, with an Add site button above the sites you have added. The X removes a site.'
}

S.flAddSite = {
  id: 'fl-add-site', os: 'android', device: 'Your phone (Family Link)', bg: FL_BG,
  bar: { back: true, title: 'Approved sites (2)', center: true },
  blocks: [
    { type: 'addbutton', text: 'Add site' },
    { type: 'list', card: true, rows: SITES },
    { type: 'sheet', title: 'Add site', overlap: -60 },
    { type: 'afield', label: 'Website', value: 'bbc.co.uk', focus: true, hl: 'Type the address' },
    { type: 'para', text: 'You can allow the entire domain or a web address.' },
    { type: 'buttons', left: 'Cancel', right: 'Done', hl: 'Then Done' }
  ],
  alt: 'Add site in Family Link: type the web address (here bbc.co.uk), then tap Done.'
}

// ------------------------------------------------------------------ screens for the versions of the "Block apps" step
// The ticks and outlines differ between versions; the settings screens around them are the same.
S.chooseAppsRule = chooseAppsScreen('ios-choose-apps-rule', TEN, {
  Social: { hl: 'Tick every category…', span: 6 },
  'Information & Reading': { avoid: '…except this one' },
  'Health & Fitness': { hl: 'Tick' },
  Utilities: { avoid: '…and this one' },
  'Shopping & Food': { hl: 'Tick', span: 3 }
}, 'Choose Apps. Every category is ticked except Information & Reading and Utilities. All Apps & Categories at the top and Websites at the bottom are not ticked either. Next is at the top right.')

S.chooseAppsTop3 = chooseAppsScreen('ios-choose-apps-top3', TOP3, {
  Social: { hl: 'Tick these three', span: 3 }
}, 'Choose Apps. Only Social, Games and Entertainment are ticked. All Apps & Categories at the top is not ticked. Next is at the top right.')

S.chooseAppsStaged = chooseAppsScreen('ios-choose-apps-staged', TEN, {
  Social: { hl: '1. These three first', span: 3 },
  Creativity: { hl: '2. Then the rest', span: 3 },
  'Information & Reading': { avoid: 'Leave unticked' },
  'Health & Fitness': { hl: '2.' },
  Utilities: { avoid: 'Leave unticked' },
  'Shopping & Food': { hl: '2.', span: 3 }
}, 'Choose Apps. First Social, Games and Entertainment are ticked, then every other category except Information & Reading and Utilities. Next is at the top right.')

S.timePicker3 = { ...S.timePicker, id: 'ios-time-picker-3', bar: { ...S.timePicker.bar, title: '3 Categories' } }

S.blockAtEnd3 = {
  ...S.blockAtEnd,
  id: 'ios-block-at-end-3',
  bar: { back: 'App Limits', title: '3 Categories' },
  blocks: S.blockAtEnd.blocks.map(b => b.header ? { ...b, rows: [{ icon: 'users-round', colour: '#FF2D55', label: 'Social, Games and Entertainment' }, { label: 'Edit List', blue: true }] } : b)
}

// Family Link: the Screen time tab, pointing at one row
S.flHomeSchedules = flScreenTime('fl-home-schedules', { schedules: 'Tap' }, 'Family Link on your phone opens on Screen time. Your child\'s phone is shown by its model name (here SM-S901B). Schedules is below it.')
S.flHomeLimits = flScreenTime('fl-home-limits', { timeLimits: 'Tap' }, 'Screen time in Family Link. Time limits is below your child\'s phone.')

// Schedules, for turning on downtime (Step 4) and then for allowed apps (Step 5)
function flSchedulesPage (id, hl, note) {
  return {
    id, os: 'android', ...fl, bg: FL_BG,
    bar: { back: true, title: 'Schedules', center: true },
    blocks: [
      { type: 'fcard', icon: 'moon', title: 'Downtime', text: 'Help Alex sleep by limiting access on their devices at night', switch: 'on', hl: hl.downtime, hlSwitch: !!hl.downtime, rows: [
        { label: 'Tonight', value: '12:00–11:59' },
        { label: 'Weekly schedule', sub: 'Every night, 12:00–11:59', chevron: true, hl: hl.weekly },
        { label: 'Allowed apps', sub: 'Unlimited apps are turned on', chevron: true, hl: hl.allowed }
      ] },
      { type: 'fcard', icon: 'school', title: 'School time', text: "Minimise distractions on Alex's devices during class", switch: 'off' },
      { type: 'footnote', text: 'Eligible devices will be locked during downtime and be silenced during school time. Access to certain apps will be limited. Calls will still be available.' }
    ],
    alt: note
  }
}
S.flDowntime = flSchedulesPage('fl-downtime', { downtime: 'Turn on', weekly: 'Set to 12:00–11:59' }, 'Schedules in Family Link. Turn on Downtime and set its weekly schedule to 12:00–11:59. Leave School time off.')
S.flDowntimeAllowed = flSchedulesPage('fl-downtime-allowed', { allowed: 'Tap' }, 'Schedules in Family Link, with Downtime on. Allowed apps is the last row under Downtime.')

// App limits with the big apps blocked one by one (the "top three" versions on Android)
S.flAppLimitsBlocked = {
  id: 'fl-app-limits-blocked', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'App limits', center: true },
  blocks: [
    { type: 'list', card: true, rows: [
      { app: true, icon: 'play', colour: '#FF0000', label: 'YouTube', sub: 'Blocked', badge: 'ban', badgeHl: 'Block' },
      { app: true, icon: 'music', colour: '#111111', label: 'TikTok', sub: 'Blocked', badge: 'ban' },
      { app: true, icon: 'gamepad-2', colour: '#4A4A4A', label: 'Roblox', sub: 'Blocked', badge: 'ban' },
      { app: true, icon: 'message-square', colour: '#25D366', label: 'WhatsApp', sub: '0 min', badge: 'infinity' },
      { app: true, icon: 'map', colour: '#34A853', label: 'Google Maps', sub: '0 min', badge: 'infinity' }
    ] }
  ],
  cut: true,
  alt: 'App limits in Family Link. Social media, game and video apps such as YouTube, TikTok and Roblox are set to Block. The apps your child needs keep their infinity sign.'
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

// Your child's iPhone: signing it in to their account (from screenshots, iOS 26)
S.childSettingsSignIn = {
  id: 'ios-child-sign-in-row', os: 'ios', device: "Your child's phone",
  bar: { largeTitle: 'Settings' },
  blocks: [
    { type: 'search' },
    { type: 'profile', icon: 'user', name: 'Sign in to your iPhone', sub: 'Set up iCloud, the App Store and more.', hl: 'Tap' },
    { type: 'group', rows: [
      { ...ios.notifications, label: 'Notifications', chevron: true },
      { ...ios.screenTime, label: 'Screen Time', chevron: true }
    ] }
  ],
  cut: true,
  alt: 'Settings on your child\'s iPhone, before it is signed in. Sign in to your iPhone is at the top.'
}

S.childAppleSignIn = {
  id: 'ios-child-apple-account', os: 'ios', device: "Your child's phone", bg: '#FFFFFF',
  bar: { back: true },
  blocks: [
    { type: 'center', icon: 'cloud', title: 'Apple Account', text: 'Sign in with an email or phone number to use iCloud, the App Store, Messages or other Apple services.' },
    { type: 'field', placeholder: 'Email or Phone Number' },
    { type: 'link', center: true, text: 'Forgot password?' },
    { type: 'link', center: true, text: 'Sign in a child in my Family', hl: 'Tap this' },
    { type: 'button', text: 'Continue', style: 'grey' }
  ],
  alt: 'Apple Account sign-in on your child\'s iPhone. Don\'t type in an account: tap Sign in a child in my Family.'
}

S.guardianSignIn = {
  id: 'ios-guardian-sign-in', os: 'ios', device: "Your child's phone", bg: '#FFFFFF',
  bar: { back: 'Back' },
  blocks: [
    { type: 'center', icon: 'users', title: 'Parent or Guardian Sign-In', text: 'Sign in to your Apple Account to set up this device for a child aged 12 or younger.' },
    { type: 'field', placeholder: 'Email or Phone Number', hl: 'Your own Apple Account' },
    { type: 'button', text: 'Continue', style: 'grey' }
  ],
  alt: 'Parent or Guardian Sign-In. Sign in with your own Apple Account.'
}

S.whichChild = {
  id: 'ios-which-child', os: 'ios', device: "Your child's phone", bg: '#FFFFFF',
  bar: { back: 'Back' },
  blocks: [
    { type: 'center', icon: 'users', title: 'Which child will use this iPhone?', text: 'You can sign into an existing account or create a new one for a child under 13 years old.' },
    { type: 'avatars', items: [
      { initials: 'AL', name: 'Alex', sub: 'Child', selected: true, hl: 'Your child' },
      { add: true, name: 'Add Child' }
    ] },
    { type: 'button', text: 'Continue', style: 'filled' }
  ],
  alt: 'Which child will use this iPhone? Choose your child, or Add Child if they don\'t have an account yet, then Continue.'
}

S.parentScreenTime = {
  id: 'ios-parent-screen-time', os: 'ios', device: 'Your phone',
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
  alt: 'Choose settings for your child. Choose fewer steps: you make the study settings later in this guide.'
}

S.flPersonalise = {
  id: 'fl-personalise', os: 'android', device: 'Your phone',
  bar: { back: true },
  blocks: [
    { type: 'ahero', icon: 'cookie', title: 'Personalisation', text: "Choose whether Google uses Alex's activity to personalise what they see." },
    { type: 'actions', left: 'Reject all', leftButton: true, leftHl: 'You can tap this', right: 'Accept all' }
  ],
  alt: 'Family Link asks about personalising your data. You can tap Reject all.'
}

S.flProfile = flScreenTime('fl-profile', { device: 'This means it worked' }, "Screen time in Family Link, showing your child's phone and what it's doing now, such as Downtime until 11:59.")

// ------------------------------------------------------------------ the guides
//
// Two guides: one for a child's iPhone, one for a child's Android phone.
// Each has two parts: connecting the child's phone to the parent's (Part 1),
// then the study settings (Part 2).
//
// [[step:key]] becomes "Step 3" (a link on the website), so the numbers stay
// right if steps are added or moved.
// Step fields: title, time, device, intro, items, after, warn, check, screens,
//   already  "Already done?" note at the top of the step: what to keep, or where to go
//   skip     a "skip ahead" box: { text, to: step key }
//   list     true adds the "If your child needs another app" note
//   variants true means the step has versions to test (see blockVersions below)

const intro = {
  title: 'Setting up your child\'s phone',
  lead: '**What we\'re asking you to do:** turn on a few settings that are already built into your child\'s phone, so it only has a short list of apps and websites. Then leave them running.',
  text: [
    '**How it works:** you block apps, then allow back the few your child needs, such as calls, messages and maps. Then you limit the web to a few sites, and lock it all with a code only you know. Anything installed later is blocked automatically.',
    'There\'s nothing to buy and nothing to install on your child\'s phone.'
  ],
  webOnly: 'You can stop between steps and come back. This page remembers the steps you\'ve ticked.',
  before: [
    '**Your child\'s phone, in your hands.** You\'ll need it for part of this, even if you manage it from your own phone afterwards.',
    '**The password for the account on your child\'s phone**: their Apple Account password (iPhone) or their Google Account password (Android). If your child set the phone up themselves, they may know it and you may not. Ask for it now rather than halfway through.',
    '**Somewhere safe to write down a new code.** You\'re about to create a four-digit code that locks these settings. If you forget it, you may need to erase the phone. Write it where you keep other passwords, not on your child\'s phone.',
    '**Only if you\'re creating a new account for your child: a credit card.** Apple and Google may ask for one to check you\'re over 18. It\'s only an ID check and you won\'t be charged. On an iPhone, if this is what stops you, you can skip that part.'
  ],
  beforeWarn: '**Don\'t use your child\'s birthday, your bank PIN, or a code your child already knows.** The settings only hold if the code does.',
  moreDevices: `**If your child has more than one device**, such as an old phone or a tablet, do the main phone first and tell us about the others at ${EMAIL}.`,
  androidNote: '**A note on Android phones.** Samsung, Google Pixel, Xiaomi, Motorola and the rest arrange their Settings slightly differently. If a step doesn\'t match, **open Settings, tap the search box or magnifying glass at the top, and type the name of the setting.** It will find it whatever your phone.',
  optional: {
    title: 'Optional: time caps on the apps you allowed',
    text: [
      'This isn\'t part of what we\'re asking. Skip it if you\'re happy as things stand.',
      `The list works by exempting apps from limits, so an app you've allowed will ignore a time limit you set on it, on both iPhone and Android. If you want a cap on one of them, email ${EMAIL} and we'll sort out the set-up for your phone.`
    ]
  }
}

// Please don't hand it to your child
const yourself = {
  title: 'Please do this yourself, not your child',
  text: [
    'Your child may know their way round the phone better than you, and it\'s tempting to hand it over. Please don\'t. **Whoever sets this up knows the code, and whoever knows the code can undo all of it.**',
    'Sit together and explain what you\'re doing, if you like. But hold the phone and type the codes yourself, where nobody can see.'
  ]
}

// Shown at the step where parents allow apps back, on both phones
allowlist.discretion = {
  title: 'If your child needs another app',
  text: [
    'You can allow back one more app yourself, in the same way: for example one their school or a club uses.',
    '**Please use your judgement.** Will they need it most weeks? Does it have videos, a feed, games, or chat with people they don\'t know? If it has any of those, leave it blocked. If you\'re not sure, leave it blocked and ask us.',
    `Please tell us about any app you add, at ${EMAIL}. If other families need it too, we'll add it to the guide for everyone.`
  ]
}

// ------------------------------------------------------------------ the "Block apps" step: versions to test
// Every version ends in a working set-up. A and B, and D if finished, block the same
// apps; C blocks fewer. The guide shows `shown`; add ?version=C to a guide's address to
// see another. guide-versions.html lays them side by side for the team.
const blockVersions = {
  step: 'block',
  shown: 'B',
  title: 'Testing the "Block apps" step',
  lead: 'This is the step that decides how much of the phone is blocked, and the one where parents are most likely to stop or make a mistake. These are four versions of the picture and the words, to try with parents before we settle on one.',
  measure: [
    '**Which settings families end up with.** Ask a sample of parents for a screenshot of App Limits (iPhone) or App limits (Android) once they\'ve finished. On an iPhone it says how many categories are limited, such as "10 Categories" or "3 Categories".',
    '**How many finish.** How many tick this step as done, and how many go on to tick the last step.',
    '**Where they get stuck.** Help emails and "Tell us about a problem" messages that mention this step.',
    '**In sessions with parents:** how long the step takes, whether anyone ticks All Apps & Categories by mistake, and what they say when they reach the list of categories.'
  ],
  versions: [
    {
      id: 'A', name: 'Ten categories, listed one by one', tag: 'The previous guide',
      what: 'The words and picture from the previous guides. Parents tick ten categories by name, with reasons for the two they leave.',
      endState: 'Ten categories blocked',
      why: 'The baseline: the full restriction, as it\'s been tested so far.',
      watch: 'A long list to work through. Parents may miss one, or tick All Apps & Categories as a shortcut.',
      ios: {
        items: [
          'Open **Settings** → **Screen Time** → **App Limits** → **Add Limit**.',
          'Tick these categories **one by one**: Social, Games, Entertainment, Creativity, Productivity & Finance, Education, Health & Fitness, Shopping & Food, Travel and Other. Work down the list so you don\'t miss one.',
          '**Leave Information & Reading and Utilities unticked**, and don\'t tick **Websites**. Your child\'s phone needs these two for getting on the web at all. The websites step then limits the web to the sites on the list.',
          '**Do not tick "All Apps & Categories"** at the top. It looks like a shortcut, but it also cuts off web access, which undoes the websites step.',
          'Tap **Next** and set the limit to **0 minutes**.',
          'Turn on **Block at End of Limit**. Without it there\'s an "Ignore Limit" button and nothing holds.'
        ],
        screens: [S.appLimitsRow, S.addLimit, S.chooseApps, S.timePicker, S.blockAtEnd, S.timeLimitScreen]
      },
      android: {
        items: [
          'Open **Family Link**. It opens on **Screen time** (bottom left).',
          'Tap **Schedules**. Turn on **Downtime**, and leave **School time** off.',
          'Tap **Weekly schedule**, then **Mon**. Check **Downtime ON** is switched on, set **Start time** to **12:00** and **End time** to **11:59**, tick **Apply to all days of the week** and tap **Done**. Every day should now show **12:00–11:59**, so downtime covers the whole day.'
        ],
        screens: [S.flHomeSchedules, S.flDowntime, S.flScheduleDay, S.flSchedule]
      }
    },
    {
      id: 'B', name: 'Ten categories, one simple rule', tag: 'In the guides now',
      what: 'The same settings as A. The instruction becomes one rule, "tick every category except two", with a number to check against, a reason, a reassurance that nothing is deleted, and what to do if one app is needed.',
      endState: 'Ten categories blocked',
      why: 'One rule is easier to follow than a list of ten. Saying nothing is deleted, and pointing to a single-app exception, should stop parents unticking a whole category to keep one app.',
      watch: 'Pointing to the exception may lead some parents to allow back more apps than they need.',
      ios: {
        intro: '**This is the step that does the work.** One limit blocks whole categories of apps, including any your child installs later. In the next step you allow back the few your child needs.',
        items: [
          'Open **Settings** → **Screen Time** → **App Limits** → **Add Limit**.',
          { text: '**Tick every category except two.** Leave **Information & Reading** and **Utilities** unticked: the phone needs them to open any website, and [[step:web]] limits the web separately.', sub: [
            '**Don\'t tick "All Apps & Categories"** at the top, or **Websites** at the bottom. They look like shortcuts, but they cut off the web too.'
          ] },
          'Tap **Next**. The top of the screen should say **10 Categories**. If it says a different number, go back and check the ticks.',
          'Set the time to **0 minutes** and tap **Add**.',
          'Turn on **Block at End of Limit**. Without it, your child gets an **Ignore Limit** button and nothing holds.'
        ],
        after: [
          '**Nothing is deleted.** Apps, photos and messages stay on the phone, just locked. You can change any of this later with your code.',
          '**Need one app from a ticked category, such as a map or a school app?** Don\'t untick the whole category. Allow back just that app in the next step.'
        ],
        screens: [S.appLimitsRow, S.addLimit, S.chooseAppsRule, S.timePicker, S.blockAtEnd, S.timeLimitScreen]
      },
      android: {
        intro: '**This is the step that does the work.** Family Link doesn\'t group apps into categories, so the way to block everything at once, including apps installed later, is downtime for the whole day. It sounds drastic, but it\'s only the first half: in the next step you allow back the few apps your child needs.',
        items: [
          'Open **Family Link**. It opens on **Screen time** (bottom left). Tap **Schedules**.',
          'Turn on **Downtime**. Leave **School time** off.',
          'Tap **Weekly schedule**, then **Mon**. Check **Downtime ON** is switched on, set **Start time** to **12:00** and **End time** to **11:59**, tick **Apply to all days of the week** and tap **Done**.',
          'Every day should now show **12:00–11:59**. That means downtime covers the whole day.'
        ],
        after: [
          '**Your child\'s phone will lock, apart from calls, until you finish the next step.** That\'s expected. Nothing is deleted: apps, photos and messages stay on the phone.',
          '**Need another app?** You can allow it back in the next step too.'
        ],
        screens: [S.flHomeSchedules, S.flDowntime, S.flScheduleDay, S.flSchedule]
      }
    },
    {
      id: 'C', name: 'Top three only', tag: 'A lighter set-up',
      what: 'Block only social media, games and video (on an iPhone, the Social, Games and Entertainment categories). Everything else stays open.',
      endState: 'Three categories blocked',
      why: 'The shortest ask. These three hold the apps children spend most time on, so more parents may finish.',
      watch: 'Weaker. Creativity, shopping and other apps stay open, and on Android a parent has to find each app by hand. This changes what the study tests, not just the wording, so it needs agreeing as a trial decision before families see it.',
      ios: {
        intro: '**This is the step that does the work.** You block the three categories that hold the apps children spend most time on: social media, games and video. That includes any your child installs later.',
        items: [
          'Open **Settings** → **Screen Time** → **App Limits** → **Add Limit**.',
          { text: '**Tick three categories: Social, Games and Entertainment.** Leave the rest unticked.', sub: [
            '**Don\'t tick "All Apps & Categories"** at the top. It looks like a shortcut, but it blocks everything, the web included.'
          ] },
          'Tap **Next**. The top of the screen should say **3 Categories**.',
          'Set the time to **0 minutes** and tap **Add**.',
          'Turn on **Block at End of Limit**. Without it, your child gets an **Ignore Limit** button and nothing holds.'
        ],
        after: [
          '**Nothing is deleted.** Apps, photos and messages stay on the phone, just locked. You can change any of this later with your code.',
          'Messaging apps such as WhatsApp are in **Social**, so they\'re blocked too. You\'ll allow WhatsApp back in the next step.'
        ],
        screens: [S.appLimitsRow, S.addLimit, S.chooseAppsTop3, S.timePicker3, S.blockAtEnd3, S.timeLimitScreen]
      },
      android: {
        already: '**Already blocked some apps?** Keep them blocked. If you have downtime at bedtime, you can keep that too.',
        intro: '**This is the step that does the work.** You block the social media, game and video apps on your child\'s phone. These hold the apps children spend most time on.',
        items: [
          'Open **Family Link** on **Screen time** and tap **Time limits**, then **App limits**.',
          'Go down the list. Tap each social media, game or video app, such as YouTube, TikTok, Snapchat or Roblox, and choose **Block**.',
          'Leave everything else as it is. You don\'t need downtime in this version.'
        ],
        after: [
          'New apps can\'t be installed without your approval once you\'ve done [[step:lock]], so nothing new slips in.',
          '**Nothing is deleted.** A blocked app stays on the phone, just locked.'
        ],
        screens: [S.flHomeLimits, S.flTimeLimits, S.flAppLimitsBlocked]
      },
      // Step 5 on Android: nothing else is blocked, so there is less to allow back
      androidAllow: {
        intro: 'In this version only the apps you chose are blocked, so this is a quick check.',
        items: [
          `In **App limits**, check that none of these says **Blocked**: ${APPS.android}. If one does, tap it and choose **Unlimited time**.`,
          'Set **Google Chrome** to **Unlimited time** too, so the websites in the next step open.'
        ],
        after: [],
        screens: [S.flAppLimits]
      }
    },
    {
      id: 'D', name: 'Top three first, then the rest', tag: 'Two-stage ask',
      what: 'The same end result as A and B, asked in two stages: first social media, games and video, then everything else.',
      endState: 'Ten categories blocked (three if a parent stops halfway)',
      why: 'A small first ask makes sure the three that matter most are done, then asks for the rest while the parent is already on the right screen.',
      watch: 'Some parents may stop after the first stage and end up with C.',
      ios: {
        intro: '**This is the step that does the work.** One limit blocks whole categories of apps, including any your child installs later. You tick them in two goes: the three that matter most, then the rest.',
        items: [
          'Open **Settings** → **Screen Time** → **App Limits** → **Add Limit**.',
          '**First, tick Social, Games and Entertainment.** These hold the apps children spend most time on: social media, games and video.',
          { text: '**Then tick the rest, apart from Information & Reading and Utilities.** The phone needs those two to open any website, and [[step:web]] limits the web separately.', sub: [
            '**Don\'t tick "All Apps & Categories"** at the top, or **Websites** at the bottom. They look like shortcuts, but they cut off the web too.'
          ] },
          'Tap **Next**. The top of the screen should say **10 Categories**.',
          'Set the time to **0 minutes** and tap **Add**.',
          'Turn on **Block at End of Limit**. Without it, your child gets an **Ignore Limit** button and nothing holds.'
        ],
        after: [
          '**Nothing is deleted.** Apps, photos and messages stay on the phone, just locked. You can change any of this later with your code.',
          '**Need one app from a ticked category, such as a map or a school app?** Don\'t untick the whole category. Allow back just that app in the next step.'
        ],
        screens: [S.appLimitsRow, S.addLimit, S.chooseAppsStaged, S.timePicker, S.blockAtEnd, S.timeLimitScreen]
      },
      android: {
        intro: '**This is the step that does the work.** You do it in two goes: first the apps that matter most, then everything else.',
        items: [
          '**First, block social media, games and video.** In **Family Link**, tap **Time limits**, then **App limits**. Tap each social media, game or video app, such as YouTube, TikTok, Snapchat or Roblox, and choose **Block**.',
          '**Then block everything else, with downtime for the whole day.** Go back to **Screen time** and tap **Schedules**. Turn on **Downtime** and leave **School time** off.',
          'Tap **Weekly schedule**, then **Mon**. Check **Downtime ON** is switched on, set **Start time** to **12:00** and **End time** to **11:59**, tick **Apply to all days of the week** and tap **Done**.',
          'Every day should now show **12:00–11:59**. That means downtime covers the whole day.'
        ],
        after: [
          '**Your child\'s phone will lock, apart from calls, until you finish the next step.** That\'s expected. Nothing is deleted.',
          '**Need another app?** You can allow it back in the next step too.'
        ],
        screens: [S.flAppLimitsBlocked, S.flHomeSchedules, S.flDowntime, S.flScheduleDay, S.flSchedule]
      }
    }
  ]
}

const guides = [
  {
    id: 'iphone', slug: 'guide-iphone', os: 'ios', illus: 'guide-iphone.svg', hero: '',
    title: 'Your child has an iPhone',
    short: 'iPhone',
    lead: 'Whatever phone you have yourself. If you have an iPhone or iPad, you can also connect your child\'s iPhone to it, so you can manage it from your own phone.',
    time: 'About 25 minutes, or 35 with Steps 1 and 2',
    checked: 'Checked on iOS 18 and 26',
    video: '1084537',
    startFrom: {
      title: 'Start from what you already have',
      text: 'Find the row that matches where you are.',
      rows: [
        { have: 'Nothing is set up yet, and you have an iPhone or iPad', go: 'family' },
        { have: 'Nothing is set up yet, and you don\'t have an iPhone or iPad', go: 'code' },
        { have: 'Your child is already in your Family Sharing group, and their iPhone is signed in to their own account', go: 'code' },
        { have: 'Screen Time on their iPhone is already locked with a code **only you** know', go: 'block' }
      ],
      after: 'Already using **App Limits**, **Downtime** or **Content & Privacy Restrictions**? Keep them. The steps add to what you have, and each one says what to change.'
    },
    // With or without Part 1: the differences
    compare: {
      title: 'What changes if you skip Part 1',
      text: 'The apps and websites are just as locked down either way. The difference is what you can do afterwards.',
      cols: ['', 'With Steps 1 and 2', 'Skipping to Step 3'],
      rows: [
        ['Apps and websites blocked', 'Yes', 'Yes, exactly the same'],
        ['Locked with a code only you know', 'Yes', 'Yes'],
        ['Changing a setting later', 'From your own phone, any time', 'Only with their phone in your hands'],
        ['When your child asks for more time or a new app', 'The request comes to your phone', 'You type your code on their phone'],
        ['Seeing their screen time', 'On your phone', 'On their phone, together'],
        ['Apple\'s protections for children, such as blurring nude images in Messages', 'On by default for a child\'s account', 'You may need to turn them on yourself'],
        ['If you forget your code', 'Reset it with your Apple Account', 'Reset it with an Apple Account if you gave one. If not, the phone may need erasing'],
        ['What you need', 'Your own iPhone or iPad. To create a child account, possibly a credit card to show you\'re over 18', 'Nothing extra'],
        ['Time', 'About 35 minutes', 'About 25 minutes']
      ]
    },
    parts: {
      connect: { title: 'Part 1: Connect their iPhone to yours', text: 'Worth doing if you have an iPhone or iPad, but you can skip it.' },
      settings: { title: 'Part 2: The study settings', text: 'Everyone does these, on your child\'s phone.' }
    },
    steps: [
      {
        key: 'family', part: 'connect', title: 'Add your child to your family group', time: '5 minutes', device: 'your phone',
        skip: { text: '**No iPhone or iPad, or short of time?** Skip to Step 3 and set everything up on your child\'s phone. It will be just as locked down.', to: 'code', button: 'Skip to Step 3' },
        already: '**Already done** if your child\'s name is listed in **Settings** → your name → **Family**. Go to [[step:signin]].',
        items: [
          'On **your** phone, open **Settings** and tap **your name** at the very top.',
          'Tap **Family**.',
          { text: 'Tap **Add Member** (or the **+**), then follow the prompts to add your child.', sub: [
            'If your child already has their own Apple Account, choose **Invite Others** and invite that account.',
            'If they don\'t have one, choose **Create Child Account**.'
          ] },
          '**Check the date of birth is correct.** The phone uses your child\'s age to decide which protections apply automatically. A wrong birth year quietly switches off protections you think you have.',
          'To check you\'re over 18, you may be asked for a **credit card**, or the security code (CVV) of the card on your Apple Account. It\'s only an ID check and **you won\'t be charged**.'
        ],
        after: [
          'If your child\'s Apple Account was set up with an adult\'s age, you can correct it and convert it to a child account from this same screen. It\'s worth doing.',
          '**Stuck here**, for example on the age check? Don\'t stop: skip to [[step:code]]. You can come back to this another day.'
        ],
        screens: [S.parentSettingsRoot, S.appleAccount, S.inviteFamily, S.createChild]
      },
      {
        key: 'signin', part: 'connect', title: 'Sign your child\'s iPhone in to their account', time: '5 minutes', device: "your child's phone",
        already: '**Already done** if your child\'s name shows at the top of **Settings** on their iPhone. Go to [[step:code]].',
        items: [
          'If their iPhone is signed in to someone else\'s account, such as yours or an old one, sign out of it first: **Settings** → the name at the top → **Sign Out**.',
          'On your **child\'s** iPhone, open **Settings** and tap **Sign in to your iPhone** at the top.',
          'Don\'t type in an account. Tap **Sign in a child in my Family**.',
          'At **Parent or Guardian Sign-In**, sign in with **your own** Apple Account.',
          'At **Which child will use this iPhone?**, choose your child and tap **Continue**. If they don\'t have an account yet, tap **Add Child** to create one.',
          'Follow the rest of the prompts.'
        ],
        after: ['From now on you can make the Screen Time settings on your child\'s iPhone, or from your own phone: **Settings** → **Screen Time** → your child\'s name. They\'re the same settings either way. This guide shows them on your child\'s phone.'],
        screens: [S.childSettingsSignIn, S.childAppleSignIn, S.guardianSignIn, S.whichChild]
      },
      {
        key: 'code', part: 'settings', title: 'Turn on Screen Time and set your code', time: '5 minutes', device: "your child's phone",
        already: '**Already have a code?** If you see **Change Screen Time Passcode**, you do. If only you know it, go to [[step:block]]. If your child might know it, tap **Change Screen Time Passcode** and choose a new one.',
        items: [
          'On **your child\'s** phone, open **Settings** and tap **Screen Time**.',
          'If Screen Time isn\'t on yet, turn it on. If a screen like the one shown pops up, tap **Turn on App & Website Activity**.',
          'Tap **Lock Screen Time Settings** (on some phones: **Use Screen Time Passcode**).',
          'Enter a **four-digit code your child does not know**, then enter it again.',
          { text: 'When asked for an Apple Account so the code can be recovered, enter **your own**, never your child\'s.', sub: [
            'Any Apple Account of yours works, even an old one from an iPad or an old phone.',
            '**If you don\'t have one**, you can skip this. But a forgotten code then means erasing the phone, so write the code down properly first.'
          ] }
        ],
        warn: 'This is the step people skip, and it\'s why restrictions come off a fortnight later. Without a code, your child can undo everything in about four taps.',
        screens: [S.settingsScreenTime, S.activitySheet, S.lockSettings, S.passcodeEntry, S.passcodeRecovery]
      },
      {
        key: 'block', part: 'settings', title: 'Block apps', time: '5 minutes', device: "your child's phone", variants: true,
        already: '**Already have App Limits?** Keep them, and add this one alongside.'
      },
      {
        key: 'allow', part: 'settings', title: 'Allow back the apps your child needs', time: '5 minutes', device: "your child's phone", list: true,
        already: '**Already use Always Allowed for Downtime?** It\'s the same list for both, so these apps will work during Downtime too.',
        items: [
          'Go back to **Screen Time** and tap **Always Allowed**.',
          `The top section is what\'s allowed now. Keep ${APPS.iosKeep}. Tap the red **−** next to anything else, such as **FaceTime**. (Phone can\'t be removed.)`,
          `In the lower section, tap the green **+** next to each of these, if it\'s on the phone: ${APPS.iosAdd}.`
        ],
        after: ['These apps now work as normal, at any time. Everything else shows a **Time Limit** screen.'],
        warn: `**If one of these apps is still blocked**, check it's in the **top** section of Always Allowed. If it still won't open, email ${EMAIL}. Don't remove the limit from the last step.`,
        screens: [S.alwaysRow, S.alwaysAllowedList]
      },
      {
        key: 'web', part: 'settings', title: 'Allow only the websites they need', time: '5 minutes', device: "your child's phone",
        intro: 'Blocking an app doesn\'t block its website. This step makes the web work the same way: only a few sites open.',
        already: '**Already limit websites?** If **Web Content** is set to **Limit Adult Websites**, change it to **Only Approved Websites**. If it\'s already on Only Approved Websites, check the sites against the list and add any that are missing.',
        items: [
          'Open **Settings** → **Screen Time** → **Content & Privacy Restrictions** and turn it on.',
          'Tap **Allowed Apps & Features** and make sure **Safari** is on.',
          'Go back, then tap **App Store, Media, Web & Games** → **Web Content**.',
          'Choose **Only Approved Websites**.',
          'Swipe left to delete the sites already listed there, such as **Apple — Start**.',
          `Tap **Add Website** and enter each of these, **exactly as written**: ${allowlist.websites}. A typo stops it working.`
        ],
        check: `**Check it works before you move on.** Open Safari and load one of the approved sites: it should open. Then type in a site you didn't add, like youtube.com: it should be blocked. **If the blocked site loads, stop and email ${EMAIL}.** Don't leave it as it is, because your child would have an open browser, where they could also reach the apps you just blocked.`,
        screens: [S.restrictionsRow, S.restrictionsOn, S.allowedFeatures, S.mediaWeb, S.approvedSites, S.swipeDelete, S.addWebsite, S.safariAllowed, S.safariBlocked]
      },
      {
        key: 'lock', part: 'settings', title: 'Lock the settings', time: '3 minutes', device: "your child's phone",
        already: '**Already done** if all five settings below say **Don\'t Allow**.',
        items: [
          'In **Settings** → **Screen Time** → **Content & Privacy Restrictions** (already on from the last step), tap **iTunes & App Store Purchases**.',
          'Set **Installing Apps**, **Deleting Apps** and **In-app Purchases** to **Don\'t Allow**.',
          'Go back and scroll down to **Allow Changes**. Set **Passcode & Face ID** and **Accounts** to **Don\'t Allow**.'
        ],
        screens: [S.purchasesRow, S.purchases, S.allowChanges]
      },
      {
        key: 'check', part: 'settings', title: 'Check it works, and agree how you\'ll check in', time: '3 minutes', device: 'your phone, or your child\'s phone together',
        items: [
          { text: '**If you did Steps 1 and 2:** on **your** phone, open **Settings** → **Screen Time** and tap your child\'s name. You should see the settings you just made.', sub: [
            'If you don\'t, check both phones are signed in to the right accounts and both are up to date.'
          ] },
          '**If you skipped them:** you can\'t see these settings from your own phone, so agree a moment with your child, say Sunday evening, when you\'ll look at their phone together for two minutes. Their week is at the top of **Settings** → **Screen Time**.',
          'Either way, checking openly on a set day works far better than checking without telling them.'
        ],
        screens: [S.parentScreenTime, S.parentChildSettings, S.weeklyReport]
      }
    ]
  },
  {
    id: 'android', slug: 'guide-android', os: 'android', illus: 'guide-android.svg', hero: 'smart-hero--mint',
    title: 'Your child has an Android phone',
    short: 'Android phone',
    lead: 'Whatever phone you have yourself. You manage it with Google\'s Family Link app, which works on any phone, iPhones included.',
    time: 'About 40 minutes, or 20 if you already use Family Link',
    checked: 'Checked on Android and Family Link',
    video: '347119375',
    startFrom: {
      title: 'Start from what you already have',
      text: 'Find the row that matches where you are.',
      rows: [
        { have: 'Nothing is set up yet, or you only use Digital Wellbeing on their phone', go: 'app' },
        { have: 'You have Family Link, but haven\'t linked this child\'s phone', go: 'link' },
        { have: 'You use **Family Link** with this child, and it shows their phone', go: 'block' }
      ],
      after: 'Already have **time limits**, **downtime** or a **website filter** in Family Link? Keep them. The steps add to what you have, and each one says what to change.'
    },
    // Why there's no "set it up on their phone only" route on Android
    shortcut: {
      title: 'Why you can\'t skip this part',
      text: [
        'Android\'s own screen time settings (Digital Wellbeing) can\'t be locked with a code, so a child can switch them off in seconds. Family Link is what locks them.',
        `If you get stuck, for example creating your child's account or proving your age, don't give up: email ${EMAIL} and we'll help.`
      ]
    },
    parts: {
      connect: { title: 'Part 1: Connect their phone to Family Link', text: 'Skip it if you already use Family Link with this child.' },
      settings: { title: 'Part 2: The study settings', text: 'Everyone does these, from Family Link on your phone.' }
    },
    steps: [
      {
        key: 'app', part: 'connect', title: 'Get the Family Link app', time: '2 minutes', device: 'your phone',
        skip: { text: '**Already use Family Link with this child?** If it shows their phone on **Screen time**, skip to Step 4.', to: 'block', button: 'Skip to Step 4' },
        already: '**Already have Family Link** on your phone? Open it and go to [[step:account]].',
        items: [
          'Open the **Play Store** (Android) or the **App Store** (iPhone).',
          'Search for **Family Link** and install it.',
          'Open it and sign in with **your own** Google Account (often ending in @gmail.com).'
        ],
        screens: [S.familyLinkStore, S.flSignIn]
      },
      {
        key: 'account', part: 'connect', title: 'Add your child\'s Google Account', time: '10 minutes', device: 'your phone, in Family Link',
        intro: 'Once you\'ve signed in, Family Link asks whether your child has a Google Account.',
        already: '**Already done** if your child is listed in Family Link. Go to [[step:link]].',
        items: [
          { text: '**If they don\'t have one**, choose **No** and follow the prompts to create one: their name, date of birth, a Gmail address and a password.', sub: [
            '**Check the date of birth is correct.** Google uses your child\'s age to decide which protections apply. A wrong birth year quietly switches off protections you think you have.',
            'Write down the new address and password. You\'ll need them on your child\'s phone in the next step.'
          ] },
          '**If they already have one**, choose **Yes** and follow the prompts. Check the date of birth on their account is correct too.',
          'After you set the password, read what Google shows you and tap to agree.',
          'Google then checks it\'s you. You may get a code by text message, and you may be asked for a credit card to confirm you\'re over 18. **You won\'t be charged.**',
          'Family Link shows you what it can do. Tap through to the end.',
          'At **Choose settings for** your child, choose **fewer steps**. You\'ll make the study\'s settings later in this guide.',
          'When asked about personalising your data, you can tap **Reject all**.'
        ],
        after: [
          'You\'ll then reach Family Link\'s main screen.',
          `**Stuck here**, for example on the age check? Don't stop: email ${EMAIL} and we'll help you through it.`
        ],
        screens: [S.flHasAccount, S.flCreateAccount, S.flChooseSettings, S.flPersonalise]
      },
      {
        key: 'link', part: 'connect', title: 'Link your child\'s phone', time: '10 minutes', device: "your child's phone",
        intro: '**Before you start, check the accounts on your child\'s phone.** The only Google Account on it must be your child\'s. If your own Google Account is signed in on their phone, remove it first (search Settings for **Accounts**), or set-up won\'t let you continue.',
        already: '**Already done** if Family Link on your phone shows your child\'s phone on **Screen time**. Go to [[step:block]].',
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
      {
        key: 'block', part: 'settings', title: 'Block apps', time: '5 minutes', device: 'your phone, in Family Link', variants: true,
        already: '**Already have downtime at bedtime?** This replaces it with downtime all day. The apps you allow back next will then work at night too. If you want them off at night, email us and we\'ll help.'
      },
      {
        key: 'allow', part: 'settings', title: 'Allow back the apps your child needs', time: '10 minutes', device: 'your phone, in Family Link', list: true,
        already: '**Already set limits on some apps?** Change the ones below to **Unlimited time**. Leave the rest as they are.',
        items: [
          'Go back to **Screen time** and tap **Time limits**, then **App limits**. Leave **Daily limit** off.',
          `Tap each of these, one at a time, and choose **Unlimited time**: ${APPS.android}. Each one then shows an infinity sign (**∞**). Calls always work, so you don\'t need Phone.`,
          'Do the same for **Google Chrome**. Without it, the websites in the next step won\'t open.',
          'Go back to **Screen time**, tap **Schedules**, then **Allowed apps**. Turn on **Unlimited apps**. This is what lets them work during downtime.'
        ],
        screens: [S.flHomeLimits, S.flTimeLimits, S.flAppLimits, S.flDowntimeAllowed, S.flAllowed]
      },
      {
        key: 'web', part: 'settings', title: 'Allow only the websites they need', time: '5 minutes', device: 'your phone, in Family Link',
        intro: 'Blocking an app doesn\'t block its website. This step makes the web work the same way: only a few sites open.',
        already: '**Already filter websites?** If it\'s set to **Try to block explicit sites**, change it to **Only allow approved sites**. If it\'s already on approved sites, check them against the list and add any that are missing.',
        items: [
          'In Family Link, tap **Controls** at the bottom, then **Google Chrome and web**.',
          'Choose **Only allow approved sites**.',
          `Tap **Approved sites**, then **Add site**. Add each of these, tapping **Done** after each one: ${allowlist.websites}. **Use the main web address**, such as bbc.co.uk: Family Link may not accept a page within a site, such as bbc.co.uk/bitesize.`,
          '**If other browsers aren\'t already blocked**, block them: **Screen time** → **Time limits** → **App limits** → tap each browser → **Block**.'
        ],
        after: [`Your child can ask to visit a blocked site, and the request comes to Family Link on your phone. Please only approve sites they need for school. If you're not sure, email ${EMAIL}.`],
        warn: `If a homework site won't load, don't switch the filter off. Email ${EMAIL} and we'll add it to the shared list.`,
        screens: [S.flControlsChrome, S.flChrome, S.flApprovedSites, S.flAddSite]
      },
      {
        key: 'lock', part: 'settings', title: 'Lock the settings', time: '3 minutes', device: 'your phone, in Family Link',
        already: '**Already done** if **Require approval for** says **All content**.',
        items: [
          'In Family Link, tap **Controls** at the bottom, then **Google Play**.',
          'Tap **Require approval for** and choose **All content**, so nothing new can be installed without your approval. When your child asks for an app, apply the same judgement as in [[step:allow]].'
        ],
        screens: [S.flControlsPlay, S.flPlay]
      },
      {
        key: 'check', part: 'settings', title: 'Check it works, and agree how you\'ll check in', time: '3 minutes', device: 'your phone',
        items: [
          'Open Family Link on **Screen time**.',
          'If it shows your child\'s phone and what it\'s doing now (such as **Downtime until 11:59**), the link is live.',
          'If it shows nothing after a few hours, check the phone is switched on, connected, and signed in to the supervised account.',
          'Agree a moment with your child, say Sunday evening, when you\'ll look at their week together. Checking openly on a set day works far better than checking without telling them.'
        ],
        screens: [S.flProfile]
      }
    ]
  }
]

module.exports = { EMAIL, allowlist, intro, yourself, blockVersions, guides }
