const utils = require('./utils')

const spawn = require('child_process').spawn

module.exports = (args) => {

	const child = spawn('git', args, {
		cwd: process.cwd(),
		env: Object.create(process.env),
		stdio: [process.stdin, process.stdout, process.stderr]
	})

	return utils.promiseFromChildProcess(child)

}