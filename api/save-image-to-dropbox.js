// Core
const { basename } = require('path')

// Local
const { handleErrors } = require('../lib/middleware')
const dropbox = require('../lib/dropbox-instance')

/**
 * Sends image to Dropbox. The filename is made up of the Twitter user
 * handle (optionally a combination of user handle + retweeted user’s handle)
 * and the original image ID retrieved from the image’s URL.
 * stfeyes-EyHsojMVgAQay7K.jpg
 * cysketch-liliuhms-EwvOn9uVoAAu7_h.jpg
 *
 * Note: error handling would result in an error page, but front-end loads this
 * page in a hidden iframe, so nothing will show up.
 */
module.exports = handleErrors(async (request, response) => {
	const { url, handle } = request.body
	if (!url || !handle) {
		const error = Error('Missing url and/or handle')
		error.statusCode = 400
		throw error
	}
	const filename = `/${ handle }-${ basename(url) }`
	await dropbox.saveFileFromURL(url, filename)
	response.status(204)
	response.end()
})
