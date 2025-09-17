
const SHA256 = require('crypto-js/sha256')
const readline = require('readline')
const fs = require('async-file')

const isWin = process.platform === 'win32'

const utils = {
	domain: str => {
		const urlParts = str.split('.')
		return urlParts
		  .slice(0)
		  .slice(-(urlParts.length === 4 ? 3 : 2))
		  .join('.')
	},
	base64: str => {
		return Buffer.from(str, 'base64').toString('binary')
	},
	isString: str => {
		return !!(typeof str === 'string' || str instanceof String)
	},
	promiseFromChildProcess: (child, piped) => {
		return new Promise((resolve, reject) => {
			child.addListener('error', reject)
			child.addListener('exit', resolve)
		})
	},
	readline: () => {
		const rl = readline.createInterface({
		    input: process.stdin,
		    output: process.stdout
		})

		return {
			question: (msg) => {
				return new Promise((resolve, reject) => {
					rl.question(msg, resolve)
				})
			},
			close: () => {
				return new Promise((resolve, reject) => {
					rl.on('close', () => {
						resolve()
					})
					rl.close()
				})
			}
		}
	},
	hash: str => {
		return SHA256(str.toLowerCase()+'\n').toString().substr(0, 12)
	},
	projectDomain: opts => {
		return utils.hash(opts.githubUsername) + '-' + opts.projectName.toLowerCase() + '.' + utils.domain(opts.host)
	},
	sanitizeOpts: opts => {
		if (opts.githubUsername){
			let regex = /[^a-zA-Z0-9-]/;
			opts.githubUsername = opts.githubUsername.toLowerCase()
			if (regex.test(opts.githubUsername)) {
				throw new Error('Error: GitHub username must be alphanumeric, with the exception of hyphen.\nRun "beamup config <server> <github-username>" to reconfigure.');
			}
		}
		if (opts.projectName){
			let regex = /[^a-z0-9-]/;
			opts.projectName = opts.projectName.toLowerCase()
			if (regex.test(opts.projectName)) {
				throw new Error('Error: Project name must be lowercase alphanumeric, with the exception of hyphen.\nRun "beamup init <project-name>" to reconfigure.');
			}
		}
		if (opts.host){
			let regex = /[^a-zA-Z0-9\.-]/;
			if (regex.test(opts.host)) {
				throw new Error('Error: Host must be alphanumeric, with the exception of hyphen.');
			}
		}
		return opts
	}
}

module.exports = utils
