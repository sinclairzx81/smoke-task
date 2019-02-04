//------------------------------------------------------
// task helper scripts:
//------------------------------------------------------

const shell = (command) => new Promise((resolve, reject) => {
  const { spawn } = require('child_process')
  command = command.replace(/'/g, '\'').replace(/"/g, '\"')
  const windows = /^win/.test(process.platform)
  console.log(`\x1b[32m${command}\x1b[0m` )
  const ls      = spawn(windows ? 'cmd' : 'sh', [windows ? '/c' : '-c', command] )
  ls.stdout.pipe(process.stdout)
  ls.stderr.pipe(process.stderr)
  ls.on('close', (code) => resolve(code))
})
const cli = async (args, tasks) => {
  const task = (args.length === 3) ? args[2] : 'none'
  const func = (tasks[task]) ? tasks[task] : () => {
    console.log('tasks:')
    Object.keys(tasks).forEach(task => console.log(` - ${task}`))
  }; await func()
}

//------------------------------------------------------
//  constants:
//------------------------------------------------------

const BUILD_SRC  = 'tsc-bundle ./src/tsconfig.json'

//------------------------------------------------------
//  tasks:
//------------------------------------------------------

async function clean() {
  await shell('shx rm -rf ./bin')
  await shell('shx rm -rf ./pack')
  await shell('shx rm -rf ./spec/index.js')
  await shell('shx rm -rf ./node_modules')
}

async function spec() {
  await shell('npm install')
  await Promise.all([
    shell(`${BUILD_SRC} --outFile ./spec/index.js --watch`),
    shell(`cd spec && fsrun ./index.js [node ./index.js start "hello world" 1.123 true]`)
  ])
}

async function pack() {
  await shell('npm install')
  await shell(`${BUILD_SRC}`)
  await shell('shx mkdir -p ./pack')
  await shell('cp -p ./bin/index.js ./pack')
  await shell('cp -p ./package.json ./pack')
  await shell('cp -p ./readme.md ./pack')
  await shell('cp -p ./license ./pack')
  await shell('cp -p ./src/smoke-task ./pack')
}

async function install_cli() {
  await pack()
  await shell(`cd ./pack && npm install -g`)
}
//------------------------------------------------------
//  cli:
//------------------------------------------------------

cli(process.argv, {
  clean,
  spec,
  pack,
  install_cli,
}).catch(console.log)
