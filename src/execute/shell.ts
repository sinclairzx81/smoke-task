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

import { spawn } from 'child_process'

// -------------------------------------------------------------------
//
// Shell
//
// The 'shell' implementation code. Runs the shell command async
// on windows / linux environments and supports multiline commands
// which are flattened prior to execution.
//
// -------------------------------------------------------------------

export class ShellExitError extends Error {
  constructor(expect: number, actual: number) {
    super(`shell: exited with code ${actual}. expected ${expect}`)
  }
}

export function shell (command: string, exitcode: number = 0): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    command = command.split('\n').join(' ').split(' ').filter(n => n.length > 0).join(' ')
    const windows = /^win/.test(process.platform)
    console.log(`\x1b[32m$ ${command}\x1b[0m` )
    const ls = spawn(windows ? 'cmd' : 'sh', [windows ? '/c' : '-c', command] )
    ls.stdout.pipe(process.stdout)
    ls.stderr.pipe(process.stderr)
    ls.on('close', (code: number) => {
      if(code !== exitcode) {
        reject(new ShellExitError(exitcode, code))
        return
      }
      resolve(code)
    })
  })
}