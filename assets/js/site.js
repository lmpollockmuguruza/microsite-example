/*
 * SMART Study microsite – shared layout and behaviour (MOCK-UP)
 *
 * Every page only holds its own <main> content. This script adds the header,
 * navigation, footer, cookie banner and the design-notes toolbar, so those
 * live in one place.
 *
 * The sign-in here is fake. It keeps a pretend session in the browser so the
 * mock-up can be clicked through. A real build must check access on the
 * server (see decision A1), because anything done in the browser can be
 * bypassed by anyone who has a link.
 */
(function () {
  'use strict'

  var SITE = {
    name: 'The SMART Study',
    tagline: 'A research study with primary schools in England',
    supportEmail: 'smartphonestudy@public.io'
  }

  // ------------------------------------------------------------------ storage
  // Wrapped because storage can be blocked (private windows, strict settings).
  function store (kind) {
    try { return window[kind] } catch (e) { return null }
  }
  function get (kind, key) {
    try { var s = store(kind); return s ? s.getItem(key) : null } catch (e) { return null }
  }
  function set (kind, key, value) {
    try { var s = store(kind); if (s) { value === null ? s.removeItem(key) : s.setItem(key, value) } } catch (e) {}
  }

  var body = document.body
  var access = body.getAttribute('data-access') || 'public'
  var page = body.getAttribute('data-page') || ''
  var onlyFor = body.getAttribute('data-only-for')

  // ------------------------------------------------------------------ session
  var session = {
    id: get('localStorage', 'smart_id'),
    group: get('localStorage', 'smart_group')
  }
  window.SMART = {
    signIn: function (id, group) {
      set('localStorage', 'smart_id', id)
      set('localStorage', 'smart_group', group)
    },
    signOut: function () {
      set('localStorage', 'smart_id', null)
      set('localStorage', 'smart_group', null)
    },
    session: session,
    email: SITE.supportEmail
  }

  if (access === 'member' && !session.group) {
    var next = encodeURIComponent(location.pathname.split('/').pop() + location.search + location.hash)
    location.replace('sign-in.html?next=' + next)
    return
  }
  if (access === 'member' && onlyFor && onlyFor !== session.group) {
    location.replace('start.html')
    return
  }
  var signedIn = !!session.group

  // ------------------------------------------------------------------ helpers
  function el (html) {
    var t = document.createElement('template')
    t.innerHTML = html.trim()
    return t.content.firstElementChild
  }
  function esc (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  // ------------------------------------------------------------------ header
  function icon (name) {
    return '<svg class="smart-icon" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>'
  }
  window.SMART.icon = icon

  // The logo mark (a sun, a parent and a child) deliberately shows no phone,
  // because the public page is seen by the control group (decision A4).
  function logo (href) {
    return '<a class="smart-logo" href="' + href + '">' +
      '<img src="assets/images/logo-mark.svg" alt="">' +
      '<span><span class="smart-logo__name">SMART <span>Study</span></span>' +
      '<span class="smart-logo__tagline">' + SITE.tagline + '</span></span></a>'
  }

  var navItems = [
    { href: 'start.html', text: 'Start here', key: 'start', icon: 'house' },
    { href: 'guides.html', text: 'Guides', key: 'guides', icon: 'book-open' },
    { href: 'videos.html', text: 'Videos and webinars', key: 'videos', icon: 'circle-play' },
    { href: 'share-screen-time.html', text: 'Share screen time', key: 'share', icon: 'upload', group: 'restrict' },
    { href: 'help.html', text: 'Get help', key: 'help', icon: 'life-buoy' }
  ]

  var header = el(
    '<div>' +
    '<a href="#main-content" class="govuk-skip-link" data-module="govuk-skip-link">Skip to main content</a>' +
    '<div class="smart-mock-banner"><div class="govuk-width-container">' +
    '<strong class="govuk-tag govuk-tag--yellow">Mock-up</strong>' +
    'This is a prototype for review. It is not a live service and nothing you enter is saved or sent. ' +
    '<a class="govuk-link" href="decisions.html">See the open decisions</a>.' +
    '</div></div>' +
    '<header class="smart-header" role="banner"><div class="govuk-width-container smart-header__inner">' +
    logo(signedIn ? 'start.html' : 'index.html') +
    (signedIn
      ? '<a class="smart-header__signout" href="index.html" data-signout>' + icon('log-out') + 'Sign out</a>'
      : '') +
    '</div></header>' +
    (signedIn
      ? '<nav class="smart-nav" aria-label="Main"><div class="govuk-width-container"><ul class="smart-nav__list">' +
        navItems.filter(function (i) { return !i.group || i.group === session.group }).map(function (i) {
          return '<li class="smart-nav__item"><a href="' + i.href + '"' + (i.key === page ? ' aria-current="page"' : '') + '>' + icon(i.icon) + i.text + '</a></li>'
        }).join('') +
        '</ul></div></nav>'
      : '') +
    '</div>'
  )
  while (header.firstChild) body.insertBefore(header.lastChild, body.firstChild)

  // ------------------------------------------------------------------ footer
  // Partner logos are placeholders: each organisation's logo needs their
  // permission and brand guidelines (decision B5).
  var partners = [
    ['Department for Education', 'Commissioned by'],
    ['IFF Research', 'Lead partner'],
    ['University of Cambridge', 'Research partner'],
    ['PUBLIC', 'Delivery partner']
  ]
  var footer = el(
    '<footer class="smart-footer" role="contentinfo"><div class="govuk-width-container">' +
    '<div class="smart-footer__top">' + logo(signedIn ? 'start.html' : 'index.html') + '</div>' +
    '<p class="smart-footer__label">This study is run by</p>' +
    '<ul class="smart-partners">' + partners.map(function (p) {
      return '<li class="smart-partner"><span>[' + p[0] + ' logo]<small>' + p[1] + '</small></span></li>'
    }).join('') + '</ul>' +
    '<h2 class="govuk-visually-hidden">Support links</h2>' +
    '<ul class="smart-footer__links">' +
    '<li><a href="privacy.html">Privacy notice</a></li>' +
    '<li><a href="privacy.html#cookies">Cookies</a></li>' +
    '<li><a href="accessibility.html">Accessibility statement</a></li>' +
    '<li><a href="' + (signedIn ? 'help.html' : 'index.html#contact') + '">Contact us</a></li>' +
    '<li><a href="decisions.html">Mock-up: open decisions</a></li>' +
    '</ul>' +
    '</div></footer>'
  )
  body.appendChild(footer)

  var main = document.getElementById('main-content')

  // ------------------------------------------------------------------ cookie banner (GOV.UK pattern)
  if (!get('localStorage', 'smart_cookies')) {
    var banner = el(
      '<div class="govuk-cookie-banner" data-nosnippet role="region" aria-label="Cookies on ' + SITE.name + '">' +
      '<div class="govuk-cookie-banner__message govuk-width-container"><div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">' +
      '<h2 class="govuk-cookie-banner__heading govuk-heading-m">Cookies on ' + SITE.name + '</h2>' +
      '<div class="govuk-cookie-banner__content"><p class="govuk-body">We use some essential cookies to make this website work.</p>' +
      '<p class="govuk-body">We\'d also like to use analytics cookies so we can understand how you use the website and make improvements.</p></div>' +
      '</div></div><div class="govuk-button-group">' +
      '<button type="button" class="govuk-button" data-cookies="accept">Accept analytics cookies</button>' +
      '<button type="button" class="govuk-button" data-cookies="reject">Reject analytics cookies</button>' +
      '<a class="govuk-link" href="privacy.html#cookies">View cookies</a></div></div></div>'
    )
    body.insertBefore(banner, body.firstChild)
    banner.addEventListener('click', function (e) {
      var choice = e.target.getAttribute('data-cookies')
      if (!choice) return
      set('localStorage', 'smart_cookies', choice)
      banner.parentNode.removeChild(banner)
    })
  }

  // ------------------------------------------------------------------ sign out
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-signout]')) window.SMART.signOut()
  })

  // ------------------------------------------------------------------ group-specific content
  // Anything marked data-show-for="restrict" or "delay" only shows for that group.
  function applyGroup () {
    document.querySelectorAll('[data-show-for]').forEach(function (n) {
      n.classList.toggle('smart-hide', n.getAttribute('data-show-for') !== session.group)
    })
    document.querySelectorAll('[data-family-id]').forEach(function (n) { n.textContent = session.id || '' })
  }
  applyGroup()

  // ------------------------------------------------------------------ design-notes toolbar (mock-up only)
  var notesOff = get('localStorage', 'smart_notes') === 'off'
  document.documentElement.classList.toggle('smart-notes-off', notesOff)
  var toolbarPref = get('localStorage', 'smart_toolbar')
  var collapsed = toolbarPref ? toolbarPref === 'collapsed' : window.innerWidth < 640
  var toolbar = el(
    '<div class="smart-toolbar smart-no-print' + (collapsed ? ' smart-toolbar--collapsed' : '') + '" role="region" aria-label="Mock-up review tools">' +
    '<div class="smart-toolbar__row"><p class="smart-toolbar__title">Review tools</p>' +
    '<button type="button" class="smart-toolbar__btn" data-tool="collapse" aria-expanded="' + !collapsed + '">' + (collapsed ? 'Show' : 'Hide') + '</button></div>' +
    '<div class="smart-toolbar__body"><div class="smart-toolbar__row">' +
    '<button type="button" class="smart-toolbar__btn" data-tool="notes" aria-pressed="' + !notesOff + '">Design notes</button>' +
    '<a class="govuk-link" href="decisions.html">All decisions</a></div>' +
    (signedIn
      ? '<div class="smart-toolbar__row" role="group" aria-label="View as group">View as:' +
        '<button type="button" class="smart-toolbar__btn" data-tool="group" data-group="restrict" aria-pressed="' + (session.group === 'restrict') + '">Restrict</button>' +
        '<button type="button" class="smart-toolbar__btn" data-tool="group" data-group="delay" aria-pressed="' + (session.group === 'delay') + '">Delay</button></div>'
      : '') +
    '</div></div>'
  )
  body.appendChild(toolbar)
  toolbar.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tool]')
    if (!b) return
    var tool = b.getAttribute('data-tool')
    if (tool === 'notes') {
      notesOff = !notesOff
      document.documentElement.classList.toggle('smart-notes-off', notesOff)
      b.setAttribute('aria-pressed', String(!notesOff))
      set('localStorage', 'smart_notes', notesOff ? 'off' : 'on')
    } else if (tool === 'collapse') {
      collapsed = !toolbar.classList.contains('smart-toolbar--collapsed')
      toolbar.classList.toggle('smart-toolbar--collapsed', collapsed)
      b.textContent = collapsed ? 'Show' : 'Hide'
      b.setAttribute('aria-expanded', String(!collapsed))
      set('localStorage', 'smart_toolbar', collapsed ? 'collapsed' : 'open')
    } else if (tool === 'group') {
      var g = b.getAttribute('data-group')
      var id = (session.id || 'SMART-X-0000').replace(/-[RD]-/, g === 'restrict' ? '-R-' : '-D-')
      window.SMART.signIn(id, g)
      if (onlyFor && onlyFor !== g) location.href = 'start.html'
      else location.reload()
    }
  })

  // ------------------------------------------------------------------ design-note labels
  // <aside class="smart-design-note" data-decision="C2"> gets a label linking to the register.
  document.querySelectorAll('.smart-design-note').forEach(function (n) {
    var ids = (n.getAttribute('data-decision') || '').split(/\s+/).filter(Boolean)
    var label = 'Design note' + (ids.length ? ' · ' + ids.map(function (id) {
      return '<a href="decisions.html#' + id + '">' + id + '</a>'
    }).join(', ') : '')
    n.insertBefore(el('<p class="smart-design-note__label">' + label + '</p>'), n.firstChild)
    if (!n.hasAttribute('aria-label')) n.setAttribute('aria-label', 'Design note for reviewers')
  })

  // ------------------------------------------------------------------ mock phone screens
  // <div data-phone="ios" data-title="Screen Time" data-back="Settings"
  //      data-rows="App Limits|Downtime*|Always Allowed~on" data-caption="..."></div>
  // "*" marks the thing to tap; "~on"/"~off" draws a switch; "^" adds a hint after it.
  document.querySelectorAll('[data-phone]').forEach(function (n) {
    var kind = n.getAttribute('data-phone')
    var groups = (n.getAttribute('data-rows') || '').split('||')
    var described = []
    var html = groups.map(function (g) {
      return '<div class="smart-phone__group">' + g.split('|').map(function (r) {
        var tap = /\*/.test(r)
        var toggle = (r.match(/~(on|off)/) || [])[1]
        var parts = r.replace(/\*|~on|~off/g, '').split('^')
        var label = parts[0].trim()
        var hint = (parts[1] || '').trim()
        if (tap) described.push('tap “' + label + '”')
        return '<div class="smart-phone__row' + (tap ? ' is-tap' : '') + '"><span>' + esc(label) + '</span>' +
          (toggle ? '<span class="smart-phone__toggle' + (toggle === 'on' ? ' is-on' : '') + '"></span>' : '') +
          (hint ? '<small>' + esc(hint) + '</small>' : (toggle ? '' : '<small>›</small>')) + '</div>'
      }).join('') + '</div>'
    }).join('')
    var title = n.getAttribute('data-title') || ''
    var caption = n.getAttribute('data-caption')
    n.setAttribute('role', 'img')
    n.setAttribute('aria-label', 'Example ' + (kind === 'android' ? 'Android' : 'iPhone') + ' screen: ' + title + (described.length ? ', ' + described.join(', ') : ''))
    n.innerHTML =
      '<div class="smart-phone smart-phone--' + kind + '" aria-hidden="true"><div class="smart-phone__screen">' +
      '<div class="smart-phone__status"><span>9:41</span><span>' + (kind === 'android' ? '▾ ▮' : '▂▄▆ ▭') + '</span></div>' +
      '<div class="smart-phone__back">' + (n.getAttribute('data-back') ? '‹ ' + esc(n.getAttribute('data-back')) : '') + '</div>' +
      '<div class="smart-phone__title">' + esc(title) + '</div>' + html +
      '</div></div>' + (caption ? '<p class="smart-phone__caption" aria-hidden="true">' + esc(caption) + '</p>' : '')
  })

  // ------------------------------------------------------------------ guide progress ("I've done this step")
  // Saved in this browser only. In a real build this could also be sent as an
  // engagement signal (see decision D2).
  var guide = body.getAttribute('data-guide')
  if (guide) {
    var key = 'smart_guide_' + guide
    var done = {}
    try { done = JSON.parse(get('localStorage', key) || '{}') || {} } catch (e) {}
    var steps = document.querySelectorAll('.smart-step')
    var bar = document.querySelector('.smart-progress span')
    var count = document.querySelector('[data-progress-text]')
    var refresh = function () {
      var n = 0
      steps.forEach(function (s) {
        var on = !!done[s.id]
        s.classList.toggle('is-done', on)
        var box = s.querySelector('.smart-step__done input')
        if (box) box.checked = on
        var link = document.querySelector('.smart-contents a[href="#' + s.id + '"]')
        if (link) link.parentNode.classList.toggle('is-done', on)
        if (on) n++
      })
      if (bar) bar.style.width = (steps.length ? (n / steps.length) * 100 : 0) + '%'
      if (count) count.textContent = n + ' of ' + steps.length + ' steps done'
    }
    steps.forEach(function (s) {
      var box = s.querySelector('.smart-step__done input')
      if (box) box.addEventListener('change', function () { done[s.id] = box.checked; set('localStorage', key, JSON.stringify(done)); refresh() })
    })
    refresh()
  }

  // ------------------------------------------------------------------ videos
  // Vimeo player with do-not-track, no title/byline, and no related videos.
  // <div data-vimeo="1084537" data-title="..." data-start="80"></div>
  // Loaded when the user presses play, so no Vimeo request happens before that.
  function vimeoSrc (id, start) {
    return 'https://player.vimeo.com/video/' + id + '?dnt=1&title=0&byline=0&portrait=0&autoplay=1' + (start ? '#t=' + start + 's' : '')
  }
  document.querySelectorAll('[data-vimeo]').forEach(function (n) {
    var id = n.getAttribute('data-vimeo')
    var title = n.getAttribute('data-title') || 'Video'
    n.classList.add('smart-video')
    var poster = n.getAttribute('data-poster')
    if (poster) n.style.backgroundImage = 'url(' + poster + ')'
    var b = el('<button type="button" class="govuk-button smart-button--coral smart-video__play">' + icon('circle-play') + 'Play video<span class="govuk-visually-hidden">: ' + esc(title) + '</span></button>')
    n.appendChild(b)
    var load = function (start) {
      n.innerHTML = '<iframe src="' + vimeoSrc(id, start) + '" title="' + esc(title) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
    }
    b.addEventListener('click', function () { load(n.getAttribute('data-start')) })
    n.smartLoad = load
  })
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-seek]')
    if (!c) return
    var target = document.getElementById(c.getAttribute('data-target'))
    if (target && target.smartLoad) { target.smartLoad(c.getAttribute('data-seek')); target.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
  })

  // ------------------------------------------------------------------ print
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-print]')) { e.preventDefault(); window.print() }
  })

  // ------------------------------------------------------------------ GOV.UK Frontend components
  body.classList.add('js-enabled')
  if ('noModule' in HTMLScriptElement.prototype) body.classList.add('govuk-frontend-supported')
  if (window.GOVUKFrontend) window.GOVUKFrontend.initAll()

  if (main) main.setAttribute('tabindex', '-1')
})()
