const Twitter = require('twitter-lite')
const tweet = require('./tweet')
const { removeEmptyKeys } = require('./util')
const { authentication, apiEndpoints, apiParams } = require('./constants')
const rateLimitInfo = require('./rate-limit-info')

let client

function getRequestToken(request) {
	if (!client) {
		client = createClient()
	}
	return client.getRequestToken(getRedirectUrl(request))
}

/**
 * Get access tokens from Twitter. With the response, we can create a client
 * with user context
 *
 * @param  {String} token
 * @param  {String} verifier
 * @return {Promise}
 */
function getAccessToken(token, verifier) {
	if (!client) {
		client = createClient()
	}
	return client.getAccessToken({
		oauth_token: token,
		oauth_verifier: verifier,
	})
}

function createClient(userContext = {}) {
	return new Twitter({
		consumer_key: process.env.TWITTER_CONSUMER_KEY,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		access_token_key: userContext.accessTokenKey,
		access_token_secret: userContext.accessTokenSecret,
	})
}

function timeline(offsetId) {
	if (!client) {
		client = createClient() // eigenlijk moet ie redirecten naar /auth, denk ik?
	}
	const params = removeEmptyKeys({
		count: apiParams.TWEETS_PER_PAGE,
		max_id: offsetId,
	})
	return client.get(apiEndpoints.HOME_TIMELINE, params)
		.then(tweetsData => {
			const tweets = tweetsData.map(tweetData => tweet.create(tweetData))
			return {
				tweets: tweets.filter(tweet => tweet.hasMedia()),
				lastTweet: tweets.pop(),
				rateLimit: rateLimitInfo(tweetsData._headers),
			}
		})
}

function verifyCredentials(accessTokenKey, accessTokenSecret) {
	if (!client) {
		client = createClient({
			accessTokenKey,
			accessTokenSecret
		})
	}
	return client.get(`/account/verify_credentials`)
}


function getRedirectUrl(request) {
    return `${request.headers['x-forwarded-proto']}://${request.headers.host}${authentication.TWITTER_REDIRECT_PATH}`
}

module.exports = { getAccessToken, timeline, getRequestToken, verifyCredentials }
