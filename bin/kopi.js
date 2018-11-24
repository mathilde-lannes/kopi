#!/usr/bin/env node

const kopiMaster = require('download-git-repo')
const commander = require('commander')
const ora = require('ora')
const chalk = require('chalk')
const path = require('path')
const figlet = require('figlet')
const cp = require('child_process')
const fs = require('fs')

commander
.version(require('./../package').version)
.usage('<project-name>')
.option('-c, --clone', 'use git clone')
.option('-b --boilerplate <boilerplate>', 'specify the template to use (default is vue-dashboard)')
.option('--vscode', 'open the freshly created app with VS Code ')
.parse(process.argv)

commander.on('--help', function() {
    console.log()
    console.log('  Example:')
    console.log()
    console.log(chalk.gray('    # create a new project with kopi'))
    console.log('    $ kopi <project-name> [--boilerplate <template-name>]')
    console.log()
})

function help() {
    commander.parse(process.argv)
    if (commander.args.length < 1) return commander.help()
}

help()

/**
 * Settings.
 */

var name = commander.args[0]
var to = path.resolve(name)
var clone = commander.clone || false
// TODO check if boilerplate name is valid
var boilerplate = commander.boilerplate || "vue-dashboard"

console.log(chalk.blue(figlet.textSync("kopi : " + boilerplate)))

function openVSCode() {
    if (process.platform !== 'win32') {
        console.log("Sorry, I only know how to open VS Code on Windows :(")
        return;
    }
    
    console.log('Opening VS Code...')
    cp.spawnSync( 'code.cmd', ['.'], {
        cwd: `./${name}`
    }); 
}

/**
 * Install NPM dependencies.
 */
function install() {
    const checkFileExists = s => new Promise(r => fs.access(s, fs.F_OK, e => r(!e)))
    checkFileExists(`./${name}/package.json`)
        .then(exists => {
            if (!exists) {
                commander.vscode && openVSCode()
                return
            };

            console.log("Installing NPM dependencies...")
            const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
            const installation = cp.spawnSync( npm, ['install'], {
                cwd: `./${name}`,
                stdio: "inherit"
            }); 

            const status = installation.status
            commander.vscode && openVSCode()
        })
}

/**
 * Install boilerplate.
 */
function run() {
    var spinner = ora('downloading project')
    spinner.start()
    kopiMaster("mathilde-lannes/" + boilerplate, to, { clone: clone }, function(err) {
        spinner.stop()
        if (!err) { 
            console.log(chalk.green(name + " has been successfully created.")) 
            install()
        } else {
            console.log(chalk.red('Failed to download repo : ' + err.message.trim()))
        }
    })
}

/**
 * Trigger the installer.
 */
run()