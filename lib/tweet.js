const tweet = {
	id: '',
	handle: '',
	name: '',
	text: '',
	media: [],
	is_rt: false,
	via_handle: '',
	via_name: '',
	create(tweetData = {}) {
		let tweet = Object.create(this)
		if (this.isRt(tweetData)) {
			tweet.is_rt = true
			tweet.via_name = tweetData.user && tweetData.user.name
			tweet.via_handle = tweetData.user && tweetData.user.screen_name
			tweetData = tweetData.retweeted_status
		}
		tweet.id = tweetData.id_str || tweet.id
		tweet.handle = tweetData.user && tweetData.user.screen_name || tweet.handle
		tweet.name = tweetData.user && tweetData.user.name || tweet.name
		tweet.text = this.getText(tweetData) || tweet.text
		tweet.media = this.getMedia(tweetData) || tweet.media
		return tweet
	},
	getText(tweetData) {
		let text = tweetData.text
		if (tweetData.entities) {
			tweetData.entities.urls.forEach(url => {
				text = text.replace(url.url, this.urlTemplate(url.expanded_url, url.display_url))
			})
			tweetData.entities.hashtags.forEach(hashtag => {
				text = text.replace(`#${hashtag.text} `, this.hashtagTemplate(hashtag.text))
			})
		}
		return text && text.replace(/https:\/\/t.co\/[a-zA-Z0-9]{10}/g, '') // remove unused t.co links
	},
	urlTemplate(url, displayUrl) {
		return `<a class="tweet__url" href="${url}">${displayUrl}</a>`
	},
	hashtagTemplate(hashtag) {
		return `<a class="tweet__hashtag" href="https://twitter.com/hashtag/${hashtag}">#${hashtag}</a> `
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
	isRt(tweetData) {
		return !!tweetData.retweeted_status
	}
}

module.exports = tweet
