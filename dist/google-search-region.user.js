// ==UserScript==
// @name            Google Search Region
// @namespace       jmln.tw
// @version         0.1.0
// @description     A user script that lets you quickly switch Google search to different region.
// @author          Jimmy Lin
// @license         MIT
// @homepage        https://github.com/jmlntw/google-search-region
// @supportURL      https://github.com/jmlntw/google-search-region/issues
// @include         https://www.google.*/search?*
// @include         https://www.google.*/webhp?*
// @compatible      firefox
// @compatible      chrome
// @compatible      opera
// @run-at          document-end
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM.getValue
// @grant           GM.setValue
// ==/UserScript==

/**
 * Greasemonkey 4 API Polyfill
 *
 * This helper script bridges compatibility between the Greasemonkey 4 APIs and
 * existing/legacy APIs.
 *
 * <https://arantius.com/misc/greasemonkey/imports/greasemonkey4-polyfill.js>
 */

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

// -----------------------------------------------------------------------------

/**
 * Lodash-Like Utility Library
 *
 * Uses ES6 features to implement a few similar methods to Lodash.
 */
class LodashLike {
  /**
   * Iterates over elements of array, returning the first element `predicate`
   * returns truthy for.
   * @static
   * @param {Array} array The array to inspect.
   * @param {Object} predicate The object to match per iteration.
   * @return {*} Returns the matched element, else `undefined`.
   */
  static find (array, predicate) {
    array = Array.isArray(array) ? array : Array.from(array)
    return array.find(value => {
      return Object.keys(predicate).every(key => predicate[key] === value[key])
    })
  }

  /**
   * Creates a function that invokes `func` with `partials` prepended to the
   * arguments it receives.
   * @static
   * @param {Function} func The function to partially apply arguments to.
   * @param {...*} [partials] The arguments to be partially applied.
   * @return {Function} Returns the new partially applied function.
   */
  static partial (func, ...partials) {
    return (...args) => func(...partials, ...args)
  }

  /**
   * Removes all given values from `array`.
   * @param {Array} array The array to modify.
   * @param {...*} values The values to remove.
   * @return {Array} Returns array.
   */
  static pull (array, ...values) {
    array = Array.isArray(array) ? array : Array.from(array)
    values.forEach(value => {
      const index = array.indexOf(value)
      if (index !== -1) array.splice(index, 1)
    })
    return array
  }

  /**
   * Creates a slice of `array` with `n` elements taken from the beginning.
   * @static
   * @param {Array} array The array to query.
   * @param {number} [n=1] The number of elements to take.
   * @return {Array} Returns the slice of `array`.
   */
  static take (array, n) {
    array = Array.isArray(array) ? array : Array.from(array)
    return array.slice(0, n < 0 ? 0 : n)
  }

  /**
   * Creates a duplicate-free version of an array, in which only the first
   * occurrence of each element is kept.
   * @static
   * @param {Array} array The array to inspect.
   * @return {Array} Returns the new duplicate free array.
   */
  static uniq (array) {
    array = Array.isArray(array) ? array : Array.from(array)
    return array.filter((value, index, self) => self.indexOf(value) === index)
  }
}

// Add a global shortcut to `LodashLike`.
const _ = LodashLike

// -----------------------------------------------------------------------------

/**
 * jQuery-Like DOM Manipulation Library
 *
 * Uses ES6 features to implement a few similar methods to jQuery.
 */
class JQueryLike {
  /**
   * Returns a collection of matched elements.
   * @param {(string|Element)} selector A string containing a selector
   * expression, or DOM element to wrap in a JQueryLike object.
   * @param {Element} [context=document] A DOM element to use as context.
   */
  constructor (selector, context = document) {
    let elements = typeof selector === 'string'
      ? context.querySelectorAll(selector)
      : [selector]
    this.length = elements.length
    Object.assign(this, elements)
  }

  /**
   * Iterates over a JQueryLike object, executing a function for each element.
   * @param {Function(Element)} iteratee A function to execute for each element.
   * @return {JQueryLike}
   */
  each (iteratee) {
    Array.from(this).forEach(iteratee)
    return this
  }

  /**
   * Inserts content, specified by the parameter, after each element in the set
   * of matched elements.
   * @param {string} content A HTML string to insert.
   * @return {JQueryLike}
   */
  after (content) {
    this.each(element => element.insertAdjacentHTML('afterend', content))
    return this
  }

  /**
   * Inserts content, specified by the parameter, to the beginning of each
   * element in the set of matched elements.
   * @param {string} content A HTML string to insert.
   * @return {JQueryLike}
   */
  prepend (content) {
    this.each(element => element.insertAdjacentHTML('afterbegin', content))
    return this
  }

  /**
   * Gets or sets the value of an attribute for the set of matched elements.
   * @param {string} name The attribute name to get or set.
   * @param {string} [value] The attribute value to set.
   * @return {(JQueryLike|string)} Returns attribute value if `value` is `null`
   * or omitted.
   */
  attr (name, value) {
    if (value) {
      this.each(element => element.setAttribute(name, value))
      return this
    } else {
      return this[0].getAttribute(name)
    }
  }

  /**
   * Determines whether any of the matched elements are assigned the given
   * class.
   * @param {string} name The class name to search for.
   * @return {boolean} Returns true if the class name is assigned to element.
   */
  hasClass (name) {
    return this[0].classList.contains(name)
  }

  /**
   * Removes the set of matched elements from the DOM.
   * @return {JQueryLike}
   */
  remove () {
    this.each(element => element.parentNode.removeChild(element))
    return this
  }

  /**
   * Displays or hides the matched elements.
   * @return {JQueryLike}
   */
  toggle () {
    this.each(element => {
      const style = window.getComputedStyle(element)
      const display = style.getPropertyValue('display')
      element.style.display = display !== 'none' ? 'none' : 'inherit'
    })
    return this
  }

  /**
   * Attaches an event handler function for an event to the selected elements.
   * @param {string} event The event type such as "click".
   * @param {string} [selector] A selector string to filter the descendants of
   * the selected elements that trigger the event. If the selector is `null` or
   * omitted, the event is always triggered when it reaches the selected
   * element.
   * @param {Function(Object)} handler A function to execute when the event os
   * triggered.
   * @return {JQueryLike}
   */
  on (event, selector = null, handler) {
    if (selector === null) {
      this.each(element => element.addEventListener(event, handler))
    } else {
      this.each(element => element.addEventListener(event, event => {
        if (event.target.matches(selector)) handler.call(this, event)
      }))
    }
    return this
  }
}

// Add a global shortcut to `JQueryLike`.
const $ = (...args) => new JQueryLike(...args)

// -----------------------------------------------------------------------------

/**
 * User Script Storage Library
 *
 * Allows JSON data to be persisted easily by user script.
 */
class ScriptStorage {
  /**
   * Gets stored value using GM API, parsing it to JavaScript value or object.
   * @static
   * @param {string} name The property name to get.
   * @param {*} [def] Any value to be returned when no value has previously been
   * set, or previous value is not valid JSON.
   * @return {Promise(*)} Returns a `Promise` object with stored value.
   */
  static getValue (name, def) {
    return GM.getValue(name, null).then(value => {
      try {
        return value !== null ? JSON.parse(value) : def
      } catch (err) {
        return def
      }
    })
  }

  /**
   * Converts value to JSON string, persisting it using GM API.
   * @static
   * @param {string} name The property name to set.
   * @param {*} value Any JSON-able value to persist.
   * @return {Promise} Returns a `Promise` object.
   */
  static setValue (name, value) {
    return GM.setValue(name, JSON.stringify(value))
  }
}

// -----------------------------------------------------------------------------

/**
 * Search Region Data Set
 *
 * Stores all search region data, providing some query methods.
 */
class RegionSet {
  /**
   * Creates a new RegionSet class.
   * @param {Array.<Object>} regions The region data to store.
   */
  constructor (regions) {
    this.regions = regions.map(region => new Region(region))
    this.finder = _.partial(_.find, this.regions)
  }

  /**
   * Finds the first search region matched `predicate` object.
   * @param {Object} predicate The object to match per region.
   * @return {(Region|undefined)} Returns the matched region, else `undefined`.
   */
  find (predicate) {
    return this.finder(predicate)
  }

  /**
   * Gets a search region matched 'id`.
   * @param {string} id The region ID to get.
   * @return {(Region|undefined)} Returns the matches region, else `undefined`.
   */
  getByID (id) {
    return this.finder({ id: id })
  }

  /**
   * All search region data as a readonly array.
   * @readonly
   * @type {Array.<Region>}
   */
  get all () {
    return this.regions
  }

  /**
   * Current search region parsed from page URL, else `undefined`.
   * @readonly
   * @type {(Region|undefined)}
   */
  get current () {
    const url = new window.URL(window.location.href)
    const domain = url.hostname.replace(/^(.+)\.google\.([A-z.]+)(.*)$/i, '$2')
    const lang = url.searchParams.get('hl')
    return this.finder({ domain: domain, lang: lang })
  }
}

/**
 * Single Search Region Data
 *
 * Stores a single search region data, including id, name, domain and language
 * parameter.
 */
class Region {
  /**
   * Creates a new Region class.
   * @param {{id: string, name: string, domain: string, lang: string?}} region
   */
  constructor (region) {
    Object.assign(this, region)
  }

  /**
   * ISO-3166 country code.
   * @readonly
   * @type {string}
   */
  get countryCode () {
    return this.id.replace(/^(\w+)-(\w+)$/i, '$1')
  }

  /**
   * Search URL replaced with region domain and language parameters.
   * @readonly
   * @type {string}
   */
  get searchURL () {
    const url = new window.URL(window.location.href)
    const domain = this.domain
    const lang = this.lang

    // Replace domain.
    url.hostname = url.hostname.replace(
      /^(.+)\.google\.([A-z.]+)(.*)$/i,
      `$1.google.${domain}$3`
    )

    // Set language parameter if any.
    lang ? url.searchParams.set('hl', lang) : url.searchParams.delete('hl')

    // Remove unnecessary URL parameters.
    url.searchParams.delete('safe')
    url.searchParams.delete('oq')

    return url.toString()
  }
}

// -----------------------------------------------------------------------------

/**
 * Search Region Menu Class
 *
 * The main class of this user script. Initializes the region menu and inserts
 * it to the page.
 */
class Menu {
  /**
   * Creates a new Menu class.
   */
  constructor () {
    this.regions = new RegionSet(
      [
      {id: 'wt-wt', name: 'All Regions', domain: 'com'},
      {id: 'ar-es', name: 'Argentina', domain: 'com.ar', lang: 'es'},
      {id: 'au-en', name: 'Australia', domain: 'com.au', lang: 'en'},
      {id: 'at-de', name: 'Austria', domain: 'at', lang: 'de'},
      {id: 'be-fr', name: 'Belgium (fr)', domain: 'be', lang: 'fr'},
      {id: 'be-nl', name: 'Belgium (nl)', domain: 'be', lang: 'nl'},
      {id: 'br-pt', name: 'Brazil', domain: 'com.br', lang: 'pt'},
      {id: 'bg-bg', name: 'Bulgaria', domain: 'bg', lang: 'bg'},
      {id: 'ca-en', name: 'Canada', domain: 'ca', lang: 'en'},
      {id: 'ca-fr', name: 'Canada (fr)', domain: 'ca', lang: 'fr'},
      {id: 'ct-ca', name: 'Catalonia', domain: 'cat', lang: 'ca'},
      {id: 'cl-es', name: 'Chile', domain: 'cl', lang: 'es'},
      {id: 'cn-zh', name: 'China', domain: 'com.hk', lang: 'zh-cn'},
      {id: 'co-es', name: 'Colombia', domain: 'com.co', lang: 'es'},
      {id: 'hr-hr', name: 'Croatia', domain: 'hr', lang: 'hr'},
      {id: 'cz-cs', name: 'Czech Republic', domain: 'cz', lang: 'cs'},
      {id: 'dk-da', name: 'Denmark', domain: 'dk', lang: 'da'},
      {id: 'ee-et', name: 'Estonia', domain: 'ee', lang: 'et'},
      {id: 'fi-fi', name: 'Finland', domain: 'fi', lang: 'fi'},
      {id: 'fr-fr', name: 'France', domain: 'fr', lang: 'fr'},
      {id: 'de-de', name: 'Germany', domain: 'de', lang: 'de'},
      {id: 'gr-el', name: 'Greece', domain: 'gr', lang: 'el'},
      {id: 'hk-zh', name: 'Hong Kong', domain: 'com.hk', lang: 'zh-hk'},
      {id: 'hu-hu', name: 'Hungary', domain: 'hu', lang: 'hu'},
      {id: 'in-en', name: 'India', domain: 'co.in', lang: 'en'},
      {id: 'id-id', name: 'Indonesia', domain: 'co.id', lang: 'id'},
      {id: 'id-en', name: 'Indonesia (en)', domain: 'co.id', lang: 'en'},
      {id: 'ie-en', name: 'Ireland', domain: 'ie', lang: 'en'},
      {id: 'il-he', name: 'Israel', domain: 'co.il', lang: 'he'},
      {id: 'it-it', name: 'Italy', domain: 'it', lang: 'it'},
      {id: 'jp-ja', name: 'Japan', domain: 'co.jp', lang: 'ja'},
      {id: 'kr-kr', name: 'Korea', domain: 'co.kr', lang: 'kr'},
      {id: 'lv-lv', name: 'Latvia', domain: 'lv', lang: 'lv'},
      {id: 'lt-lt', name: 'Lithuania', domain: 'lt', lang: 'lt'},
      {id: 'my-ms', name: 'Malaysia', domain: 'com.my', lang: 'ms'},
      {id: 'my-en', name: 'Malaysia (en)', domain: 'com.my', lang: 'en'},
      {id: 'mx-es', name: 'Mexico', domain: 'mx', lang: 'es'},
      {id: 'nl-nl', name: 'Netherlands', domain: 'nl', lang: 'nl'},
      {id: 'nz-en', name: 'New Zealand', domain: 'co.nz', lang: 'en'},
      {id: 'no-no', name: 'Norway', domain: 'no', lang: 'no'},
      {id: 'pe-es', name: 'Peru', domain: 'com.pe', lang: 'es'},
      {id: 'ph-en', name: 'Philippines', domain: 'com.ph', lang: 'en'},
      {id: 'ph-tl', name: 'Philippines (tl)', domain: 'com.ph', lang: 'tl'},
      {id: 'pl-pl', name: 'Poland', domain: 'pl', lang: 'pl'},
      {id: 'pt-pt', name: 'Portugal', domain: 'pt', lang: 'pt'},
      {id: 'ro-ro', name: 'Romania', domain: 'ro', lang: 'ro'},
      {id: 'ru-ru', name: 'Russia', domain: 'ru', lang: 'ru'},
      {id: 'sa-ar', name: 'Saudi Arabia', domain: 'com.sa', lang: 'ar'},
      {id: 'sg-en', name: 'Singapore', domain: 'com.sg', lang: 'en'},
      {id: 'sk-sk', name: 'Slovakia', domain: 'sk', lang: 'sk'},
      {id: 'sl-sl', name: 'Slovenia', domain: 'si', lang: 'sl'},
      {id: 'za-en', name: 'South Africa', domain: 'co.za', lang: 'en'},
      {id: 'es-es', name: 'Spain', domain: 'es', lang: 'es'},
      {id: 'es-ca', name: 'Spain (ca)', domain: 'es', lang: 'ca'},
      {id: 'se-sv', name: 'Sweden', domain: 'se', lang: 'sv'},
      {id: 'ch-de', name: 'Switzerland (de)', domain: 'ch', lang: 'de'},
      {id: 'ch-fr', name: 'Switzerland (fr)', domain: 'ch', lang: 'fr'},
      {id: 'ch-it', name: 'Switzerland (it)', domain: 'ch', lang: 'it'},
      {id: 'tw-zh', name: 'Taiwan', domain: 'com.tw', lang: 'zh-tw'},
      {id: 'th-th', name: 'Thailand', domain: 'co.th', lang: 'th'},
      {id: 'tr-tr', name: 'Turkey', domain: 'com.tr', lang: 'tr'},
      {id: 'gb-en', name: 'United Kingdom', domain: 'co.uk', lang: 'en'},
      {id: 'us-en', name: 'United States', domain: 'com', lang: 'en'},
      {id: 'us-es', name: 'United States (es)', domain: 'com', lang: 'es'},
      {id: 'vn-vi', name: 'Vietnam', domain: 'com.vn', lang: 'vi'}
    ]
    )

    this.currentRegion = this.regions.current || this.regions.getByID('wt-wt')

    this.recentRegions = ['us-en', 'jp-ja', 'tw-zh']
    this.recentRegionsKey = 'recentRegions'

    this.classMap = {
      menuButton: 'GM_region_menuButton',
      menuList: 'GM_region_menuList',
      menuItem: 'GM_region_menuItem',
      menuLink: 'GM_region_menuLink',
      toggler: 'GM_region_toggler',
      togglable: 'GM_region_togglable',
      removable: 'GM_region_removable'
    }
  }

  /**
   * Initializes the menu, inserting it when the page is ready.
   */
  init () {
    this.addStyles()
    this.delegateEvents()

    // Observe the page and insert menu when possible.
    const observer = new window.MutationObserver(() => {
      const $target = $('#hdtb-mn-gp')
      if ($target.length !== 0) {
        this.insertMenu($target)
        this.insertRecentItems()
        observer.disconnect()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  /**
   * Generates menu HTML, inserting after `$target` element.
   * @param {JQueryLike} $target The target element to insert menu.
   */
  insertMenu ($target) {
    const html = []

    html.push(this.makeMenuButton())
    html.push(this.makeMenuList())

    $target.after(html.join(' '))
  }

  /**
   * Generates recent items HTML, prepending to `$target` element.
   */
  insertRecentItems () {
    this.getRecentRegions().then(ids => {
      const $target = $(`.${this.classMap.menuList}`)

      // Map ID to `Region` object and map again to HTML string.
      const html = ids.map(id => this.regions.getByID(id)).map(region => {
        return this.makeMenuItem(region, { togglable: false, removable: true })
      })

      // Inserts a separator.
      html.push('<li class="hdtbItm"><div class="cdr_sep"></div></li>')

      $target.prepend(html.join(' '))
    })
  }

  /**
   * Generates menu button HTML string.
   * @return {string}
   */
  makeMenuButton () {
    const region = this.currentRegion
    const content = `${this.makeFlag(region)} ${region.name}`
    const classList = [this.classMap.menuButton]

    // Add `hdtb-sel` to bolden button text if current region is set.
    if (region.id !== 'wt-wt') classList.unshift('hdtb-sel')

    return `
      <div class="hdtb-mn-hd ${classList.join(' ')}" role="button">
        <div class="mn-hd-txt">${content}</div>
        <span class="mn-dwn-arw"></span>
      </div>
    `
  }

  /**
   * Generates menu list HTML string.
   * @return {string}
   */
  makeMenuList () {
    const items = this.regions.all.map(region => {
      return this.makeMenuItem(region, { togglable: true, removable: false })
    })
    const toggler = `
      <li class="hdtbItm">
        <a class="q qs ${this.classMap.toggler}" href="#"
           title="More regions...">
          ...
        </a>
      </li>
    `

    return `
      <ul class="hdtbU hdtb-mn-c ${this.classMap.menuList}">
        ${toggler}
        ${items.join(' ')}
      </ul>
    `
  }

  /**
   * Generates menu item HTML string.
   * @param {Region} region
   * @param {{togglable: boolean, removable: boolean}} options
   * @return {string}
   */
  makeMenuItem (region, options) {
    const { id, name, domain, lang, searchURL } = region
    const selected = id === this.currentRegion.id
    const togglable = options.togglable
    const removable = options.removable
    const content = `${this.makeFlag(region)} ${name}`
    const itemClassList = [this.classMap.menuItem]
    const linkClassList = [this.classMap.menuLink]
    const inlineStyle = togglable ? ['display:none'] : []
    const tooltip = removable
      ? `Press Shift+Click to remove this item.`
      : `Domain: ${domain}\nLanguage: ${lang}`

    if (selected) {
      return `
        <li class="hdtbItm hdtbSel ${itemClassList.join(' ')}">${content}</li>
      `
    }

    if (togglable) itemClassList.push(this.classMap.togglable)
    if (removable) linkClassList.push(this.classMap.removable)

    return `
      <li class="hdtbItm ${itemClassList.join(' ')}"
          style="${inlineStyle.join(';')}">
        <a class="q qs ${linkClassList.join(' ')}" href="${searchURL}"
           data-gm-region="${id}" title="${tooltip}">
          ${content}
        </a>
      </li>
    `
  }

  /**
   * Generates flag HTML string.
   * @param {Region} region The region to get flag HTML from.
   * @return {string}
   */
  makeFlag (region) {
    return `<span class="flag flag-${region.countryCode}"></span>`
  }

  /**
   * Gets recent regions IDs from `ScriptStorage`.
   * @return {Promise(Array.<String>)}
   */
  getRecentRegions () {
    return ScriptStorage.getValue(this.recentRegionsKey, this.recentRegions)
      .then(value => {
        this.recentRegions = value
        return value
      })
  }

  /**
   * Prepends a region ID to recent regions.
   * @param {string} id The region ID to prepend.
   * @return {Promise}
   */
  addRecentRegion (id) {
    let recentRegions = this.recentRegions
    recentRegions.unshift(id)
    recentRegions = _.uniq(recentRegions)     // Remove duplicated regions.
    recentRegions = _.take(recentRegions, 3)  // Take first 3 regions.
    return ScriptStorage.setValue(this.recentRegionsKey, recentRegions)
  }

  /**
   * Removes a region ID from recent regions.
   * @param {string} id The region ID to remove.
   * @return {Promise}
   */
  removeRecentRegion (id) {
    let recentRegions = this.recentRegions
    recentRegions = _.pull(recentRegions, id)
    return ScriptStorage.setValue(this.recentRegionsKey, recentRegions)
  }

  /**
   * Attaches all event handler functions to the menu elements.
   */
  delegateEvents () {
    $(document)
      .on('click', `a.${this.classMap.toggler}`, event => {
        this.onTogglerClick(event)
      })
      .on('click', `a.${this.classMap.menuLink}`, event => {
        this.onMenuLinkClick(event)
      })
  }

  /**
   * Toggles menu items.
   * @param {Object} event
   */
  onTogglerClick (event) {
    event.preventDefault()
    $(`li.${this.classMap.togglable}`).toggle()
  }

  /**
   * Stores clicked region link and redirects page.
   * @param {Object} event
   */
  onMenuLinkClick (event) {
    event.preventDefault()
    const $target = $(event.target)
    const id = $target.attr('data-gm-region')
    const href = $target.attr('href')
    const removable = $target.hasClass(this.classMap.removable)

    if (event.shiftKey && removable) {
      this.removeRecentRegion(id).then(() => $target.remove())
    } else {
      this.addRecentRegion(id).then(() => { window.location.href = href })
    }
  }

  /**
   * Injects CSS codes used by this user script to the page.
   */
  addStyles () {
    GM_addStyle(`
      .hdtb-sel { font-weight: bold }
      .${this.classMap.menuList} { max-height: 60vh; overflow-y: auto }
    `)
    GM_addStyle(`
      /*!
       * Generated with CSS Flag Sprite Generator <https://www.flag-sprites.com/>
       *
       * FAMFAMFAM Flag Icons <http://www.famfamfam.com/lab/icons/flags/>
       * These flag icons are available for free use for any purpose with no
       * requirement for attribution.
       */
      .flag{box-sizing:border-box;display:inline-block;width:16px;height:11px;background:url(data:image/png;base64,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) no-repeat;image-rendering:-moz-crisp-edges;image-rendering:crisp-edges;image-rendering:pixelated}
      .flag.flag-wt{border:1px dotted;background-image:none!important}
      .flag.flag-ar{background-position:0 0}
      .flag.flag-at{background-position:-16px 0}
      .flag.flag-au{background-position:-32px 0}
      .flag.flag-be{background-position:-48px 0}
      .flag.flag-bg{background-position:-64px 0}
      .flag.flag-br{background-position:-80px 0}
      .flag.flag-ca{background-position:-96px 0}
      .flag.flag-ct{background-position:-112px 0}
      .flag.flag-ch{background-position:0 -11px}
      .flag.flag-cl{background-position:-16px -11px}
      .flag.flag-cn{background-position:-32px -11px}
      .flag.flag-co{background-position:-48px -11px}
      .flag.flag-cz{background-position:-64px -11px}
      .flag.flag-de{background-position:-80px -11px}
      .flag.flag-dk{background-position:-96px -11px}
      .flag.flag-ee{background-position:-112px -11px}
      .flag.flag-es{background-position:0 -22px}
      .flag.flag-fi{background-position:-16px -22px}
      .flag.flag-fr{background-position:-32px -22px}
      .flag.flag-gb{background-position:-48px -22px}
      .flag.flag-gr{background-position:-64px -22px}
      .flag.flag-hk{background-position:-80px -22px}
      .flag.flag-hr{background-position:-96px -22px}
      .flag.flag-hu{background-position:-112px -22px}
      .flag.flag-id{background-position:0 -33px}
      .flag.flag-ie{background-position:-16px -33px}
      .flag.flag-il{background-position:-32px -33px}
      .flag.flag-in{background-position:-48px -33px}
      .flag.flag-it{background-position:-64px -33px}
      .flag.flag-jp{background-position:-80px -33px}
      .flag.flag-kr{background-position:-96px -33px}
      .flag.flag-lt{background-position:-112px -33px}
      .flag.flag-lv{background-position:0 -44px}
      .flag.flag-mx{background-position:-16px -44px}
      .flag.flag-my{background-position:-32px -44px}
      .flag.flag-nl{background-position:-48px -44px}
      .flag.flag-no{background-position:-64px -44px}
      .flag.flag-nz{background-position:-80px -44px}
      .flag.flag-pe{background-position:-96px -44px}
      .flag.flag-ph{background-position:-112px -44px}
      .flag.flag-pl{background-position:0 -55px}
      .flag.flag-pt{background-position:-16px -55px}
      .flag.flag-ro{background-position:-32px -55px}
      .flag.flag-ru{background-position:-48px -55px}
      .flag.flag-sa{background-position:-64px -55px}
      .flag.flag-se{background-position:-80px -55px}
      .flag.flag-sg{background-position:-96px -55px}
      .flag.flag-sk{background-position:-112px -55px}
      .flag.flag-sl{background-position:0 -66px}
      .flag.flag-th{background-position:-16px -66px}
      .flag.flag-tr{background-position:-32px -66px}
      .flag.flag-tw{background-position:-48px -66px}
      .flag.flag-us{background-position:-64px -66px}
      .flag.flag-vn{background-position:-80px -66px}
      .flag.flag-za{background-position:-96px -66px}
    `)
  }
}

new Menu().init()
