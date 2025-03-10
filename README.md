# Beamup CLI

CLI for deploying to Beamup servers.

## Prerequisites

In order to deploy you will need:
- [Node.js](https://nodejs.org/en/download/) installed on your system
- a valid [Beamup](https://github.com/Stremio/stremio-beamup) host
- a GitHub account
- your SSH key added to your GitHub account

## Install

- `npm install beamup-cli -g`

## Usage

### Deploying

- go to the project directory that you want to deploy
- use the `beamup` command

(for more specific commands, use `beamup --help`)

The `beamup` command is a universal command, it will handle both initial setup and the deploying of projects.

### Deleting

You can completely delete your project using `delete` command

```
beamup delete
```

### Secrets

You can add secrets to your project in the form of environment variables

```
beamup secrets <secret-name> <secret-value>
```

### Logs

You can view your project's logs by using:

```
beamup logs
```

#### Good to Know

- we have a [FAQ](https://github.com/Stremio/stremio-beamup-cli/wiki/FAQ) that might help with some quick answers
- you can use `git push beamup master` to update your projects as well
- your project must support using the `PORT` process environment variable (if available) as the http server port
- your project repo must suppport one of the Heroku buildpacks or must have a `Dockerfile`; with Nodejs, simply having a `package.json` in the repo should be sufficient
- if your project uses Python, it must include either `requirements.txt` or `Procfile`
- it's based on [Dokku](http://dokku.viewdocs.io/dokku/), so whatever you can deploy there you can also deploy on Beamup (it's using the same build system); however, some features are not supported such as custom NGINX config
- currently only projects using Dokku 'Herokuish' buildpack are supported; an ugly workaround to deploy a project built with Dokku 'Dockerfile' buildpack is to include 'docker' in the project name
- the Node.js dependency can be avoided by downloading a prebuilt version of `beamup-cli` from the [releases page](https://github.com/Stremio/stremio-beamup-cli/releases/)


**Built by the Stremio Team**

[![Stremio](https://www.stremio.com/website/stremio-purple-small.png)](https://stremio.com/)
