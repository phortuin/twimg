const fetch = require('node-fetch')
const Dropbox = require('dropbox').Dropbox

const errorPage = require('../lib/error-page')

const { basename } = require('path')

module.exports = async (request, response) => {
	const { body, headers } = request
	const dropboxApi = new Dropbox({
		fetch,
		accessToken: process.env.DROPBOX_ACCESS_TOKEN,
	})
	const options = {
		url: body.url,
		path: `/${ body.handle }-${ basename(body.url) }`
	}

	await dropboxApi.filesSaveUrl(options)
		.then(() => response.status(204))
		.catch(error => {
			response.status(error.status)
			response.end(errorPage(`Could not save image: "${ error.error.error_summary }"`))
		})
	response.end()
}
