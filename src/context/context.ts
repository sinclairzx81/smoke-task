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

import { Script, createContext } from 'vm'
import { join }                  from 'path' 
import { TaskFile }              from '../taskfile'
import * as effects              from './effects'

// -------------------------------------------------------------------
//
// MapParameterType
//
// Makes a best effort attempt to map the string parameter argument
// into a respective string | number or boolean type.
//
// -------------------------------------------------------------------

function mapParameterType(parameters: string[]): Array<string | number | boolean> {
  return parameters.map(parameter => {
    if (parameter === 'true') {
      return true
    } else if (parameter === 'false') {
      return false
    } else if (!isNaN(parameter as any)) {
      return parseFloat(parameter)
    } else {
      return parameter
    }
  })
}

// -------------------------------------------------------------------
//
// RunTask
//
// Resposible for invoking a task within the taskFile. Tasks here
// are executed within a nodejs vm with the task itself wrapped
// within an asynchronous closure. All tasks are awaited on.
//
// -------------------------------------------------------------------

export async function runTask(taskFile: TaskFile, task: string, parameters: string[] = []) {
  const args = mapParameterType(parameters)
  const context = createContext({
    require: (module: string) => {
      try { return require(module) } catch { /** ignore */}
      return require(join(process.cwd(), module))
    },
    __dirname:  process.cwd(),
    __filename: join(process.cwd(), 'tasks.js'),
    ...global,
    ...effects,
    process,
    console,
    args,
  })
  const theader = `(async function(args) {`
  const tcontent = taskFile.content
  const tboot = `return await ${task}(...args)`
  const tfooter = `})(args);`
  const tcode = [
    theader,
    tcontent,
    tboot,
    tfooter
  ].join('\n\n')
  const script = new Script(tcode)
  try {
    await script.runInContext(context)
    process.exit(0)
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}