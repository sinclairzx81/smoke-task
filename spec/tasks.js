// run 'npm run spec' to build the project
// and run this task.

export function other() {
  console.log('other task')
}

export function start(s, n, b) {
  console.log(typeof s, s)
  console.log(typeof n, n)
  console.log(typeof b, b)
  other()
  shell('echo hello')
}