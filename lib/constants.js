const apiEndpoints = {
	HOME_TIMELINE: 'statuses/home_timeline',
}

/**
 * Specifies the number of records to retrieve. Must be less than or equal to
 * 200. Defaults to 20. The value of count is best thought of as a limit to the
 * number of tweets to return because suspended or deleted content is removed
 * after the count has been applied.
 * [...]
 * Up to 800 Tweets are obtainable on the home timeline. It is more volatile for
 * users that follow many users or follow users who Tweet frequently.
 */
const apiParams = {
	TWEETS_PER_PAGE: 200,
}

const rateLimitHeaders = {
	REMAINING: 'x-rate-limit-remaining',
	LIMIT: 'x-rate-limit-limit',
	RESET_TIMESTAMP: 'x-rate-limit-reset',
}

const authentication = {
	TWITTER_REDIRECT_PATH: '/api/token',
	TWITTER_OAUTH_URL: 'https://api.twitter.com/oauth/authenticate?oauth_token='
}

const redisKeys = {
	AUTO_ID: 'auto_id',
}

module.exports = {
	apiEndpoints,
	apiParams,
	rateLimitHeaders,
	authentication,
	redisKeys,
}
