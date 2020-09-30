
const utils = require('./utils')
const ssh = require('./ssh')
const git = require('./git')
const path = require('path')
const spawn = require('child_process').spawn
const fs = require('async-file')

const defaultProjectName = path.basename(process.cwd())

const beamupGlobalFile = path.join(process.env.HOME || process.env.APPDATA || path.join(__dirname, '..'), 'beamup-config.json')
const beamupProjectFile = path.join(process.cwd(), 'beamup.json')

const config = {}

async function global(opts) {

	opts = opts || {}

	let usingSaved = false

	if (!opts.host && !opts.githubUsername) {
		let saved
		try { saved = await loadSaved(opts) } catch(e) {}
		if (saved) {
			opts = saved
			usingSaved = true
		}
	}

	if (!opts.host)
		opts.host = await requestValue({
			description: 'Beamup Host',
			wrongRegex: /[^a-zA-Z0-9\.-]/,
			error: 'Error: Beam Up server address must be alphanumeric, with the exception of hyphen and dot.',
		})

	if (!opts.githubUsername)
		opts.githubUsername = await requestValue({
			description: 'GitHub Username',
			wrongRegex: /[^a-zA-Z0-9\.-]/,
			error: 'Error: GitHub username must be alphanumeric, with the exception of hyphen and dot.',
		})

	if (!usingSaved) {
		opts.askDeploy = true
		await fs.writeFile(beamupGlobalFile, JSON.stringify({ host: opts.host, githubUsername: opts.githubUsername }, null, 4))
		console.log('Configuration saved at "' + beamupGlobalFile + '"')
	}

	return Promise.resolve(opts)
}

async function project(opts) {

	opts = opts || {}

	let usingSaved = false

	if (!opts.projectName) {
		let saved
		try { saved = await loadSaved(opts) } catch(e) {}
		if (saved) {
			opts = saved
			usingSaved = true
		}
	}

	if (!opts.projectName)
		opts.projectName = await requestValue({
			default: defaultProjectName,
			description: 'Project Name',
			wrongRegex: /[^a-zA-Z0-9-]/,
			error: 'Error: Project name must be alphanumeric, with the exception of hyphen.',
		})

	if (!usingSaved) {
		opts.askDeploy = true
		await fs.writeFile(beamupProjectFile, JSON.stringify({ projectName: opts.projectName }, null, 4))
		console.log('Project configuration saved at "' + beamupProjectFile + '"')
		let isGitRepo = false
		try {
			await fs.lstat(path.join(process.cwd(), '.git'))
			isGitRepo = true
		} catch(e) {}
		if (!isGitRepo) {

			const readline = utils.readline()

			const val = await readline.question('The current folder is not a git repository, would you like to make it a git repository? (y/n): ')

			if (['n','no'].includes(val.toLowerCase())) {
				console.log('Deployment aborted, you can only deploy git repositories to Beam Up.')
				process.exit(0)
			}

			await readline.close()

			await git(['init'])
			await git(['add', '--all'])
			await git(['commit', '-m', 'First Commit'])

		}
		await ssh.addRemote(opts)
	}

	return Promise.resolve(opts)
}

function loadSaved(opts) {
	async function loadFromFile(file) {
		let savedExists = false
		try {
			await fs.lstat(file)
			savedExists = true
		} catch(e) {}
		if (savedExists) {
			try {
				let savedData = await fs.readFile(file)
				savedData = Buffer.isBuffer(savedData) ? savedData.toString() : savedData
				return Promise.resolve(JSON.parse(savedData))
			} catch(e) {
				return Promise.reject(e)
			}
		}
	}

	if (!opts.host && !opts.githubUsername) {
		return loadFromFile(beamupGlobalFile)
	}

	if (!opts.projectName)
		return loadFromFile(beamupProjectFile)
}

async function requestValue(opts) {
	const val = await question(opts)

	if (opts.wrongRegex.test(val)) {
		console.log('Error: ' + (opts.error || opts.description + ' set wrongly.'))
		process.exit(1)
	}

	return val
}

async function question(opts) {

	const readline = utils.readline()

	let val = await readline.question(opts.description + (opts.default ? ' (default: ' + opts.default + ')' : '') + ': ')

	await readline.close()

	if (!val && opts.default)
		val = opts.default

	if (!val) {
		console.log('Error: ' + opts.description + ' value cannot be empty.')
		return question(opts)
	}
	if (opts.wrongRegex && opts.wrongRegex.test(val)) {
		console.log('Error: ' + (opts.error || opts.description + ' set wrongly.'))
		return question(opts)
	}

	return val

}

module.exports = {
	global,
	project,
}
