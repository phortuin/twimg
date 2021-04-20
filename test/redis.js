const test = require('tape')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const AUTO_INCREMENT = 1

/**
 * Mock Redis connection options
 */
const REDIS_CONNECTION_OPTIONS = {
	host: '127.0.0.1',
	port: 1337,
	password: 'hunter2',
}

/**
 * Fake user credentials. Original object contains auth token etc, but we’re
 * not testing against the object’s integrity, just that it’s there.
 */
const USER_CREDENTIALS = {
	username: 'AzureDiamond',
}

/**
 * Fake valid session id
 */
const SESSION_ID = `ABCDEFGHIJKLMnopqrstuvwxyz012345${AUTO_INCREMENT}`

/**
 * Fake invalid session id (could be a valid Redis key though)
 */
 const INVALID_SESSION_ID = 'auto_increment'

/**
 * The methods `incr`, `get` and `set` need to be promisifyable, so the last
 * argument is a callback function that is called with `null` as first
 * parameter (the `error` parameter; following "error-first callback style":
 * see also https://nodejs.org/api/util.html#util_util_promisify_original
 */
const clientReturnObject = {
	incr: (key, callback) => callback(null, AUTO_INCREMENT),
	set: (key, val, callback) => callback(null, val),
	on: (eventType, callback) => callback,
	del: (key, callback) => callback(null, key),
}

/**
 * Mock redis package
 */
const redis = {
	createClient: options => {
		return {
			...clientReturnObject,
			get: (key, callback) => callback(null, JSON.stringify(USER_CREDENTIALS)),
		}
	}
}

/**
 * As above, but the `get` method will return invalid JSON
 */
const redisNoUserCredentials = {
	createClient: options => {
		return {
			...clientReturnObject,
			get: (key, callback) => callback(null, ""),
		}
	}
}

// Spies
const createClientSpy = sinon.spy(redis, 'createClient')
const redisDelSpy = sinon.spy(clientReturnObject, 'del')

// Init redisInstance
const redisInstance = proxyquire('../lib/redis-instance', {
	redis
})

// Init redisInstance with broken user credentials
const brokenRedisInstance = proxyquire('../lib/redis-instance', {
	redis: redisNoUserCredentials
})

/**
 * Tests whether redis.createClient is called, which indicates the redis client
 * is being initialised.
 *
 * Note: spy.args[0][0] is first call to the spied function, first argument
 * See also https://sinonjs.org/releases/v10.0.1/spies/ (under spy.args)
 *
 * Note: error handling isn’t tested since the setup would require implementing
 * an EventEmitter and testing whether the event is handled and thrown, which
 * is basically testing if Node.js’s internals work.
 */
test('Initialising client passes correct connection params to Redis client', t => {
	redisInstance.initClient(REDIS_CONNECTION_OPTIONS)
	t.deepLooseEqual(createClientSpy.args[0][0], { ...REDIS_CONNECTION_OPTIONS, tls: {} })
	t.end()
})

/**
 * Tests whether a valid session id is returned when creating a session. The
 * regex is the same as the one in `isValidSessionId` in redis-instance.js
 *
 * Note: we’re not testing if user credentials were actually stored in Redis.
 */
test('Create user session returns a valid session id', async t => {
	const sessionId = await redisInstance.createUserSession()
	const sessionRegex = new RegExp(`^[a-zA-Z0-9_-]{32}${AUTO_INCREMENT}$`)
	t.ok(sessionRegex.test(sessionId))
	t.end()
})

/**
 * Tests whether user credentials are returned properly. This test is pretty
 * lousy, since all it effectively does is JSON.parse something that we JSON
 * stringified above here in the mocked `get` method
 */
test('Get user session should return user credentials', async t => {
	const userCredentials = await redisInstance.getUserSession(SESSION_ID)
	t.deepLooseEqual(USER_CREDENTIALS, userCredentials)
	t.end()
})

/**
 * Tests whether deleteUserSession calls the DEL command from the redis client.
 */
test('Delete user session should try to DEL session id from Redis', async t => {
	await redisInstance.deleteUserSession(SESSION_ID)
	t.ok(redisDelSpy.calledOnce)
	t.end()
})

/**
 * Get/delete user session functions should only return/delete valid session ids
 * or else any Redis key can be accessed/deleted
 */
test('Delete or get invalid session ID should fail', async t => {
	const userCredentials = await redisInstance.getUserSession(INVALID_SESSION_ID)
	await redisInstance.deleteUserSession(INVALID_SESSION_ID)
	t.notDeepLooseEqual(USER_CREDENTIALS, userCredentials)
	t.notOk(redisDelSpy.calledTwice) // First time is in test above
	t.end()
})

/**
 * Tests whether getUserSession throws if there are no (parseable) user
 * credentials. Again, pretty lousy, since all we do is test an empty string
 * against a try-catch block with JSON.parse
 */
test('Get user session should return {} if Redis has bad user credentials', async t => {
	t.deepLooseEqual(await brokenRedisInstance.getUserSession(SESSION_ID), {})
	t.end()
})
