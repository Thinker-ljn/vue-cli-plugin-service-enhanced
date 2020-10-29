const chokidar = require('chokidar');
const path = require('path')
const debounce = require('lodash.debounce')

const cwd = process.cwd()
const packageJson = require(path.join(cwd, 'package.json'))

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

let watcher = null
let currServer = null
function startWatch (serveFn, mode) {
  const watchCallback = debounce((event, path) => {
    console.log(event, path)
    serveFn()
  }, 300)
  
  serveFn()
    .then(() => {
      watcher = chokidar
        .watch(genWatchFiles(mode), {
          cwd,
          ignoreInitial: true
        })
        .on('all', watchCallback)
    })
}

function enhance (serveFn) {
  return function enhanced (...args) {
    const currMode = args[0].mode || 'development'
    console.log('当前模式', currMode)
    process.env.VUE_APP_CLI_SERVICE_MODE = currMode
    const start = () => {
      return serveFn(...args)
        .then(({ server }) => {
          currServer = server
        })
    }
    startWatch(() => {
      if (currServer) {
        currServer.close(start)
      } else {
        return start()
      }
    }, currMode)
  }
}

module.exports = (api, _options) => {
  const { serve, build } = api.service.commands

  const serveFn = serve.fn
  const buildFn = build.fn

  serve.fn = enhance(serveFn)
  build.fn = function enhancedBuild (...args) {
    process.env.VUE_APP_CLI_SERVICE_MODE = args[0].mode || 'production'
    buildFn(...args)
  }
}
