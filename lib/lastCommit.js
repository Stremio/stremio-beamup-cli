const spawn = require('child_process').spawn

module.exports = () => {

	return new Promise((resolve, reject) => {

		const child = spawn('git', ['rev-parse', '--short', 'HEAD'], {
			cwd: process.cwd(),
			env: Object.create(process.env),
		})

		let resp = ''

		child.stdout.on('data', data => { resp += data })

		child.on('close', code => {
			resp = resp.trim()
			if (resp)
				resolve(resp)
			else
				reject(Error('Could not get last commit from git history'))
		})

	})

}
