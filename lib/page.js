module.exports = { errorPage, page }

/**
 * Wrapper for template with a preformatted error message. The message is
 * understood to be a string, but could be HTML if needed
 *
 * @param  {String} message
 * @return {String}
 */
function errorPage(message) {
	return page(
		'Website broken',
		`<pre class="error">${message}</pre><p>Sorry about that ¯\\_(ツ)_/¯</p><p><a href="/">&larr; Go back</a></p>`
	)
}

/**
 * Return a string with title and body injected (no sanitization, this is a
 * regular template literal. All strings are considered to be HTML.
 *
 * @param  {String} title
 * @param  {String} body
 * @return {String}
 */
function page(title, body) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<title>T/W/I/M/G</title>
	<style>
		body {
			font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;
		}
		main {
			display: flex;
			margin-top: 2rem;
			padding: 1rem;
			flex-direction: column;
			align-items: center;
		}
		h1 {
			font-size: 1.25em;
			text-transform: uppercase;
			letter-spacing: 2px;
		}
		h1, p, pre {
			margin: 0 0 2rem;
		}
		pre {
			font-family: 'Menlo', monospace;
			padding: 0.5em;
			word-break: break-word;
			color: red;
			background: #f7f7f7;
			white-space: normal;
			font-size: 0.9375em;
		}
		a {
			color: black;
		}
		.button {
			text-decoration: none;
			padding: 0.5em 0.75em;
			background: #09f;
			border-radius: 0.25em;
			color: white;
		}
	</style>
</head>
<body>
	<main>
		<h1>${title}</h1>
		${body}
	</main>
</body>
</html>`
}
