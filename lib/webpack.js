const fs = require ('fs');
const path = require ('path');
const parser = require ('@babel/parser');
const traverse = require ('@babel/traverse').default;

const {transformFromAst} = require ('@babel/core');

module.exports = class Webpack {
  constructor (options) {
    const {entry, output} = options;
    this.$entry = entry;
    this.$output = output;
    this.modules = [];
  }
  run () {
    // 开始分析入口模块的内容
    const info = this.parse (this.$entry);
    // console.log ('info', info);
    this.modules.push (info);
    //递归分析其他的模块
    for (let i = 0; i < this.modules.length; i++) {
      const item = this.modules[i];
      const {dependencies} = item;
      if (dependencies) {
        for (let j in dependencies) {
          this.modules.push (this.parse (dependencies[j]));
        }
      }
    }

    const obj = {};
    this.modules.forEach (item => {
      obj[item.entryFile] = {
        dependencies: item.dependencies,
        code: item.code,
      };
    });
    /*   console.log('modules',this.modules);
    console.log('obj',obj); */
    this.file (obj);
  }
  require (module) {
    function reRequire (relativePath) {
      return require (graph[module].dependencies[relativePath]);
    }
    var exports = {};
    (function (require, exports, code) {
      eval (code);
    }) (reRequire, exports, graph[module].code);
    return exports;
  }
  file (code) {
    //创建自运行函数，处理require,module,exports
    //生成main.js = >dist/main.js
    const filePath = path.join (this.$output.path, this.$output.filename);
    // console.log(filePath);
    //require("./a.js")
    const {require} = this;
    // this.entry = "./src/index.js"
    const newCode = JSON.stringify (code);
    const bundle = `(function(graph){
        ${require}('${this.$entry}')
    })(${newCode})`;
    fs.writeFileSync (filePath, bundle, 'utf-8');
  }
  parse (entryFile) {
    const content = fs.readFileSync (entryFile, 'utf-8');
    const ast = parser.parse (content, {
      sourceType: 'module',
    });
    const dependencies = {};
    traverse (ast, {
      ImportDeclaration({node}) {
        const newPathName =
          './' + path.join (path.dirname (entryFile), node.source.value);
        dependencies[node.source.value] = newPathName;
      },
    });
    const {code} = transformFromAst (ast, null, {
      presets: ['@babel/preset-env'],
    });
    return {
      entryFile,
      dependencies,
      code,
    };
  }
};
