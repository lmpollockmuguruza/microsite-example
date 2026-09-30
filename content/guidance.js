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
      { label: 'Apple — Start', value: '' },
      { label: 'Wikipedia', value: '' },
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
  alt: "What your child sees when they open an app that isn't on the list: Time Limit."
}

// ------------------------------------------------------------------ shared settings: Android (Family Link)
const fl = { device: 'Your phone (Family Link)' }

S.flControls = {
  id: 'fl-controls', os: 'android', ...fl,
  bar: { back: true, title: 'Alex' },
  blocks: [
    { type: 'tabs', items: ['Highlights', 'Controls', 'Location'], active: 1 },
    { type: 'list', rows: [
      { icon: 'hourglass', label: 'Screen time', sub: 'Daily limit, downtime, app limits', hl: 'Tap' },
      { icon: 'shield', label: 'Content restrictions', sub: 'Google Play, Chrome, YouTube' },
      { icon: 'users', label: 'Contacts', sub: 'Who your child can talk to' },
      { icon: 'settings', label: 'Devices', sub: "Alex's Galaxy A15" }
    ] }
  ],
  draft: true,
  alt: 'Family Link on your phone, open at your child. Controls is selected, and Screen time is the first option.'
}

S.flDowntime = {
  id: 'fl-downtime', os: 'android', ...fl,
  bar: { back: true, title: 'Screen time' },
  blocks: [
    { type: 'tabs', items: ['Daily limit', 'Downtime', 'App limits'], active: 1 },
    { type: 'list', rows: [
      { label: 'Downtime', sub: 'Also called School time on some versions', switch: 'on', hl: 'Turn on' },
      { label: 'Weekly schedule', sub: 'Every day, 12:00 AM to 11:59 PM' },
      { label: 'Allowed apps', sub: 'Apps that work during downtime' }
    ] }
  ],
  draft: true,
  alt: 'Screen time in Family Link, on the Downtime tab, with the Downtime switch turned on.'
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
    { type: 'list', rows: [
      { label: 'Unlimited apps', sub: 'These work during downtime', switch: 'on', hl: 'Turn on' }
    ] },
    { type: 'header', text: 'Select apps' },
    { type: 'list', rows: [
      { app: true, icon: 'phone', colour: '#34C759', label: 'Phone', value: 'Unlimited time', hl: 'Each app on the list' },
      { app: true, icon: 'message-circle', colour: '#1A73E8', label: 'Messages', value: 'Unlimited time' },
      { app: true, icon: 'message-square', colour: '#25D366', label: 'WhatsApp', value: 'Unlimited time' },
      { app: true, icon: 'play', colour: '#FF0000', label: 'YouTube', value: 'Not allowed', muted: true }
    ] }
  ],
  draft: true,
  alt: 'Allowed apps in Family Link. Each app on the list is set to Unlimited time.'
}

S.flContent = {
  id: 'fl-content', os: 'android', ...fl,
  bar: { back: true, title: 'Content restrictions' },
  blocks: [
    { type: 'list', rows: [
      { icon: 'store', label: 'Google Play', sub: 'Approval needed for downloads' },
      { icon: 'globe', label: 'Google Chrome', sub: 'Try to block explicit sites', hl: 'Tap' },
      { icon: 'play', label: 'YouTube', sub: 'Blocked' },
      { icon: 'search', label: 'Google Search', sub: 'SafeSearch on' }
    ] }
  ],
  draft: true,
  alt: 'Content restrictions in Family Link, with Google Chrome highlighted.'
}

S.flChrome = {
  id: 'fl-chrome', os: 'android', ...fl,
  bar: { back: true, title: 'Google Chrome' },
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
  alt: 'Google Chrome settings in Family Link, set to Only allow approved sites.'
}

S.flBlockBrowser = {
  id: 'fl-block-browser', os: 'android', ...fl,
  bar: { back: true, title: 'App limits' },
  blocks: [
    { type: 'list', rows: [
      { app: true, icon: 'globe', colour: '#FF7139', label: 'Firefox', switch: 'off', hl: 'Turn Allowed off' },
      { app: true, icon: 'globe', colour: '#0060DF', label: 'Samsung Internet', switch: 'off' },
      { app: true, icon: 'globe', colour: '#4285F4', label: 'Chrome', switch: 'on', sub: 'Approved sites only' }
    ] }
  ],
  draft: true,
  alt: 'App limits in Family Link. Other browsers are switched off. Chrome stays on, limited to approved sites.'
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
      screens: [S.appLimitsRow, S.addLimit, S.chooseApps, S.timePicker, S.blockAtEnd, S.alwaysRow, S.alwaysAllowedList]
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
      screens: [S.restrictionsRow, S.restrictionsOn, S.allowedFeatures, S.mediaWeb, S.approvedSites, S.addWebsite, S.safariBlocked]
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
        'Open **Family Link** → your child → **Controls** → **Screen time**.',
        'Turn on **Downtime** (called **School time** in some versions).',
        'Tap **Weekly schedule** → choose a day → **Start 12:00 AM**, **End 11:59 PM** → **Apply to all days of the week**.',
        'Tap **Allowed apps** → turn on **Unlimited apps** → **Select apps**.',
        'Set each app on your list to **Unlimited time**.'
      ],
      after: ['To block one app outright rather than by schedule: **Screen time** → **App limits** → tap the app → turn **Allowed** off. Some system apps can\'t be blocked.'],
      screens: [S.flControls, S.flDowntime, S.flSchedule, S.flAllowed]
    },
    {
      key: 'web', title: 'Allow only the websites they need', time: '5 minutes', device: 'your phone, in Family Link',
      intro: 'Blocking an app doesn\'t block its website. This step makes the web work the same way as the apps: only what\'s on the list.',
      items: [
        'In Family Link, go to **Controls** → **Content restrictions** → **Google Chrome**.',
        'Choose **Only allow approved sites**, then add the sites on the list under **Approved sites**.',
        'Block other browsers: **Screen time** → **App limits** → tap each browser → turn **Allowed** off.'
      ],
      warn: `If a homework site won't load, don't switch the filter off. Email ${EMAIL} and we'll add it to the shared list.`,
      screens: [S.flContent, S.flChrome, S.flBlockBrowser]
    },
    {
      key: 'lock', title: 'Lock the settings', time: '3 minutes', device: 'your phone, in Family Link',
      items: [
        'In Family Link, go to **Controls** → **Content restrictions** → **Google Play**.',
        'Under download approvals, choose **All content**, so nothing new can be installed without your approval.'
      ],
      screens: [S.flPlay]
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
  bar: { back: true, title: 'All services' },
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
  alt: "On your child's phone: Settings, Google, All services. Parental controls is under Kids & family."
}

S.flProfile = {
  id: 'fl-profile', os: 'android', device: 'Your phone (Family Link)',
  bar: { back: true, title: 'Alex' },
  blocks: [
    { type: 'tabs', items: ['Highlights', 'Controls', 'Location'], active: 0 },
    { type: 'device', name: "Alex's Galaxy A15", sub: 'Last active 5 minutes ago', hl: 'This means it worked' },
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
  lead: '**What we\'re asking you to do:** spend about 25 to 30 minutes setting up a small number of settings on your child\'s phone, then leave them running.',
  text: [
    'Everything you need is already built into the phone. There is nothing to buy, nothing to download, and no separate app to learn.',
    '**Start here:** find your child\'s phone, sit down with it for half an hour, and work through the one route below that matches your situation.'
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
          '**Check the date of birth is correct.** The phone uses your child\'s age to decide which protections apply automatically. A wrong birth year quietly switches off protections you think you have.'
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
        screens: [S.settingsScreenTime, S.activitySheet, S.lockSettings, S.passcodeRecovery]
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
        screens: [S.parentScreenTime, S.timeLimitScreen]
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
        screens: [S.settingsScreenTime, S.activitySheet, S.lockSettings, S.passcodeRecovery]
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
        screens: [S.timeLimitScreen]
      }
    ]
  },
  {
    id: 'C', slug: 'guide-android', os: 'android', illus: 'guide-android.svg', hero: 'smart-hero--mint',
    title: 'Your child has an Android phone, and you have an Android or iPhone',
    short: 'Android phone, managed with Family Link',
    lead: 'Google\'s Family Link works whichever phone you have, including an iPhone. Your child\'s phone needs to be an Android.',
    time: 'About 30 minutes',
    steps: [
      {
        title: 'Get the Family Link app', time: '2 minutes', device: 'your phone',
        items: [
          'Open the **Play Store** (Android) or the **App Store** (iPhone).',
          'Search for **Family Link** and install it.',
          'Open it and sign in with **your own** Google Account (often ending in @gmail.com).'
        ],
        screens: [S.familyLinkStore]
      },
      {
        title: 'Link your child\'s account', time: '10 minutes', device: 'both phones',
        intro: '**If your child is under 13**, Family Link will walk you through creating a Google Account for them, and it will be supervised from the start.',
        items: [
          'On your **child\'s** phone, open **Settings**, tap **Google**, then **All services**.',
          'Under **Kids & family**, tap **Parental controls**.',
          'Tap **Get started** (or **Let\'s do this**) and choose your child\'s account.',
          'Follow the prompts, entering your own Google Account when asked for a parent.',
          'Your child taps to agree, and enters their own password to confirm.'
        ],
        after: ['Or from your phone: send the invitation from the Family Link app, then have your child open the email on their phone and accept it.'],
        screens: [S.androidParental]
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
  { area: 'Labels (fixed)', note: 'The text said "Allowed Apps"; the screenshots show "Allowed Apps & Features". The text said "Account Changes and Passcode Changes"; the screenshots show "Accounts" and "Passcode & Face ID". The guide now uses the screenshot labels.' },
  { area: 'Safari after step "apps"', note: 'The category limits may also block Safari itself (it sits in one of the categories). If Safari won\'t open after the apps step, the websites step has nothing to work on. Test on a device. If Safari is blocked, add Safari to Always Allowed and say so in the guide.' },
  { area: '0-minute limit', note: 'Your screenshots show 0 min saved, but the App Limits picker has historically had a 1-minute minimum. Confirm on the latest iOS that 0 holds. If the minimum is 1 minute, say so: the child gets 1 minute a day per category.' },
  { area: 'Route A, where to set it up', note: 'When a child is in Family Sharing, their Screen Time is usually managed from the parent\'s phone (Settings, Screen Time, the child\'s name), and the passcode recovery screen may not appear. Test whether steps 2 to 5 of Route A should happen on the parent\'s phone instead. That would also make Route A simpler.' },
  { area: 'Android wording', note: 'Family Link names ("Schedules", "Unlimited apps", "Unlimited time", "Let\'s do this", "All services") change often, and there were no Android screenshots to check against. The Android screens are drawn from the text and marked as drafts. They need checking on a test phone.' },
  { area: 'Support email', note: 'The guidance uses lucas.pollock@public.io; the tech spec and microsite use smartphonestudy@public.io. The guide now uses smartphonestudy@public.io. Confirm which one.' },
  { area: 'Time', note: '"Sit down with it for twenty minutes tonight" contradicted "about 25 to 30 minutes". The guide now says half an hour.' },
  { area: '"Almost none of this can be done from your own phone"', note: 'That isn\'t true for Routes A and C, where much of it is done from the parent\'s phone. Reworded to "You\'ll need it for part of this".' },
  { area: 'Child account age', note: 'The Apple screen says child accounts are for children "13 or younger" in some regions and "12 or younger" in the UK. The drawing uses 12. Check on a UK device.' },
  { area: 'Software versions', note: 'All iPhone screens follow your screenshots (iOS 18 and 26). iOS 27 changes parental controls. Check every screen on the version families will have in April 2027.' }
]

module.exports = { EMAIL, allowlist, sharedIntro, shared, intro, routes, review }
