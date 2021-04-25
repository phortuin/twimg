const { handleErrors } = require('../lib/middleware')
const twitter = require('../lib/twitter-instance')
const { createUserSession } = require('../lib/redis-instance') // @todo should come from session lib which implements redis
const { page } = require('../lib/page')

/**
 * Our end point for Twitter’s incoming oauth redirect. The oauth token and
 * verifier are passed as query parameters. If they are missing, a 400 error is
 * thrown. If they are present, permanent credentials are requested from Twitter
 * and stored in a session. The session ID is persisted with a session cookie to
 * the front-end. Finally, a page is rendered to let the user proceed to TWIMG’s
 * home page.
 *
 * Notes on cookies and CSRF:
 * - The cookie is secure, httponly and has samesite=strict settings. Even
 *   though this is just a ‘speedbump’ in CSRF attacks, since TWIMG only renders
 *   a user’s timeline and no potential harmful actions are implemented, no
 *   further CSRF attack mitigation is implemented.
 *   Sources:
 *   https://en.wikipedia.org/wiki/Cross-site_request_forgery#Prevention
 *   https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#samesite-cookie-attribute
 *
 * - We don’t sign the cookie. Signing exists to detect tampering with a cookie,
 *   but in our case the session id is only that: an id. It is random enough
 *   to not be guessable, and there is no data stored inside the id.
 *   Sources:
 *   https://security.stackexchange.com/questions/213208/why-sign-session-cookies
 *   https://github.com/expressjs/session/issues/68
 *   https://github.com/expressjs/session/issues/176
 *
 * - Because we use samesite=strict cookies, we cannot redirect the incoming
 *   request from Twitter: it would break the 'samesite' flow. Instead, we
 *   render a 'continue to TWIMG' page.
 *   Source:
 *   https://stackoverflow.com/questions/42216700/how-can-i-redirect-after-oauth2-with-samesite-strict-and-still-get-my-cookies
 */
module.exports = handleErrors(async (request, response) => {
	const { oauth_token, oauth_verifier } = request.query
	if (!oauth_token || !oauth_verifier) {
		const error = Error('Missing access token and/or verifier')
		error.statusCode = 400
		throw error
	}
	const credentials = await twitter.getAccessToken(oauth_token, oauth_verifier)
	const sessionId = await createUserSession(credentials)
	response.setHeader('Set-Cookie', `session_id=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/`)
	response.send(page('Logged in', `<a href="/">Proceed to T/W/I/M/G</a>`))
})
