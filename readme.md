# Smoke-Task

A JavaScript task runner for node.

[![NPM package](https://badge.fury.io/js/smoke-task.svg)](https://www.npmjs.com/package/smoke-task)

```
$ npm install smoke-task --save-dev
```
```javascript
export async function add(a, b) {
  await shell(`echo ${a + b}`).exec()
}
```
```bash
$ npx smoke-task add 10 20
# $ echo 30
# 30
```

## Overview

Smoke-Task is a shell scripting tool that allows javascript functions to be exposed and run from a terminal. It is intended to be a lightweight single dependency cli module to assist with various build tasks for node projects.

This tool is offered for anyone who finds it useful. Supports node 10 and up.

## Tasks

Smoke-Task requires that a `tasks.js` file exist in the current working directory (typically a project root). For a tasks to be available to the task runner, the functions must be exported.

```typescript
/** A task to build a TypeScript project, then run the project */
export async function start() {
  await shell('tsc --project ./src/tsconfig.json').exec()
  await shell('node ./src/index.js').exec()
}
```
```
$ smoke-task start
```

## Functions

Tasks defined within `tasks.js` have access to four global functions that allow for various folder, file, shell and watch operations to be composed within each task. The API for these functions is outlined below.

```typescript
shell(command)
    .err(func)            // Redirects stderr data to the given function.
    .exec()               // (eval) Executes this shell command.
    .expect(exitcode)     // Sets the expected exitcode for this command. Default is 0.
    .log(func)            // Redirects both stdout and stderr to the given function.
    .out(func)            // Redirects stdout data to the given function.

watch(path)
    .timeout(ms)          // Sets a this watchers debounce timeout (default is 250ms)
    .run(func)            // Runs this function when a file or folder changes.
    .exec()               // Executes this watch (does not complete)

folder(path)
    .add(path)            // Adds a file to this folder. If the path being added exists, it is overwritten.
    .copy_to(folder)      // Copies this folder into the given folder.
    .contents()           // Returns the inner contents of this folder (see contents)
        .copy_to(folder)  // Copies the contents into the given folder.
        .move_to(folder)  // Moves the contents into the given folder.
        .delete()         // Deletes the contents of this folder.
        .exec()           // Executes effects on these contents.
    .create()             // Creates this folder if not exists.
    .delete()             // Deletes this folder if exists.
    .exec()               // (eval) Executes effects on this folder.
    .exists()             // (eval) Returns true if this folder exists.
    .hash(algo?)          // (eval) Returns a hash of this folder with the given algorithm.
    .merge_from(folder)   // Merges the contents from the remote folder into this folder.
    .move_to(folder)      // Moves this folder into the given folder.
    .remove(name)         // Removes a file or folder from this folder.
    .rename(newname)      // Renames this folder.
    .size()               // (eval) Returns the size of this folder in bytes.
    .stat()               // (eval) Returns a fs stats object for this folder.

file(path)
    .append_from(path)    // Appends to this file from a remote path | url. If file not exist, create.
    .append(data)         // Appends to this file. If file not exist, create.
    .copy_to(folder)      // Copies this file into the given folder. 
    .create()             // Creates this file if not exists.
    .delete()             // Deletes this file if exists.
    .edit(find, replace)  // Makes a find and replace edit to this file.
    .exec()               // (eval) Executes effects on this file.
    .exists()             // (eval) Returns true if this file exists.
    .hash(algo?)          // (eval) Returns a hash for this file with the given algorithm.
    .move_to(folder)      // Moves this file into the given folder.
    .prepend_from(path)   // Prepends to this file from a remote path | url. If file not exist, create.
    .prepend(data)        // Prepends to this file. If file not exist, create.
    .read(encoding?)      // (eval) Returns the contents of this file.
    .rename(newname)      // Renames this file.
    .size()               // (eval) Returns the size of this file in bytes.
    .stat()               // (eval) Returns a fs stats object for this file.
    .truncate()           // Truncates this file. If the file does not exist, it is created.
    .write_from(path)     // Writes to this file from a remote path | url. If file not exist, create.
    .write(data)          // Writes to this file. If the file does not exist, it is created.
```




## Project Tasks

The following tasks are supported.
```bash
npm run clean       # cleans this project.
npm run build       # builds this project.
npm run spec        # runs the spec project in watch.
npm run pack        # builds a deployment package.
npm run install-cli # installs this package globally.
```