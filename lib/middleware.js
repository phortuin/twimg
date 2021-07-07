// Local
const { getUserSession, deleteUserSession } = require('./redis-instance')
const { verifyCredentials } = require('./twitter-instance')
const { page, errorPage } = require('./page')
const rateLimitInfo = require('./rate-limit-info')
const log = require('./log-error.js')
const getUrl = require('./get-url')

// HTTP Status codes
const BAD_REQUEST = 400
const NOT_AUTHORIZED = 401
const FORBIDDEN = 403
const NOT_FOUND = 404
const GONE = 410
const TOO_MANY_REQUESTS = 429
const INTERNAL_SERVER_ERROR = 500
const SERVICE_UNAVAILABLE = 503

// API
module.exports = { authenticate, handleErrors }

/**
 * Middleware to check if a session id is present in the cookie, and if the
 * user credentials belonging to that session verify against Twitter. If so,
 * the user is authenticated and the handler will be called. If not, any
 * existing session data will be destroyed and a login page is rendered.
 *
 * @param  {Function} handler
 * @return {Function}
 */
function authenticate(handler) {
	if (typeof handler !== 'function') {
		throw Error('Authentication middleware expects a function')
	}
	return async (req, res) => {
		const sessionId = req.cookies.session_id
		try {
			if (sessionId) {
				// Both `verifyCredentials` and destructuring `getUserSession`
				// will throw if they fail, which is why the catch handler kicks
				// in if either the session is missing from Redis, or Twitter
				// says the credentials are wrong
				const { oauth_token, oauth_token_secret } = await getUserSession(sessionId)
				await verifyCredentials(oauth_token, oauth_token_secret)
				return handler(req, res)
			}
		} catch(error) {
			log(error)
			if (sessionId) {
				await deleteUserSession(sessionId)
				// Deleting cookie is best done by setting it to an 'incorrect'
				// value and letting it expire in the past
				// https://stackoverflow.com/a/53573622
				res.setHeader('Set-Cookie', 'session_id=destroyed; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
			}
		}
		sendLoginPage(req, res)
	}
}

/**
 * Responds with a login page. Also sets a 401 status (Unauthorized) and sends
 * a WWW-Authenticate header according to spec
 *
 * @param {HTTP Request object} req
 * @param {HTTP Response object} res
 */
function sendLoginPage(req, res) {
	res.status(NOT_AUTHORIZED)
	res.setHeader('WWW-Authenticate', `OAuth realm="${ getUrl(req) }"`)
	res.send(page('Not logged in', '<a href="/api/auth" class="button">Log in with Twitter</a>'))
}

/**
 * Middleware that handles various types of errors, especially the ones that
 * Twitter returns. It returns a request-response handler that sets headers and
 * status codes, and renders an error page.
 *
 * @todo handle Dropbox errors
 * (error.status, error.error.error_summary)
 *
 * @param  {Function} handler
 * @return {Function}
 */
function handleErrors(handler) {
	if (typeof handler !== 'function') {
		throw Error('Error handling middleware expects a function')
	}
	return async (req, res) => {
		try {
			await handler(req, res)
		} catch(error) {
			log(error)
			const rateLimit = error._headers ? rateLimitInfo(error._headers) : false
			const message = getErrorMessage(error, rateLimit)
			const statusCode = getStatusCode(error)

			if (statusCode === TOO_MANY_REQUESTS) {
				res.setHeader('Retry-After', rateLimit.secondsToReset)
			}

			res.status(statusCode)
			res.send(errorPage(message))
		}
	}
}

/**
 * Tries to make a sensible error message using the passed error. If a rateLimit
 * object is passed, the ratelimit info will be appended at the end of the
 * error messages, mostly for development convenience
 *
 * @param  {Object} error
 * @param  {Object} rateLimit
 * @return {String}
 */
function getErrorMessage(error, rateLimit) {
	let errorMessage
	if (error.errors) {
		errorMessage = error.errors.map(_err => `${_err.message} (${_err.code})`).join('; ')
	} else if (error.message) {
		errorMessage = error.message
	} else {
		errorMessage = error
	}
	if (typeof rateLimit === 'object') {
		if (getStatusCode(error) === TOO_MANY_REQUESTS) {
			errorMessage += `; Reset in ${rateLimit.minutesToReset} minutes`
		} else {
			errorMessage += `; ${rateLimit.remaining} / ${rateLimit.limit} requests remaining`
		}
	}
	return errorMessage
}

/**
 * Gets a HTTP Status code from the error object. Note that the Twitter `code`
 * is not an HTTP status code, but an internal error code. The most commen ones
 * are mapped to HTTP codes
 * See also https://developer.twitter.com/en/support/twitter-api/error-troubleshooting#error-codes
 *
 * @todo Try to find a way to keep the Twitter error code: the `twitter-lite`
 * package swallows the status code, even if they state in the docs that it’s
 * passed in the `_headers` object:
 * https://github.com/draftbit/twitter-lite#getendpoint-parameters
 *
 * @param  {Object} error
 * @return {Number}
 */
function getStatusCode(error) {
	const errorCodeToStatusCodeMap = {
		32: NOT_AUTHORIZED,
		34: NOT_FOUND,
		63: FORBIDDEN,
		64: FORBIDDEN,
		87: FORBIDDEN,
		88: TOO_MANY_REQUESTS,
		89: FORBIDDEN,
		99: FORBIDDEN,
		130: SERVICE_UNAVAILABLE,
		135: NOT_AUTHORIZED,
		215: BAD_REQUEST,
		251: GONE,
		325: BAD_REQUEST,
		415: FORBIDDEN,
		416: NOT_AUTHORIZED,
		417: NOT_AUTHORIZED,
	}
	if (error.errors) {
		return errorCodeToStatusCodeMap[error.errors[0].code] || INTERNAL_SERVER_ERROR
	} else if (error.statusCode) {
		return error.statusCode
	}
	return INTERNAL_SERVER_ERROR
}
