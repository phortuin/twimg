const { authenticate, handleErrors } = require('../lib/middleware')
const { getTimeline } = require('../lib/twitter-instance')
const render = require('../lib/render')

/**
 * Gets timeline data from twitter and renders them. This route needs
 * an authenticated twitter client, which is handled by the authenticate
 * middleware.
 */
module.exports = authenticate(handleErrors(async (req, res) => {
	const timeline = await getTimeline(req.query.id)
	const html = await render('tweets', timeline)
	res.send(html)
}))
