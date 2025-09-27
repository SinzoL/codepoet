---
title: "模块化演进：从 CommonJS 到 ESM"
date: "2025-09-25"
description: "深入解析 JavaScript 模块化的发展历程，从 CommonJS、AMD 到 ES Modules 的演进过程和技术细节"
tags: ["模块化", "CommonJS", "ESM", "AMD", "UMD", "JavaScript"]
---

## 模块化的必要性

### 早期 JavaScript 的问题

**全局污染问题**:
```javascript
// 早期 JavaScript - 全局变量污染
// file1.js
var userName = 'Alice';
var userAge = 25;

function getUserInfo() {
  return userName + ' is ' + userAge + ' years old';
}

// file2.js  
var userName = 'Bob'; // 意外覆盖了 file1.js 中的变量
var calculateAge = function(birthYear) {
  return new Date().getFullYear() - birthYear;
};

// file3.js
console.log(getUserInfo()); // 输出可能不是预期的结果
```

**依赖管理混乱**:
```html
<!-- 手动管理依赖顺序 -->
<script src="jquery.js"></script>
<script src="lodash.js"></script>
<script src="utils.js"></script> <!-- 依赖 jquery 和 lodash -->
<script src="components.js"></script> <!-- 依赖 utils.js -->
<script src="app.js"></script> <!-- 依赖 components.js -->

<!-- 顺序错误会导致运行时错误 -->
```

**命名空间模式的局限**:
```javascript
// 命名空间模式 - 早期解决方案
var MyApp = MyApp || {};

MyApp.Utils = {
  formatDate: function(date) {
    return date.toLocaleDateString();
  },
  
  validateEmail: function(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
};

MyApp.Components = {
  Modal: function(options) {
    // 模态框实现
  },
  
  Tooltip: function(element, text) {
    // 工具提示实现
  }
};

// 问题：仍然污染全局作用域，依赖关系不明确
```

## CommonJS 规范

### Node.js 中的 CommonJS

**基础语法**:
```javascript
// math.js - 导出模块
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

// 导出方式1：逐个导出
exports.add = add;
exports.subtract = subtract;

// 导出方式2：整体导出
module.exports = {
  add,
  subtract,
  multiply
};

// 导出方式3：导出单个函数
module.exports = function(a, b) {
  return a + b;
};
```

**导入和使用**:
```javascript
// app.js - 导入模块
const math = require('./math');
const { add, subtract } = require('./math');
const fs = require('fs'); // 内置模块
const lodash = require('lodash'); // 第三方模块

// 使用导入的模块
console.log(math.add(5, 3)); // 8
console.log(subtract(10, 4)); // 6

// 条件导入
if (process.env.NODE_ENV === 'development') {
  const debug = require('debug');
  debug('Development mode enabled');
}
```

### CommonJS 实现原理

**模块包装函数**:
```javascript
// 原始代码：utils.js
const fs = require('fs');
exports.readFile = function(path) {
  return fs.readFileSync(path, 'utf-8');
};

// Node.js 实际执行时的包装
(function(exports, require, module, __filename, __dirname) {
  const fs = require('fs');
  exports.readFile = function(path) {
    return fs.readFileSync(path, 'utf-8');
  };
})(exports, require, module, __filename, __dirname);

// Node.js 提供的参数：
// exports: 指向 module.exports 的引用
// require: 导入其他模块的函数
// module: 当前模块对象
// __filename: 当前文件的绝对路径
// __dirname: 当前文件所在目录的绝对路径
```

**require 函数底层实现**:
```javascript
// 简化版 require 实现原理
function require(modulePath) {
  // 1. 解析模块路径
  const absolutePath = resolveModulePath(modulePath);
  
  // 2. 检查缓存 - CommonJS 的关键特性
  if (require.cache[absolutePath]) {
    return require.cache[absolutePath].exports;
  }
  
  // 3. 创建模块对象
  const module = {
    id: absolutePath,
    exports: {},        // 初始为空对象
    loaded: false,
    children: [],
    parent: currentModule
  };
  
  // 4. 立即缓存模块 - 处理循环依赖
  require.cache[absolutePath] = module;
  
  // 5. 读取文件内容
  const content = fs.readFileSync(absolutePath, 'utf8');
  
  // 6. 包装模块代码
  const wrapper = `(function(exports, require, module, __filename, __dirname) {
    ${content}
  })`;
  
  // 7. 编译包装函数
  const compiledWrapper = vm.runInThisContext(wrapper, {
    filename: absolutePath
  });
  
  // 8. 执行模块 - 同步执行
  try {
    compiledWrapper.call(
      module.exports,    // this 指向
      module.exports,    // exports 参数
      require,           // require 参数
      module,            // module 参数
      absolutePath,      // __filename 参数
      path.dirname(absolutePath)  // __dirname 参数
    );
  } catch (error) {
    // 执行失败时从缓存中删除
    delete require.cache[absolutePath];
    throw error;
  }
  
  // 9. 标记为已加载
  module.loaded = true;
  
  // 10. 返回 exports 对象 - 值拷贝
  return module.exports;
}

require.cache = {};

// 路径解析实现
function resolveModulePath(modulePath) {
  // 1. 绝对路径直接返回
  if (path.isAbsolute(modulePath)) {
    return modulePath;
  }
  
  // 2. 相对路径解析
  if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
    return path.resolve(path.dirname(currentModule.filename), modulePath);
  }
  
  // 3. 核心模块 (fs, path, http 等)
  if (isCoreModule(modulePath)) {
    return modulePath;
  }
  
  // 4. node_modules 查找
  return resolveNodeModules(modulePath);
}

function resolveNodeModules(moduleName) {
  const paths = [];
  let currentDir = path.dirname(currentModule.filename);
  
  // 向上查找 node_modules
  while (currentDir !== path.dirname(currentDir)) {
    paths.push(path.join(currentDir, 'node_modules', moduleName));
    currentDir = path.dirname(currentDir);
  }
  
  // 全局 node_modules
  paths.push(path.join(process.env.NODE_PATH || '', moduleName));
  
  for (const modulePath of paths) {
    if (fs.existsSync(modulePath)) {
      return modulePath;
    }
  }
  
  throw new Error(`Cannot find module '${moduleName}'`);
}
```

**CommonJS 的运行机制特点**:
```javascript
// 1. 同步加载 - 阻塞执行
console.log('开始加载模块');
const math = require('./math'); // 这里会阻塞，直到模块加载完成
console.log('模块加载完成');

// 2. 运行时解析 - 可以动态 require
function loadModule(condition) {
  if (condition) {
    return require('./module-a');  // 运行时决定加载哪个模块
  } else {
    return require('./module-b');
  }
}

// 3. 值拷贝 - 导出时复制值
// counter.js
let count = 0;
function increment() { count++; }
module.exports = { count, increment };  // 导出时 count 的值被复制

// main.js
const { count, increment } = require('./counter');
console.log(count);  // 0
increment();         // 修改了 counter.js 中的 count
console.log(count);  // 仍然是 0，因为是值拷贝

// 4. 缓存机制 - 模块只执行一次
// 第一次 require 时执行模块代码
const moduleA1 = require('./module-a');  // 执行模块代码
const moduleA2 = require('./module-a');  // 从缓存返回
console.log(moduleA1 === moduleA2);      // true，同一个对象
```

### CommonJS 的特点

**同步加载**:
```javascript
// 同步执行 - 适合服务器端
console.log('开始加载模块');
const math = require('./math'); // 阻塞执行，直到模块加载完成
console.log('模块加载完成');
console.log(math.add(1, 2));

// 运行时加载
function loadMathModule() {
  if (Math.random() > 0.5) {
    return require('./math');
  } else {
    return require('./advanced-math');
  }
}
```

**值拷贝**:
```javascript
// counter.js
let count = 0;

function increment() {
  count++;
}

function getCount() {
  return count;
}

module.exports = {
  count,      // 导出时的值拷贝
  increment,
  getCount
};

// app.js
const counter = require('./counter');

console.log(counter.count); // 0
counter.increment();
console.log(counter.count); // 仍然是 0 (值拷贝)
console.log(counter.getCount()); // 1 (通过函数获取最新值)
```

## AMD (Asynchronous Module Definition)

### RequireJS 实现

**基础语法**:
```javascript
// 定义模块 - math.js
define(['dependency1', 'dependency2'], function(dep1, dep2) {
  function add(a, b) {
    return a + b;
  }
  
  function subtract(a, b) {
    return a - b;
  }
  
  // 返回模块接口
  return {
    add: add,
    subtract: subtract
  };
});

// 无依赖模块
define(function() {
  return {
    PI: 3.14159,
    E: 2.71828
  };
});

// 使用模块
require(['math', 'constants'], function(math, constants) {
  console.log(math.add(5, 3)); // 8
  console.log(constants.PI);   // 3.14159
});
```

**配置和优化**:
```javascript
// requirejs 配置
require.config({
  baseUrl: 'js',
  paths: {
    'jquery': 'lib/jquery-3.6.0.min',
    'lodash': 'lib/lodash.min',
    'backbone': 'lib/backbone.min'
  },
  shim: {
    'backbone': {
      deps: ['jquery', 'lodash'],
      exports: 'Backbone'
    }
  }
});

// 主应用
require(['jquery', 'backbone', 'app/router'], function($, Backbone, Router) {
  $(document).ready(function() {
    const router = new Router();
    Backbone.history.start();
  });
});
```

### AMD 的优势和问题

**优势**:
```javascript
// 1. 异步加载 - 适合浏览器环境
require(['heavy-module'], function(heavyModule) {
  // 模块异步加载，不阻塞页面渲染
  heavyModule.doSomething();
});

// 2. 依赖前置 - 清晰的依赖关系
define(['jquery', 'lodash', 'utils'], function($, _, utils) {
  // 所有依赖都已加载完成
  return {
    init: function() {
      // 可以安全使用所有依赖
    }
  };
});
```

**问题**:
```javascript
// 1. 语法复杂 - 大量回调函数
define(['dep1', 'dep2', 'dep3', 'dep4'], function(dep1, dep2, dep3, dep4) {
  // 嵌套层级深，难以维护
  return function() {
    // 实际模块逻辑
  };
});

// 2. 依赖前置可能导致性能问题
define(['rarely-used-module'], function(rareModule) {
  return {
    commonFunction: function() {
      // 常用功能不需要 rareModule
    },
    
    rareFunction: function() {
      // 只有这里需要 rareModule
      return rareModule.process();
    }
  };
});
```

## UMD (Universal Module Definition)

### 兼容多种模块系统

```javascript
// UMD 模式 - 兼容 CommonJS、AMD 和全局变量
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD 环境
    define(['dependency'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS 环境
    module.exports = factory(require('dependency'));
  } else {
    // 浏览器全局变量
    root.MyLibrary = factory(root.Dependency);
  }
}(typeof self !== 'undefined' ? self : this, function (dependency) {
  
  // 模块实现
  function MyLibrary() {
    // 构造函数
  }
  
  MyLibrary.prototype.method = function() {
    // 方法实现
    return dependency.someMethod();
  };
  
  return MyLibrary;
}));

// 实际使用示例 - jQuery 插件
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('jquery'));
  } else {
    factory(root.jQuery);
  }
}(typeof self !== 'undefined' ? self : this, function ($) {
  
  $.fn.myPlugin = function(options) {
    const settings = $.extend({
      color: 'red',
      fontSize: '12px'
    }, options);
    
    return this.each(function() {
      $(this).css(settings);
    });
  };
  
  return $;
}));
```

## ES Modules (ESM)

### 基础语法

**导出语法**:
```javascript
// math.js - 命名导出
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export const PI = 3.14159;

// 批量导出
function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

export { multiply, divide };

// 重命名导出
function power(base, exponent) {
  return Math.pow(base, exponent);
}

export { power as pow };

// 默认导出
export default function calculator(operation, a, b) {
  switch (operation) {
    case 'add': return add(a, b);
    case 'subtract': return subtract(a, b);
    case 'multiply': return multiply(a, b);
    case 'divide': return divide(a, b);
    default: throw new Error('Unknown operation');
  }
}

// 混合导出
export { default as Calculator } from './calculator';
export * from './constants';
```

**导入语法**:
```javascript
// app.js - 各种导入方式

// 1. 命名导入
import { add, subtract, PI } from './math.js';

// 2. 重命名导入
import { pow as power } from './math.js';

// 3. 默认导入
import calculator from './math.js';

// 4. 混合导入
import calculator, { add, PI } from './math.js';

// 5. 命名空间导入
import * as math from './math.js';

// 6. 仅执行模块 (副作用导入)
import './polyfills.js';

// 7. 动态导入
async function loadMath() {
  const math = await import('./math.js');
  return math.add(5, 3);
}

// 8. 条件导入
if (process.env.NODE_ENV === 'development') {
  import('./debug-tools.js').then(debugTools => {
    debugTools.enableDebugMode();
  });
}
```

### ESM 底层实现原理

ESM 的实现完全不同于 CommonJS，它是**静态的、异步的**，基于更复杂的模块加载机制。

**第一阶段：静态分析（Parse）**:
```javascript
// 原始 ESM 代码
import { readFile } from './utils.js';
import fs from 'fs';

export function processFile(path) {
  return readFile(path).toUpperCase();
}

// 引擎的静态分析结果
const moduleRecord = {
  // 导入声明 - 编译时确定
  imports: [
    { 
      specifier: './utils.js', 
      importedNames: ['readFile'],
      moduleRequest: './utils.js'
    },
    { 
      specifier: 'fs', 
      importedNames: ['default'],
      moduleRequest: 'fs'
    }
  ],
  
  // 导出声明 - 编译时确定
  exports: [
    { 
      exportedName: 'processFile', 
      localName: 'processFile' 
    }
  ],
  
  // 模块代码（去除 import/export 声明）
  code: `
    function processFile(path) {
      return readFile(path).toUpperCase();
    }
  `,
  
  // 模块状态
  status: 'unlinked',  // unlinked -> linking -> linked -> evaluating -> evaluated
  environment: null,   // 模块环境记录
  namespace: null      // 模块命名空间对象
};
```

**第二阶段：模块图构建**:
```javascript
// 模块图构建器
class ModuleGraph {
  constructor() {
    this.modules = new Map();  // URL -> ModuleRecord
    this.loading = new Map();  // 正在加载的模块
  }
  
  async loadModule(specifier, referrer) {
    // 1. 解析模块 URL
    const moduleURL = await this.resolve(specifier, referrer);
    
    // 2. 检查缓存
    if (this.modules.has(moduleURL)) {
      return this.modules.get(moduleURL);
    }
    
    // 3. 检查是否正在加载
    if (this.loading.has(moduleURL)) {
      return await this.loading.get(moduleURL);
    }
    
    // 4. 开始加载模块
    const loadingPromise = this._loadModuleInternal(moduleURL);
    this.loading.set(moduleURL, loadingPromise);
    
    try {
      const moduleRecord = await loadingPromise;
      this.modules.set(moduleURL, moduleRecord);
      return moduleRecord;
    } finally {
      this.loading.delete(moduleURL);
    }
  }
  
  async _loadModuleInternal(moduleURL) {
    // 1. 获取模块源码
    const source = await this.fetchSource(moduleURL);
    
    // 2. 解析模块
    const moduleRecord = this.parseModule(source, moduleURL);
    
    // 3. 递归加载所有依赖
    const importPromises = moduleRecord.imports.map(async (importDecl) => {
      const depModule = await this.loadModule(importDecl.specifier, moduleURL);
      importDecl.module = depModule;  // 建立引用关系
      return depModule;
    });
    
    await Promise.all(importPromises);
    
    return moduleRecord;
  }
  
  parseModule(source, url) {
    // 使用 JavaScript 引擎的解析器
    const ast = parseScript(source, { sourceType: 'module' });
    
    const imports = [];
    const exports = [];
    
    // 遍历 AST 提取 import/export 声明
    traverse(ast, {
      ImportDeclaration(node) {
        imports.push({
          specifier: node.source.value,
          importedNames: node.specifiers.map(spec => spec.imported.name),
          localNames: node.specifiers.map(spec => spec.local.name)
        });
      },
      
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          // export function foo() {}
          exports.push({
            exportedName: node.declaration.id.name,
            localName: node.declaration.id.name
          });
        } else {
          // export { foo, bar }
          node.specifiers.forEach(spec => {
            exports.push({
              exportedName: spec.exported.name,
              localName: spec.local.name
            });
          });
        }
      }
    });
    
    return {
      url,
      imports,
      exports,
      code: source,
      status: 'unlinked',
      environment: null,
      namespace: null
    };
  }
}
```

**第三阶段：模块链接（Linking）**:
```javascript
// 模块链接器 - 建立实时绑定
class ModuleLinker {
  linkModules(moduleGraph) {
    // 1. 为所有模块创建环境记录
    for (const [url, module] of moduleGraph.modules) {
      if (module.status === 'unlinked') {
        module.environment = this.createModuleEnvironment(module);
        module.status = 'linking';
      }
    }
    
    // 2. 解析所有导入/导出绑定
    for (const [url, module] of moduleGraph.modules) {
      if (module.status === 'linking') {
        this.resolveImportBindings(module);
        module.status = 'linked';
      }
    }
  }
  
  createModuleEnvironment(module) {
    // 创建模块环境记录
    const environment = new Map();
    
    // 为每个导出创建绑定
    for (const exportDecl of module.exports) {
      environment.set(exportDecl.localName, {
        type: 'mutable',
        value: undefined,
        initialized: false
      });
    }
    
    // 为每个导入创建绑定
    for (const importDecl of module.imports) {
      for (let i = 0; i < importDecl.importedNames.length; i++) {
        const localName = importDecl.localNames[i];
        const importedName = importDecl.importedNames[i];
        
        // 创建实时绑定 - ESM 的核心特性
        environment.set(localName, this.createLiveBinding(
          importDecl.module, 
          importedName
        ));
      }
    }
    
    return environment;
  }
  
  createLiveBinding(targetModule, exportName) {
    // ESM 的关键特性：实时绑定（Live Binding）
    return {
      type: 'immutable',
      get value() {
        const targetEnv = targetModule.environment;
        const binding = targetEnv.get(exportName);
        
        if (!binding.initialized) {
          throw new ReferenceError(`Cannot access '${exportName}' before initialization`);
        }
        
        return binding.value;
      },
      set value(newValue) {
        throw new TypeError('Assignment to constant variable.');
      }
    };
  }
  
  resolveImportBindings(module) {
    // 解析导入绑定，建立模块间的连接
    for (const importDecl of module.imports) {
      const targetModule = importDecl.module;
      
      // 确保目标模块已经链接
      if (targetModule.status === 'unlinked') {
        this.linkModule(targetModule);
      }
      
      // 验证导入的绑定是否存在
      for (const importedName of importDecl.importedNames) {
        if (!targetModule.environment.has(importedName)) {
          throw new SyntaxError(
            `The requested module '${targetModule.url}' does not provide an export named '${importedName}'`
          );
        }
      }
    }
  }
}
```

**第四阶段：模块执行**:
```javascript
// 模块执行器
class ModuleExecutor {
  async executeModule(module) {
    if (module.status === 'evaluated') {
      return module.namespace;
    }
    
    if (module.status === 'evaluating') {
      // 循环依赖检测
      throw new Error('Circular dependency detected');
    }
    
    module.status = 'evaluating';
    
    try {
      // 1. 先执行所有依赖模块
      for (const importDecl of module.imports) {
        await this.executeModule(importDecl.module);
      }
      
      // 2. 执行当前模块代码
      await this.evaluateModuleCode(module);
      
      // 3. 创建模块命名空间对象
      module.namespace = this.createNamespaceObject(module);
      
      module.status = 'evaluated';
      return module.namespace;
      
    } catch (error) {
      module.status = 'error';
      throw error;
    }
  }
  
  async evaluateModuleCode(module) {
    // 创建模块执行上下文
    const moduleFunction = new AsyncFunction(
      'import', 'export', 'module',
      this.transformModuleCode(module.code)
    );
    
    // 提供运行时支持
    const importMeta = {
      url: module.url,
      resolve: (specifier) => this.resolve(specifier, module.url)
    };
    
    const exportHelper = {
      set: (name, value) => {
        const binding = module.environment.get(name);
        binding.value = value;
        binding.initialized = true;
      }
    };
    
    // 执行模块代码
    await moduleFunction.call(
      undefined,  // this 值为 undefined
      importMeta,
      exportHelper,
      module
    );
  }
  
  createNamespaceObject(module) {
    // 创建模块命名空间对象
    const namespace = Object.create(null);
    
    // 添加所有导出
    for (const exportDecl of module.exports) {
      Object.defineProperty(namespace, exportDecl.exportedName, {
        get() {
          const binding = module.environment.get(exportDecl.localName);
          return binding.value;
        },
        enumerable: true,
        configurable: false
      });
    }
    
    // 添加 Symbol.toStringTag
    Object.defineProperty(namespace, Symbol.toStringTag, {
      value: 'Module',
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    return namespace;
  }
}
```

### ESM 的特点

**1. 静态分析**:
```javascript
// ✅ 静态导入 - 编译时确定，可以被工具分析
import { usedFunction } from './utils.js';

// ❌ 动态导入 - 运行时确定，难以静态分析
const moduleName = './utils.js';
import(moduleName).then(module => {
  // 运行时才知道导入了什么
});

// Tree Shaking 的基础
// utils.js
export function usedFunction() {
  return 'This will be included';
}

export function unusedFunction() {
  return 'This will be removed by tree shaking';
}

// app.js
import { usedFunction } from './utils.js';
// 构建工具可以静态分析出 unusedFunction 未被使用，将其移除
```

**2. 实时绑定 (Live Binding)**:
```javascript
// counter.js
export let count = 0;

export function increment() {
  count++;
}

// app.js
import { count, increment } from './counter.js';

console.log(count); // 0
increment();        // 修改 counter.js 中的 count
console.log(count); // 1 - 实时绑定，值会同步更新！

// 对比 CommonJS 的值拷贝
// CommonJS 中这里仍然会是 0

// 注意：导入的绑定是只读的
// count++; // TypeError: Assignment to constant variable
```

**3. 异步加载和执行**:
```javascript
// ESM 的异步特性
async function loadAndUseModule() {
  // 动态导入返回 Promise
  const mathModule = await import('./math.js');
  return mathModule.add(1, 2);
}

// 顶层 await (Top-level await)
const config = await import('./config.js');
const data = await fetch(config.apiUrl);

// 这在 CommonJS 中是不可能的
```

**4. 循环依赖处理**:
```javascript
// a.js
import { b } from './b.js';
export const a = 'a';
console.log('a.js:', b);

// b.js  
import { a } from './a.js';
export const b = 'b';
console.log('b.js:', a);

// main.js
import './a.js';

// ESM 处理循环依赖的完整流程：
// 1. 解析阶段：构建模块图，发现循环依赖
// 2. 链接阶段：创建所有绑定，但不初始化值
// 3. 执行阶段：按依赖顺序执行，实时绑定确保正确性

// 输出：
// b.js: undefined (a 的绑定存在但未初始化)
// a.js: b (b 已经初始化)
```

**5. 严格模式和作用域**:
```javascript
// ESM 自动启用严格模式
// 'use strict'; // 不需要显式声明

// 顶层 this 为 undefined
console.log(this); // undefined (不是 global/window)

// 块级作用域
if (true) {
  const blockScoped = 'only available in this block';
}
// console.log(blockScoped); // ReferenceError
```

## 模块系统对比

### 加载机制对比

```javascript
// CommonJS - 同步加载，值拷贝
const fs = require('fs');
const content = fs.readFileSync('./file.txt', 'utf8'); // 阻塞

// ESM - 异步加载，活绑定
import fs from 'fs/promises';
const content = await fs.readFile('./file.txt', 'utf8'); // 非阻塞

// 动态导入对比
// CommonJS
function loadModule(name) {
  return require(name); // 同步
}

// ESM
async function loadModule(name) {
  return await import(name); // 异步
}
```

### 性能对比

```javascript
// Tree Shaking 效果对比

// CommonJS - 整个模块都会被包含
const _ = require('lodash');
const result = _.debounce(fn, 300); // 整个 lodash 都被打包

// ESM - 只包含使用的部分
import { debounce } from 'lodash-es';
const result = debounce(fn, 300); // 只打包 debounce 相关代码

// 代码分割
// CommonJS - 难以实现代码分割
const heavyModule = require('./heavy-module');

// ESM - 天然支持代码分割
const heavyModule = await import('./heavy-module');
```

### 兼容性处理

**在 Node.js 中使用 ESM**:
```json
// package.json
{
  "type": "module",
  "main": "index.js",
  "exports": {
    ".": {
      "import": "./index.js",
      "require": "./index.cjs"
    }
  }
}
```

```javascript
// 混合使用 CommonJS 和 ESM
// index.js (ESM)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 导入 CommonJS 模块
const commonjsModule = require('./commonjs-module');

// 导入 ESM 模块
import { esmFunction } from './esm-module.js';

// 获取 __dirname 和 __filename 等价物
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

**Babel 转换**:
```javascript
// 源代码 (ESM)
import { add } from './math.js';
export default function calculator() {
  return add(1, 2);
}

// Babel 转换后 (CommonJS)
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = calculator;

var _math = require("./math.js");

function calculator() {
  return (0, _math.add)(1, 2);
}
```

## 现代模块化最佳实践

### 模块设计原则

```javascript
// 1. 单一职责原则
// ❌ 职责混乱
export function validateEmail(email) { /* ... */ }
export function sendEmail(to, subject, body) { /* ... */ }
export function formatDate(date) { /* ... */ }

// ✅ 职责清晰
// validation.js
export function validateEmail(email) { /* ... */ }
export function validatePhone(phone) { /* ... */ }

// email.js  
export function sendEmail(to, subject, body) { /* ... */ }
export function parseEmail(raw) { /* ... */ }

// date-utils.js
export function formatDate(date) { /* ... */ }
export function parseDate(str) { /* ... */ }

// 2. 接口稳定性
// ✅ 稳定的公共接口
export class ApiClient {
  constructor(config) {
    this._config = config;
    this._cache = new Map();
  }
  
  // 公共方法 - 稳定接口
  async get(endpoint) {
    return this._request('GET', endpoint);
  }
  
  async post(endpoint, data) {
    return this._request('POST', endpoint, data);
  }
  
  // 私有方法 - 内部实现
  _request(method, endpoint, data) {
    // 实现细节可以改变
  }
}

// 3. 依赖注入
// ✅ 依赖注入，便于测试
export class UserService {
  constructor(apiClient, cache) {
    this.api = apiClient;
    this.cache = cache;
  }
  
  async getUser(id) {
    const cached = this.cache.get(`user:${id}`);
    if (cached) return cached;
    
    const user = await this.api.get(`/users/${id}`);
    this.cache.set(`user:${id}`, user);
    return user;
  }
}

// 工厂函数
export function createUserService(config) {
  const apiClient = new ApiClient(config.api);
  const cache = new Map();
  return new UserService(apiClient, cache);
}
```

### 模块组织策略

```javascript
// 项目结构示例
/*
src/
├── modules/
│   ├── auth/
│   │   ├── index.js          // 模块入口
│   │   ├── auth-service.js   // 核心服务
│   │   ├── auth-utils.js     // 工具函数
│   │   └── types.js          // 类型定义
│   ├── user/
│   │   ├── index.js
│   │   ├── user-service.js
│   │   └── user-model.js
│   └── shared/
│       ├── api/
│       ├── utils/
│       └── constants/
├── components/
├── pages/
└── app.js
*/

// modules/auth/index.js - 模块入口
export { AuthService } from './auth-service.js';
export { validateToken, hashPassword } from './auth-utils.js';
export * from './types.js';

// 重新导出，提供统一接口
export { default as AuthService } from './auth-service.js';

// modules/auth/auth-service.js
import { ApiClient } from '../shared/api/index.js';
import { validateToken } from './auth-utils.js';

export class AuthService {
  constructor(apiClient) {
    this.api = apiClient;
  }
  
  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }
  
  async validateSession(token) {
    return validateToken(token);
  }
}

export default AuthService;

// app.js - 应用入口
import { AuthService } from './modules/auth/index.js';
import { UserService } from './modules/user/index.js';
import { ApiClient } from './modules/shared/api/index.js';

// 依赖注入和服务组装
const apiClient = new ApiClient({
  baseURL: process.env.API_BASE_URL
});

const authService = new AuthService(apiClient);
const userService = new UserService(apiClient);

export { authService, userService };
```

### 性能优化策略

```javascript
// 1. 懒加载
class FeatureManager {
  constructor() {
    this._features = new Map();
  }
  
  async loadFeature(name) {
    if (this._features.has(name)) {
      return this._features.get(name);
    }
    
    // 动态导入，按需加载
    const module = await import(`./features/${name}.js`);
    const feature = new module.default();
    
    this._features.set(name, feature);
    return feature;
  }
}

// 2. 代码分割
// 路由级别的代码分割
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard.js')
  },
  {
    path: '/profile',
    component: () => import('./pages/Profile.js')
  }
];

// 3. 预加载
class ModulePreloader {
  constructor() {
    this.preloadPromises = new Map();
  }
  
  preload(modulePath) {
    if (!this.preloadPromises.has(modulePath)) {
      const promise = import(modulePath);
      this.preloadPromises.set(modulePath, promise);
    }
    return this.preloadPromises.get(modulePath);
  }
  
  async getModule(modulePath) {
    // 如果已经预加载，直接返回
    if (this.preloadPromises.has(modulePath)) {
      return await this.preloadPromises.get(modulePath);
    }
    
    // 否则立即加载
    return await import(modulePath);
  }
}

// 使用示例
const preloader = new ModulePreloader();

// 在用户可能需要之前预加载
document.addEventListener('mouseover', (e) => {
  if (e.target.matches('[data-preload]')) {
    const modulePath = e.target.dataset.preload;
    preloader.preload(modulePath);
  }
});
```

## 总结

### 模块化发展历程

**演进路径**:
1. **全局变量** → **命名空间** → **IIFE**
2. **CommonJS** (Node.js 服务端)
3. **AMD** (浏览器异步加载)
4. **UMD** (通用兼容)
5. **ES Modules** (标准化解决方案)

### 技术选择建议

**现代项目推荐**:
- **优先使用 ESM**: 标准化、工具支持好、性能优势
- **Node.js 项目**: 逐步迁移到 ESM，注意兼容性
- **库开发**: 提供 ESM 和 CommonJS 双版本
- **构建工具**: 利用 Tree Shaking 和代码分割优化

### 最佳实践总结

1. **模块设计**: 单一职责、稳定接口、合理依赖
2. **性能优化**: 懒加载、代码分割、预加载策略
3. **兼容性**: 渐进式迁移、工具链支持
4. **团队协作**: 统一规范、文档完善、测试覆盖

模块化是现代 JavaScript 开发的基础，理解其演进历程和技术细节对于构建可维护的大型应用至关重要。