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
      { select: 'on', icon: 'users-round', colour: '#FF2D55', label: 'Social', value: 'All', chevron: true, hl: 'Tick', span: 6 },
      { select: 'on', icon: 'gamepad-2', colour: '#007AFF', label: 'Games', value: 'All', chevron: true },
      { select: 'on', icon: 'clapperboard', colour: '#FF3B30', label: 'Entertainment', value: 'All', chevron: true },
      { select: 'on', icon: 'palette', colour: '#FF9500', label: 'Creativity', value: 'All', chevron: true },
      { select: 'on', icon: 'briefcase', colour: '#007AFF', label: 'Productivity & Finance', value: 'All', chevron: true },
      { select: 'on', icon: 'graduation-cap', colour: '#34C759', label: 'Education', value: 'All', chevron: true },
      { select: 'off', icon: 'book-open', colour: '#5AC8FA', label: 'Information & Reading', value: 'All', chevron: true, avoid: 'Leave unticked' },
      { select: 'on', icon: 'heart-pulse', colour: '#FF2D55', label: 'Health & Fitness', value: 'All', chevron: true, hl: 'Tick' },
      { select: 'off', icon: 'wrench', colour: '#8E8E93', label: 'Utilities', value: 'All', chevron: true, avoid: 'Leave unticked' },
      { select: 'on', icon: 'shopping-cart', colour: '#FF9500', label: 'Shopping & Food', value: 'All', chevron: true, hl: 'Tick', span: 3 },
      { select: 'on', icon: 'plane', colour: '#34C759', label: 'Travel', value: 'All', chevron: true },
      { select: 'on', icon: 'ellipsis', colour: '#8E8E93', label: 'Other', value: 'All', chevron: true },
      { select: 'off', icon: 'globe', colour: '#8E8E93', label: 'Websites', chevron: true, avoid: "Don't tick" }
    ] }
  ],
  alt: 'Choose Apps. Every category from Social to Other is ticked except Information & Reading and Utilities. All Apps & Categories at the top and Websites at the bottom are not ticked either. Next is at the top right.'
}

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
S.flHome = flScreenTime('fl-home', { timeLimits: 'First tap', schedules: 'Then' }, "Family Link on your phone opens on Screen time. Your child's phone is shown by its model name (here SM-S901B). Below it are Time limits and Schedules.")

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
      { app: true, icon: 'message-square', colour: '#25D366', label: 'WhatsApp', value: 'Unlimited time', hl: 'One app at a time', span: 3 },
      { app: true, icon: 'message-circle', colour: '#1A73E8', label: 'Messages', value: 'Unlimited time' },
      { app: true, icon: 'map', colour: '#30B0C7', label: 'Maps', value: 'Unlimited time' },
      { app: true, icon: 'play', colour: '#FF0000', label: 'YouTube', value: 'No limit set', muted: true }
    ] }
  ],
  draft: true,
  alt: 'App limits in Family Link. Tap each app on the list and choose Unlimited time. Apps not on the list are left as they are.'
}

S.flDowntime = {
  id: 'fl-downtime', os: 'android', ...fl, bg: FL_BG,
  bar: { back: true, title: 'Schedules', center: true },
  blocks: [
    { type: 'fcard', icon: 'moon', title: 'Downtime', text: 'Help Alex sleep by limiting access on their devices at night', switch: 'on', hl: 'Turn on', hlSwitch: true, rows: [
      { label: 'Tonight', value: '12:00–11:59' },
      { label: 'Weekly schedule', sub: 'Every night, 12:00–11:59', chevron: true, hl: 'Set to 12:00–11:59' },
      { label: 'Allowed apps', sub: 'Unlimited apps are turned on', chevron: true, hl: 'Then tap' }
    ] },
    { type: 'fcard', icon: 'school', title: 'School time', text: "Minimise distractions on Alex's devices during class", switch: 'off' },
    { type: 'footnote', text: 'Eligible devices will be locked during downtime and be silenced during school time. Access to certain apps will be limited. Calls will still be available.' }
  ],
  alt: 'Schedules in Family Link. Turn on Downtime and set its weekly schedule to 12:00–11:59. Leave School time off.'
}

S.flSchedule = {
  id: 'fl-schedule', os: 'android', ...fl,
  bar: { back: true, title: 'Weekly schedule' },
  blocks: [
    { type: 'days', items: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], active: 0 },
    { type: 'list', rows: [
      { label: 'Start', value: '12:00', hl: 'Set these times', span: 2 },
      { label: 'End', value: '11:59' }
    ] },
    { type: 'mbutton', text: 'Apply to all days of the week', hl: 'Then tap' }
  ],
  draft: true,
  alt: 'Downtime weekly schedule: start 12:00, end 11:59, on every day of the week.'
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
      { label: 'Approved sites', sub: '2 sites', chevron: true, hl: 'Add the sites on the list' },
      { label: 'Blocked sites', sub: '0 sites', chevron: true }
    ] }
  ],
  alt: 'Google Chrome and web in Family Link, set to Only allow approved sites. Add the sites on the list under Approved sites.'
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
      { ...ios.appLimits, label: 'App Limits', sub: '10 categories, 0 min', chevron: true, hl: 'The settings you made', span: 3 },
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
        'Tick these categories **one by one**: Social, Games, Entertainment, Creativity, Productivity & Finance, Education, Health & Fitness, Shopping & Food, Travel and Other. Work down the list so you don\'t miss one.',
        '**Leave Information & Reading and Utilities unticked**, and don\'t tick **Websites**. Your child\'s phone needs these two for getting on the web at all. The websites step then limits the web to the sites on the list.',
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
        { text: 'Open **Family Link**. It opens on **Screen time** (bottom left).', sub: [
          'If it asks you to **Add device**, your child\'s phone isn\'t linked yet. Follow the instructions it shows: they\'re the same as in **Link your child\'s phone**.',
          'Otherwise you\'ll see your child\'s phone, shown by its model name (for example SM-S901B).'
        ] },
        'Tap **Time limits**, then **App limits**. Leave **Daily limit** off.',
        'Go through **the apps on the list** one at a time: tap each one and choose **Unlimited time**. There\'s no way to do them all at once.',
        'Go back to **Screen time** and tap **Schedules**. Turn on **Downtime**, and leave **School time** off.',
        'Tap **Weekly schedule** and set it to start at **12:00** and end at **11:59**, every day, so downtime covers the whole day. It then shows as **Every night, 12:00–11:59**.',
        'Go back and tap **Allowed apps**. Turn on **Unlimited apps**, so the apps you set to Unlimited time still work during downtime. Calls always work.'
      ],
      after: ['To block one app outright: **Time limits** → **App limits** → tap the app → **Block**. Some system apps can\'t be blocked.'],
      screens: [S.flHome, S.flTimeLimits, S.flAppLimits, S.flDowntime, S.flSchedule, S.flAllowed]
    },
    {
      key: 'web', title: 'Allow only the websites they need', time: '5 minutes', device: 'your phone, in Family Link',
      intro: 'Blocking an app doesn\'t block its website. This step makes the web work the same way as the apps: only what\'s on the list.',
      items: [
        'In Family Link, tap **Controls** at the bottom, then **Google Chrome and web**.',
        'Choose **Only allow approved sites**.',
        'Tap **Approved sites** and add each site on the list. **Use the main web address only**, such as bbc.co.uk. Family Link won\'t accept a page within a site, such as bbc.co.uk/bitesize.',
        '**If other browsers aren\'t already blocked**, block them: **Screen time** → **Time limits** → **App limits** → tap each browser → **Block**.'
      ],
      after: [`Your child can ask to visit a site that isn't on the list, and the request comes to Family Link on your phone. Only approve sites on the list. For anything else, email ${EMAIL}.`],
      warn: `If a homework site won't load, don't switch the filter off. Email ${EMAIL} and we'll add it to the shared list.`,
      screens: [S.flControlsChrome, S.flChrome, S.flAddSite]
    },
    {
      key: 'lock', title: 'Lock the settings', time: '3 minutes', device: 'your phone, in Family Link',
      items: [
        'In Family Link, tap **Controls** at the bottom, then **Google Play**.',
        'Tap **Require approval for** and choose **All content**, so nothing new can be installed without your approval.'
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

// Your child's iPhone: signing it in to their account (from screenshots, iOS 26)
S.childSettingsSignIn = {
  id: 'ios-child-sign-in-row', os: 'ios', draft: true, device: "Your child's phone",
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

S.flProfile = flScreenTime('fl-profile', { device: 'This means it worked' }, "Screen time in Family Link, showing your child's phone and what it's doing now, such as Downtime until 11:59.")

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
    '**Somewhere to write down a new passcode.** You are about to create a four-digit code that locks these settings. If you forget it, you may need to erase the phone completely. Write it where you keep other passwords, not in a note on your child\'s phone.',
    '**A credit card, if your child doesn\'t have an account yet.** To create a child account, Apple and Google may ask for one to check you\'re over 18. It\'s only an ID check and you won\'t be charged, but without a credit card they won\'t let you create the account.'
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
    lead: 'This is the fullest version. You set the restrictions once, then you can see and change them from your own phone without asking for theirs. Being in one family group also gives you other things, such as sharing your locations.',
    time: 'About 35 minutes',
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
          'To check you\'re over 18, you may be asked for a **credit card**, or the security code (CVV) of the card on your Apple Account. It\'s only an ID check and **you won\'t be charged**, but without a credit card Apple won\'t let you create a child account.'
        ],
        after: ['If your child\'s Apple Account was set up with an adult\'s age, you can now correct it and convert it to a child account from this same screen. It\'s worth doing.'],
        screens: [S.parentSettingsRoot, S.appleAccount, S.inviteFamily, S.createChild]
      },
      {
        title: 'Sign your child\'s iPhone in to their account', time: '5 minutes', device: "your child's phone",
        intro: 'Skip this step if your child\'s iPhone is already signed in to the account in your family group: their name shows at the top of **Settings**.',
        items: [
          'If their iPhone is signed in to someone else\'s account, such as yours or an old one, sign out of it first: **Settings** → the name at the top → **Sign Out**.',
          'On your **child\'s** iPhone, open **Settings** and tap **Sign in to your iPhone** at the top.',
          'Don\'t type in an account. Tap **Sign in a child in my Family**.',
          'At **Parent or Guardian Sign-In**, sign in with **your own** Apple Account.',
          'At **Which child will use this iPhone?**, choose your child and tap **Continue**. If they don\'t have an account yet, tap **Add Child** to create one.',
          'Follow the rest of the prompts.'
        ],
        after: ['From now on you can make the Screen Time settings in the next steps on your child\'s iPhone, or from your own phone: **Settings** → **Screen Time** → your child\'s name. They\'re the same settings either way.'],
        screens: [S.childSettingsSignIn, S.childAppleSignIn, S.guardianSignIn, S.whichChild]
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
          'Google then checks it\'s you. You may get a code by text message, and you may be asked for a credit card to confirm you\'re over 18. **You won\'t be charged.**',
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
          'Open Family Link on **Screen time**.',
          'If it shows your child\'s phone and what it\'s doing now (such as **Downtime until 11:59**), the link is live.',
          'If it shows nothing after a few hours, check the phone is switched on, connected, and signed into the supervised account.'
        ],
        screens: [S.flProfile]
      }
    ]
  }
]

// ------------------------------------------------------------------ review notes (for the team, not families)
const review = [
  { area: 'Route A, existing accounts', note: 'Tested: signing a child\'s iPhone in through Sign in a child in my Family, and setting restrictions from either phone. Still to test end to end: a child whose existing Apple Account isn\'t in the parent\'s family yet (Invite Others), and what signing out of another account does to the data on the phone.' },
  { area: 'iPhone categories', note: 'Information & Reading and Utilities are now left unticked so the web works. That also leaves every app in those two categories allowed, not just the ones on the list. Check on a test phone which installed apps sit in these categories, and whether any of them shouldn\'t be allowed.' },
  { area: 'Android, tested on a phone', note: 'Route C was tested on a Samsung Galaxy S22 (SM-S901B), with Family Link on an iPhone. These Family Link screens are now drawn from screenshots: Screen time, Controls, Time limits, Schedules, Allowed apps, Google Chrome and web, and Google Play. Still drawn from notes, and marked as drafts: App limits, the weekly schedule, adding a site, and every screen on the child\'s phone and in account set-up.' },
  { area: 'Android, Samsung account', note: 'On the Samsung, parental controls also asked for a Samsung account (the parent\'s own, with a child account created inside it), plus a card check. It isn\'t clear whether Family Link needs this, or whether other brands ask for something similar. Test on a Pixel and one other brand, then decide whether the Samsung part of Route C step 3 stays.' },
  { area: 'Android, websites', note: 'Family Link only accepts a whole site (bbc.co.uk), not a page within it (bbc.co.uk/bitesize). Allowing bbc.co.uk also allows the rest of the BBC, including iPlayer. Write the website list as whole sites, and check what else each one opens up.' },
  { area: 'Android, existing account', note: 'Only the "create a new account" path was tested. Test a child who already has a Google Account, including one with the wrong date of birth.' },
  { area: 'Software versions', note: 'The iPhone screens follow screenshots from iOS 18 and 26. iOS 27 changes parental controls. Check every screen on the version families will have in April 2027.' }
]

module.exports = { EMAIL, allowlist, sharedIntro, shared, intro, routes, review }
