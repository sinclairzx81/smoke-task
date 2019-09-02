const { folder, shell } = require('./tools')
const package = require(`${process.cwd()}/package.json`)

async function clean() {
  await folder('node_modules').delete().exec().catch(() => { /** Cannot delete @types on windows */ })
  await folder('public').delete().exec()
}

async function build() {
  await shell('tsc-bundle ./src/tsconfig.json --outFile ./public/pack/index.js').exec()
}

async function pack() {
  await folder('public/pack')
    .delete()
    .create()
    .exec()

  await shell('tsc-bundle ./src/tsconfig.json --outFile ./public/pack/index.js')
    .exec()

  await folder('public/pack')
    .add('src/context/context.d.ts')
    .add('src/start.js')
    .add('package.json')
    .add('readme.md')
    .add('license')
    .exec()
  
  await shell('cd ./public/pack && npm pack').exec()
}

async function install_cli() {
  await pack()
  await shell(`npm install public/pack/${package.name}-${package.version}.tgz -g`).exec()
}

/** Command Line interface. */
async function cli (args, tasks) {
  const [_, __, task] = args
  await tasks[task]()
}
cli(process.argv, {
  clean,
  build,
  pack,
  install_cli
}).catch(console.log)

