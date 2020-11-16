const chokidar = require('chokidar');
const path = require('path')
const debounce = require('lodash.debounce')

const cwd = process.cwd()
const packageJson = require(path.join(cwd, 'package.json'))

const { spawn } = require('child_process')

function genWatchFiles (mode) {
  const files = packageJson.cliServiceWatchFiles || [
    '.env',
    '.env.local',
    'vue.config.js',
    ...(mode ? [`.env.${mode}`, `.env.${mode}.local`] : [])
  ]
  console.log('watching....')
  console.log(files)
  return files
}

let p
function spawnServeFn(done) {
  if (p) {
    p.kill()
    if (p.killed) {
      console.log(`process [${p.pid}] is killed`)
    }
  }

  p = spawn(
    'node',
    [path.join(cwd, 'node_modules/@vue/cli-service/bin/vue-cli-service.js'), 'serve'],
    { stdio: 'inherit' }
  )
  if (done) {
    console.log(`process [${p.pid}] is start`)
    done()
  }
}

let watcher = null
function startWatch (watchFiles) {
  const watchCallback = debounce((event, path) => {
    console.log(event, path)
    spawnServeFn()
  }, 300)
  
  spawnServeFn()
  
  watcher = chokidar
    .watch(watchFiles, {
      cwd,
      ignoreInitial: true
    })
    .on('all', watchCallback)
}

function enhance (arg) {
  const currMode = arg.mode || 'development'
  console.log('当前模式', currMode)
  process.env.VUE_APP_CLI_SERVICE_MODE = currMode
  startWatch(genWatchFiles(currMode))
}

module.exports = (api, _options) => {
  api.registerCommand('serve-enhanced', enhance)
  const { build } = api.service.commands

  const buildFn = build.fn

  build.fn = function enhancedBuild (...args) {
    process.env.VUE_APP_CLI_SERVICE_MODE = args[0].mode || 'production'
    buildFn(...args)
  }
}
