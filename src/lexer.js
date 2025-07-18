const MULTI_WORD_KEYWORDS = [
    { phrase: "else recon", type: "ELSE_RECON" },
    { phrase: "fallback position", type: "FALLBACK_POSITION" },
    { phrase: "while under siege", type: "WHILE_UNDER_SIEGE" },
    { phrase: "break siege", type: "BREAK_SIEGE" },
    { phrase: "patrol through", type: "PATROL_THROUGH" },
    { phrase: "end patrol", type: "END_PATROL" },
    { phrase: "is equal to", type: "EQ" },
    { phrase: "is not equal to", type: "NEQ" },
    { phrase: "is outranked by", type: "LT" },
    { phrase: "outranks or holds", type: "GTE" },
    { phrase: "is outranked or held by", type: "LTE" },
    { phrase: "and also", type: "AND" },
    { phrase: "or else", type: "OR" }
];

const KEYWORDS = {
    "enlist": "ENLIST",
    "mission": "MISSION",
    "with": "WITH",
    "retreat": "RETREAT",
    "report": "REPORT",
    "execute": "EXECUTE",
    "recon": "RECON",
    "secure": "SECURE",
    "shout": "SHOUT",
    "interrogate": "INTERROGATE",
    "in": "IN"
};

const OPERATORS = {
    "reinforce": "PLUS",
    "expend": "MINUS",
    "amplify": "MULTIPLY",
    "decimate": "DIVIDE",
    "outranks": "GT"
};

class Lexer {
    constructor(input) {
        this.input = input;
        this.tokens = [];
        this.current = 0;
        this.line = 1;
        this.col = 1;
    }

    tokenize() {
        while (this.current < this.input.length) {
            let char = this.input[this.current];
            if (char === ' ' || char === '\t' || char === '\r') {
                this.col++;
                this.current++;
                continue;
            }
            if (char === '\n') {
                this.line++;
                this.col = 1;
                this.current++;
                continue;
            }
            if (char === '/' && this.peek() === '/') {
                this.skipComment();
                continue;
            }
            const multiWordToken = this.checkMultiWordKeyword();
            if (multiWordToken) {
                this.tokens.push(multiWordToken);
                continue;
            }
            if (/[a-zA-Z_]/.test(char)) {
                this.tokens.push(this.identifier());
                continue;
            }
            if (/[0-9]/.test(char)) {
                this.tokens.push(this.number());
                continue;
            }
            if (char === '"') {
                this.tokens.push(this.string());
                continue;
            }
            if (char === '=') {
                this.tokens.push({ type: 'ASSIGN', value: '=', line: this.line, col: this.col });
                this.current++;
                this.col++;
                continue;
            }
            if (char === ':') {
                this.tokens.push({ type: 'COLON', value: ':', line: this.line, col: this.col });
                this.current++;
                this.col++;
                continue;
            }
            if (char === ',') {
                this.tokens.push({ type: 'COMMA', value: ',', line: this.line, col: this.col });
                this.current++;
                this.col++;
                continue;
            }
            if (char === '.') {
                this.tokens.push({ type: 'PERIOD', value: '.', line: this.line, col: this.col });
                this.current++;
                this.col++;
                continue;
            }
            if (char === '[') {
                this.tokens.push({ type: 'LEFT_BRACKET', value: '[', line: this.line, col: this.col });
                this.current++;
                this.col++;
                continue;
            }
            if (char === ']') {
                this.tokens.push({ type: 'RIGHT_BRACKET', value: ']', line: this.line, col: this.col });
                this.current++;
                this.col++;
                continue;
            }
            throw new Error(`Unexpected character: ${char} at line ${this.line}:${this.col}`);
        }

        this.tokens.push({ type: 'EOF', value: 'EOF', line: this.line, col: this.col });
        return this.tokens;
    }

    checkMultiWordKeyword() {
        for (const keyword of MULTI_WORD_KEYWORDS) {
            if (this.matchesPhrase(keyword.phrase)) {
                const startCol = this.col;
                this.current += keyword.phrase.length;
                this.col += keyword.phrase.length;
                return { type: keyword.type, value: keyword.phrase, line: this.line, col: startCol };
            }
        }
        return null;
    }

    matchesPhrase(phrase) {
        if (this.current + phrase.length > this.input.length) {
            return false;
        }
        
        const substring = this.input.slice(this.current, this.current + phrase.length);
        if (substring.toLowerCase() !== phrase.toLowerCase()) {
            return false;
        }
        
        const nextChar = this.current + phrase.length < this.input.length ? 
            this.input[this.current + phrase.length] : ' ';
        return !/[a-zA-Z]/.test(nextChar);
    }

    skipComment() {
        while (this.current < this.input.length && this.input[this.current] !== '\n') {
            this.current++;
        }
    }

    identifier() {
        let start = this.current;
        while (this.current < this.input.length && /[a-zA-Z_0-9]/.test(this.input[this.current])) {
            this.current++;
        }

        const text = this.input.slice(start, this.current);
        const keywordType = KEYWORDS[text];
        const operatorType = OPERATORS[text];

        if (keywordType) {
            return { type: keywordType, value: text, line: this.line, col: this.col };
        }

        if (operatorType) {
            return { type: operatorType, value: text, line: this.line, col: this.col };
        }

        return { type: 'IDENTIFIER', value: text, line: this.line, col: this.col };
    }

    number() {
        let start = this.current;
        while (this.current < this.input.length && /[0-9.]/.test(this.input[this.current])) {
            this.current++;
        }
        const value = this.input.slice(start, this.current);
        return { type: 'NUMBER', value: parseFloat(value), line: this.line, col: this.col };
    }

    string() {
        this.current++;
        let start = this.current;
        while (this.current < this.input.length && this.input[this.current] !== '"') {
            this.current++;
        }
        if (this.current === this.input.length) {
            throw new Error(`Unterminated string at line ${this.line}:${this.col}`);
        }

        const value = this.input.slice(start, this.current);
        this.current++;
        return { type: 'STRING', value, line: this.line, col: this.col };
    }
    peek() {
        if (this.current + 1 >= this.input.length) return '\0';
        return this.input[this.current + 1];
    }
}

module.exports = Lexer;