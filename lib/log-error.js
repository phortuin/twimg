module.exports = error => {
	if (process.env.NODE_ENV === 'development') {
		console.error(error)
	}
}

