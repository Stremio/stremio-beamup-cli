
const SHA256 = require('crypto-js/sha256')
const readline = require('readline')
const fs = require('async-file')

//const domain = process.env['BEAMUP_DOMAIN'] || 'baby-beamup.club'

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
}

module.exports = utils
