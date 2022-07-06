// ==UserScript==
// @name            Google Search Region
// @namespace       jmln.tw
// @version         0.3.0
// @description     A user script that lets you quickly switch Google search to different region.
// @author          Jimmy Lin
// @license         MIT
// @homepageURL     https://github.com/jmlntw/google-search-region
// @supportURL      https://github.com/jmlntw/google-search-region/issues
// @include         /^https:\/\/(?:ipv4|ipv6|www)\.google\.(?:[a-z\.]+)\/search\?(?:.+&)?q=[^&]+(?:&.+)?$/
// @exclude         /^https:\/\/(?:ipv4|ipv6|www)\.google\.(?:[a-z\.]+)\/search\?(?:.+&)?tbm=lcl(?:&.+)?$/
// @compatible      firefox
// @compatible      chrome
// @compatible      edge
// @compatible      opera
// @run-at          document-end
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM.getValue
// @grant           GM.setValue
// ==/UserScript==
