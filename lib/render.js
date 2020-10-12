const readFile = require('fs').promises.readFile
const mustache = require('mustache')

module.exports = (name, data) => {
	const templatePath = `${__dirname}/../src/views/${name}.mustache`
	const is_dev = process.env.NODE_ENV === 'development'
	return readFile(templatePath, { encoding: 'utf8' })
		.then(template => mustache.render(template, { ...data, is_dev }))
}
