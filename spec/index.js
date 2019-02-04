(() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
    define("command/command", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function* parseParameters(args) {
            while (args.length > 0) {
                const current = args.shift();
                yield current;
            }
        }
        function readCommand(argv) {
            if (argv.length === 2) {
                const type = 'info';
                return { type };
            }
            const parameters = [...parseParameters(argv.slice(2))];
            const method = parameters.shift();
            const type = 'run';
            return { type, task: method, parameters };
        }
        exports.readCommand = readCommand;
    });
    define("command/index", ["require", "exports", "command/command"], function (require, exports, command_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.readCommand = command_1.readCommand;
    });
    define("taskfile/file", ["require", "exports", "fs", "path"], function (require, exports, fs_1, path_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function readTaskPattern(code, type, pattern) {
            const tasks = [];
            while (true) {
                const result = pattern.exec(code);
                if (!result) {
                    break;
                }
                const match = result[0];
                const name = result[1];
                const args = result[2].split(',').map(n => n.trim());
                tasks.push({ type, match, name, args });
            }
            return tasks;
        }
        function readTasks(code) {
            return [
                ...readTaskPattern(code, 'sync', /export\s+function\s+([a-z0-9$_]+)\s*\((.*)\)/g),
                ...readTaskPattern(code, 'async', /export\s+async\s+function\s+([a-z0-9$_]+)\s*\((.*)\)/g),
            ];
        }
        function transformTasks(code, tasks) {
            return tasks.reduce((code, task) => {
                switch (task.type) {
                    case 'async': return code.replace(task.match, `async function ${task.name}(${task.args.join(', ')}) `);
                    case 'sync': return code.replace(task.match, `function ${task.name}(${task.args.join(', ')}) `);
                }
            }, code);
        }
        function readTasksFile(taskFile) {
            const filePath = path_1.resolve(taskFile);
            if (!fs_1.existsSync(filePath)) {
                const type = 'task-file-error';
                const message = `No 'tasks.js' file found in this directory.`;
                return { type, message };
            }
            const type = 'task-file';
            const code = fs_1.readFileSync(filePath, 'utf8');
            const methods = readTasks(code);
            const content = transformTasks(code, methods);
            return { type, content, tasks: methods, filePath };
        }
        exports.readTasksFile = readTasksFile;
    });
    define("taskfile/index", ["require", "exports", "taskfile/file"], function (require, exports, file_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.readTasksFile = file_1.readTasksFile;
    });
    define("context/shell", ["require", "exports", "child_process"], function (require, exports, child_process_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        class ShellExitError extends Error {
            constructor(expect, actual) {
                super(`shell: exited with code ${actual}. expected ${expect}`);
            }
        }
        exports.ShellExitError = ShellExitError;
        function shell(command, exitcode = 0) {
            return new Promise((resolve, reject) => {
                command = command.split('\n').join(' ').split(' ').filter(n => n.length > 0).join(' ');
                const windows = /^win/.test(process.platform);
                console.log(`\x1b[32m$ ${command}\x1b[0m`);
                const ls = child_process_1.spawn(windows ? 'cmd' : 'sh', [windows ? '/c' : '-c', command]);
                ls.stdout.pipe(process.stdout);
                ls.stderr.pipe(process.stderr);
                ls.on('close', (code) => {
                    if (code !== exitcode) {
                        reject(new ShellExitError(exitcode, code));
                        return;
                    }
                    resolve(code);
                });
            });
        }
        exports.shell = shell;
    });
    define("context/context", ["require", "exports", "context/shell", "vm"], function (require, exports, shell_1, vm_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function mapParameterType(parameters) {
            return parameters.map(parameter => {
                if (parameter === 'true') {
                    return true;
                }
                else if (parameter === 'false') {
                    return false;
                }
                else if (!isNaN(parameter)) {
                    return parseFloat(parameter);
                }
                else {
                    return parameter;
                }
            });
        }
        async function runTask(taskFile, task, parameters = []) {
            const args = mapParameterType(parameters);
            const context = vm_1.createContext({
                require,
                console,
                args,
                shell: shell_1.shell,
                ...global
            });
            const theader = `(async function(args) {`;
            const tcontent = taskFile.content;
            const tboot = `return await ${task}(...args)`;
            const tfooter = `})(args);`;
            const tcode = [
                theader,
                tcontent,
                tboot,
                tfooter
            ].join('\n\n');
            const script = new vm_1.Script(tcode);
            await script.runInContext(context);
        }
        exports.runTask = runTask;
    });
    define("context/index", ["require", "exports", "context/context"], function (require, exports, context_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.runTask = context_1.runTask;
    });
    define("index", ["require", "exports", "command/index", "taskfile/index", "context/index", "path"], function (require, exports, command_2, taskfile_1, context_2, path_2) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        const TASKFILE = path_2.join(process.cwd(), './tasks.js');
        function fatal(message = '') {
            console.error(message);
            process.exit(1);
        }
        function info(message = '') {
            console.log(message);
            console.log();
            const result = taskfile_1.readTasksFile(TASKFILE);
            if (result.type === 'task-file') {
                console.log('Tasks:');
                result.tasks.forEach(task => {
                    const parameters = task.args.join(', ').trim();
                    console.log(' - ' + task.name + ' (' + parameters + ')');
                });
            }
        }
        async function execute(command, taskfile) {
            const task = taskfile.tasks.find(task => task.name === command.task);
            if (task) {
                return context_2.runTask(taskfile, command.task, command.parameters);
            }
            info(`Task '${command.task}' not found. Did you forget to export the function?`);
            fatal();
        }
        async function run(command) {
            const result = taskfile_1.readTasksFile(TASKFILE);
            switch (result.type) {
                case 'task-file-error': return fatal(result.message);
                case 'task-file': return execute(command, result);
            }
        }
        async function start() {
            try {
                const command = command_2.readCommand(process.argv);
                switch (command.type) {
                    case 'info': return info();
                    case 'run': return run(command);
                }
            }
            catch (error) {
                fatal(error.message);
            }
        }
        start();
    });
    
    'marker:entry';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch {
                    throw Error(['module ', name, ' not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve(entry[0]);
    }
})();