// NPM
const { Dropbox } = require('dropbox')
const fetch = require('node-fetch')

// Local
const { errorPage } = require('../lib/page')

/**
 * Dropbox app key and secret. The Dropbox SDK is built for both server- and
 * client side, so we need to define a fetch library on the server.
 */
const APP_DEFAULTS = {
	// clientId: process.env.DROPBOX_APP_KEY,
	// clientSecret: process.env.DROPBOX_APP_SECRET,
	accessToken: process.env.DROPBOX_ACCESS_TOKEN,
	fetch
}

// API
module.exports = {
	saveFileFromURL
}

// Shared instance
let client

/**
 * Initialise Dropbox client.
 *
 * @param  {Object} appParams
 * @return {Twitter instance}
 */
function initClient(appParams = {}) {
	if (client) return
	const options = Object.assign({}, APP_DEFAULTS, appParams)
	client = new Dropbox(options)
}

/**
 * Sends a URL to Dropbox to retrieve and store. The path to where the file is
 * stored is configured in the Dropbox App Console.
 * See https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesSaveUrl__anchor
 *
 * @todo test validity of URL and filename
 *
 * @param  {String} url
 * @param  {String} filename
 * @return {Promise}
 */
function saveFileFromURL(url, filename) {
	if (!client) initClient()
	return client.filesSaveUrl({
		url,
		path: filename,
	})
}
