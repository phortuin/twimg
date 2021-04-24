const twitter = require('../lib/twitter-instance')
const { handleErrors } = require('../lib/middleware')

module.exports = handleErrors(async (req, res) => {
	const { oauth_token } = await twitter.getRequestToken(req)
	res.writeHead(302, {
		Location: `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`,
	})
	res.end()
})
