const errorPage = require('../lib/error-page')
const render = require('../lib/render')
const twitter = require('../lib/twitter-instance')
const rateLimitInfo = require('../lib/rate-limit-info')

const isRateLimitExceededError = error => error.errors && error.errors[0].code == 88 || false

module.exports = async (request, response) => {
	twitter.timeline(request.query.id)
		.then(data => render('tweets', data))
		.then(html => response.end(html))
		.catch(error => {
			let rateLimit = {}
			if (error._headers) {
				rateLimit = rateLimitInfo(error._headers)
			}
			const message = getErrorMessage(error, rateLimit)
			if (isRateLimitExceededError(error)) {
				response.setHeader('Retry-After', rateLimit.secondsToReset)
				response.status(429) // Too Many Requests
			} else {
				response.status(500)
			}
			response.end(errorPage(message))
		})
}

function getErrorMessage(error, rateLimit) {
	let errorMessage = error.errors
		? error.errors.map(_err => `${_err.message} (${_err.code})`).join('; ')
		: error
	if (rateLimit) {
		if (isRateLimitExceededError(error)) {
			errorMessage += `; Reset in ${rateLimit.minutesToReset} minutes`
		} else {
			errorMessage += `; ${rateLimit.remaining} / ${rateLimit.limit} requests remaining`
		}
	}
	return errorMessage
}
