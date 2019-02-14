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

const package = require(`${process.cwd()}/package.json`)

//------------------------------------------------------
//  tasks:
//------------------------------------------------------

async function clean() {
  await shell('shx rm -rf ./public')
  await shell('shx rm -rf ./node_modules')
}

async function pack() {
  await shell('shx rm -rf ./public/pack')
  await shell('tsc-bundle ./src/tsconfig.json --outFile ./public/pack/index.js')
  await shell('shx cp ./src/start.js   ./public/pack')
  await shell('shx cp ./package.json   ./public/pack')
  await shell('shx cp ./readme.md      ./public/pack')
  await shell('shx cp ./license        ./public/pack')
  await shell('cd ./public/pack && npm pack')
}

async function install_cli() {
  await pack()
  await shell(`npm install public/pack/${package.name}-${package.version}.tgz -g`)
}

async function watch() {
  await shell(`smoke-run ./src/{**,.}/** -- npm run install-cli`)
}
//------------------------------------------------------
//  cli:
//------------------------------------------------------

cli(process.argv, {
  clean,
  pack,
  install_cli,
  watch
}).catch(console.log)
