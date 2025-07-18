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

class CommandantFunction {
    constructor(declaration, closure) {
        this.declaration = declaration;
        this.closure = closure;
    }

    call(interpreter, args) {
        const environment = new Environment(this.closure);
        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].value, args[i]);
        }

        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (returnValue) {
            return returnValue.value;
        }

        return null;
    }

    toString() {
        return `<mission ${this.declaration.name.value}>`;
    }
}

module.exports = CommandantFunction;
