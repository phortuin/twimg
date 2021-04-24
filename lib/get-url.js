module.exports = getUrl

/**
 * Get the app’s current URL. The url automatically adapts to the hosting
 * environment (dev/prod) by parsing the HTTP Request object’s hostname
 * and protocol
 *
 * @param  {HTTP Request object} request
 * @return {String}
 */
function getUrl(req) {
	return `${req.headers['x-forwarded-proto']}://${req.headers.host}`
}
