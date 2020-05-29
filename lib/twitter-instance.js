const Twitter = require('twitter-lite')
const tweet = require('./tweet')
const { removeEmptyKeys } = require('./util')
const { apiEndpoints, apiParams } = require('./constants')
const rateLimitInfo = require('./rate-limit-info')

const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

function timeline(offsetId) {
	const params = removeEmptyKeys({
		count: apiParams.TWEETS_PER_PAGE,
		max_id: offsetId,
	})
	return twitter.get(apiEndpoints.HOME_TIMELINE, params)
		.then(tweetsData => {
			const tweets = tweetsData.map(tweetData => tweet.create(tweetData))
			return {
				tweets: tweets.filter(tweet => tweet.hasMedia()),
				lastTweet: tweets.pop(),
				rateLimit: rateLimitInfo(tweetsData._headers),
			}
		})
}

module.exports = { timeline }
