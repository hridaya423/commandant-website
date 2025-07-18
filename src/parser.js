class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse() {
        const statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return { type: 'Program', body: statements };
    }

    statement() {
        if (this.match('SHOUT')) return this.shoutStatement();
        if (this.match('ENLIST')) return this.enlistStatement();
        if (this.match('MISSION')) return this.missionStatement();
        if (this.match('REPORT')) return this.reportStatement();
        if (this.match('RECON')) return this.reconStatement();
        if (this.match('WHILE_UNDER_SIEGE')) return this.whileStatement();
        if (this.match('PATROL_THROUGH')) return this.forEachStatement();
        return this.expressionStatement(); 
    }

    shoutStatement() {
        const expression = this.expression();
        return { type: 'ShoutStatement', expression };
    }

    enlistStatement() {
        const name = this.consume('IDENTIFIER', 'Expect variable name.');
        this.consume('ASSIGN', 'Expect = after variable name.');
        const initializer = this.expression();
        return { type: 'EnlistStatement', name, initializer };
    }

    missionStatement() {
        const name = this.consume('IDENTIFIER', 'Expect mission name.');
        let params = [];
        if (this.match('WITH')) {
            params = this.parameters();
        }
        this.consume('COLON', "Expect ':' before mission body.");
        const body = this.block('RETREAT');
        this.consume('RETREAT', "Expect 'retreat.' after mission body.");
        this.consume('PERIOD', "Expect '.' after retreat.");
        return { type: 'MissionStatement', name, params, body };
    }

    reportStatement() {
        const value = this.expression();
        return { type: 'ReportStatement', value };
    }

    reconStatement() {
        return this.reconStatementHelper(true);
    }

    reconStatementHelper(consumeSecure) {
        const condition = this.expression();
        this.consume('COLON', "Expect ':' after recon condition.");
        const thenBranch = this.block('SECURE', 'ELSE_RECON', 'FALLBACK_POSITION');
        let elseBranch = null;
        if (this.match('ELSE_RECON')) {
            elseBranch = this.reconStatementHelper(false);
        } else if (this.match('FALLBACK_POSITION')) {
            this.consume('COLON', "Expect ':' after fallback position.");
            elseBranch = this.block('SECURE');
        }
        if (consumeSecure) {
            this.consume('SECURE', "Expect 'secure.' after recon block.");
            this.consume('PERIOD', "Expect '.' after secure.");
        }
        return { type: 'ReconStatement', condition, thenBranch, elseBranch };
    }

    whileStatement() {
        const condition = this.expression();
        this.consume('COLON', "Expect ':' after while under siege condition.");
        const body = this.block('BREAK_SIEGE');
        this.consume('BREAK_SIEGE', "Expect 'break siege.' after while body.");
        this.consume('PERIOD', "Expect '.' after break siege.");
        return { type: 'WhileStatement', condition, body };
    }

    forEachStatement() {
        const variable = this.consume('IDENTIFIER', 'Expect variable name for patrol.');
        this.consume('IN', 'Expect "in" after patrol variable.');
        const iterable = this.expression();
        this.consume('COLON', "Expect ':' after patrol through expression.");
        const body = this.block('END_PATROL');
        this.consume('END_PATROL', "Expect 'end patrol.' after patrol body.");
        this.consume('PERIOD', "Expect '.' after end patrol.");
        return { type: 'ForEachStatement', variable, iterable, body };
    }

    parameters() {
        const params = [];
        if (!this.check('COLON')) {
            do {
                params.push(this.consume('IDENTIFIER', 'Expect parameter name.'));
            } while (this.match('COMMA'));
        }
        return params;
    }

    block(...endTokens) {
        const statements = [];
        while (!endTokens.some(token => this.check(token)) && !this.isAtEnd()) {
            statements.push(this.statement());
        }
        return statements;
    }

    expressionStatement() {
        const expr = this.expression();
        return { type: 'ExpressionStatement', expression: expr };
    }

    expression() {
        return this.assignment();
    }

    assignment() {
        const expr = this.logicalOr();

        if (this.match('ASSIGN')) {
            const equals = this.previous();
            const value = this.assignment();

            if (expr.type === 'Identifier') {
                const name = expr.name;
                return { type: 'AssignmentExpression', name, value };
            }

            if (expr.type === 'ArrayAccess') {
                return { type: 'ArrayAssignmentExpression', object: expr.object, index: expr.index, value };
            }

            this.error(equals, 'Invalid assignment target.');
        }

        return expr;
    }

    logicalOr() {
        let expr = this.logicalAnd();
        while (this.match('OR')) {
            const operator = this.previous();
            const right = this.logicalAnd();
            expr = { type: 'LogicalExpression', left: expr, operator, right };
        }
        return expr;
    }

    logicalAnd() {
        let expr = this.equality();
        while (this.match('AND')) {
            const operator = this.previous();
            const right = this.equality();
            expr = { type: 'LogicalExpression', left: expr, operator, right };
        }
        return expr;
    }

    equality() {
        let expr = this.comparison();
        while (this.match('EQ', 'NEQ')) {
            const operator = this.previous();
            const right = this.comparison();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }

    comparison() {
        let expr = this.term();
        while (this.match('GT', 'GTE', 'LT', 'LTE')) {
            const operator = this.previous();
            const right = this.term();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }

    term() {
        let expr = this.factor();
        while (this.match('PLUS', 'MINUS')) {
            const operator = this.previous();
            const right = this.factor();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }

    factor() {
        let expr = this.unary();
        while (this.match('MULTIPLY', 'DIVIDE')) {
            const operator = this.previous();
            const right = this.unary();
            expr = { type: 'BinaryExpression', left: expr, operator, right };
        }
        return expr;
    }

    unary() {
        if (this.match('MINUS')) {
            const operator = this.previous();
            const right = this.unary();
            return { type: 'UnaryExpression', operator, right };
        }
        return this.primary();
    }

    primary() {
        if (this.match('NUMBER', 'STRING')) {
            return { type: 'Literal', value: this.previous().value };
        }

        if (this.match('LEFT_BRACKET')) {
            return this.arrayLiteral();
        }

        if (this.match('EXECUTE')) {
            return this.executeExpression();
        }

        if (this.match('INTERROGATE')) {
            return this.interrogateExpression();
        }

        if (this.match('IDENTIFIER')) {
            return this.postfix({ type: 'Identifier', name: this.previous().value });
        }

        throw this.error(this.peek(), 'Expect expression.');
    }

    executeExpression() {
        const callee = this.consume('IDENTIFIER', 'Expect mission name to execute.');
        const args = [];
        if (this.match('WITH')) {
            do {
                args.push(this.expression());
            } while (this.match('COMMA'));
        }
        return { type: 'CallExpression', callee: { type: 'Identifier', name: callee.value }, arguments: args };
    }

    interrogateExpression() {
        const prompt = this.expression();
        return { type: 'InterrogateExpression', prompt };
    }

    arrayLiteral() {
        const elements = [];
        if (!this.check('RIGHT_BRACKET')) {
            do {
                elements.push(this.expression());
            } while (this.match('COMMA'));
        }
        this.consume('RIGHT_BRACKET', "Expect ']' after array elements.");
        return { type: 'ArrayLiteral', elements };
    }

    postfix(expr) {
        while (true) {
            if (this.match('LEFT_BRACKET')) {
                const index = this.expression();
                this.consume('RIGHT_BRACKET', "Expect ']' after array index.");
                expr = { type: 'ArrayAccess', object: expr, index };
            } else {
                break;
            }
        }
        return expr;
    }

    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type === 'EOF';
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    error(token, message) {
        const err = new Error(`${message} at line ${token.line} col ${token.col}`);
        err.token = token;
        return err;
    }
}

module.exports = Parser;
