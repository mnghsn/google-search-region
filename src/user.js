$inline('meta.js|trim')

// =============================================================================
// Add compatibility between the Greasemonkey 4 APIs and existing/legacy APIs.
// =============================================================================

if (typeof GM === 'undefined') {
  // eslint-disable-next-line no-global-assign
  GM = {
    getValue: (...args) => Promise.resolve(GM_getValue.apply(this, args)),
    setValue: (...args) => Promise.resolve(GM_setValue.apply(this, args))
  }
}

// eslint-disable-next-line camelcase
function GM_addStyle (css) {
  const style = document.createElement('style')
  style.type = 'text/css'
  style.textContent = css
  document.head.appendChild(style)
  return style
}
// eslint-disable-next-line camelcase
GM.addStyle = GM_addStyle

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * @param {string} selector
 * @param {Element} [context]
 * @return {Element}
 */
function $ (selector, context) {
  return (context || document).querySelector(selector)
}

/**
 * @param {string} selector
 * @param {Element} [context]
 * @return {NodeListOf<Element>}
 */
function $$ (selector, context) {
  return (context || document).querySelectorAll(selector)
}

/**
 * @param {Element} target
 * @param {string} type
 * @param {EventListener} callback
 * @param {boolean} [useCapture]
 */
function $on (target, type, callback, useCapture) {
  target.addEventListener(type, callback, !!useCapture)
}

/**
 * @param {Element} target
 * @param {string} selector
 * @param {string} type
 * @param {EventListener} callback
 */
function $delegate (target, selector, type, callback) {
  const useCapture = (type === 'blur') || (type === 'focus')
  const dispatchEvent = function dispatchEvent (event) {
    if (event.target.matches(selector)) { callback.call(event.target, event) }
  }

  $on(target, type, dispatchEvent, useCapture)
}

if (window.NodeList && !window.NodeList.prototype.forEach) {
  window.NodeList.prototype.forEach = Array.prototype.forEach
}

// =============================================================================
// Template Engine
// =============================================================================

/**
 * @param {string} text
 * @param {Object} data
 * @return {string}
 */
function renderTemplate (text, data) {
  const matcher = /<%-([\s\S]+?)%>|<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g
  const escapeChar = function escapeChar (text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
  }
  const escape = function escape (text) {
    return ('' + text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;')
  }

  let index = 0
  let source = "__p += '"

  text.replace(matcher, (match, escape, interpolate, evaluate, offset) => {
    source += escapeChar(text.slice(index, offset))
    index = offset + match.length
    if (escape) {
      source += `' + ((__t = (${escape})) == null ? '' : escape(__t)) + '`
    } else if (interpolate) {
      source += `' + ((__t = (${interpolate})) == null ? '' : __t) + '`
    } else if (evaluate) {
      source += `'; ${evaluate} __p += '`
    }
    return match
  })

  source += "';"
  source = `
    let __t, __p = '';
    const __j = Array.prototype.join;
    const print = function print () { __p += __j.call(arguments, ''); };
    with (data || {}) { ${source} }
    return __p;
  `

  try {
    // eslint-disable-next-line no-new-func
    return new Function('data', 'escape', source).call(this, data, escape)
  } catch (err) {
    err.source = source
    throw err
  }
}

// =============================================================================
// User Script Configuration
// =============================================================================

/**
 * @typedef {Object} Config
 * @property {boolean} setTLD
 * @property {boolean} setHl
 * @property {boolean} setGl
 * @property {boolean} setCr
 * @property {boolean} setLr
 * @property {Array<string>} userRegions
 */

/**
 * @type {Config}
 */
const config = Object.seal($inline('data:config'))

/**
 * @return {Promise<Config>}
 */
function loadConfig () {
  return GM.getValue('config')
    .then(value => {
      try { return JSON.parse(value) } catch (err) { return {} }
    })
    .then(value => {
      return Object.assign(config, value)
    })
}

/**
 * @return {Promise<Config>}
 */
function saveConfig () {
  return GM.setValue('config', JSON.stringify(config))
}

// =============================================================================
// Search Regions
// =============================================================================

/**
 * @typedef {Object} Region
 * @property {string} id
 * @property {string} name
 * @property {string} [tld]
 * @property {string} [country]
 * @property {string} [lang]
 */

/**
 * @type {ReadonlyArray<Region>}
 */
const regions = Object.freeze($inline('data:regions'))

/**
 * @param {Object} predicate
 * @return {Region}
 */
function findRegion (predicate) {
  return regions.find(region => {
    return Object.keys(predicate).every(key => {
      return predicate[key] === region[key]
    })
  })
}

/**
 * @param {string} regionID
 * @return {Region}
 */
function getRegionByID (regionID) {
  return findRegion({ id: regionID })
}

const urlRegExp = Object.freeze({
  tld: /^www\.google\.([\w.]+)$/i,
  cr: /^country(\w+)$/i,
  lr: /^lang_([\w-]+)$/i,
  lang: /-\w+$/i
})

/**
 * @return {Region}
 */
function getCurrentRegion () {
  const { hostname, searchParams } = new window.URL(window.location.href)
  const { setTLD, setHl, setGl, setCr, setLr } = config
  const predicate = {}

  if (setTLD && urlRegExp.tld.test(hostname)) {
    predicate.tld = hostname.replace(urlRegExp.tld, '$1')
  }
  if (setHl && searchParams.has('hl')) {
    predicate.lang = searchParams.get('hl')
  }
  if (setGl && searchParams.has('gl')) {
    predicate.country = searchParams.get('gl')
  }
  if (setCr && searchParams.has('cr')) {
    predicate.country = searchParams.get('cr').replace(urlRegExp.cr, '$1')
  }
  if (setLr && searchParams.has('lr')) {
    predicate.lang = searchParams.get('lr').replace(urlRegExp.lr, '$1')
  }

  for (let prop in predicate) {
    predicate[prop] = predicate[prop].toLowerCase()
  }

  return findRegion(predicate)
}

/**
 * @type {ReadonlyArray<string>}
 */
const delParams = Object.freeze($inline('data:del-params'))

/**
 * @param {Region} region
 * @return {string}
 */
function getSearchURL (region) {
  const url = new window.URL(window.location.href)
  const { hostname, searchParams } = url
  const { setTLD, setHl, setGl, setCr, setLr } = config
  const { tld, country, lang } = region

  if (setTLD && tld) {
    url.hostname = hostname.replace(urlRegExp.tld, `www.google.${tld}`)
  } else {
    url.hostname = hostname.replace(urlRegExp.tld, 'www.google.com')
  }
  if (setHl && lang) {
    searchParams.set('hl', lang)
  } else {
    searchParams.delete('hl')
  }
  if (setGl && country) {
    searchParams.set('gl', country)
  } else {
    searchParams.delete('gl')
  }
  if (setCr && country) {
    searchParams.set('cr', `country${country.toUpperCase()}`)
  } else {
    searchParams.delete('cr')
  }
  if (setLr && lang) {
    const lr = `lang_${lang.replace(urlRegExp.lang, m => m.toUpperCase())}`
    searchParams.set('lr', lr)
  } else {
    searchParams.delete('lr')
  }

  delParams.forEach(param => {
    searchParams.delete(param)
  })

  return url.toString()
}

// =============================================================================
// User Interface
// =============================================================================

/**
 * @param {Element} target
 */
function createMenu (target) {
  const currentRegion = getCurrentRegion()
  const data = { config, regions, getRegionByID, getSearchURL, currentRegion }
  const template = `
    $inline('template:menu,4')
  `
  const html = renderTemplate(template, data)

  target.insertAdjacentHTML('afterend', html)
}

/**
 * @param {Element} target
 */
function createModal (target) {
  const data = { config, regions }
  const template = `
    $inline('template:modal,4')
  `
  const html = renderTemplate(template, data)

  target.insertAdjacentHTML('beforeend', html)
}

/**
 * @return {Promise<void>}
 */
function delegateEvents () {
  const body = document.body
  const events = {}

  events.showModal = function showModal (event) {
    const modal = $('.gsr-modal')
    if (modal) { modal.style.display = null } else { createModal(body) }
  }

  events.hideModal = function hideModal (event) {
    const modal = $('.gsr-modal')
    if (modal) { modal.style.display = 'none' }
  }

  events.save = function save (event) {
    const modal = $('.gsr-modal')
    const controls = $$('[data-gsr-config]', modal)
    const pending = {}

    controls.forEach(control => {
      const attr = control.getAttribute('data-gsr-config').split(':')
      const [name, value = control.value] = attr

      if (typeof config[name] === 'boolean') {
        pending[name] = control.checked
      }
      if (Array.isArray(config[name])) {
        if (!Array.isArray(pending[name])) { pending[name] = [] }
        if (control.checked) { pending[name].push(value) }
      }
    })

    Object.assign(config, pending)

    saveConfig().then(() => {
      window.location.reload()
    })
  }

  $delegate(body, '[data-gsr-onclick]', 'click', event => {
    const name = event.target.getAttribute('data-gsr-onclick')
    const callback = events[name]
    if (callback) { callback.call(event.target, event) }
  })

  return Promise.resolve()
}

/**
 * @return {Promise<HTMLStyleElement>}
 */
function addStyles () {
  const style = GM_addStyle(`
    $inline('css:menu,4')
    $inline('css:modal,4')
    $inline('css:flags,4')
  `)

  return Promise.resolve(style)
}

// =============================================================================
// Initialization
// =============================================================================

/**
 * @return {Promise<Element>}
 */
function waitForPageReady () {
  return new Promise(resolve => {
    const observee = $('#hdtb')
    const observer = new window.MutationObserver(() => {
      const target = $('#hdtb-mn-gp')
      if (target) { resolve(target) }
    })

    observer.observe(observee, { childList: true, subtree: true })
  })
}

Promise.all([
  waitForPageReady(),
  loadConfig(),
  delegateEvents(),
  addStyles()
]).then(values => createMenu(values[0]))
