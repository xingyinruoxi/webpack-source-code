const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const { transformFromAst } = require("@babel/core");

module.exports = class Webpack {
    constructor(options) {
        const { entry, output } = options;
        this.$entry = entry;
        this.$output = output;
    }
    run() {
        const content = fs.readFileSync(this.$entry, "utf-8");
        console.log("content", content);
        const ast = parser.parse(content, {
            sourceType: "module",
        });
        console.log("ast", ast);
    }
};