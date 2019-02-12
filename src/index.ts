/*--------------------------------------------------------------------------

MIT License

Copyright (c) smoke-task 2019 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---------------------------------------------------------------------------*/

import { readCommand, RunCommand } from './command'
import { readTasksFile, TaskFile } from './taskfile'
import { runTask }                 from './context'
import { join }                    from 'path'

const TASK_FILE = join(process.cwd(), './tasks.js')

// ---------------------------------------------------------------------
//
// Report
//
// Prints general information about running tasks and enumerates
// existing tasks if present. This function serves as a print and
// exit point for the process. It exits the process appropriately
// on error. This function could use a general clean up.
//
// ---------------------------------------------------------------------

async function report(message: string | null = null, error: boolean = false) {
  const buffer = []
  const green  = '\x1b[32m'
  const yellow = '\x1b[33m'
  const esc    = '\x1b[0m'
  // report general help information.
  buffer.push(...[
    'Version 1.0.3', ``,
    `$ ${green}smoke-task${esc} <task> [...params]`, ``,
  ])

  // report usage or existing tasks if available.
  const file = readTasksFile(TASK_FILE)
  if(!(file.type === 'task-file' && file.tasks.length > 0)) {
    buffer.push(...[
      `Examples: ${green}smoke-task${esc} ${yellow}build${esc}`,
      `          ${green}smoke-task${esc} ${yellow}add${esc} 10 20`, ``,
    ])
  } else {
    const tasks = file.tasks.map((task, index) => {
      const padding = (index === 0)
        ? `Tasks:${Array.from({length: 2}).join(' ')}`
        : Array.from({length: 8}).join(' ')
      const line = `${padding}${green}smoke-task${esc} ${yellow}${task.name}${esc}`
      const args = task.args.join(' ')
      return [line, args].join(' ')
    })
    buffer.push(...tasks)
    buffer.push('')
  }
  // report any info | error messages.
  if(message) {
    buffer.push(message)
    buffer.push('')
  }
  // emit to console and exit.
  console.log(buffer.join('\n'))
  return (!error)
    ? process.exit(0)
    : process.exit(1)
}

// ---------------------------------------------------------------------
//
// Execute
//
// Attempts to execute the given command
//
// ---------------------------------------------------------------------

async function execute(command: RunCommand, taskfile: TaskFile) {
  const task = taskfile.tasks.find(task => task.name === command.task)
  if (!task) {
    report(`Task '${command.task}' not found. Did you forget to export a function?`, true)
  }
  return runTask(taskfile, command.task, command.parameters)
}

// ---------------------------------------------------------------------
//
// Run
//
// Attempts to run the given command.
//
// ---------------------------------------------------------------------

async function run(command: RunCommand) {
  const result = readTasksFile(TASK_FILE)
  switch (result.type) {
    case 'task-file-error': return report(result.message, true);
    case 'task-file': return execute(command, result);
  }
}

// ---------------------------------------------------------------------
//
// Main
//
// ---------------------------------------------------------------------

async function main() {
  const command = readCommand(process.argv)
  switch (command.type) {
    case 'info': return report(null, false)
    case 'run':  return run(command)
  }
}

main()
.then(() => process.exit(0))
.catch(console.log)
.then(() => process.exit(1))




