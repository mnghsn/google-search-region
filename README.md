# Google Search Region

[![Build Status](https://travis-ci.org/jmlntw/google-search-region.svg?branch=master)](https://travis-ci.org/jmlntw/google-search-region)

A user script that lets you quickly switch Google search to different region.

## Features

_Google does have an option to search in different region_, but it's hidden in "Advanced Search" page. This user script adds a region menu to Google search page so you can access it directly.

![Google Search Region (Menu)](https://raw.githubusercontent.com/jmlntw/google-search-region/master/screenshot-menu.png)

You can configurate regions and URLs by clicking **"..."** in dropdown menu.

![Google Search Region (Modal)](https://raw.githubusercontent.com/jmlntw/google-search-region/master/screenshot-modal.png)

The following regions are supported:
Argentina, Australia, Austria, Belgium (fr), Belgium (nl), Brazil, Bulgaria, Canada, Canada (fr), Catalonia, Chile, China, Colombia, Croatia, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hong Kong, Hungary, India, Indonesia, Indonesia (en), Ireland, Israel, Italy, Japan, Korea, Latvia, Lithuania, Malaysia, Malaysia (en), Mexico, Netherlands, New Zealand, Norway, Peru, Philippines, Philippines (tl), Poland, Portugal, Romania, Russia, Saudi Arabia, Singapore, Slovakia, Slovenia, South Africa, Spain, Spain (ca), Sweden, Switzerland (de), Switzerland (fr), Switzerland (it), Taiwan, Thailand, Turkey, United Kingdom, United States, United States (es) and Vietnam.
(See `src/data/regions.json` for details.)

## Installation

Install a user script manager such as [Greasemonkey](http://www.greasespot.net/) or [Tampermonkey](https://tampermonkey.net/) to your browser, then install this user script:

* From **Greasy Fork**: <https://greasyfork.org/en/scripts/33780-google-search-region>
* From **GitHub**: <https://raw.githubusercontent.com/jmlntw/google-search-region/master/dist/google-search-region.user.js>

## Changelog

* **v0.2.1** (2017-11-11)
  * Minor fixes for codes and UI
  * Make current region item clickable
* **v0.2.0** (2017-11-05)
  * Apply script to encrypted.google.com
  * Use modal dialog to provide more options
  * Remove recent regions
  * Fix Korean country code
  * Update readme and screenshots
* **v0.1.0** (2017-10-05)
  * First release

## License

Licensed under the **MIT License**.
