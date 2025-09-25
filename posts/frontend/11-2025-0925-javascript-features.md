---
title: "JavaScript 语言特性与 ES6+ 新特性详解"
date: "2025-09-25"
description: "深入解析 JavaScript 核心语言特性和 ES6+ 新特性，包括作用域、闭包、原型链、异步编程等核心概念"
tags: ["JavaScript", "ES6", "闭包", "原型链", "异步编程", "语言特性"]
---

# JavaScript 语言特性与 ES6+ 新特性详解

## JavaScript 核心特性

### 作用域与闭包

**作用域链机制**:
```javascript
// 全局作用域
var globalVar = 'global';

function outerFunction(outerParam) {
  // 函数作用域
  var outerVar = 'outer';
  
  function innerFunction(innerParam) {
    // 内部函数作用域
    var innerVar = 'inner';
    
    // 作用域链查找顺序：
    // 1. innerFunction 作用域: innerVar, innerParam
    // 2. outerFunction 作用域: outerVar, outerParam  
    // 3. 全局作用域: globalVar
    
    console.log(innerVar);   // 'inner' - 当前作用域
    console.log(innerParam); // 传入的参数
    console.log(outerVar);   // 'outer' - 父作用域
    console.log(outerParam); // 传入的参数
    console.log(globalVar);  // 'global' - 全局作用域
  }
  
  return innerFunction;
}

const inner = outerFunction('outer param');
inner('inner param');
```

**闭包的实际应用**:
```javascript
// 1. 模块模式 - 创建私有变量
const CounterModule = (function() {
  let count = 0; // 私有变量
  
  return {
    increment() {
      count++;
      return count;
    },
    
    decrement() {
      count--;
      return count;
    },
    
    getCount() {
      return count;
    },
    
    reset() {
      count = 0;
      return count;
    }
  };
})();

console.log(CounterModule.getCount()); // 0
console.log(CounterModule.increment()); // 1
console.log(CounterModule.increment()); // 2
// count 变量无法直接访问，实现了封装

// 2. 函数工厂 - 创建特定功能的函数
function createMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// 3. 缓存函数 - 利用闭包缓存计算结果
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('从缓存获取结果');
      return cache.get(key);
    }
    
    console.log('计算新结果');
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 斐波那契数列 - 递归优化
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(10)); // 计算新结果
console.log(fibonacci(10)); // 从缓存获取结果

// 4. 事件处理器 - 保持状态
function createButtonHandler(name) {
  let clickCount = 0;
  
  return function(event) {
    clickCount++;
    console.log(`${name} 按钮被点击了 ${clickCount} 次`);
    
    // 可以访问外部变量和参数
    if (clickCount >= 5) {
      console.log(`${name} 按钮点击次数过多，禁用中...`);
      event.target.disabled = true;
    }
  };
}

// 使用
document.getElementById('btn1').addEventListener('click', createButtonHandler('按钮1'));
document.getElementById('btn2').addEventListener('click', createButtonHandler('按钮2'));
```

### 原型链与继承

**原型链机制**:
```javascript
// 构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// 原型方法
Person.prototype.sayHello = function() {
  return `Hello, I'm ${this.name}`;
};

Person.prototype.getAge = function() {
  return this.age;
};

// 创建实例
const person1 = new Person('Alice', 25);
const person2 = new Person('Bob', 30);

console.log(person1.sayHello()); // "Hello, I'm Alice"
console.log(person2.sayHello()); // "Hello, I'm Bob"

// 原型链查找过程：
// person1.sayHello() 
// 1. 在 person1 实例上查找 sayHello - 未找到
// 2. 在 Person.prototype 上查找 sayHello - 找到并执行
// 3. 如果还未找到，继续在 Object.prototype 上查找
// 4. 最终到达 null

console.log(person1.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true
```

**继承的多种实现方式**:
```javascript
// 1. 原型链继承
function Animal(name) {
  this.name = name;
  this.colors = ['red', 'blue'];
}

Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

function Dog(name, breed) {
  this.breed = breed;
}

// 设置原型链
Dog.prototype = new Animal();
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  return `${this.name} barks`;
};

const dog1 = new Dog('Buddy', 'Golden Retriever');
// 问题：所有实例共享引用类型属性

// 2. 构造函数继承 (借用构造函数)
function Cat(name, breed) {
  Animal.call(this, name); // 借用父构造函数
  this.breed = breed;
}

// 问题：无法继承原型方法

// 3. 组合继承 (推荐)
function Bird(name, canFly) {
  Animal.call(this, name); // 继承实例属性
  this.canFly = canFly;
}

Bird.prototype = new Animal(); // 继承原型方法
Bird.prototype.constructor = Bird;

Bird.prototype.fly = function() {
  return this.canFly ? `${this.name} is flying` : `${this.name} cannot fly`;
};

// 4. 寄生组合继承 (最优解)
function inheritPrototype(child, parent) {
  const prototype = Object.create(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}

function Fish(name, waterType) {
  Animal.call(this, name);
  this.waterType = waterType;
}

inheritPrototype(Fish, Animal);

Fish.prototype.swim = function() {
  return `${this.name} is swimming in ${this.waterType} water`;
};

// 5. ES6 Class 继承 (语法糖)
class ModernAnimal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    return `${this.name} makes a sound`;
  }
}

class ModernDog extends ModernAnimal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }
  
  bark() {
    return `${this.name} barks`;
  }
  
  // 方法重写
  speak() {
    return `${super.speak()} - Woof!`;
  }
}

const modernDog = new ModernDog('Max', 'Labrador');
console.log(modernDog.speak()); // "Max makes a sound - Woof!"
```

### this 绑定机制

**this 绑定规则**:
```javascript
// 1. 默认绑定 - 严格模式下为 undefined，非严格模式下为全局对象
function defaultBinding() {
  console.log(this); // 浏览器中为 window，Node.js 中为 global
}

defaultBinding();

// 2. 隐式绑定 - 调用位置有上下文对象
const obj = {
  name: 'Object',
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

obj.greet(); // "Hello, Object" - this 指向 obj

// 隐式绑定丢失
const greetFunc = obj.greet;
greetFunc(); // "Hello, undefined" - this 指向全局对象

// 3. 显式绑定 - call, apply, bind
function introduce(age, city) {
  console.log(`I'm ${this.name}, ${age} years old, from ${city}`);
}

const person = { name: 'Alice' };

// call - 立即执行，参数列表
introduce.call(person, 25, 'Beijing');

// apply - 立即执行，参数数组
introduce.apply(person, [25, 'Beijing']);

// bind - 返回新函数，预设 this 和参数
const boundIntroduce = introduce.bind(person, 25);
boundIntroduce('Shanghai');

// 4. new 绑定 - 构造函数调用
function Constructor(name) {
  this.name = name;
  // 隐式返回 this
}

const instance = new Constructor('Instance');
console.log(instance.name); // "Instance"

// 5. 箭头函数 - 词法作用域绑定
const arrowObj = {
  name: 'Arrow Object',
  
  regularMethod() {
    console.log('Regular:', this.name);
    
    // 普通函数 - this 指向调用者
    setTimeout(function() {
      console.log('Timeout Regular:', this.name); // undefined
    }, 100);
    
    // 箭头函数 - this 继承外层作用域
    setTimeout(() => {
      console.log('Timeout Arrow:', this.name); // "Arrow Object"
    }, 100);
  }
};

arrowObj.regularMethod();
```

## ES6+ 新特性详解

### let, const 与块级作用域

**变量声明对比**:
```javascript
// var - 函数作用域，存在变量提升
console.log(varVariable); // undefined (不是报错)
var varVariable = 'var value';

function varExample() {
  if (true) {
    var innerVar = 'inner';
  }
  console.log(innerVar); // 'inner' - var 没有块级作用域
}

// let - 块级作用域，暂时性死区
// console.log(letVariable); // ReferenceError: Cannot access before initialization
let letVariable = 'let value';

function letExample() {
  if (true) {
    let innerLet = 'inner let';
  }
  // console.log(innerLet); // ReferenceError: innerLet is not defined
}

// const - 块级作用域，必须初始化，不可重新赋值
const constValue = 'const value';
// constValue = 'new value'; // TypeError: Assignment to constant variable

// const 对象的属性可以修改
const constObj = { name: 'Alice' };
constObj.name = 'Bob'; // 允许
constObj.age = 25;     // 允许
// constObj = {}; // TypeError: Assignment to constant variable

// 暂时性死区示例
let x = 'outer';
function temporalDeadZone() {
  // console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 'inner'; // 这里的 let 声明创建了暂时性死区
  console.log(x); // 'inner'
}
```

**块级作用域的实际应用**:
```javascript
// 1. 循环中的闭包问题
// var 版本 - 经典问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log('var:', i); // 输出三次 3
  }, 100);
}

// let 版本 - 解决方案
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log('let:', i); // 输出 0, 1, 2
  }, 100);
}

// 2. 模块化开发
{
  // 块级作用域创建模块
  const API_URL = 'https://api.example.com';
  const cache = new Map();
  
  function fetchData(endpoint) {
    if (cache.has(endpoint)) {
      return Promise.resolve(cache.get(endpoint));
    }
    
    return fetch(`${API_URL}/${endpoint}`)
      .then(response => response.json())
      .then(data => {
        cache.set(endpoint, data);
        return data;
      });
  }
  
  // 只暴露需要的接口
  window.dataService = { fetchData };
}
// API_URL 和 cache 在此处不可访问
```

### 箭头函数

**箭头函数特性**:
```javascript
// 1. 语法简化
const numbers = [1, 2, 3, 4, 5];

// 传统函数
const doubled1 = numbers.map(function(n) {
  return n * 2;
});

// 箭头函数
const doubled2 = numbers.map(n => n * 2);

// 多参数
const add = (a, b) => a + b;

// 多行函数体
const processUser = user => {
  const processed = {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    isAdult: user.age >= 18
  };
  return processed;
};

// 2. this 绑定差异
class EventHandler {
  constructor() {
    this.count = 0;
  }
  
  // 传统方法 - this 需要绑定
  traditionalHandler() {
    document.addEventListener('click', function() {
      this.count++; // this 指向 document 或 undefined
      console.log(this.count);
    }.bind(this)); // 需要显式绑定
  }
  
  // 箭头函数 - 自动绑定 this
  arrowHandler() {
    document.addEventListener('click', () => {
      this.count++; // this 指向 EventHandler 实例
      console.log(this.count);
    });
  }
}

// 3. 不能用作构造函数
const ArrowConstructor = () => {};
// new ArrowConstructor(); // TypeError: ArrowConstructor is not a constructor

// 4. 没有 arguments 对象
function regularFunction() {
  console.log(arguments); // Arguments 对象
}

const arrowFunction = () => {
  // console.log(arguments); // ReferenceError: arguments is not defined
  console.log(...arguments); // 可以使用剩余参数
};

// 5. 实际应用场景
class DataProcessor {
  constructor(data) {
    this.data = data;
    this.processed = [];
  }
  
  // 数据处理管道
  process() {
    return this.data
      .filter(item => item.active)           // 过滤活跃项
      .map(item => ({ ...item, processed: true })) // 标记处理状态
      .sort((a, b) => a.priority - b.priority)     // 按优先级排序
      .forEach(item => this.processed.push(item)); // 添加到处理列表
  }
  
  // 异步处理
  async processAsync() {
    const promises = this.data.map(async item => {
      const result = await this.processItem(item);
      return { ...item, result };
    });
    
    return Promise.all(promises);
  }
  
  async processItem(item) {
    // 模拟异步处理
    return new Promise(resolve => {
      setTimeout(() => resolve(item.value * 2), 100);
    });
  }
}
```

### 解构赋值

**数组解构**:
```javascript
// 基础数组解构
const colors = ['red', 'green', 'blue', 'yellow'];

const [first, second] = colors;
console.log(first, second); // 'red', 'green'

// 跳过元素
const [, , third] = colors;
console.log(third); // 'blue'

// 剩余元素
const [primary, ...others] = colors;
console.log(primary); // 'red'
console.log(others);  // ['green', 'blue', 'yellow']

// 默认值
const [a, b, c, d, e = 'default'] = colors;
console.log(e); // 'yellow' (不是 'default')

const [x, y, z, w, v = 'default'] = ['1', '2'];
console.log(v); // 'default'

// 交换变量
let num1 = 10, num2 = 20;
[num1, num2] = [num2, num1];
console.log(num1, num2); // 20, 10

// 函数返回多个值
function getCoordinates() {
  return [100, 200];
}

const [x1, y1] = getCoordinates();
```

**对象解构**:
```javascript
// 基础对象解构
const user = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  address: {
    city: 'Beijing',
    country: 'China'
  }
};

const { name, email } = user;
console.log(name, email); // 'Alice', 'alice@example.com'

// 重命名变量
const { name: userName, email: userEmail } = user;
console.log(userName, userEmail);

// 默认值
const { age = 25, status = 'active' } = user;
console.log(age, status); // 25, 'active'

// 嵌套解构
const { address: { city, country } } = user;
console.log(city, country); // 'Beijing', 'China'

// 剩余属性
const { id, ...userInfo } = user;
console.log(userInfo); // { name: 'Alice', email: '...', address: {...} }

// 函数参数解构
function processUser({ name, age = 18, email }) {
  console.log(`Processing ${name}, age ${age}, email ${email}`);
}

processUser({ name: 'Bob', email: 'bob@example.com' });

// 复杂解构示例
const response = {
  data: {
    users: [
      { id: 1, name: 'Alice', roles: ['admin', 'user'] },
      { id: 2, name: 'Bob', roles: ['user'] }
    ],
    pagination: {
      page: 1,
      total: 2,
      hasNext: false
    }
  },
  status: 'success'
};

const {
  data: {
    users: [firstUser, ...otherUsers],
    pagination: { page, total }
  },
  status
} = response;

console.log(firstUser); // { id: 1, name: 'Alice', roles: [...] }
console.log(page, total); // 1, 2
```

### 模板字符串

**基础用法和高级特性**:
```javascript
// 基础模板字符串
const name = 'Alice';
const age = 25;
const greeting = `Hello, my name is ${name} and I'm ${age} years old.`;

// 多行字符串
const multiLine = `
  This is a multi-line string.
  It preserves line breaks and indentation.
  Very useful for HTML templates.
`;

// 表达式计算
const a = 10, b = 20;
const result = `The sum of ${a} and ${b} is ${a + b}`;

// 函数调用
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

const price = `Price: ${formatCurrency(99.99)}`;

// 嵌套模板字符串
const users = ['Alice', 'Bob', 'Charlie'];
const userList = `
  <ul>
    ${users.map(user => `<li>${user}</li>`).join('')}
  </ul>
`;

// 标签模板字符串
function highlight(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] ? `<mark>${values[i]}</mark>` : '';
    return result + string + value;
  }, '');
}

const searchTerm = 'JavaScript';
const text = highlight`Learn ${searchTerm} programming with ease!`;
// 结果: "Learn <mark>JavaScript</mark> programming with ease!"

// 实际应用 - SQL 查询构建器
function sql(strings, ...values) {
  // 简单的 SQL 注入防护
  const escapedValues = values.map(value => {
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  });
  
  return strings.reduce((query, string, i) => {
    const value = escapedValues[i] || '';
    return query + string + value;
  }, '');
}

const userId = 123;
const userName = "O'Connor";
const query = sql`
  SELECT * FROM users 
  WHERE id = ${userId} 
  AND name = ${userName}
`;
// 生成安全的 SQL 查询

// HTML 模板引擎
class TemplateEngine {
  static render(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || '';
    });
  }
  
  static renderAdvanced(strings, ...expressions) {
    return strings.reduce((result, string, i) => {
      let value = expressions[i];
      
      if (Array.isArray(value)) {
        value = value.join('');
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      } else if (value === undefined || value === null) {
        value = '';
      }
      
      return result + string + value;
    }, '');
  }
}

// 使用示例
const templateData = { title: 'Welcome', content: 'Hello World' };
const htmlTemplate = '<h1>{{title}}</h1><p>{{content}}</p>';
const rendered = TemplateEngine.render(htmlTemplate, templateData);
```

### 展开运算符与剩余参数

**数组操作**:
```javascript
// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// 合并数组
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// 复制数组 (浅拷贝)
const copied = [...arr1]; // [1, 2, 3]

// 在数组中插入元素
const inserted = [...arr1, 'new', ...arr2]; // [1, 2, 3, 'new', 4, 5, 6]

// 转换类数组对象
const nodeList = document.querySelectorAll('div');
const nodeArray = [...nodeList];

// 字符串转数组
const chars = [...'hello']; // ['h', 'e', 'l', 'l', 'o']

// 数组去重
const duplicates = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(duplicates)]; // [1, 2, 3, 4]

// 找到数组最大值
const numbers = [1, 5, 3, 9, 2];
const max = Math.max(...numbers); // 9
```

**对象操作**:
```javascript
// 对象展开
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };

// 合并对象
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3, d: 4 }

// 覆盖属性
const updated = { ...obj1, b: 'updated', e: 5 }; // { a: 1, b: 'updated', e: 5 }

// 复制对象 (浅拷贝)
const copied = { ...obj1 };

// 条件属性
const includeOptional = true;
const conditional = {
  required: 'value',
  ...(includeOptional && { optional: 'optional value' })
};

// 移除属性
const { b, ...withoutB } = obj1; // withoutB = { a: 1 }

// 实际应用 - 状态更新
class StateManager {
  constructor(initialState = {}) {
    this.state = initialState;
  }
  
  setState(updates) {
    this.state = {
      ...this.state,
      ...updates
    };
  }
  
  updateNestedState(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    let target = this.state;
    const newState = { ...this.state };
    let current = newState;
    
    // 深度复制路径
    for (const key of keys) {
      current[key] = { ...current[key] };
      current = current[key];
    }
    
    current[lastKey] = value;
    this.state = newState;
  }
}
```

**剩余参数**:
```javascript
// 函数剩余参数
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4, 5)); // 15

// 与普通参数结合
function greet(greeting, ...names) {
  return `${greeting} ${names.join(', ')}!`;
}

console.log(greet('Hello', 'Alice', 'Bob', 'Charlie')); // "Hello Alice, Bob, Charlie!"

// 数组解构中的剩余元素
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(rest);  // [2, 3, 4, 5]

// 对象解构中的剩余属性
const user = { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 };
const { id, ...userInfo } = user;
console.log(userInfo); // { name: 'Alice', email: 'alice@example.com', age: 25 }

// 实际应用 - 高阶函数
function createLogger(prefix, ...defaultTags) {
  return function log(message, ...additionalTags) {
    const allTags = [...defaultTags, ...additionalTags];
    const tagString = allTags.length > 0 ? `[${allTags.join(', ')}]` : '';
    console.log(`${prefix} ${tagString} ${message}`);
  };
}

const apiLogger = createLogger('[API]', 'request', 'response');
apiLogger('User data fetched', 'success'); // [API] [request, response, success] User data fetched
```

## 异步编程演进

### 从回调到 Promise 到 async/await

**回调地狱问题**:
```javascript
// 回调地狱示例
function fetchUserData(userId, callback) {
  setTimeout(() => {
    const user = { id: userId, name: 'Alice' };
    callback(null, user);
  }, 1000);
}

function fetchUserPosts(userId, callback) {
  setTimeout(() => {
    const posts = [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }];
    callback(null, posts);
  }, 1000);
}

function fetchPostComments(postId, callback) {
  setTimeout(() => {
    const comments = [{ id: 1, text: 'Great post!' }];
    callback(null, comments);
  }, 1000);
}

// 嵌套回调 - 难以维护
fetchUserData(1, (err, user) => {
  if (err) return console.error(err);
  
  fetchUserPosts(user.id, (err, posts) => {
    if (err) return console.error(err);
    
    fetchPostComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err);
      
      console.log('User:', user);
      console.log('Posts:', posts);
      console.log('Comments:', comments);
    });
  });
});
```

**Promise 解决方案**:
```javascript
// Promise 版本
function fetchUserDataPromise(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = { id: userId, name: 'Alice' };
      resolve(user);
    }, 1000);
  });
}

function fetchUserPostsPromise(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const posts = [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }];
      resolve(posts);
    }, 1000);
  });
}

function fetchPostCommentsPromise(postId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const comments = [{ id: 1, text: 'Great post!' }];
      resolve(comments);
    }, 1000);
  });
}

// Promise 链式调用
fetchUserDataPromise(1)
  .then(user => {
    console.log('User:', user);
    return fetchUserPostsPromise(user.id);
  })
  .then(posts => {
    console.log('Posts:', posts);
    return fetchPostCommentsPromise(posts[0].id);
  })
  .then(comments => {
    console.log('Comments:', comments);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**async/await 最终解决方案**:
```javascript
// async/await 版本 - 最清晰的异步代码
async function fetchAllData(userId) {
  try {
    const user = await fetchUserDataPromise(userId);
    console.log('User:', user);
    
    const posts = await fetchUserPostsPromise(user.id);
    console.log('Posts:', posts);
    
    const comments = await fetchPostCommentsPromise(posts[0].id);
    console.log('Comments:', comments);
    
    return { user, posts, comments };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 并行执行
async function fetchDataParallel(userId) {
  try {
    // 同时发起多个请求
    const [user, posts] = await Promise.all([
      fetchUserDataPromise(userId),
      fetchUserPostsPromise(userId)
    ]);
    
    // 基于前面的结果继续请求
    const comments = await fetchPostCommentsPromise(posts[0].id);
    
    return { user, posts, comments };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 错误处理和重试机制
async function fetchWithRetry(fetchFunction, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFunction();
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // 指数退避
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 使用示例
async function robustFetch() {
  try {
    const data = await fetchWithRetry(() => fetchAllData(1));
    console.log('Successfully fetched:', data);
  } catch (error) {
    console.error('Final error:', error);
  }
}
```

## 总结

### JavaScript 核心特性掌握要点

**作用域与闭包**:
- 理解作用域链的查找机制
- 掌握闭包的实际应用场景
- 避免闭包导致的内存泄漏

**原型链与继承**:
- 理解原型链的工作原理
- 掌握多种继承实现方式
- 熟练使用 ES6 Class 语法

**this 绑定**:
- 掌握四种 this 绑定规则
- 理解箭头函数的 this 特性
- 能够正确处理 this 指向问题

### ES6+ 新特性应用建议

**变量声明**:
- 优先使用 `const`，需要重新赋值时使用 `let`
- 避免使用 `var`，利用块级作用域

**函数增强**:
- 合理使用箭头函数，注意 this 绑定
- 利用默认参数和剩余参数简化代码
- 使用解构赋值提高代码可读性

**异步编程**:
- 优先使用 async/await 处理异步操作
- 合理使用 Promise.all 进行并行处理
- 建立完善的错误处理机制

### 最佳实践

1. **代码可读性**: 使用新语法提高代码表达力
2. **性能考虑**: 理解新特性的性能影响
3. **兼容性**: 根据目标环境选择合适的特性
4. **渐进升级**: 在现有项目中逐步引入新特性

JavaScript 的持续演进为开发者提供了更强大的工具，掌握这些特性能够显著提升开发效率和代码质量。