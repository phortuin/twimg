const twitter = require('../lib/twitter-instance')
const { handleErrors } = require('../lib/middleware')

/**
 * Kicks off the oAuth process. Requests an oauth token from Twitter, and
 * redirects the user to the Twitter login screen.
 */
module.exports = handleErrors(async (req, res) => {
	const { oauth_token } = await twitter.getRequestToken(req)
	res.writeHead(302, {
		Location: `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`,
	})
	res.end()
})
