// NPM
const Twitter = require('twitter-lite')

// Local
const tweet = require('./tweet')
const getUrl = require('./get-url')
const rateLimitInfo = require('./rate-limit-info')

/**
 * Twitter consumer key and secret are app specific; access token parameters
 * are user specific and can be passed to initClient() separately
 */
const APP_DEFAULTS = {
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
}

/**
 * From Twitter docs:
 * "Specifies the number of records to retrieve. Must be less than or equal to
 * 200. Defaults to 20. The value of count is best thought of as a limit to the
 * number of tweets to return because suspended or deleted content is removed
 * after the count has been applied. [...] Up to 800 Tweets are obtainable on
 * the home timeline. It is more volatile for for users that follow many users
 * or follow users who Tweet frequently."
 *
 * See https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-home_timeline
 */
const TWEETS_PER_PAGE = 100

// This app’s endpoint for oauth tokens coming from Twitter
const OAUTH_REDIRECT_PATH = '/api/token'

// API
module.exports = {
	getAccessToken,
	getRequestToken,
	getTimeline,
	verifyCredentials,
}

// Shared instance
let client

/**
 * Initialise Twitter client. If no parameters are passed, the client has
 * app-level authorisation, which can be used to start an oAuth authentication
 * process.
 *
 * See twitter-lite readme for implementation details
 * https://github.com/draftbit/twitter-lite#verifying-credentials-example-user-auth
 *
 * @param  {Object} appParams
 * @return {Twitter instance}
 */
function initClient(appParams = {}) {
	if (client) return
	const options = Object.assign({}, APP_DEFAULTS, appParams)
	client = new Twitter(options)
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
	if (!client) initClient()
	return client.getAccessToken({
		oauth_token: token,
		oauth_verifier: verifier,
	})
}

/**
 * Wrapper for twitter-lite getRequestToken method, providing the right
 * redirectUrl which is also configured in the Twitter app dashboard.
 *
 * @param  {HTTP Request object} req
 * @return {Promise}
 */
function getRequestToken(req) {
	if (!client) initClient()
	const redirectUrl = getUrl(req) + OAUTH_REDIRECT_PATH
	return client.getRequestToken(redirectUrl)
}

/**
 * Get a filtered list of tweets from the user’s home timeline. Tweets without
 * media (video/image) are removed. The offsetId is used for pagination; the
 * Twitter API returns `count` tweets either from the top (offsetId is
 * undefined) or from that id forward. The `lastTweetId` is present in
 * the return object to be used as offsetId for the next page. Ratelimit info is
 * provided for development purposes.
 *
 * Note that our custom tweet model is used to create new objects out of
 * Twitter’s data, for ease of use in templating.
 *
 * This function needs the Twitter client to have been instantiated before,
 * including user access tokens, it will fail otherwise.
 *
 * @param  {String} offsetId
 * @return {Promise}
 */
async function getTimeline(offsetId) {
	if (!client) return Promise.reject('Can’t get Twitter timeline: client not instantiated')
	let params = removeEmptyKeys({
		count: TWEETS_PER_PAGE,
		max_id: offsetId,
	})
	const tweetsData = await client.get('/statuses/home_timeline', params)
	const tweets = tweetsData.map(tweetData => tweet.create(tweetData))
	return {
		tweets: tweets.filter(tweet => tweet.hasMedia()),
		meta: {
			lastTweetId: tweets[tweets.length - 1].id,
			rateLimit: rateLimitInfo(tweetsData._headers),
		}
	}
}

/**
 * Removes empty key/value pairs from an object. Empty means its value
 * is falsy (null and undefined)
 *
 * @param  {Object} obj
 * @return {Object}
 */
function removeEmptyKeys(obj) {
	return Object.keys(obj)
		.reduce((newObj, key) => {
			return { ...newObj, ...(obj[key] && { [key]: obj[key] }) }
		}, {})
}

/**
 * Fetches the 'verify credentials' endpoint on Twitter, which responds ok if
 * the access token key & secret are valid, and errors if they aren’t. In our
 * implementation, this means the Promise rejects, which we can use to check
 * if a user is authenticated.
 *
 * See also
 * https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
 *
 * @param  {String} key     Twitter access token key
 * @param  {String} secret  Twitter access token secret
 * @return {Promise}
 */
function verifyCredentials(key, secret) {
	if (!client) {
		initClient({
			access_token_key: key,
			access_token_secret: secret
		})
	}
	return client.get('/account/verify_credentials')
}
