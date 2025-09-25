---
title: "前端笔试题精选解析"
date: "2025-09-25"
description: "深入解析前端面试中的经典笔试题，包括 Promise、防抖节流、手写实现等核心知识点"
tags: ["面试", "JavaScript", "Promise", "防抖", "节流", "手写实现"]
---

# 前端笔试题精选解析

## Promise 相关题目

### Promise.then 执行顺序

**经典题目分析**:
```javascript
// 题目1: Promise 执行顺序
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// 输出顺序: 1 -> 4 -> 3 -> 2
// 解析:
// 1. 同步代码先执行: console.log('1'), console.log('4')
// 2. 微任务队列: Promise.then(() => console.log('3'))
// 3. 宏任务队列: setTimeout(() => console.log('2'), 0)
// 4. 事件循环: 先清空微任务队列，再执行宏任务
```

**复杂 Promise 链式调用**:
```javascript
// 题目2: 复杂的 Promise 链
Promise.resolve()
  .then(() => {
    console.log('A');
    return Promise.resolve('B');
  })
  .then((value) => {
    console.log(value);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('C');
        resolve('D');
      }, 0);
    });
  })
  .then((value) => {
    console.log(value);
  });

console.log('E');

// 输出顺序: E -> A -> B -> C -> D
// 解析:
// 1. 同步代码: console.log('E')
// 2. 第一个 then: console.log('A'), 返回 Promise.resolve('B')
// 3. 第二个 then: console.log('B'), 返回一个异步 Promise
// 4. setTimeout 执行: console.log('C'), resolve('D')
// 5. 第三个 then: console.log('D')
```

**Promise 错误处理**:
```javascript
// 题目3: Promise 错误处理机制
Promise.resolve()
  .then(() => {
    throw new Error('Error 1');
  })
  .catch((err) => {
    console.log('Caught:', err.message);
    return 'Recovery 1';
  })
  .then((value) => {
    console.log('Then:', value);
    throw new Error('Error 2');
  })
  .catch((err) => {
    console.log('Caught:', err.message);
  })
  .then(() => {
    console.log('Final then');
  });

// 输出:
// Caught: Error 1
// Then: Recovery 1  
// Caught: Error 2
// Final then

// 解析: catch 会捕获前面的错误，并且可以返回值继续链式调用
```

### 手写 Promise 实现

**基础 Promise 实现**:
```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  then(onFulfilled, onRejected) {
    // 参数校验
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };
    
    // 返回新的 Promise 实现链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    
    return promise2;
  }
  
  // Promise 解析过程
  resolvePromise(promise2, x, resolve, reject) {
    // 避免循环引用
    if (promise2 === x) {
      return reject(new TypeError('Chaining cycle detected for promise'));
    }
    
    let called = false;
    
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        const then = x.then;
        
        if (typeof then === 'function') {
          then.call(
            x,
            (y) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise2, y, resolve, reject);
            },
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
  }
  
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  
  // 静态方法
  static resolve(value) {
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }
  
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }
}

// 使用示例
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!');
  }, 1000);
});

promise
  .then(value => {
    console.log(value); // Success!
    return 'Next value';
  })
  .then(value => {
    console.log(value); // Next value
  })
  .catch(error => {
    console.error(error);
  });
```

### Promise 工具方法实现

**Promise.all 实现**:
```javascript
MyPromise.all = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    const results = [];
    let completedCount = 0;
    const total = promises.length;
    
    if (total === 0) {
      return resolve(results);
    }
    
    promises.forEach((promise, index) => {
      // 确保每个元素都是 Promise
      MyPromise.resolve(promise)
        .then(value => {
          results[index] = value;
          completedCount++;
          
          if (completedCount === total) {
            resolve(results);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  });
};

// 使用示例
const promise1 = MyPromise.resolve(1);
const promise2 = new MyPromise(resolve => setTimeout(() => resolve(2), 1000));
const promise3 = MyPromise.resolve(3);

MyPromise.all([promise1, promise2, promise3])
  .then(values => {
    console.log(values); // [1, 2, 3]
  })
  .catch(error => {
    console.error(error);
  });
```

**Promise.race 实现**:
```javascript
MyPromise.race = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    promises.forEach(promise => {
      MyPromise.resolve(promise)
        .then(resolve)
        .catch(reject);
    });
  });
};

// 使用示例
const fastPromise = new MyPromise(resolve => setTimeout(() => resolve('fast'), 100));
const slowPromise = new MyPromise(resolve => setTimeout(() => resolve('slow'), 1000));

MyPromise.race([fastPromise, slowPromise])
  .then(value => {
    console.log(value); // 'fast'
  });
```

**Promise.allSettled 实现**:
```javascript
MyPromise.allSettled = function(promises) {
  return new MyPromise((resolve) => {
    if (!Array.isArray(promises)) {
      return resolve([]);
    }
    
    const results = [];
    let completedCount = 0;
    const total = promises.length;
    
    if (total === 0) {
      return resolve(results);
    }
    
    promises.forEach((promise, index) => {
      MyPromise.resolve(promise)
        .then(value => {
          results[index] = { status: 'fulfilled', value };
        })
        .catch(reason => {
          results[index] = { status: 'rejected', reason };
        })
        .finally(() => {
          completedCount++;
          if (completedCount === total) {
            resolve(results);
          }
        });
    });
  });
};
```

**Promise.any 实现**:
```javascript
MyPromise.any = function(promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    const errors = [];
    let rejectedCount = 0;
    const total = promises.length;
    
    if (total === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }
    
    promises.forEach((promise, index) => {
      MyPromise.resolve(promise)
        .then(value => {
          resolve(value); // 第一个成功的就返回
        })
        .catch(error => {
          errors[index] = error;
          rejectedCount++;
          
          if (rejectedCount === total) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        });
    });
  });
};
```

## 防抖和节流

### 防抖 (Debounce) 实现

**基础防抖实现**:
```javascript
function debounce(func, delay) {
  let timeoutId;
  
  return function debounced(...args) {
    // 清除之前的定时器
    clearTimeout(timeoutId);
    
    // 设置新的定时器
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 使用示例
const searchInput = document.getElementById('search');
const handleSearch = debounce((event) => {
  console.log('搜索:', event.target.value);
  // 发送搜索请求
}, 300);

searchInput.addEventListener('input', handleSearch);
```

**高级防抖实现 (支持立即执行)**:
```javascript
function advancedDebounce(func, delay, immediate = false) {
  let timeoutId;
  let lastCallTime;
  
  return function debounced(...args) {
    const now = Date.now();
    
    // 立即执行模式
    if (immediate && !timeoutId) {
      func.apply(this, args);
      lastCallTime = now;
    }
    
    // 清除之前的定时器
    clearTimeout(timeoutId);
    
    // 设置新的定时器
    timeoutId = setTimeout(() => {
      // 非立即执行模式，或者立即执行模式但已经过了延迟时间
      if (!immediate || (now - lastCallTime >= delay)) {
        func.apply(this, args);
      }
      timeoutId = null;
    }, delay);
  };
}

// 使用示例
const button = document.getElementById('submit');
const handleSubmit = advancedDebounce(() => {
  console.log('提交表单');
}, 1000, true); // 立即执行一次，然后防抖

button.addEventListener('click', handleSubmit);
```

**可取消的防抖**:
```javascript
function cancellableDebounce(func, delay) {
  let timeoutId;
  
  const debounced = function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
  
  // 取消方法
  debounced.cancel = function() {
    clearTimeout(timeoutId);
    timeoutId = null;
  };
  
  // 立即执行方法
  debounced.flush = function(...args) {
    clearTimeout(timeoutId);
    func.apply(this, args);
  };
  
  return debounced;
}

// 使用示例
const debouncedSave = cancellableDebounce(() => {
  console.log('保存数据');
}, 2000);

// 正常使用
debouncedSave();

// 取消执行
debouncedSave.cancel();

// 立即执行
debouncedSave.flush();
```

### 节流 (Throttle) 实现

**基础节流实现**:
```javascript
function throttle(func, delay) {
  let lastCallTime = 0;
  
  return function throttled(...args) {
    const now = Date.now();
    
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func.apply(this, args);
    }
  };
}

// 使用示例
const handleScroll = throttle(() => {
  console.log('滚动事件', window.scrollY);
}, 100);

window.addEventListener('scroll', handleScroll);
```

**定时器版本节流**:
```javascript
function throttleWithTimer(func, delay) {
  let timeoutId;
  let lastCallTime = 0;
  
  return function throttled(...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCallTime);
    
    if (remaining <= 0) {
      // 立即执行
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      func.apply(this, args);
    } else if (!timeoutId) {
      // 设置定时器，确保最后一次调用也能执行
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}
```

**高级节流实现 (支持首次和末次执行控制)**:
```javascript
function advancedThrottle(func, delay, options = {}) {
  const { leading = true, trailing = true } = options;
  let timeoutId;
  let lastCallTime = 0;
  let lastArgs;
  
  return function throttled(...args) {
    const now = Date.now();
    
    // 首次调用且不需要 leading 执行
    if (!lastCallTime && !leading) {
      lastCallTime = now;
    }
    
    const remaining = delay - (now - lastCallTime);
    lastArgs = args;
    
    if (remaining <= 0 || remaining > delay) {
      // 立即执行
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      func.apply(this, args);
    } else if (!timeoutId && trailing) {
      // 设置定时器执行最后一次
      timeoutId = setTimeout(() => {
        lastCallTime = leading ? Date.now() : 0;
        timeoutId = null;
        func.apply(this, lastArgs);
      }, remaining);
    }
  };
}

// 使用示例
const handleMouseMove = advancedThrottle((event) => {
  console.log('鼠标移动', event.clientX, event.clientY);
}, 100, { leading: true, trailing: false });

document.addEventListener('mousemove', handleMouseMove);
```

## 深拷贝实现

### 基础深拷贝

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 和非对象类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // 处理正则对象
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    const cloneArr = [];
    hash.set(obj, cloneArr);
    
    for (let i = 0; i < obj.length; i++) {
      cloneArr[i] = deepClone(obj[i], hash);
    }
    
    return cloneArr;
  }
  
  // 处理普通对象
  const cloneObj = {};
  hash.set(obj, cloneObj);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  
  return cloneObj;
}

// 测试用例
const original = {
  name: 'John',
  age: 30,
  hobbies: ['reading', 'gaming'],
  address: {
    city: 'Beijing',
    country: 'China'
  },
  birthday: new Date('1990-01-01'),
  pattern: /\d+/g
};

// 创建循环引用
original.self = original;

const cloned = deepClone(original);
console.log(cloned);
console.log(cloned === original); // false
console.log(cloned.self === cloned); // true (循环引用正确处理)
```

### 完整深拷贝实现

```javascript
function completeDeepClone(obj, hash = new WeakMap()) {
  // 获取对象类型
  const getType = (obj) => Object.prototype.toString.call(obj).slice(8, -1);
  
  const type = getType(obj);
  
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  let cloneObj;
  
  switch (type) {
    case 'Date':
      cloneObj = new Date(obj);
      break;
      
    case 'RegExp':
      cloneObj = new RegExp(obj.source, obj.flags);
      break;
      
    case 'Function':
      // 函数克隆 (简单实现)
      cloneObj = function() {
        return obj.apply(this, arguments);
      };
      break;
      
    case 'Array':
      cloneObj = [];
      hash.set(obj, cloneObj);
      obj.forEach((item, index) => {
        cloneObj[index] = completeDeepClone(item, hash);
      });
      break;
      
    case 'Set':
      cloneObj = new Set();
      hash.set(obj, cloneObj);
      obj.forEach(value => {
        cloneObj.add(completeDeepClone(value, hash));
      });
      break;
      
    case 'Map':
      cloneObj = new Map();
      hash.set(obj, cloneObj);
      obj.forEach((value, key) => {
        cloneObj.set(
          completeDeepClone(key, hash),
          completeDeepClone(value, hash)
        );
      });
      break;
      
    case 'Object':
      cloneObj = {};
      hash.set(obj, cloneObj);
      
      // 处理 Symbol 属性
      const symbolKeys = Object.getOwnPropertySymbols(obj);
      symbolKeys.forEach(key => {
        cloneObj[key] = completeDeepClone(obj[key], hash);
      });
      
      // 处理普通属性
      Object.keys(obj).forEach(key => {
        cloneObj[key] = completeDeepClone(obj[key], hash);
      });
      break;
      
    default:
      // 其他类型尝试直接赋值
      cloneObj = obj;
  }
  
  return cloneObj;
}

// 测试复杂对象
const complexObj = {
  // 基本类型
  str: 'hello',
  num: 42,
  bool: true,
  nul: null,
  undef: undefined,
  
  // 对象类型
  obj: { nested: 'value' },
  arr: [1, 2, { inner: 'array' }],
  
  // 特殊对象
  date: new Date(),
  regex: /test/gi,
  set: new Set([1, 2, 3]),
  map: new Map([['key1', 'value1'], ['key2', 'value2']]),
  
  // Symbol 属性
  [Symbol('test')]: 'symbol value',
  
  // 函数
  func: function() { return 'function result'; }
};

const clonedComplex = completeDeepClone(complexObj);
console.log('原对象:', complexObj);
console.log('克隆对象:', clonedComplex);
```

## 数组去重

### 多种去重方法

```javascript
// 方法1: Set 去重 (ES6)
function uniqueBySet(arr) {
  return [...new Set(arr)];
}

// 方法2: filter + indexOf
function uniqueByFilter(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

// 方法3: reduce 去重
function uniqueByReduce(arr) {
  return arr.reduce((unique, item) => {
    return unique.includes(item) ? unique : [...unique, item];
  }, []);
}

// 方法4: Map 去重 (性能较好)
function uniqueByMap(arr) {
  const map = new Map();
  const result = [];
  
  for (const item of arr) {
    if (!map.has(item)) {
      map.set(item, true);
      result.push(item);
    }
  }
  
  return result;
}

// 方法5: 对象去重 (复杂对象)
function uniqueByProperty(arr, property) {
  const seen = new Set();
  return arr.filter(item => {
    const key = item[property];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// 方法6: 深度去重 (处理对象)
function deepUnique(arr) {
  const result = [];
  const map = new Map();
  
  for (const item of arr) {
    const key = JSON.stringify(item);
    if (!map.has(key)) {
      map.set(key, true);
      result.push(item);
    }
  }
  
  return result;
}

// 测试用例
const numbers = [1, 2, 2, 3, 3, 4, 5, 5];
const objects = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice' },
  { id: 3, name: 'Charlie' }
];

console.log('Set去重:', uniqueBySet(numbers));
console.log('Filter去重:', uniqueByFilter(numbers));
console.log('属性去重:', uniqueByProperty(objects, 'id'));
console.log('深度去重:', deepUnique(objects));
```

## 柯里化实现

```javascript
// 基础柯里化实现
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...nextArgs) {
        return curried.apply(this, args.concat(nextArgs));
      };
    }
  };
}

// 使用示例
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6

// 高级柯里化 (支持占位符)
function advancedCurry(fn, placeholder = '_') {
  return function curried(...args) {
    // 替换占位符
    const resolvedArgs = args.map(arg => 
      arg === placeholder ? undefined : arg
    );
    
    // 检查是否有足够的参数
    const hasEnoughArgs = resolvedArgs.filter(arg => 
      arg !== undefined
    ).length >= fn.length;
    
    if (hasEnoughArgs && !resolvedArgs.includes(undefined)) {
      return fn.apply(this, resolvedArgs);
    } else {
      return function(...nextArgs) {
        const mergedArgs = [];
        let nextIndex = 0;
        
        // 合并参数，处理占位符
        for (let i = 0; i < resolvedArgs.length; i++) {
          if (resolvedArgs[i] === undefined && nextIndex < nextArgs.length) {
            mergedArgs[i] = nextArgs[nextIndex++];
          } else {
            mergedArgs[i] = resolvedArgs[i];
          }
        }
        
        // 添加剩余的新参数
        while (nextIndex < nextArgs.length) {
          mergedArgs.push(nextArgs[nextIndex++]);
        }
        
        return curried.apply(this, mergedArgs);
      };
    }
  };
}

// 使用占位符
const _ = '_';
const curriedAddWithPlaceholder = advancedCurry(add, _);

console.log(curriedAddWithPlaceholder(1, _, 3)(2)); // 6
console.log(curriedAddWithPlaceholder(_, 2, _)(1, 3)); // 6
```

## 总结

### 核心知识点回顾

**Promise 相关**:
- 理解事件循环和微任务队列
- 掌握 Promise 链式调用和错误处理
- 能够手写 Promise 及其工具方法

**防抖节流**:
- 理解防抖和节流的应用场景
- 掌握不同实现方式的优缺点
- 能够根据需求选择合适的实现

**手写实现**:
- 深拷贝要考虑循环引用和特殊对象
- 数组去重有多种方法，性能各异
- 柯里化体现了函数式编程思想

### 面试建议

1. **理解原理**: 不仅要会写代码，更要理解背后的原理
2. **考虑边界**: 处理各种边界情况和异常情况
3. **性能优化**: 了解不同实现方式的性能差异
4. **实际应用**: 结合实际项目经验说明使用场景
5. **代码质量**: 注重代码的可读性和可维护性

这些笔试题涵盖了前端开发的核心概念，掌握这些知识点对于前端面试和日常开发都非常重要。