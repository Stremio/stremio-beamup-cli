#!/usr/bin/env node

'use strict'

const utils = require('../lib/utils')
const config = require('../lib/config')
const deploy = require('../lib/deploy')
const ssh = require('../lib/ssh')
const git = require('../lib/git')
const lastCommit = require('../lib/lastCommit')

const commands = {
	config: async (options) => {
		const args = options.args || []
		const globalOpts = await config.global({ host: args[0], githubUsername: args[1] })
		await ssh.syncGithubKeys(globalOpts)
		process.exit(0)
	},
	init: async (options) => {
		const args = options.args || []
		const opts = await config.global()
		opts.projectName = args[0]
		await config.project(opts)
		process.exit(0)
	},
	deploy: async () => {
		const globalOpts = await config.global()
		const projectOpts = await config.project(globalOpts)
		const opts = Object.assign({}, globalOpts, projectOpts)
		if (projectOpts.lastCommit) {
			const commitHash = await lastCommit()
			if (commitHash && utils.isString(commitHash)) {
				if (projectOpts.lastCommit == commitHash) {
					// last commit hash did not change
					// ask if we should auto-commit changes
					const readline = utils.readline()

					const val = await readline.question('The commit history did not change since the last deployment, would you like to create a new commit for your project? (y/n): ')

					await readline.close()

					if (['y','yes'].includes(val.toLowerCase())) {
						console.log('Creating a new commit with the title "Auto-commit"')

						await git(['add', '--all'])
						await git(['commit', '-m', 'Auto-commit'])
					} else {
						console.log('Warning: You have chosen to deploy a project where the commit history did not change, deploying the project may fail in this case.')
					}

				}
			}
		}
		try {
			await deploy(opts)
			console.log('Project URL: ' + utils.projectDomain(opts))
		} catch(e) {
			console.log('An error occured while deploying the project.')
		}
		await config.saveLastCommit(opts)
		process.exit(0)
	},
	secrets: async (options) => {
		const args = options.args || []
		const globalOpts = await config.global()
		const projectOpts = await config.project(globalOpts)
		const opts = Object.assign({}, globalOpts, projectOpts)
		try {
			await ssh.addSecret(opts, {
				name: args[0],
				value: args[1],
			})
			console.log('Added secret "'+args[0]+'" to project')
		} catch(e) {
			console.log('An error occured while adding the secret to the project.')
		}
		process.exit(0)
	},
	logs: async () => {
		const globalOpts = await config.global()
		const projectOpts = await config.project(globalOpts)
		const opts = Object.assign({}, globalOpts, projectOpts)
		await ssh.showLogs(opts)
		process.exit(0)
	},
	default: async (options) => {
		if (!(options.args || []).length)
			commands.deploy()
		else
			program.outputHelp(() => { process.exit(1) })
	},
	delete: async () => {
		const globalOpts = await config.global()
		const projectOpts = await config.project(globalOpts)
		const opts = Object.assign({}, globalOpts, projectOpts)

		// ask if for confirmation
		const readline = utils.readline()
		const val = await readline.question('You are about to delete this project. This action cannot be undone. Do you want to continue? (y/n): ')

		await readline.close()

		if (['y', 'yes'].includes(val.toLowerCase())) {
			await ssh.deleteAddon(opts)
		} else {
			console.log('Project deletion canceled by user.')
		}

		process.exit(0)
	}
}

const { program } = require('commander')

program.name('beamup').version(require('../package.json').version)

program
  .command('config')
  .option('<server> <github-username>')
  .description('configure a new installation (asks for values if not given)')
  .action(commands.config)

program
  .command('init')
  .option('<project-name>')
  .description('configure a new project (asks for values if not given)')
  .action(commands.init)

program
  .command('deploy')
  .description('deploys the project, the same can be achieved with "git push beamup master"')
  .action(commands.deploy)

program
  .command('secrets')
  .option('<secret-name> <secret-value>')
  .description('adds secrets to the project as environment variables')
  .action(commands.secrets)

program
  .command('logs')
  .description('view projects logs')
  .action(commands.logs)

program
  .command('delete')
  .description('deletes the current project')
  .action(commands.delete)

program
  .description('Using "beamup" with no extra arguments, can be used to: configure a new installation, configure a new project, deploy')
  .action(commands.default)

program.parse(process.argv)
