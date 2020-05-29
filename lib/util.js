module.exports = {
	removeEmptyKeys(obj) {
		return Object.keys(obj)
			.filter(key => obj[key] != null) // null and undefined
			.reduce((newObj, key) => ({...newObj, [key]: obj[key] }), {})
	},
	tsDiff(timestampInSeconds) {
		// https://developer.twitter.com/en/docs/basics/rate-limiting
		// Twitter rate limit timestamp is in seconds since epoch,
		// Date.now() is milliseconds
		const nowInSeconds = Date.now() / 1000
		return timestampInSeconds - nowInSeconds
	},
}
