/*
 * SMART Study – the video guides (single source)
 *
 * One video per phone, made in Google Vids from a slide deck: Google Vids adds
 * the transitions and reads the narration (each slide's speaker notes) with an
 * AI voice. `npm run build:video` turns this file and content/guidance.js into:
 *
 *   exports/video/SMART-video-iphone.pptx            the slides, with narration in the speaker notes
 *   exports/video/SMART-video-android.pptx
 *   exports/video/SMART-video-narration-iphone.txt   the narration as one script, slide by slide
 *   exports/video/SMART-video-narration-android.txt
 *
 * The steps, their order and every phone screen come from content/guidance.js
 * (Step 4 is Option A). This file holds what the video says: short, spoken
 * versions of each step (`say`) and the few words on its slide (`points`).
 * The screens are all shown, in order; their narration is the first sentence of
 * each screen's description.
 *
 * Timestamps: the chapter list says [0:00] until the video is made; then put
 * the real times in the chapter slide, the script and the video description.
 */
const { EMAIL } = require('./resources')

const common = {
  howTo: {
    title: 'How to use this video',
    points: [
      { icon: 'pause', text: 'Pause after each step, do it on the phone, then carry on' },
      { icon: 'skip-forward', text: 'Already done some of it? Skip to the step you need' },
      { icon: 'book-open', text: 'Everything is also in the written guide' }
    ],
    say: 'Have your child\'s phone with you. This video goes one step at a time. After each step, pause the video, do the step on the phone, then press play to carry on. If some of it is already set up, use the chapters to skip straight to the step you need. Everything is also in the written guide, Setting up your child\'s phone.'
  },
  chapters: {
    title: 'Chapters',
    say: 'Here are the chapters, with the times to skip to. You\'ll also find them under the video.'
  },
  before: {
    title: 'Before you start',
    points: [
      { icon: 'smartphone', text: 'Your child\'s phone, in your hands' },
      { icon: 'key-round', text: 'The password for the account on it' },
      { icon: 'pencil', text: 'Somewhere safe to write down a new code' },
      { icon: 'credit-card', text: 'Only for a new child account: a card for an age check' }
    ],
    note: 'Please do this yourself, not your child. Whoever knows the code can undo it all.',
    say: 'Before you start, have four things ready. Your child\'s phone. The password for the account on it. Somewhere safe to write down a new four-digit code. And, only if you\'re creating a new account for your child, a credit card for an age check. You won\'t be charged. One more thing: please do this yourself, not your child. Whoever sets it up knows the code, and whoever knows the code can undo all of it.'
  },
  end: {
    title: 'That\'s it. Thank you!',
    points: [
      { icon: 'upload', text: 'In about a week, we\'ll ask for a screenshot of your child\'s screen time' },
      { icon: 'mail', text: `Stuck, or something looks different? Email ${EMAIL}` }
    ],
    say: `That's it. Thank you! In about a week, we'll ask you to share a screenshot of your child's screen time, and then once a month. If a step doesn't match your phone, or you get stuck, email ${EMAIL.replace('@', ' at ').replace(/\./g, ' dot ')}, and we'll help.`
  }
}

const guides = {
  iphone: {
    file: 'iphone',
    title: 'Setting up your child\'s iPhone',
    intro: 'This short video shows you how to set up your child\'s iPhone for the SMART Study, so it only has a short list of apps and websites. It takes about 25 minutes, or 35 if you also connect it to your own iPhone or iPad.',
    parts: {
      connect: 'Part 1 connects your child\'s iPhone to your own iPhone or iPad, so you can manage it from your phone. It\'s worth doing, but you can skip it. If you don\'t have an iPhone or iPad, or you\'re short of time, skip to Step 3. Your child\'s phone will be just as locked down.',
      settings: 'Part 2 is the study settings. Everyone does these, on your child\'s phone.'
    },
    steps: {
      family: {
        points: ['Settings → your name → Family', 'Add your child, or create a child account', 'Check their date of birth'],
        say: 'Step 1. On your own phone, open Settings, tap your name, then Family. Add your child: invite their Apple Account if they have one, or create a child account. Check their date of birth is right. You may be asked for a card to check you\'re over 18. You won\'t be charged. Stuck on the age check? Skip to Step 3 and come back another day.'
      },
      signin: {
        points: ['Sign out of anyone else\'s account', 'Tap "Sign in a child in my Family"', 'Sign in with your own Apple Account'],
        say: 'Step 2. On your child\'s iPhone, sign it in to their own account. If it\'s signed in to someone else\'s account, sign out first. Then tap Sign in to your iPhone, choose Sign in a child in my Family, sign in with your own Apple Account, and choose your child.'
      },
      code: {
        points: ['Settings → Screen Time → turn it on', 'Lock Screen Time Settings', 'A four-digit code only you know'],
        say: 'Step 3. On your child\'s phone, open Settings, then Screen Time, and turn it on. Tap Lock Screen Time Settings, and choose a four-digit code your child doesn\'t know. When you\'re asked for an Apple Account for recovery, enter your own. Please don\'t skip this step: without the code, your child can undo everything in a few taps.'
      },
      block: {
        points: ['App Limits → Add Limit', 'Tick ten categories, one by one', 'Not Information & Reading, Utilities, All Apps or Websites', '0 minutes, and Block at End of Limit'],
        say: 'Step 4. In Screen Time, tap App Limits, then Add Limit. Tick these categories one by one: Social, Games, Entertainment, Creativity, Productivity and Finance, Education, Health and Fitness, Shopping and Food, Travel, and Other. Leave Information and Reading and Utilities unticked, and don\'t tick All Apps and Categories, or Websites. Tap Next, set the time to zero minutes, and turn on Block at End of Limit.'
      },
      allow: {
        points: ['Screen Time → Always Allowed', 'Keep Phone, Messages and Maps', 'Add the apps listed in the guide'],
        say: 'Step 5. Now allow back the apps your child needs. In Screen Time, tap Always Allowed. Keep Phone, Messages and Maps, remove anything else, such as FaceTime, and add the apps listed in the guide, such as WhatsApp, Camera and Clock.'
      },
      web: {
        points: ['Content & Privacy Restrictions → on', 'Web Content → Only Approved Websites', 'Add the sites in the guide, then test'],
        say: 'Step 6. Blocking an app doesn\'t block its website, so now you limit the web. In Screen Time, turn on Content and Privacy Restrictions, and check Safari is allowed. Then go to App Store, Media, Web and Games, then Web Content, and choose Only Approved Websites. Delete the sites already listed, and add the ones in the guide, exactly as written. Then test it: an approved site should open, and youtube dot com should be blocked.'
      },
      lock: {
        points: ['Installing, Deleting, In-app Purchases: Don\'t Allow', 'Passcode & Face ID, Accounts: Don\'t Allow'],
        say: 'Step 7. Still in Content and Privacy Restrictions, tap iTunes and App Store Purchases, and set Installing Apps, Deleting Apps and In-app Purchases to Don\'t Allow. Then, under Allow Changes, set Passcode and Face ID, and Accounts, to Don\'t Allow.'
      },
      check: {
        points: ['Did Part 1? Check the settings on your phone', 'Skipped it? Look at their phone together each week'],
        say: 'Step 8. If you did Part 1, open Screen Time on your own phone and tap your child\'s name: you should see the settings you just made. If you skipped it, agree a time each week, say Sunday evening, to look at their phone together.'
      }
    }
  },
  android: {
    file: 'android',
    title: 'Setting up your child\'s Android phone',
    intro: 'This short video shows you how to set up your child\'s Android phone for the SMART Study, so it only has a short list of apps and websites. It takes about 40 minutes, or 20 if you already use Google\'s Family Link app.',
    parts: {
      connect: 'Part 1 connects your child\'s phone to Google\'s Family Link app, which works on any phone, iPhones included. You\'ll need it, because Android\'s own settings can\'t be locked with a code. If you already use Family Link with this child, skip to Step 4.',
      settings: 'Part 2 is the study settings. You make them from Family Link, on your own phone.'
    },
    steps: {
      app: {
        points: ['Install Family Link on your phone', 'Sign in with your own Google Account'],
        say: 'Step 1. On your own phone, install the Family Link app from the Play Store or the App Store, and sign in with your own Google Account.'
      },
      account: {
        points: ['Create or add your child\'s Google Account', 'Check their date of birth', 'Choose "fewer steps"'],
        say: 'Step 2. Family Link asks whether your child has a Google Account. If they don\'t, create one. If they do, add it. Check their date of birth is right. Google may check you\'re over 18, with a text message or a card. You won\'t be charged. When asked about settings, choose fewer steps: you\'ll make the study settings later.'
      },
      link: {
        points: ['Only your child\'s Google Account on their phone', 'Settings → Google → Parental controls', 'Set a PIN only you know'],
        say: 'Step 3. On your child\'s phone, first check that the only Google Account on it is theirs. Then open Settings, Google, Parental controls. Tap Get started, choose Child or teen, and sign in with your own Google Account when asked for a parent. Set a PIN your child doesn\'t know. Your child then types their password and taps Agree. On a Samsung phone, you may also be asked to set up a Samsung account: the written guide explains how.'
      },
      block: {
        points: ['Schedules → Downtime on', 'Every day, 12:00 to 11:59', 'Then go straight on to Step 5'],
        say: 'Step 4. In Family Link, tap Schedules and turn on Downtime. Leave School time off. Tap Weekly schedule, then Monday. Set the start time to twelve o\'clock and the end time to eleven fifty-nine, tick Apply to all days of the week, and tap Done. Downtime now covers the whole day. Your child\'s phone will lock, apart from calls, until you finish the next step, so carry straight on.'
      },
      allow: {
        points: ['Time limits → App limits', 'Apps in the guide: Unlimited time', 'Allowed apps → Unlimited apps on'],
        say: 'Step 5. Go back to Screen time, tap Time limits, then App limits. Tap each app your child needs, such as Messages, WhatsApp and Google Maps, and choose Unlimited time. Do the same for Google Chrome. Then go to Schedules, Allowed apps, and turn on Unlimited apps, so these apps work during downtime.'
      },
      web: {
        points: ['Controls → Google Chrome and web', 'Only allow approved sites', 'Add the sites in the guide'],
        say: 'Step 6. In Family Link, tap Controls, then Google Chrome and web, and choose Only allow approved sites. Under Approved sites, add each site in the guide, using the main web address.'
      },
      lock: {
        points: ['Controls → Google Play', 'Require approval for: All content'],
        say: 'Step 7. In Controls, tap Google Play, then Require approval for, and choose All content, so nothing new can be installed without your say-so.'
      },
      check: {
        points: ['Family Link shows their phone', 'Look at their phone together each week'],
        say: 'Step 8. Open Family Link on Screen time. If it shows your child\'s phone, the link is live. Then agree a time each week, say Sunday evening, to look at their phone together.'
      }
    }
  }
}

module.exports = { common, guides }
