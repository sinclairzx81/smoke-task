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

/** Formats multiline commands, newlines resolved to spaces. */
function formatCommand(command: string): string {
  return command.split('\n').join(' ').split(' ').filter(n => n.length > 0).join(' ')
}

/** Resolves the spawn options based on the host operating system. */
function resolveSpawnOptions(command: string): { command: string, options: string[] } {
  return (/^win/.test(process.platform))
    ? { command: 'cmd', options: ['/c', command] }
    : { command: 'sh',  options: ['-c', command] }
}

// -------------------------------------------------------------------
//
// Shell Options Function.
//
// Sets global options for the shell.
//
// -------------------------------------------------------------------

export interface ShellOptions {
  trace?: boolean
}
let ShellOptions: ShellOptions = {
  trace: true
}
export function shell_options(options: ShellOptions) {
  ShellOptions = { ...ShellOptions, ...options }
}

// -------------------------------------------------------------------
//
// Shell Function.
//
// This function is passed to the executing task allowing that task
// to run shell commands. By default, the shell emits all content
// received over stderr, stdout to the host process stdio, but can
// be overridden by passing ShellOptions to disable.
//
// -------------------------------------------------------------------

export class ShellExitCodeError extends Error {
  constructor(expect: number, actual: number) {
    super(`shell: ended with exitcode ${actual}. expected ${expect}`)
  }
}
export interface CommandOptions {
  expect?: number  
  stdout?: boolean
  stderr?: boolean
}
export function shell (command: string, options: CommandOptions = {}): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    if(options.expect === undefined) { options.expect = 0 }
    if(options.stdout === undefined) { options.stdout = true }
    if(options.stderr === undefined) { options.stderr = true }
    if(ShellOptions.trace) {
      console.log(`\x1b[32m$ ${command}\x1b[0m` )
    }
    const spawnOptions = resolveSpawnOptions(formatCommand(command))
    const subprocess   = spawn(spawnOptions.command, spawnOptions.options )
    if(options.stdout) {
      subprocess.stdout.pipe(process.stdout)
    }
    if(options.stderr) {
      subprocess.stderr.pipe(process.stderr)
    }
    subprocess.on('close', (exitcode: number) => {
      if(exitcode !== options.expect) {
        return reject(new ShellExitCodeError(options.expect!, exitcode))
      }
      resolve(exitcode)
    })
  })
}