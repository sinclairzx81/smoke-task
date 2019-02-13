/*--------------------------------------------------------------------------

smoke-task

The MIT License (MIT)

Copyright (c) 2019 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { readFileSync, existsSync }  from 'fs'
import { resolve }                   from 'path'

// -------------------------------------------------------------------
//
// Task
//
// The following code reads task meta information from the given
// task file source code. This information is used to preform a
// small transformation on the file, with 'exports' rewritten as
// flat functions to be later invoked by the 'context'
//
// -------------------------------------------------------------------
interface Task {
  type:    'sync' | 'async'
  name:    string
  args:    string[]
  match:   string
}
function readTaskPattern(code: string, type: 'sync' | 'async', pattern: RegExp): Task[] {
  const tasks = []
  while(true) {
    const result = pattern.exec(code)
    if(!result) {
      break
    }
    const match   = result[0]
    const name    = result[1]
    const args    = result[2].split(',').map(n => n.trim())
    tasks.push({ type, match, name, args })
  }
  return tasks
}
function readTasks(code: string): Task[] {
  return [
    ...readTaskPattern(code, 'sync',  /export\s+function\s+([a-z0-9$_]+)\s*\((.*)\)/g),
    ...readTaskPattern(code, 'async', /export\s+async\s+function\s+([a-z0-9$_]+)\s*\((.*)\)/g),
  ]
}

// -------------------------------------------------------------------
//
// Transform
//
// Performs a small transformation on the task file, specifically
// removing the 'exports' syntax on the tasks file. This should
// align well (syntactially at least) with ESM module exports in 
// future revisions of node.js.
//
// -------------------------------------------------------------------

function transformTasks(code: string, tasks: Task[]): string {
  return tasks.reduce((code, task) => {
    switch(task.type) {
      case 'async': return code.replace(task.match, `async function ${task.name}(${task.args.join(', ')}) `)
      case 'sync':  return code.replace(task.match, `function ${task.name}(${task.args.join(', ')}) `)
    }
  }, code)
}

// -------------------------------------------------------------------
//
// ReadTaskFile
//
// Loads up the given file and parses it as a task file.
//
// -------------------------------------------------------------------

export type TaskFileResult = TaskFile | TaskFileError

export interface TaskFile {
  type:    'task-file'
  filePath: string,
  content:  string,
  tasks:    Task[]
}
export interface TaskFileError {
  type:    'task-file-error'
  message:  string
}

export function readTasksFile(taskFile: string): TaskFileResult {
  const filePath = resolve(taskFile)
  if(!existsSync(filePath)) {
    const type    = 'task-file-error'
    const message = `No 'tasks.js' file found in this directory.`
    return { type, message } 
  }
  const code = readFileSync(filePath, 'utf8')
  const tasks = readTasks(code)
  if(tasks.length === 0) {
    const type    = 'task-file-error'
    const message = `No export functions found in 'tasks.js' file.`
    return { type, message }
  }
  const type = 'task-file'
  const content = transformTasks(code, tasks)
  return { type, content, tasks, filePath }
}