const tweet = {
	id: null,
	handle: null,
	name: null,
	text: null,
	media: [],
	create(tweetData) {
		let tweet = Object.create(this)
		tweet.id = tweetData.id_str
		tweet.handle = tweetData.user.screen_name
		tweet.name = tweetData.user.name
		tweet.text = tweetData.text
		tweet.media = this.getMedia(tweetData) || []
		return tweet
	},
	getMedia(tweetData) {
		// https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/extended-entities-object
		// extended_entities are preferred over entities
		const entities = tweetData.extended_entities ?
			tweetData.extended_entities :
			tweetData.entities
		if (entities && entities.media) {
			return entities.media.map(medium => ({
				url: medium.media_url,
				type: medium.type,
			}))
		}
	},
	hasMedia() {
		return !!this.media.length
	},
}

module.exports = tweet
