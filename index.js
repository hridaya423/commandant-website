const fs = require('fs');
const Lexer = require('./src/lexer');
const Parser = require('./src/parser');
const { Interpreter, NativeFunction } = require('./src/interpreter');
const readlineSync = require('readline-sync');

function run(source) {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter = new Interpreter();
    interpreter.globals.define('interrogate', new NativeFunction((prompt) => {
        return readlineSync.question(prompt);
    }));
    interpreter.globals.define('deploy', new NativeFunction((array, element) => {
        if (!Array.isArray(array)) {
            throw new Error('Can only deploy to arrays.');
        }
        array.push(element);
        return array.length;
    }));

    interpreter.globals.define('extract', new NativeFunction((array) => {
        if (!Array.isArray(array)) {
            throw new Error('Can only extract from arrays.');
        }
        if (array.length === 0) {
            throw new Error('Cannot extract from empty array.');
        }
        return array.pop();
    }));

    interpreter.globals.define('headcount', new NativeFunction((array) => {
        if (!Array.isArray(array)) {
            throw new Error('Can only count arrays.');
        }
        return array.length;
    }));

    interpreter.globals.define('reinforce_at', new NativeFunction((array, index, element) => {
        if (!Array.isArray(array)) {
            throw new Error('Can only reinforce arrays.');
        }
        if (typeof index !== 'number' || index < 0) {
            throw new Error('Invalid position for reinforcement.');
        }
        array.splice(Math.floor(index), 0, element);
        return array.length;
    }));

    interpreter.globals.define('evacuate_at', new NativeFunction((array, index) => {
        if (!Array.isArray(array)) {
            throw new Error('Can only evacuate from arrays.');
        }
        if (typeof index !== 'number' || index < 0 || index >= array.length) {
            throw new Error('Invalid position for evacuation.');
        }
        return array.splice(Math.floor(index), 1)[0];
    }));

    interpreter.interpret(ast.body);
}

function runFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${filePath}`);
            process.exit(1);
        }
        run(data);
    });
}

if (process.argv.length > 2) {
    runFile(process.argv[2]);
} else {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'commandant> '
    });

    readline.prompt();

    readline.on('line', (line) => {
        try {
            run(line);
        } catch (e) {
            console.error(e.message);
        }
        readline.prompt();
    });
}

function runWithOutput(source) {
    const outputs = [];
    const originalLog = console.log;
    
    console.log = function(...args) {
        outputs.push(args.join(' '));
        originalLog.apply(console, args);
    };
    
    try {
        run(source);
        return {
            success: true,
            output: outputs.join('\n')
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            output: `Error: ${error.message}`
        };
    } finally {
        console.log = originalLog;
    }
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        run: runWithOutput,
        Lexer,
        Parser, 
        Interpreter,
        NativeFunction
    };
}
