const { rateLimitHeaders } = require('./constants')

module.exports = rateLimitInfo

/**
 * Returns information about Twitters rate limit.
 *
 * Note that the headers object follows the WHATWG Fetch standard:
 * https://github.github.io/fetch/#Headers
 *
 * @param  {Headers Object} headers
 * @return {Object}
 */
function rateLimitInfo(headers) {
	const secondsToReset = tsDiff(headers.get(rateLimitHeaders.RESET_TIMESTAMP))
	return {
		remaining: headers.get(rateLimitHeaders.REMAINING),
		limit: headers.get(rateLimitHeaders.LIMIT),
		minutesToReset: Math.ceil(secondsToReset / 60),
		secondsToReset: Math.ceil(secondsToReset),
	}
}

/**
 * Calculates the number of seconds until timestamp is reached. The timestamp
 * is in seconds, not milliseconds. This calculation is needed because the
 * Twitter rate limit timestamp is in seconds since epoch, Date.now()
 * is in milliseconds
 * See https://developer.twitter.com/en/docs/basics/rate-limiting
 *
 * @param  {Number} timestampInSeconds
 * @return {Number}
 */
function tsDiff(timestampInSeconds) {
	const nowInSeconds = Date.now() / 1000
	return timestampInSeconds - nowInSeconds
}
