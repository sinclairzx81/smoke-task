# smoke-task

An ultra lightweight JavaScript task runner for node.
```
$ npm install smoke-task -g
```

```javascript
// ./tasks.js
export async function add(a, b) {
  await shell(`echo ${a + b}`)
}
```
```bash
$ smoke-task add 10 20
# $ echo 30
# 30
```

## Overview

Smoke-Task is a lightweight task runner for node. It allows one to write vanilla JavaScript functions which can be run via the terminal or via npm scripts.

This tools main focus is to provide a scripting environment for running shell commands and offers a single built in function `shell(cmd)`. All shell commands are run asynchronously and return Promises to be `awaited`, multiple shell commands can be executed in parallel via `Promise.all()`. Useful for watch tasks.

This tool is offered for anyone who finds it useful.

## Tasks
Smoke-Task requires that a `tasks.js` file exist in the current working directory (typically a project root). For tasks to be available to the terminal, they must `export` themselves. As follows.

```typescript
export function syncTask() { /* code here */ }

export async function asyncTask() { /* code here */ }
```
```bash
$ smoke-task syncTask

$ smoke-task asyncTask
```
Parameters can also be passed to the task if nessasary.
```typescript
export function myTask(text, value) {

  console.log(text, value)
}
```
```bash
$ smoke-task myTask hello 42
```
Note: This tool will treat each space in an argument list as a distinct function argument. Only single `word` strings are supported.

## Series
The following is a simple build task that compiles a TypeScript file and copies some files around.
```typescript
export async function build() {
  await shell('tsc ./src/index.ts --outFile ./bin/index.js')
  await shell('shx cp -p ./readme.md ./bin')
  await shell('shx cp -p ./licence ./bin')
  await shell('shx cp -p ./package.json ./bin')
}
```
```bash
$ smoke-task build
```
## Parallel

It's common to want to run multiple shell commands simultaneously. The following runs the TypeScript compiler in watch mode and also starts a `serve` process running on port 5000. Both commands are executed in parallel and never finish. Useful for watch development workflows.

```typescript
export async function watch() {
  await Promise.all([
    shell('tsc ./index.ts --outFile ./bin/index.js --watch')
    shell('cd bin && serve --port 5000')
  ])
}
```
```bash
$ smoke-task watch
```
## Project Tasks

The following tasks are supported.
```
npm run clean       # cleans this project.
npm run spec        # runs the spec project in watch.
npm run pack        # builds a deployment package.
npm run install-cli # installs this package globally.
```