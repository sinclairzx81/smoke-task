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

const TASKFILE = join(process.cwd(), './tasks.js')

/** Exits the task runner with status code 1 and a message. */
function fatal(message: string = '') {
  console.error(message)
  process.exit(1)
}

/** Prints an informational message + available tasks. */
function info(message: string = '') {
  console.log(message); console.log()
  const result = readTasksFile(TASKFILE)
  if (result.type === 'task-file') {
    console.log('Tasks:')
    result.tasks.forEach(task => {
      const parameters = task.args.join(', ').trim()
      console.log(' - ' + task.name + ' (' + parameters + ')')
    })
  }
}

/** Executes the given task. */
async function execute(command: RunCommand, taskfile: TaskFile) {
  const task = taskfile.tasks.find(task => task.name === command.task)
  if (task) {
    return runTask(taskfile, command.task, command.parameters)
  }
  info(`Task '${command.task}' not found. Did you forget to export the function?`)
  fatal()
}

/** Runs a command issued from the command line. */
async function run(command: RunCommand) {
  const result = readTasksFile(TASKFILE)
  switch (result.type) {
    case 'task-file-error': return fatal(result.message);
    case 'task-file': return execute(command, result);
  }
}

/** Starts up the process. */
async function start() {
  try {
    const command = readCommand(process.argv)
    switch (command.type) {
      case 'info': return info()
      case 'run': return run(command)
    }
  } catch (error) {
    fatal(error.message)
  }
}
start()




