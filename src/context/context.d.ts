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

/// <reference types="node" />

declare class File {
    /** Appends to this file from a remote path | url. If file not exist, create. */
    append_from(path_or_url: string): File;
    /** Appends to this file. If file not exist, create. */
    append(content: Buffer | string | Readable): File;
    /** Copies this file into the given folder. */
    copy_to(folder: string): File;
    /** Creates this file if not exists. */
    create(): File;
    /** Deletes this file if exists. */
    delete(): File;
    /** Makes a find and replace edit to this file. */
    edit(find: RegExp | string, replace: string): File;
    /** Executes effects on this file. */
    exec(): Promise<void>;
    /** Returns true if this file exists. */
    exists(): Promise<boolean>;
    /** Returns a hash for this file with the given algorithm (default is sha1) */
    hash(algorithm?: string): Promise<string>;
    /** Moves this file into the given folder. */
    move_to(folder: string): File;
    /** Prepends to this file with content loaded from a remote path or url. If the file does not exist, it is created. */
    prepend_from(path_or_url: string): File;
    /** Prepends to this file. If the file does not exist, it is created. */
    prepend(content: Buffer | string | Readable): File;
    /** Returns the contents of this file as a buffer. */
    read(): Promise<Buffer>;
    /** Returns the contents of this file a string. */
    read(encoding: string): Promise<Buffer>;
    /** Renames this file to the given newname. */
    rename(newname: string): File;
    /** Returns the size of this file in bytes. */
    size(): Promise<number>;
    /** Returns a fs stats object for this file. */
    stat(): Promise<Stats>;
    /** Truncates the contents of this file. If the file does not exist, it is created. */
    truncate(): File;
    /** Writes to this file with content loaded from a remote path or url. If the file does not exist, it is created. */
    write_from(path_or_url: string): File;
    /** Writes to this file. If the file does not exist, it is created. */
    write(content: Buffer | string | Readable): File;
}
declare class Folder {
    constructor(current: string, effects: Effect[]);
    /** Adds a file to this folder. If the file exists, it is overwritten. */
    add(path: string): Folder;
    /** Copies this folder into the given folder. */
    copy_to(folder: string): Folder;
    /** Returns a contents object for this folder */
    contents(): Contents;
    /** Creates this folder. If the folder exists, no action. */
    create(): Folder;
    /** Deletes this folder. If the folder does not exist, no action. */
    delete(): Folder;
    /** Executes effects on this folder. */
    exec(): Promise<void>;
    /** Returns true if this folder exists. */
    exists(): Promise<boolean>;
    /** Returns a hash for this folder with the given algorithm (default is sha1) */
    hash(algorithm?: string): Promise<string>;
    /** Merges the content from a remote folder into this folder. */
    merge_from(folder: string): Folder;
    /** Moves this folder into the given folder. */
    move_to(folder: string): Folder;
    /** Deletes a file from this folder. If the file does not exist, no action. */
    remove(source: string): Folder;
    /** Renames this folder. */
    rename(newname: string): Folder;
    /** Returns the size of this folder in bytes. */
    size(): Promise<number>;
    /** Returns a fs stats object for this folder. */
    stat(): Promise<Stats>;
}
declare class Shell {
    /** Redirects stdout to the given function. */
    out(func: OutFunction): Shell;
    /** Redirects stderr to the given function. */
    err(func: ErrFunction): Shell;
    /** Redirects both stdout and stderr to the given function. */
    log(func: OutFunction): Shell;
    /** Sets the expected exitcode for this process. */
    expect(exitcode: number): Shell;
    /** Executes this process. */
    exec(): Promise<void>;
}
declare class Watch {
    /** Sets the debounce timeout for this watch. Default is 250 ms. */
    timeout(timeout: number): Watch;
    /** Runs this function when this file or folder changes. */
    run(func: RunFunction): Watch;
    /** Executes this watch. This promise should not resolve. */
    exec(): Promise<void>;
}

/** Creates a new file combinator. */
declare function file(path: string): File

/** Creates a new folder combinator. */
declare function folder(path: string): Folder

/** Creates a new shell combinator. */
declare function shell(command: string): Shell

/** Creates a new watch combinator. */
declare function watch(path): Watch