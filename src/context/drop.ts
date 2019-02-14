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

import { existsSync, lstatSync, unlinkSync, rmdirSync, readdirSync } from 'fs'
import { join } from 'path'

function dropFile(filePath: string) {
  unlinkSync(filePath)
}
/** Recursively deletes the given path. */
function dropDirectory(directoryPath: string) {
  for (const file of readdirSync(directoryPath)) {
    const current = join(directoryPath, file)
    if (lstatSync(current).isDirectory()) {
      dropDirectory(current)
    } else {
      dropFile(current)
    }
  }
  rmdirSync(directoryPath)
}

/** Recursively deletes the given path. */
export function drop(pathLike: string): void {
  if(!existsSync(pathLike)) {
    return
  }
  const stat = lstatSync(pathLike)
  return (stat.isDirectory())
    ? dropDirectory(pathLike)
    : dropFile(pathLike)
}
