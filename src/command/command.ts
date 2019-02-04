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

// -------------------------------------------------------------------
//
// Parse Parameters
//
// Parses out the argv parameters. In future, perhaps consider better
// support for 'string' parsing, allowing users to pass strings within
// quotes.
//
// -------------------------------------------------------------------
function* parseParameters(args: string[]) {
  while(args.length > 0) {
    const current = args.shift()!
    yield current
  }
}

// -------------------------------------------------------------------
//
// Command
//
// Reads command line arguments from the processes argv array.
//
// -------------------------------------------------------------------

export interface InfoCommand { type: 'info' }
export interface RunCommand  { type: 'run', task: string, parameters: string[] }
export type Command = InfoCommand | RunCommand
export function readCommand(argv: string[]): Command {
  if(argv.length === 2) {
    const type = 'info'
    return { type }
  }
  const parameters = [...parseParameters(argv.slice(2))]
  const method     = parameters.shift()!
  const type       = 'run'
  return { type, task: method, parameters }
}