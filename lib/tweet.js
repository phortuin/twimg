function urlTemplate(url, displayUrl) {
	return `<a class="tweet__url" href="${url}">${displayUrl}</a>`
}

function hashtagTemplate(hashtag) {
	return `<a class="tweet__hashtag" href="https://twitter.com/hashtag/${hashtag}">#${hashtag}</a> `
}

function findBestVideo(variants) {
	return variants
		.filter(variant => variant.content_type == 'video/mp4')
		.sort((first, second) => first.bitrate > second.bitrate ? -1 : 1)
		[0]
}

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
		this.tweetData = tweetData
		if (this.isRt()) {
			tweet.is_rt = true
			tweet.via_name = this.tweetData.user && this.tweetData.user.name
			tweet.via_handle = this.tweetData.user && this.tweetData.user.screen_name
			this.tweetData = this.tweetData.retweeted_status
		}
		tweet.id = this.tweetData.id_str || tweet.id
		tweet.handle = this.tweetData.user && this.tweetData.user.screen_name || tweet.handle
		tweet.name = this.tweetData.user && this.tweetData.user.name || tweet.name
		tweet.text = this.getText() || tweet.text
		tweet.media = this.getMedia() || tweet.media
		return tweet
	},
	getText() {
		let text = this.tweetData.text
		if (this.tweetData.entities) {
			this.tweetData.entities.urls.forEach(url => {
				text = text.replace(url.url, urlTemplate(url.expanded_url, url.display_url))
			})
			this.tweetData.entities.hashtags.forEach(hashtag => {
				text = text.replace(`#${hashtag.text} `, hashtagTemplate(hashtag.text))
			})
		}
		return text && text.replace(/https:\/\/t.co\/[a-zA-Z0-9]{10}/g, '') // remove unused t.co links
	},
	getMedia() {
		// https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/extended-entities-object
		// extended_entities are preferred over entities
		const entities = this.tweetData.extended_entities ?
			this.tweetData.extended_entities :
			this.tweetData.entities
		if (entities && entities.media) {
			return entities.media.map(medium => {
				const is_video = ['video', 'animated_gif'].includes(medium.type)
				return {
					url: is_video
						? findBestVideo(medium.video_info.variants).url
						: medium.media_url,
					type: medium.type,
					is_video,
					orientation: medium.sizes.large.w / medium.sizes.large.h < 1 ? "portrait" : "landscape",
				}
			})
		}
	},
	hasMedia() {
		return !!this.media.length
	},
	isRt() {
		return !!this.tweetData.retweeted_status
	}
}

module.exports = tweet
