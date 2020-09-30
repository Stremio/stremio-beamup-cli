
const utils = require('./utils')
const git = require('./git')
const spawn = require('child_process').spawn

async function deploy(opts) {
	if (opts.askDeploy) {
		const readline = utils.readline()

		const val = await readline.question('Do you want to deploy "' + opts.projectName + '"? (y/n): ')

		if (['n','no'].includes(val.toLowerCase())) {
			console.log('Deployment aborted.')
			process.exit(0)
		}

		await readline.close()
	}

	console.log('Deploying to ' + utils.projectDomain(opts))

	return git(['push', 'beamup', 'master', '--force'])

}

module.exports = deploy
