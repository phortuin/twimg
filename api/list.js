const errorPage = require('../lib/error-page')
const render = require('../lib/render')
const twitter = require('../lib/twitter-instance')

module.exports = async (request, response) => {
	twitter.timeline(request.query.id)
		.then(data => render('tweets', data))
		.then(html => response.end(html))
		.catch(error => {
			response.status(500) // rate limit = 429
			const message = error.errors ?
				error.errors.map(_err => `${_err.message} (${_err.code})`).join('; ') :
				error
			response.end(errorPage(message))
		})
}
