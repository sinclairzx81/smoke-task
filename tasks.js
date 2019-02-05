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
//  tasks:
//------------------------------------------------------

async function clean() {
  await shell('shx rm -rf ./output/pack')
  await shell('shx rm -rf ./output')
  await shell('shx rm -rf ./spec/index.js')
  await shell('shx rm -rf ./node_modules')
}

async function pack() {
  await shell('shx rm -rf ./output/pack')
  await shell('tsc-bundle ./src/tsconfig.json --outFile ./output/pack/index.js')
  await shell('shx cp ./src/smoke-task ./output/pack')
  await shell('shx cp ./package.json   ./output/pack')
  await shell('shx cp ./readme.md      ./output/pack')
  await shell('shx cp ./license        ./output/pack')
  await shell('cd ./output/pack && npm pack')
  await shell('shx rm ./output/pack/index.js')
  await shell('shx rm ./output/pack/smoke-task')
  await shell('shx rm ./output/pack/package.json')
  await shell('shx rm ./output/pack/readme.md')
  await shell('shx rm ./output/pack/license')
}

async function install_cli() {
  await pack()
  await shell('cd ./output/pack && npm install ./* -g')
}

//------------------------------------------------------
//  cli:
//------------------------------------------------------

cli(process.argv, {
  clean,
  pack,
  install_cli,
}).catch(console.log)
