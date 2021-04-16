const test = require('tape')

const { errorPage, page } = require('../lib/page')

const TITLE = 'All your base'
const BODY = 'Are belong to us'
const BODY_HTML = '<h2>Are belong to us</h2>'
const BODY_HTML_RE = '<h2>Are belong to us<\/h2>'
const BODY_XSS = `<script>alert("Are belong to us")</script>`
const BODY_XSS_RE = `<script>alert\\("Are belong to us"\\)<\\/script>`
const BODY_FN = () => 'Are belong to us'

/**
 * Tests if title and body are properly interpolated in page template.
 *
 * Note: `s` flag in regex means 'single line', ie. dot matches newline
 * character, which is needed because of newlines in HTML template.
 */
test('Page template contains title and body as string', t => {
	t.match(
		page(TITLE, BODY),
		new RegExp(`${TITLE}.+?${BODY}`, 'gs'),
		'Title and body input should match exact'
	)
	t.end()
})

test('Page template contains title and body as HTML', t => {
	t.match(
		page(TITLE, BODY_HTML),
		new RegExp(`${TITLE}.+?${BODY_HTML_RE}`, 'gs'),
		'Title and body input should match exact'
	)
	t.end()
})

test('Page template allows <script> tags', t => {
	t.match(
		page(TITLE, BODY_XSS),
		new RegExp(`${TITLE}.+?${BODY_XSS_RE}`, 'gs'),
		'Script tags are allowed'
	)
	t.end()
})

test('Page template does title and body as function returning a string', t => {
	t.match(
		page(TITLE, BODY_FN),
		new RegExp(`${TITLE}.+?${BODY}`, 'gs'),
		'Function expressions should be evaluated'
	)
	t.end()
})

test('Page template does title and body as expression', t => {
	t.match(
		page(TITLE, 13 + 37),
		new RegExp(`${TITLE}.+?50`, 'gs'),
		'Expressions should be evaluated'
	)
	t.end()
})

/**
 * Test if error template shows default formatting and copy, interpolated
 * with a custom errory message
 */
test('Error template shows error message', t => {
	t.match(
		errorPage(BODY),
		new RegExp(`Website broken.+?<pre class="error">${BODY}<\/pre>`, 'gs'),
		'Error page should match default formatting and copy'
	)
	t.end()
})
