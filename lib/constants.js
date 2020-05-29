export const apiEndpoints = {
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
export const apiParams = {
	TWEETS_PER_PAGE: 200,
}

export const rateLimitHeaders = {
	REMAINING: 'x-rate-limit-remaining',
	LIMIT: 'x-rate-limit-limit',
	RESET_TIMESTAMP: 'x-rate-limit-reset',
}
