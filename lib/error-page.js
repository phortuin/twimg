module.exports = message => {
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
		div {
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
			color: red;
			background: #f7f7f7;
			white-space: normal;
			font-size: 0.9375em;
		}
		a {
			color: black;
		}
	</style>
</head>
<body>
	<div>
		<h1>Website broken</h1>
		<pre class="error">${message}</pre>
		<p>Sorry about that ¯\\_(ツ)_/¯</p>
		<p><a href="/">&larr; Go back</a></p>
	</div>
</body>
</html>`
}
