#!/usr/bin/env node

'use strict'

const utils = require('../lib/utils')
const config = require('../lib/config')
const deploy = require('../lib/deploy')
const ssh = require('../lib/ssh')

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
		await deploy(opts)
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
	default: async (options) => {
		if (!(options.args || []).length) {
			const globalOpts = await config.global()
			const projectOpts = await config.project(globalOpts)
			const opts = Object.assign({}, globalOpts, projectOpts)
			console.log('Deployed to ' + utils.projectDomain(opts))
			try {
				await deploy(opts)
				console.log('Deployed to ' + utils.projectDomain(opts))
			} catch(e) {
				console.log('An error occured while deploying the project.')
			}
			process.exit(0)
		} else
			program.outputHelp(() => { process.exit(1) })
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
  .action(commands.deploy)

program
  .description('Using "beamup" with no extra arguments, can be used to: configure a new installation, configure a new project, deploy')
  .action(commands.default)

program.parse(process.argv)
