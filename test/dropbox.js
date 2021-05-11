const test = require('tape')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

/**
 * Mock Dropbox SDK Class
 */
class Dropbox {
	/**
	 * @param  {Object} options
	 * @return {Dropbox instance}
	 */
	constructor(options) {
		this.options = options
	}

	/**
	 * @param  {Object} params
	 * @return {Function}
	 */
	filesSaveUrl(params) {
		return Promise.resolve({ status: 200 })
	}
}

// Init dropboxInstance
// Note that the dropbox package exports Dropbox class wrapped in object literal
const dropboxInstance = proxyquire('../lib/dropbox-instance', {
	'dropbox': { Dropbox }
})

/**
 * Tests if saving a file to dropbox initialises a Dropbox client by checking
 * if the internal API returns the right JSON
 */
test('Save file to dropbox calls filesSaveUrl in Dropbox SDK', async t => {
	const res = await dropboxInstance.saveFileFromURL('url', 'path')
	t.deepLooseEqual(res, { status: 200 })
	t.end()
})
