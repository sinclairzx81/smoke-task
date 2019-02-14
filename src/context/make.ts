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

import { dirname }                   from 'path'
import { existsSync, writeFileSync } from 'fs'
import { mkdirSync }                 from 'fs'

/** Makes the given directory path. If not exists, create recursively. */
export function makeDirectory (directoryPath: string): void {
 const facade: Function = mkdirSync // pending node 10 LTS
 facade(directoryPath, { recursive: true })
}
/** Makes the given directory path. If not exists, create recursively. */
export function makeFile (filePath: string): void {
  const directoryPath = dirname(filePath)
  makeDirectory(directoryPath)
  writeFileSync(filePath, Buffer.alloc(0))
}

/** Makes the given path as either an empty file, or directory. Default is 'directory' */
export function make(pathLike: string, type: 'directory' | 'file' = 'directory') {
  if(existsSync(pathLike)) {
    return
  }
  return (type === 'directory')
    ? makeDirectory(pathLike)
    : makeFile(pathLike)
}

