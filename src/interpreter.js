const CommandantFunction = require('./commandant-function');

class Environment {
  constructor(enclosing = null) {
    this.values = {};
    this.enclosing = enclosing;
  }

  define(name, value) {
    this.values[name] = value;
  }

  get(name) {
    if (this.values.hasOwnProperty(name)) {
      return this.values[name];
    }

    if (this.enclosing) {
      return this.enclosing.get(name);
    }

    throw new Error(`Undefined variable '${name}'.`);
  }

  assign(name, value) {
    if (this.values.hasOwnProperty(name)) {
      this.values[name] = value;
      return value;
    }

    if (this.enclosing) {
      return this.enclosing.assign(name, value);
    }

    throw new Error(`Undefined variable '${name}'.`);
  }
}

class NativeFunction {
    constructor(fn) {
        this.fn = fn;
    }

    call(interpreter, args) {
        return this.fn(...args);
    }

    toString() {
        return '<native mission>';
    }
}

class Interpreter {

    constructor() {
        this.globals = new Environment();
        this.environment = this.globals;
    }
    interpret(statements) {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        } catch (error) {
            console.error(error);
        }
    }
    execute(statement) {
        switch (statement.type) {
            case 'ShoutStatement':
                return this.visitShoutStatement(statement);
            case 'EnlistStatement':
                return this.visitEnlistStatement(statement);
            case 'MissionStatement':
                return this.visitMissionStatement(statement);
            case 'ReportStatement':
                return this.visitReportStatement(statement);
            case 'ReconStatement':
                return this.visitReconStatement(statement);
            case 'WhileStatement':
                return this.visitWhileStatement(statement);
            case 'ForEachStatement':
                return this.visitForEachStatement(statement);
            case 'ExpressionStatement':
                return this.visitExpressionStatement(statement);
            default:
                throw new Error(`Unknown statement type: ${statement.type}`);
        }
    }
    executeBlock(statements, environment) {
        const previous = this.environment;
        try {
            this.environment = environment;
            for (const statement of statements) {
                this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
    }
    visitShoutStatement(statement) {
        const value = this.evaluate(statement.expression);
        console.log(value);
    }
    visitEnlistStatement(statement) {
        const value = this.evaluate(statement.initializer);
        this.environment.define(statement.name.value, value);
    }
    visitMissionStatement(statement) {
        const func = new CommandantFunction(statement, this.environment);
        this.environment.define(statement.name.value, func);
    }
    visitReportStatement(statement) {
        const value = this.evaluate(statement.value);
        throw { value };
    }
    visitReconStatement(statement) {
        if (this.isTruthy(this.evaluate(statement.condition))) {
            this.executeBlock(statement.thenBranch, new Environment(this.environment));
        } else if (statement.elseBranch) {
            if (Array.isArray(statement.elseBranch)) {
                this.executeBlock(statement.elseBranch, new Environment(this.environment));
            } else {
                this.execute(statement.elseBranch);
            }
        }
    }

    visitWhileStatement(statement) {
        while (this.isTruthy(this.evaluate(statement.condition))) {
            this.executeBlock(statement.body, new Environment(this.environment));
        }
    }

    visitForEachStatement(statement) {
        const iterable = this.evaluate(statement.iterable);
        if (!Array.isArray(iterable)) {
            throw new Error('Can only patrol through arrays.');
        }
        for (const element of iterable) {
            const environment = new Environment(this.environment);
            environment.define(statement.variable.value, element);
            this.executeBlock(statement.body, environment);
        }
    }

    isTruthy(object) {
        if (object === null) return false;
        if (typeof object === 'boolean') return object;
        return true;
    }

    visitExpressionStatement(statement) {
        this.evaluate(statement.expression);
    }

    evaluate(expression) {
        switch (expression.type) {
            case 'Literal':
                return this.visitLiteral(expression);
            case 'Identifier':
                return this.visitIdentifier(expression);
            case 'AssignmentExpression':
                return this.visitAssignmentExpression(expression);
            case 'ArrayAssignmentExpression':
                return this.visitArrayAssignmentExpression(expression);
            case 'CallExpression':
                return this.visitCallExpression(expression);
            case 'InterrogateExpression':
                return this.visitInterrogateExpression(expression);
            case 'BinaryExpression':
                return this.visitBinaryExpression(expression);
            case 'LogicalExpression':
                return this.visitLogicalExpression(expression);
            case 'UnaryExpression':
                return this.visitUnaryExpression(expression);
            case 'ArrayLiteral':
                return this.visitArrayLiteral(expression);
            case 'ArrayAccess':
                return this.visitArrayAccess(expression);
            default:
                throw new Error(`Unknown expression type: ${expression.type}`);
        }
    }

    visitLiteral(expression) {
        return expression.value;
    }

    visitIdentifier(expression) {
        return this.environment.get(expression.name);
    }

    visitAssignmentExpression(expression) {
        const value = this.evaluate(expression.value);
        this.environment.assign(expression.name, value);
        return value;
    }

    visitCallExpression(expression) {
        const callee = this.evaluate(expression.callee);

        const args = [];
        for (const argument of expression.arguments) {
            args.push(this.evaluate(argument));
        }

        if (!(callee instanceof CommandantFunction) && !(callee instanceof NativeFunction)) {
            throw new Error('Can only call missions or native functions.');
        }

        return callee.call(this, args);
    }

    visitInterrogateExpression(expression) {
        const prompt = this.evaluate(expression.prompt);
        const interrogateFunc = this.globals.get('interrogate');
        if (!(interrogateFunc instanceof NativeFunction)) {
            throw new Error('Interrogate function not properly defined.');
        }
        return interrogateFunc.call(this, [prompt]);
    }

    visitBinaryExpression(expression) {
        const left = this.evaluate(expression.left);
        const right = this.evaluate(expression.right);
        switch (expression.operator.type) {
            case 'PLUS':
                return left + right;
            case 'MINUS':
                return left - right;
            case 'MULTIPLY':
                return left * right;
            case 'DIVIDE':
                return left / right;
            case 'GT':
                return left > right;
            case 'GTE':
                return left >= right;
            case 'LT':
                return left < right;
            case 'LTE':
                return left <= right;
            case 'EQ':
                return left === right;
            case 'NEQ':
                return left !== right;
        }
    }

    visitLogicalExpression(expression) {
        const left = this.evaluate(expression.left);

        if (expression.operator.type === 'OR') {
            if (left) return left;
        } else {
            if (!left) return left;
        }

        return this.evaluate(expression.right);
    }

    visitUnaryExpression(expression) {
        const right = this.evaluate(expression.right);
        if (expression.operator.type === 'MINUS') {
            return -right;
        }
        return right;
    }

    visitArrayLiteral(expression) {
        const elements = [];
        for (const element of expression.elements) {
            elements.push(this.evaluate(element));
        }
        return elements;
    }

    visitArrayAccess(expression) {
        const object = this.evaluate(expression.object);
        const index = this.evaluate(expression.index);

        if (!Array.isArray(object)) {
            throw new Error('Can only access elements of arrays.');
        }

        if (typeof index !== 'number' || index < 0 || index >= object.length) {
            throw new Error('Array index out of bounds.');
        }

        return object[Math.floor(index)];
    }

    visitArrayAssignmentExpression(expression) {
        const object = this.evaluate(expression.object);
        const index = this.evaluate(expression.index);
        const value = this.evaluate(expression.value);

        if (!Array.isArray(object)) {
            throw new Error('Can only assign to array elements.');
        }

        if (typeof index !== 'number' || index < 0) {
            throw new Error('Invalid array index.');
        }

        object[Math.floor(index)] = value;
        return value;
    }
}

module.exports = { Interpreter, NativeFunction };
