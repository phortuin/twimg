// Core
const crypto = require('crypto')
const { promisify } = require('util')

// NPM
const redis = require('redis')

// Local
const { redisKeys } = require('./constants.js')
const log = require('./log-error.js')

/**
 * Redis connection default settings.
 * Note that `tls` should not be null to set up a secure connection, but no
 * options need to be passed; hence, an empty object `{}`
 */
const CONNECTION_DEFAULTS = {
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	password: process.env.REDIS_PASSWORD,
	tls: {},
}

module.exports = { initClient, createUserSession, getUserSession }

// Shared instance
let client

/**
 * Initialise a Redis client and attach error handling. The shared `client`
 * instance implements the `get`, `set` and `incr` methods as Promises, making
 * them easy to use and implement.
 *
 * @param {Object} connectionParams
 */
function initClient(connectionParams = {}) {
	if (client) {
		return
	}
	const options = Object.assign({}, CONNECTION_DEFAULTS, connectionParams)
	const redisClient = redis.createClient(options)

	redisClient.on('error', error => {
		log(error)
		throw error
	})

	// Promisified redis commands need to be rebound to `client` scope
	// https://stackoverflow.com/questions/44815553/use-node-redis-with-node-8-util-promisify#comment108778017_44926073
	client = {
		incr: promisify(redisClient.incr).bind(redisClient),
		get: promisify(redisClient.get).bind(redisClient),
		set: promisify(redisClient.set).bind(redisClient),
	}
}

/**
 * Creates a new session id and stores the session data in Redis.
 *
 * Note: We’re not storing key/values in a Redis hash because the performance
 * difference is negligable and since we already have a JSON object, this is
 * less overhead. See also https://stackoverflow.com/a/31364449
 *
 * @todo let sessions expire
 *
 * @param  {Object} userCredentials
 * @return {String}
 */
async function createUserSession(userCredentials) {
	if (!client) {
		initClient()
	}
	try {
		const increment = await client.incr(redisKeys.AUTO_INCREMENT)
		const sessionId = createSessionId(increment)
		await client.set(sessionId, JSON.stringify(userCredentials))
		return sessionId
	} catch(error) {
		log(error)
		throw Error('Could not create session')
	}
}

/**
 * Returns session data from Redis for a given session id. The session should
 * contain the oauth token + secret, a username and user id.
 *
 * @param  {String} sessionId
 * @return {Object}
 */
async function getUserSession(sessionId) {
	if (!client) {
		initClient()
	}
	try {
		const sessionData = await client.get(sessionId)
		return JSON.parse(sessionData)
	} catch(error) {
		log(error)
		return {}
	}
}

/**
 * Creates a pseudo-random string of characters, appended with Redis’ auto
 * incremented number as a hexadecimal to get a unique session id.
 *
 * Some good resources on creating session id’s:
 * https://stackoverflow.com/a/18079904
 * https://stackoverflow.com/questions/817882/unique-session-id-in-python/6092448#6092448
 *
 * @param  {Number} increment
 * @return {String}
 */
function createSessionId(increment) {
	const randomString = urlSafeBase64(crypto.randomBytes(24))
	return randomString + increment.toString('16')
}

/**
 * Create a URL-safe base64 encoded string, so that the session id can be shared
 * via URL as well as in JSON responses or cookies. Follows RFC 4648 (see
 * https://tools.ietf.org/html/rfc4648#page-7)
 *
 * Source:
 * https://github.com/RGBboy/urlsafe-base64
 *
 * @param  {Buffer} buffer
 * @return {String}
 */
function urlSafeBase64(buffer) {
	return buffer.toString('base64')
	  .replace(/\+/g, '-')
	  .replace(/\//g, '_')
	  .replace(/=+$/, '')
}
