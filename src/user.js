$inline('meta.js|trim')

/**
 * Greasemonkey 4 API Polyfill
 *
 * This helper script bridges compatibility between the Greasemonkey 4 APIs and existing/legacy
 * APIs.
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

// -------------------------------------------------------------------------------------------------

/**
 * Lodash-Like Utility Library
 *
 * Uses ES6 features to implement a few similar methods to Lodash.
 */
class LodashLike {
  /**
   * Iterates over elements of array, returning the first element `predicate` returns truthy for.
   * @static
   * @param {Array} array The array to inspect.
   * @param {Object} predicate The object to match per iteration.
   * @return {*} Returns the matched element, else `undefined`.
   */
  static find (array, predicate) {
    array = Array.isArray(array) ? array : Array.from(array)
    return array.find(value => Object.keys(predicate).every(key => predicate[key] === value[key]))
  }

  /**
   * Creates a function that invokes `func` with `partials` prepended to the arguments it receives.
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
   * Creates a duplicate-free version of an array, in which only the first occurrence of each
   * element is kept.
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

// -------------------------------------------------------------------------------------------------

/**
 * jQuery-Like DOM Manipulation Library
 *
 * Uses ES6 features to implement a few similar methods to jQuery.
 */
class JQueryLike {
  /**
   * Returns a collection of matched elements.
   * @param {(string|Element)} selector A string containing a selector expression, or DOM element to
   * wrap in a JQueryLike object.
   * @param {Element} [context=document] A DOM element to use as context.
   */
  constructor (selector, context = document) {
    let elements = typeof selector === 'string' ? context.querySelectorAll(selector) : [selector]
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
   * Inserts content, specified by the parameter, after each element in the set of matched elements.
   * @param {string} content A HTML string to insert.
   * @return {JQueryLike}
   */
  after (content) {
    this.each(element => element.insertAdjacentHTML('afterend', content))
    return this
  }

  /**
   * Inserts content, specified by the parameter, to the beginning of each element in the set of
   * matched elements.
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
   * @return {(JQueryLike|string)} Returns attribute value if `value` is `null` or omitted.
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
   * Determines whether any of the matched elements are assigned the given class.
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
      const display = window.getComputedStyle(element).getPropertyValue('display')
      element.style.display = display !== 'none' ? 'none' : 'inherit'
    })
    return this
  }

  /**
   * Attaches an event handler function for an event to the selected elements.
   * @param {string} event The event type such as "click".
   * @param {string} [selector] A selector string to filter the descendants of the selected elements
   * that trigger the event. If the selector is `null` or omitted, the event is always triggered
   * when it reaches the selected element.
   * @param {Function(Object)} handler A function to execute when the event is triggered.
   * @return {JQueryLike}
   */
  on (event, selector, handler) {
    if (handler === null) {
      handler = selector
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

// -------------------------------------------------------------------------------------------------

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
   * @param {*} [def] Any value to be returned when no value has previously been set, or previous
   * value is not valid JSON.
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

// -------------------------------------------------------------------------------------------------

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
 * Stores a single search region data, including id, name, domain and language parameter.
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
    url.hostname = url.hostname.replace(/^(.+)\.google\.([A-z.]+)(.*)$/i, `$1.google.${domain}$3`)

    // Set language parameter if any.
    lang ? url.searchParams.set('hl', lang) : url.searchParams.delete('hl')

    // Remove unnecessary URL parameters.
    url.searchParams.delete('safe')
    url.searchParams.delete('oq')

    return url.toString()
  }
}

// -------------------------------------------------------------------------------------------------

/**
 * Search Region Menu Class
 *
 * The main class of this user script. Initializes the region menu and inserts it to the page.
 */
class Menu {
  /**
   * Creates a new Menu class.
   */
  constructor () {
    this.regions = new RegionSet($inline('data/regions.json|stringify|indent:4|trim'))

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
    const tooltip = removable ? `Press Shift+Click to remove this item.` : `Domain: ${domain}\nLanguage: ${lang}`

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
      $inline('css/flags.css|cssmin|indent:6|trim')
    `)
  }
}

new Menu().init()
