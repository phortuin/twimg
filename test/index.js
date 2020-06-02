const test = require('tape')
const tweetData = require('./fixtures/tweet.json')

const tweet = require('../lib/tweet')

const expectedTweet = {
	id: '1050118621198921728',
	handle: 'TwitterAPI',
	name: 'Twitter API',
	text: 'To make room for more expression, we will now count all emojis as equal—including those with gender and skin t… https://t.co/MkGjXf9aXm',
	media: [],
}

const expectedTweetEmpty = {
	id: '',
	handle: '',
	name: '',
	text: '',
	media: [],
}

test('Creates empty tweetobject', t => {
	t.plan(1)
	t.deepLooseEqual(tweet.create(), expectedTweetEmpty)
})

test('Creates tweetobject', t => {
	t.plan(1)
	t.deepLooseEqual(expectedTweet, tweet.create(tweetData))
})
