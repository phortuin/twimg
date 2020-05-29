const { rateLimitHeaders } = require('./constants')
const { tsDiff } = require('./util')

module.exports = headers => {
	const secondsToReset = tsDiff(headers.get(rateLimitHeaders.RESET_TIMESTAMP))
	return {
		remaining: headers.get(rateLimitHeaders.REMAINING),
		limit: headers.get(rateLimitHeaders.LIMIT),
		minutesToReset: Math.ceil(secondsToReset / 60),
	}
}
