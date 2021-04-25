const { authenticate, handleErrors } = require('../lib/middleware')
const { getTimeline } = require('../lib/twitter-instance')
const render = require('../lib/render')

/**
 * Gets home timeline from twitter and renders it. If an `id` query parameter
 * is available, this id will be used as an offset id (pagination). This route
 * needs an authenticated twitter client, which is handled by the authenticate
 * middleware.
 */
module.exports = authenticate(handleErrors(async (req, res) => {
	const timeline = await getTimeline(req.query.id)
	const html = await render('tweets', timeline)
	res.send(html)
}))
