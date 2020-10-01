# Beam Up CLI

CLI for deploying to Beam Up servers.

## Prerequisites

In order to deploy you will need:
- [Node.js](https://nodejs.org/en/download/) installed on your system
- a valid [Beam Up](https://github.com/Stremio/stremio-beamup) host
- a GitHub account
- your SSH key added to your GitHub account

## Install

- `npm install beamup-cli -g`

## Usage

- go to the project directory that you want to deploy
- use the `beamup` command

(for more specific commands, use `beamup --help`)

### Good to Know

- you can use `git push beamup master` to deploy your projects as well
- your project repo must suppport one of the Heroku buildpacks or must have a `Dockerfile`; with Nodejs, simply having a `package.json` in the repo should be sufficient
- it's based on [Dokku](http://dokku.viewdocs.io/dokku/), so whatever you can deploy there you can also deploy on Beam Up (it's using the same build system); however, some features are not supported such as custom NGINX config
- currently only apps using Dokku 'Herokuish' buildpack are supported; an ugly workaround to deploy an project built with Dokku 'Dockerfile' buildpack is to include 'docker' in the project name


**Built by the Stremio Team**

[![Stremio](https://www.stremio.com/website/stremio-purple-small.png)](https://stremio.com/)
