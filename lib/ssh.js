const { NodeSSH } = require('node-ssh')

const utils = require('./utils')
const git = require('./git')

const os = require('os')
const path = require('path')
const fs = require('async-file')
const spawn = require('child_process').spawn


async function syncGithubKeys(opts) {

	// This priv key is intended to be public; we base64 encode it only so that it doesn't get automatically detected
	// by whitehat bots that send warnings

	const key = utils.base64('LS0tLS1CRUdJTiBPUEVOU1NIIFBSSVZBVEUgS0VZLS0tLS0KYjNCbGJuTnphQzFyWlhrdGRqRUFBQUFBQkc1dmJtVUFBQUFFYm05dVpRQUFBQUFBQUFBQkFBQUJGd0FBQUFkemMyZ3RjbgpOaEFBQUFBd0VBQVFBQUFRRUF0eC85MVZGYzNCb0xCS2pIU1V0RmNnOHRDcE1NK2M4c2VjOFNtRTVaRWxsd3lNY2VaY3JWCklOQzV4OUl6K1RJU05LZnJldFhGQjlIKzNWRTI3RnFRbFd3SXM5U0VsMkd6QSs3L2dRaE1DcktRWTNiWTBXZkJ4eUZlNFQKQW9VcXJadTQ2M25KWnBZZ0lGRDJtbHphZTViNTljTUNveWpsZVpMczA3NURuNmkranlrWmxwUFFISXp0NkdsdUdvd0VEagpwMklqYkt2SXRDaVoxV0pOUjJZWm9NbDdpL2RaMlFpMlhEU0xmRWQ3VGxwTnBnYms1SmJ5REtoUm53WCtycEFwN1JCbE5wCldXelJHVjFEVVVpRlJ6WjFXeXNvU3VId3l0c3l4S0J5NE54VzV0SzV4U3didCt2cEdRcGx2K01xVWVPbE5NVGcvRXJIY2MKd1BKYzdydlJHd0FBQTlpYU05N2xtalBlNVFBQUFBZHpjMmd0Y25OaEFBQUJBUUMzSC8zVlVWemNHZ3NFcU1kSlMwVnlEeQowS2t3ejV6eXg1enhLWVRsa1NXWERJeHg1bHl0VWcwTG5IMGpQNU1oSTBwK3Q2MWNVSDBmN2RVVGJzV3BDVmJBaXoxSVNYClliTUQ3ditCQ0V3S3NwQmpkdGpSWjhISElWN2hNQ2hTcXRtN2pyZWNsbWxpQWdVUGFhWE5wN2x2bjF3d0tqS09WNWt1elQKdmtPZnFMNlBLUm1XazlBY2pPM29hVzRhakFRT09uWWlOc3E4aTBLSm5WWWsxSFpobWd5WHVMOTFuWkNMWmNOSXQ4UjN0TwpXazJtQnVUa2x2SU1xRkdmQmY2dWtDbnRFR1UybFpiTkVaWFVOUlNJVkhOblZiS3loSzRmREsyekxFb0hMZzNGYm0wcm5GCkxCdTM2K2taQ21XLzR5cFI0NlUweE9EOFNzZHh6QThsenV1OUViQUFBQUF3RUFBUUFBQVFCbnA0d2VldmQ4L3FETitsc1QKZWEvTmFCbXVxcDNscVFjYnk4SlN3OFpYUkprNmpMc0FFMWVnUTRWbFBlNTlWNEpHbStZR21ZbjFhMEJBTmdCSXVOcXVPWQpDVGllK2pZSUhiOENSZi9UcE5zOVZXOTZheW9YQm1MdFZ0MGJ5QlRvUUFUa0JRT2pOY2JwZytxU1pZeWwrRWQwZlBXNU5TClR2TStNcDE4Q2ZWdnkyNEsxRnhHZmNXaFlsZm03NnNCRk9ha2ZqaVk2SGV2WGdSVisrUUFGQU5Sc1lHS2FQWXVUU1pMeEgKTlpPYWxlNUNhNmF4dzA1TCtjdmZFRzU2VWZvYTUrWHo1b0I2aHJJWXk3UnpUcmw3R2ZweCtvdWsxdDZ1eE1Na0tHZzdZdAo3eitLb2UrSm4xZnNHZHpiVHlUVGZ3Z01adGlha1VzYkNwRWJLQlRQa25TQkFBQUFnRnc3eW9tU0ttS2FJK09uWFVBVzJzClkxbjVXc3J6UWNWNnVLSlJzNHpnYnVua1lSV0ZPQnlWNTZDN29xU01FeXdvTGRwSENoek9UVlE0aStCcDI2Lys5WmdNMjIKMGRkUkhxSkZDYnoxa3RKWTVScm1qeUVYdzFvZXdNN0ZINEhDMWRLdkxKMUd4Ry92eTVKaFNhL0VVUWtTa3lkQ1NtVGUxaQptRlYxNUpEVURkQUFBQWdRRG9PTE9RaFlacytoYVdUOW1ibmhBNk0xY3ZxaTIycm00NjRIRS9wTUF0WkYxTmd6aS9NMmlVClIvUnE3SWVvZWE2WklxQzY2dE1WZ1FFUnozQUhPT01nRzB3UFFwZHBWTUF5OFpTQlcyUnRSSjVMM1BxSUROczhOc1ZvUGUKaTI3YzdlTWNmOGxiUjlRNzNhUkN1U1A3MFJLbEhZYmtCemFibkwvWWFIOEp6a2FRQUFBSUVBeWVCT2h2MHlFYkZJU2Q4VAoyam44UlhZM3NOcUFLZ24rc1dqOHpJU0JJWGp6MittbEppbTNMYXFlVVgzd0RycE1ZSTAybzZkL2w5czVueEVPMkRlRkZLClBMVUcveXpUa1hUdXY4UmpJMHFyY3FkY3ZyZmtySGJhN0MrbGsxNTEyaGtEdVNkVmNLemZKbFBBRzJoVy9RMXRNUVJPSGwKQjcreEI5bGl4ekZxQ09NQUFBQWVZMjl1ZEhKdmJFQnpkSEpsYldsdkxXRmtaRzl1TFdSbGNHeHZlV1Z5QVFJREJBVT0KLS0tLS1FTkQgT1BFTlNTSCBQUklWQVRFIEtFWS0tLS0t')

	const ssh = new NodeSSH()

	await ssh.connect({
		host: opts.host,
		username: 'dokku',
		privateKey: key
	})

	await ssh.exec('sync-github-keys', [ opts.githubUsername ])

	await ssh.dispose()

}

async function addRemote(opts) {

	const githubUsernameHashed = utils.hash(opts.githubUsername)
	await git(['remote', 'add', 'beamup', 'dokku@' + opts.host + ':' + githubUsernameHashed + '/' + opts.projectName])

	await syncGithubKeys(opts)

}

async function addSecret(opts, secret) {
	// ssh dokku@deployer.beamup.dev config:set 768c7b2546f2/hello NODE_ENV=production

	// using the `ssh` command instead of the SSH module
	// because we'd need to know the priv key / passphrase
	// of the user to use the SSH module here

	const githubUsernameHashed = utils.hash(opts.githubUsername)

	const child = spawn('ssh', ['dokku@' + opts.host, 'config:set', githubUsernameHashed + '/' + opts.projectName, secret.name+'='+secret.value], {
		cwd: process.cwd(),
		env: Object.create(process.env),
		stdio: [process.stdin, process.stdout, process.stderr]
	})

	return utils.promiseFromChildProcess(child)

}

async function showLogs(opts) {
	// ssh dokku@deployer.beamup.dev logs 768c7b2546f2-hello

	// using the `ssh` command instead of the SSH module
	// because we'd need to know the priv key / passphrase
	// of the user to use the SSH module here

	const githubUsernameHashed = utils.hash(opts.githubUsername)

	const child = spawn('ssh', ['dokku@' + opts.host, 'logs', githubUsernameHashed + '-' + opts.projectName], {
		cwd: process.cwd(),
		env: Object.create(process.env),
		stdio: [process.stdin, process.stdout, process.stderr]
	})

	return utils.promiseFromChildProcess(child)

}

async function deleteAddon(opts) {
	// ssh dokku@deployer.beamup.dev delete-addon 768c7b2546f2-hello

	// using the `ssh` command instead of the SSH module
	// because we'd need to know the priv key / passphrase
	// of the user to use the SSH module here

	const githubUsernameHashed = utils.hash(opts.githubUsername)

	const child = spawn('ssh', ['dokku@' + opts.host, 'delete-addon', githubUsernameHashed + '-' + opts.projectName], {
		cwd: process.cwd(),
		env: Object.create(process.env),
		stdio: [process.stdin, process.stdout, process.stderr]
	})

	return utils.promiseFromChildProcess(child)

}

module.exports = {
	syncGithubKeys,
	addRemote,
	addSecret,
	showLogs,
	deleteAddon
}
