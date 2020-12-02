/*--------------------------------------------------------------------------

MIT License

Copyright (c) fs-effects 2019 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { OutFunction, ErrFunction, shell_execute, shell_execute_inherit } from './effects/shell_execute' 

export class Shell {
    constructor(private readonly _command: string, 
                private readonly _out: OutFunction | undefined, 
                private readonly _err: ErrFunction | undefined, 
                private readonly _expect: number) {}

    /** Redirects stdout to the given function. */
    public out(func: OutFunction): Shell {
        return new Shell(this._command, func, this._err, this._expect)
    }
    /** Redirects stderr to the given function. */
    public err(func: ErrFunction): Shell {
        return new Shell(this._command, this._out, func, this._expect)
    }
    /** Redirects both stdout and stderr to the given function. */
    public log(func: OutFunction): Shell {
        return new Shell(this._command, func, func, this._expect)
    }
    /** Sets the expected exitcode for this process. */
    public expect(exitcode: number) {
        return new Shell(this._command, this._out, this._err, exitcode)
    }
    /** Executes this process. */
    public exec(): Promise<void> {
        if(this._out === undefined && this._err === undefined) {
            return shell_execute_inherit(this._command, this._expect)
        }
        const out = this._out || (() => {});
        const err = this._err || (() => {});
        return shell_execute(this._command, out, err, this._expect)
    }
}
